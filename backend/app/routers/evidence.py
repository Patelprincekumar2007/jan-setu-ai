from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.evidence import EvidenceSearchQuery, EvidenceSearchResult
from app.services.retrieval_service import retrieval_service

router = APIRouter(prefix="/evidence", tags=["Evidence Retrieval"])

@router.post("/search", response_model=EvidenceSearchResult)
def search_evidence(
    query_in: EvidenceSearchQuery,
    db: Session = Depends(get_db)
):
    result = retrieval_service.search_evidence(
        db=db,
        query=query_in.query,
        state=query_in.state,
        district=query_in.district,
        category=query_in.category,
        top_k=query_in.top_k or 10
    )
    return result
