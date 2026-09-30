import json
import logging
import datetime
from typing import Optional, List
from sqlalchemy.orm import Session

from backend.models import CitizenRequest, RequestEvidenceMatch
from backend.knowledge.models import KnowledgeEvidence

from backend.prioritization.models import RequestPriorityAssessment, RequestPriorityFactor
from backend.prioritization.schemas import PriorityAssessmentResponse, PriorityFactorDetail
from backend.prioritization.engine import evaluate_priority_assessment, METHODOLOGY_VERSION

logger = logging.getLogger("nagriklens.prioritization.service")

class PrioritizationService:
    @staticmethod
    def get_priority_assessment(db: Session, reference_id: str) -> Optional[PriorityAssessmentResponse]:
        """
        Retrieves an existing persisted priority assessment for a request.
        Does NOT auto-generate if missing (GET idempotency).
        """
        req = db.query(CitizenRequest).filter(CitizenRequest.reference_id == reference_id).first()
        if not req:
            return None

        assessment = (
            db.query(RequestPriorityAssessment)
            .filter(RequestPriorityAssessment.request_id == req.id)
            .order_by(RequestPriorityAssessment.generated_at.desc())
            .first()
        )
        if not assessment:
            return None

        factors: List[PriorityFactorDetail] = []
        for f in assessment.factors:
            ev_ids = json.loads(f.evidence_ids) if f.evidence_ids else []
            factors.append(
                PriorityFactorDetail(
                    factor=f.factor,
                    raw_value=f.raw_value,
                    normalized_value=f.normalized_value,
                    weight=f.weight,
                    available=f.available,
                    contribution=f.contribution,
                    source=f.source,
                    evidence_ids=ev_ids,
                    explanation=f.explanation,
                )
            )

        limitations = json.loads(assessment.limitations) if assessment.limitations else []

        return PriorityAssessmentResponse(
            id=assessment.id,
            request_reference_id=assessment.request_reference_id,
            overall_priority=assessment.overall_priority,
            priority_band=assessment.priority_band,  # type: ignore
            methodology_version=assessment.methodology_version,
            evidence_count=assessment.evidence_count,
            factors=factors,
            limitations=limitations,
            generated_at=assessment.generated_at,
        )

    @staticmethod
    def calculate_and_persist_priority(db: Session, reference_id: str) -> PriorityAssessmentResponse:
        """
        Executes deterministic priority assessment and idempotently persists results.
        """
        req = db.query(CitizenRequest).filter(CitizenRequest.reference_id == reference_id).first()
        if not req:
            raise ValueError(f"Citizen request with reference ID '{reference_id}' not found.")

        # 1. Fetch matched evidence records
        matched_records = (
            db.query(RequestEvidenceMatch)
            .filter(RequestEvidenceMatch.request_id == req.id)
            .order_by(RequestEvidenceMatch.rank.asc())
            .all()
        )

        evidence_items: List[KnowledgeEvidence] = []
        if matched_records:
            ev_ids = [m.evidence_id for m in matched_records]
            evidence_items = (
                db.query(KnowledgeEvidence)
                .filter(KnowledgeEvidence.evidence_id.in_(ev_ids))
                .all()
            )
        else:
            # Fallback direct lookup if matches table was not pre-populated
            if req.district and req.category:
                evidence_items = (
                    db.query(KnowledgeEvidence)
                    .filter(
                        KnowledgeEvidence.district.ilike(f"%{req.district}%"),
                        KnowledgeEvidence.category == req.category,
                    )
                    .limit(5)
                    .all()
                )

        # 2. Deterministic evaluation
        assessment_res = evaluate_priority_assessment(req, evidence_items)

        # 3. Idempotent replacement in database
        existing_assessment = (
            db.query(RequestPriorityAssessment)
            .filter(RequestPriorityAssessment.request_id == req.id)
            .first()
        )

        now = datetime.datetime.now(datetime.timezone.utc)
        if existing_assessment:
            # Delete old factors
            db.query(RequestPriorityFactor).filter(
                RequestPriorityFactor.assessment_id == existing_assessment.id
            ).delete()

            existing_assessment.overall_priority = assessment_res.overall_priority
            existing_assessment.priority_band = assessment_res.priority_band
            existing_assessment.methodology_version = assessment_res.methodology_version
            existing_assessment.evidence_count = assessment_res.evidence_count
            existing_assessment.limitations = json.dumps(assessment_res.limitations)
            existing_assessment.generated_at = now
            db_assessment = existing_assessment
        else:
            db_assessment = RequestPriorityAssessment(
                request_id=req.id,
                request_reference_id=req.reference_id,
                overall_priority=assessment_res.overall_priority,
                priority_band=assessment_res.priority_band,
                methodology_version=assessment_res.methodology_version,
                evidence_count=assessment_res.evidence_count,
                limitations=json.dumps(assessment_res.limitations),
                generated_at=now,
            )
            db.add(db_assessment)
            db.flush()

        # Add factor rows
        for f in assessment_res.factors:
            db_factor = RequestPriorityFactor(
                assessment_id=db_assessment.id,
                factor=f.factor,
                raw_value=f.raw_value,
                normalized_value=f.normalized_value,
                weight=f.weight,
                available=f.available,
                contribution=f.contribution,
                source=f.source,
                evidence_ids=json.dumps(f.evidence_ids) if f.evidence_ids else None,
                explanation=f.explanation,
                created_at=now,
            )
            db.add(db_factor)

        db.commit()
        db.refresh(db_assessment)

        assessment_res.id = db_assessment.id
        assessment_res.generated_at = db_assessment.generated_at
        return assessment_res
