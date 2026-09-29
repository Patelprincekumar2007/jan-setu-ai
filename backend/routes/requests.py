import logging
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db
from backend.models import CitizenRequest, RequestEvidenceMatch
from backend.schemas import (
    CitizenRequestCreate,
    CitizenRequestCreateResponse,
    CitizenRequestDetailResponse,
    RequestLocation,
)
from backend.utils import generate_unique_reference_id
from backend.gemini_service import extract_request_intelligence
from backend.knowledge.query_builder import build_retrieval_query
from backend.knowledge.hybrid_retriever import HybridKnowledgeRetriever
from backend.knowledge.schemas import KnowledgeEvidenceResponse
from backend.knowledge.models import KnowledgeEvidence

logger = logging.getLogger("nagriklens.routes.requests")

router = APIRouter(prefix="/api/requests", tags=["Citizen Requests"])


class RequestEvidenceItem(BaseModel):
    evidence: KnowledgeEvidenceResponse
    retrieval_method: str
    rank: int
    similarity_score: float
    metadata_match_level: int


class RequestEvidenceListResponse(BaseModel):
    reference_id: str
    retrieval_status: str
    evidence_count: int
    results: List[RequestEvidenceItem]


def execute_request_retrieval(db: Session, db_request: CitizenRequest):
    """
    Executes automatic hybrid retrieval pipeline for a citizen request and persists matched evidence links.
    """
    try:
        # Build concise natural language retrieval query
        query_text = build_retrieval_query(
            problem_summary=db_request.problem_summary,
            citizen_request=db_request.citizen_request,
            category=db_request.category,
            state=db_request.state,
            district=db_request.district,
            locality=db_request.locality,
            affected_group=db_request.affected_group,
            severity=db_request.severity,
            location_hint=db_request.location_hint,
        )

        retriever = HybridKnowledgeRetriever(db=db)
        results, total = retriever.retrieve(
            query=query_text,
            state=db_request.state,
            district=db_request.district,
            category=db_request.category,
            top_k=5,
        )

        # Clear existing matches if any
        db.query(RequestEvidenceMatch).filter(RequestEvidenceMatch.request_id == db_request.id).delete()

        if results:
            for rank_idx, r in enumerate(results, start=1):
                match_rec = RequestEvidenceMatch(
                    request_id=db_request.id,
                    evidence_id=r.evidence_id,
                    retrieval_method=r.retrieval_method,
                    rank=rank_idx,
                    similarity_score=float(r.similarity_score),
                    metadata_match_level=int(r.metadata_match_level),
                )
                db.add(match_rec)

            db_request.retrieval_status = "COMPLETED"
        else:
            db_request.retrieval_status = "NO_EVIDENCE"

        db.commit()
    except Exception as e:
        logger.error(f"Automatic retrieval for request {db_request.reference_id} failed: {e}")
        db_request.retrieval_status = "FAILED"
        db.commit()


@router.post("", response_model=CitizenRequestCreateResponse, status_code=status.HTTP_201_CREATED)
def submit_citizen_request(
    request_in: CitizenRequestCreate,
    db: Session = Depends(get_db),
):
    """
    Accepts, structures, persists, and grounds a new citizen request against public data evidence.
    """
    ref_id = generate_unique_reference_id(db)

    # 1. Initialize and store citizen request
    db_request = CitizenRequest(
        reference_id=ref_id,
        citizen_request=request_in.citizen_request,
        state=request_in.state,
        district=request_in.district,
        locality=request_in.locality,
        category=request_in.category,
        affected_household_count=request_in.affected_household_count,
        status="RECEIVED",
        ai_extraction_status="NOT_PROCESSED",
        retrieval_status="NOT_RUN",
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)

    # 2. Perform Gemini structured intelligence extraction if available
    try:
        extraction = extract_request_intelligence(
            citizen_text=request_in.citizen_request,
            state=request_in.state,
            district=request_in.district,
            locality=request_in.locality,
            user_category=request_in.category,
        )

        if extraction:
            db_request.ai_extraction_status = "SUCCESS"
            db_request.language = extraction.language
            db_request.problem_summary = extraction.problem_summary
            db_request.severity = extraction.severity
            db_request.affected_group = extraction.affected_group
            db_request.location_hint = extraction.location_hint
            if extraction.category:
                db_request.category = extraction.category
        else:
            db_request.ai_extraction_status = "SKIPPED"

        db.commit()
        db.refresh(db_request)
    except Exception as e:
        logger.warning(f"AI extraction skipped or failed for {ref_id}: {e}")
        db_request.ai_extraction_status = "FAILED"
        db.commit()
        db.refresh(db_request)

    # 3. Perform automatic hybrid retrieval grounding
    execute_request_retrieval(db, db_request)
    db.refresh(db_request)

    return CitizenRequestCreateResponse(
        reference_id=db_request.reference_id,
        status=db_request.status,
        message="Citizen request submitted and processed successfully.",
    )


