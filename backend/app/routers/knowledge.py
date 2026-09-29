from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.hybrid_retrieval_service import hybrid_retrieval_service

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Retrieval"])


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