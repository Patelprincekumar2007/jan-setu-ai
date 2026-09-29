import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.citizen_request import CitizenRequest, RequestEvidenceMatch
from app.models.evidence import Evidence
from app.schemas.citizen_request import (
    CitizenRequestCreate,
    CitizenRequestResponse,
    RequestEvidenceResponse,
)
from app.services.gemini_service import gemini_service
from app.services.hybrid_retrieval_service import hybrid_retrieval_service
from app.services.retrieval_query_builder import build_retrieval_query

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/requests", tags=["Citizen Requests"])


def _evidence_payload(evidence: Evidence) -> dict:
    metadata = evidence.extra_metadata if isinstance(evidence.extra_metadata, dict) else {}
    return {
        "evidence_id": evidence.evidence_identifier,
        "dataset_id": evidence.dataset_id,
        "record_id": metadata.get("record_id"),
        "title": evidence.title,
        "content": evidence.description,
        "state": evidence.state,
        "district": evidence.district,
        "locality": evidence.locality,
        "category": evidence.category,
        "metric_name": evidence.metric_name,
        "metric_value": evidence.metric_value,
        "unit": metadata.get("unit"),
        "year": metadata.get("year"),
        "period": evidence.reporting_period,
        "geographic_level": metadata.get("geographic_level"),
        "source_name": evidence.source_name,
        "source_url": evidence.source_url,
        "source_reference": metadata.get("source_reference"),
        "publisher": evidence.source_organization,
        "license": metadata.get("license"),
        "last_updated": metadata.get("last_updated"),
        "notes": evidence.raw_text,
    }


def _request_response(request: CitizenRequest, db: Session) -> dict:
    evidence_count = db.query(RequestEvidenceMatch).filter(
        RequestEvidenceMatch.request_id == request.reference_id
    ).count()
    return {
        "reference_id": request.reference_id,
        "citizen_request": request.citizen_request,
        "category": request.category,
        "state": request.state,
        "district": request.district,
        "locality": request.locality,
        "affected_households": request.affected_households,
        "status": request.status,
        "ai_extraction_status": request.ai_extraction_status,
        "extracted_data": request.extracted_data,
        "retrieval_status": request.retrieval_status,
        "retrieval_query": request.retrieval_query,
        "evidence_count": evidence_count,
        "created_at": request.created_at,
    }


@router.post("", response_model=CitizenRequestResponse, status_code=status.HTTP_201_CREATED)
def create_citizen_request(payload: CitizenRequestCreate, db: Session = Depends(get_db)):
    reference_id = f"REQ-{datetime.utcnow():%Y}-{uuid.uuid4().hex[:8].upper()}"
    request = CitizenRequest(
        reference_id=reference_id,
        citizen_request=payload.citizen_request,
        category=payload.category,
        state=payload.state,
        district=payload.district,
        locality=payload.locality,
        affected_households=payload.affected_households,
        status="RECEIVED",
        ai_extraction_status="NOT_RUN",
        retrieval_status="NOT_RUN",
    )
    db.add(request)
    db.commit()
    db.refresh(request)

    try:
        extracted_data, extraction_status = gemini_service.understand_complaint_with_status(
            original_narrative=payload.citizen_request,
            category=payload.category,
            state=payload.state,
            district=payload.district,
            locality=payload.locality,
        )
    except Exception:
        logger.warning("Request extraction failed; continuing with the original citizen request.")
        extracted_data = {"problem_summary": payload.citizen_request, "category": payload.category}
        extraction_status = "FAILED"
    request.extracted_data = extracted_data
    request.ai_extraction_status = extraction_status

    request.retrieval_query = build_retrieval_query(
        extracted_data,
        original_request=payload.citizen_request,
        category=payload.category,
        state=payload.state,
        district=payload.district,
        locality=payload.locality,
    )
    try:
        search_result = hybrid_retrieval_service.search(
            db=db,
            query=request.retrieval_query,
            top_k=5,
            state=payload.state,
            district=payload.district,
            category=payload.category,
        )
        for rank, result in enumerate(search_result["results"], start=1):
            db.add(RequestEvidenceMatch(
                id=f"rem-{uuid.uuid4().hex[:12]}",
                request_id=reference_id,
                evidence_id=result["evidence_id"],
                retrieval_method=result["retrieval_method"],
                rank=rank,
                similarity_score=result["similarity_score"],
                metadata_match_level=result["metadata_match_level"],
            ))
        request.retrieval_status = "COMPLETED" if search_result["results"] else "NO_EVIDENCE"
    except Exception:
        logger.warning("Request evidence retrieval failed; request remains stored.")
        request.retrieval_status = "FAILED"

    db.commit()
    db.refresh(request)
    return _request_response(request, db)


@router.get("/{reference_id}", response_model=CitizenRequestResponse)
def get_citizen_request(reference_id: str, db: Session = Depends(get_db)):
    request = db.query(CitizenRequest).filter(
        CitizenRequest.reference_id == reference_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return _request_response(request, db)


@router.get("/{reference_id}/evidence", response_model=RequestEvidenceResponse)
def get_request_evidence(reference_id: str, db: Session = Depends(get_db)):
    request = db.query(CitizenRequest).filter(
        CitizenRequest.reference_id == reference_id
    ).first()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")

    matches = db.query(RequestEvidenceMatch).filter(
        RequestEvidenceMatch.request_id == reference_id
    ).order_by(RequestEvidenceMatch.rank.asc()).all()
    results = []
    for match in matches:
        evidence = db.query(Evidence).filter(
            Evidence.evidence_identifier == match.evidence_id
        ).first()
        if evidence is None:
            continue
        results.append({
            "evidence": _evidence_payload(evidence),
            "retrieval_method": match.retrieval_method,
            "rank": match.rank,
            "similarity_score": match.similarity_score,
            "metadata_match_level": match.metadata_match_level,
            "source": {
                "source_name": evidence.source_name,
                "source_url": evidence.source_url,
                "source_reference": _evidence_payload(evidence)["source_reference"],
                "publisher": evidence.source_organization,
            },
        })
    return {
        "reference_id": reference_id,
        "retrieval_status": request.retrieval_status,
        "evidence_count": len(results),
        "results": results,
    }