@router.get("/{reference_id}", response_model=CitizenRequestDetailResponse, status_code=status.HTTP_200_OK)
def get_citizen_request(
    reference_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve stored citizen request by unique human-readable reference code.
    """
    req = db.query(CitizenRequest).filter(CitizenRequest.reference_id == reference_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Citizen request with reference ID '{reference_id}' was not found.",
        )

    evidence_count = db.query(RequestEvidenceMatch).filter(RequestEvidenceMatch.request_id == req.id).count()

    return CitizenRequestDetailResponse(
        reference_id=req.reference_id,
        citizen_request=req.citizen_request,
        location=RequestLocation(
            state=req.state,
            district=req.district,
            locality=req.locality,
        ),
        category=req.category,
        affected_household_count=req.affected_household_count,
        status=req.status,
        ai_extraction_status=req.ai_extraction_status,
        language=req.language,
        problem_summary=req.problem_summary,
        severity=req.severity,
        affected_group=req.affected_group,
        location_hint=req.location_hint,
        retrieval_status=req.retrieval_status,
        evidence_count=evidence_count,
        created_at=req.created_at,
    )


@router.get("/{reference_id}/evidence", response_model=RequestEvidenceListResponse, status_code=status.HTTP_200_OK)
def get_citizen_request_evidence(
    reference_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieve grounded public data evidence linked to a citizen request.
    """
    req = db.query(CitizenRequest).filter(CitizenRequest.reference_id == reference_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Citizen request with reference ID '{reference_id}' was not found.",
        )

    matches = (
        db.query(RequestEvidenceMatch)
        .filter(RequestEvidenceMatch.request_id == req.id)
        .order_by(RequestEvidenceMatch.rank.asc())
        .all()
    )

    results: List[RequestEvidenceItem] = []
    for m in matches:
        ev = db.query(KnowledgeEvidence).filter(KnowledgeEvidence.evidence_id == m.evidence_id).first()
        if ev:
            ev_resp = KnowledgeEvidenceResponse(
                evidence_id=ev.evidence_id,
                dataset_id=ev.dataset_id,
                record_id=ev.record_id,
                title=ev.title,
                content=ev.content,
                state=ev.state,
                district=ev.district,
                locality=ev.locality,
                category=ev.category,  # type: ignore
                metric_name=ev.metric_name,
                metric_value=ev.metric_value,
                unit=ev.unit,
                year=ev.year,
                period=ev.period,
                geographic_level=ev.geographic_level,
                source_name=ev.source_name,
                source_url=ev.source_url,
                source_reference=ev.source_reference,
                publisher=ev.publisher,
                license=ev.license,
                last_updated=ev.last_updated,
                notes=ev.notes,
                created_at=ev.created_at,
            )
            results.append(
                RequestEvidenceItem(
                    evidence=ev_resp,
                    retrieval_method=m.retrieval_method,
                    rank=m.rank,
                    similarity_score=float(m.similarity_score),
                    metadata_match_level=int(m.metadata_match_level),
                )
            )

    return RequestEvidenceListResponse(
        reference_id=req.reference_id,
        retrieval_status=req.retrieval_status,
        evidence_count=len(results),
        results=results,
    )
