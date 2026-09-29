from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.evidence import Evidence
from app.services.embedding_service import embedding_service
from app.services.hybrid_retrieval_service import hybrid_retrieval_service
from app.services.vector_store import vector_store

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Retrieval"])


@router.get("/search")
def metadata_search(
    q: Optional[str] = None,
    top_k: int = Query(5, ge=1, le=20),
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Evidence)
    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(or_(
            Evidence.title.ilike(term),
            Evidence.description.ilike(term),
            Evidence.raw_text.ilike(term),
        ))
    if state:
        query = query.filter(Evidence.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(Evidence.district.ilike(f"%{district.strip()}%"))
    if category:
        query = query.filter(Evidence.category.ilike(f"%{category.strip()}%"))
    records = query.order_by(Evidence.evidence_identifier.asc()).all()
    results = [
        hybrid_retrieval_service._serialize(record, 0, None, "metadata")
        for record in records[:top_k]
    ]
    return {
        "query": q,
        "retriever": "baseline_metadata",
        "top_k": top_k,
        "result_count": len(results),
        "filters": {"state": state, "district": district, "category": category},
        "results": results,
    }


@router.get("/semantic-search")
def semantic_search(
    q: str,
    top_k: int = Query(5, ge=1, le=20),
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    if not q or not q.strip():
        raise HTTPException(status_code=400, detail="query must be a non-empty string.")
    query_vector = hybrid_retrieval_service._normalize(embedding_service.embed_text(q.strip()))
    candidates = vector_store.search(query_vector, top_k=max(top_k * 10, 50))
    scores = {evidence_id: score for evidence_id, score in candidates}
    query = db.query(Evidence).filter(Evidence.evidence_identifier.in_(scores))
    if state:
        query = query.filter(Evidence.state.ilike(f"%{state.strip()}%"))
    if district:
        query = query.filter(Evidence.district.ilike(f"%{district.strip()}%"))
    if category:
        query = query.filter(Evidence.category.ilike(f"%{category.strip()}%"))
    records = query.all() if scores else []
    records.sort(key=lambda record: (-scores[record.evidence_identifier], record.evidence_identifier))
    results = [
        hybrid_retrieval_service._serialize(
            record, 0, float(scores[record.evidence_identifier]), "semantic"
        )
        for record in records[:top_k]
    ]
    return {
        "query": q.strip(),
        "retriever": "semantic_faiss",
        "top_k": top_k,
        "result_count": len(results),
        "filters": {"state": state, "district": district, "category": category},
        "results": results,
    }


@router.get("/hybrid-search")
def hybrid_search(
    q: str = Query(..., description="Natural-language evidence query"),
    top_k: int = Query(5, ge=1, le=20),
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
):
    try:
        return hybrid_retrieval_service.search(
            db=db,
            query=q,
            top_k=top_k,
            state=state,
            district=district,
            category=category,
        )
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error