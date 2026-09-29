from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.rag.schemas import AnalysisResponse
from backend.rag.service import create_or_update_request_analysis

router = APIRouter(prefix="/api/requests", tags=["RAG Grounded Analysis"])


@router.post("/{reference_id}/analysis", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
def trigger_request_analysis(
    reference_id: str,
    db: Session = Depends(get_db),
):
    """
    Triggers on-demand RAG grounded analysis using Google Gemini and retrieved Public Data Evidence.
    Grounded strictly in verified KnowledgeEvidence without fabrication.
    """
    try:
        return create_or_update_request_analysis(db, reference_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating grounded analysis: {e}",
        )
