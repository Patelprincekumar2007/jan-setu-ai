from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.knowledge.schemas import (
    KnowledgeSearchResponse,
    KnowledgeDatasetSummaryResponse,
    SemanticKnowledgeSearchResponse,
    SemanticKnowledgeEvidenceResponse,
)
from backend.knowledge.retriever import (
    DeterministicMetadataRetriever,
    SemanticFAISSRetriever,
    semantic_search,
)
from backend.knowledge.service import KnowledgeService
from backend.knowledge.vector_index import get_vector_index_status, VectorIndexUnavailableException

router = APIRouter(prefix="/api/knowledge", tags=["Knowledge Retrieval Layer"])


@router.get("/search", response_model=KnowledgeSearchResponse, status_code=status.HTTP_200_OK)
def search_knowledge_evidence(
    q: Optional[str] = Query(None, description="Search query string"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    category: Optional[str] = Query(None, description="Filter by civic sector category"),
    top_k: int = Query(5, ge=1, le=20, description="Maximum number of evidence items to return (1-20)"),
    db: Session = Depends(get_db),
):
    """
    Deterministic Baseline Metadata Retrieval Endpoint.
    Retrieves grounded KnowledgeEvidence records matching query terms and administrative filters.
    Contract is prepared for seamless drop-in of future vector retrievers.
    """
    retriever = DeterministicMetadataRetriever(db)
    try:
        results, total = retriever.retrieve(
            query=q,
            state=state,
            district=district,
            category=category,
            top_k=top_k,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    return KnowledgeSearchResponse(
        query=q,
        retriever="baseline_metadata",
        total=total,
        results=results,
    )


@router.get("/status", status_code=status.HTTP_200_OK)
def get_knowledge_status(db: Session = Depends(get_db)):
    """
    Retrieves the status of the semantic vector index.
    """
    status_info = get_vector_index_status(db)
    return {
        "baseline_metadata": {"available": True},
        "semantic_faiss": status_info
    }


@router.get("/semantic-search", response_model=SemanticKnowledgeSearchResponse, status_code=status.HTTP_200_OK)
def semantic_search_knowledge_evidence(
    q: str = Query(..., description="Semantic search query string"),
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    category: Optional[str] = Query(None, description="Filter by civic sector category"),
    top_k: int = Query(5, ge=1, le=20, description="Maximum number of evidence items to return (1-20)"),
    db: Session = Depends(get_db),
):
    """
    Semantic FAISS Vector Retrieval Endpoint.
    Retrieves grounded KnowledgeEvidence records matching semantic query intent.
    """
    if not q or not q.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="query must be a non-empty string.",
        )

    try:
        return semantic_search(
            db=db,
            query=q,
            top_k=top_k,
            state=state,
            district=district,
            category=category,
        )
    except VectorIndexUnavailableException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {e}")


@router.get("/datasets/{dataset_id}", response_model=KnowledgeDatasetSummaryResponse, status_code=status.HTTP_200_OK)
def get_knowledge_dataset_summary(
    dataset_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieves knowledge ingestion summary for a specific dataset ID.
    """
    summary = KnowledgeService.get_dataset_summary(db, dataset_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found in knowledge repository.",
        )
    return summary
