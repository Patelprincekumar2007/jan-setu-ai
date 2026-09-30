from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.prioritization.schemas import PriorityAssessmentResponse
from backend.prioritization.service import PrioritizationService

router = APIRouter(prefix="/api/requests", tags=["Evidence-Based Prioritisation"])

@router.post(
    "/{reference_id}/priority",
    response_model=PriorityAssessmentResponse,
    status_code=status.HTTP_200_OK,
)
def generate_request_priority(
    reference_id: str,
    db: Session = Depends(get_db),
):
    """
    Computes and persists a deterministic, evidence-grounded priority assessment for a citizen request.
    """
    try:
        assessment = PrioritizationService.calculate_and_persist_priority(db, reference_id)
        return assessment
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prioritization calculation failed: {e}",
        )


@router.get(
    "/{reference_id}/priority",
    response_model=PriorityAssessmentResponse,
    status_code=status.HTTP_200_OK,
)
def get_request_priority(
    reference_id: str,
    db: Session = Depends(get_db),
):
    """
    Retrieves the persisted priority assessment for a citizen request.
    Returns 404 if not yet generated.
    """
    assessment = PrioritizationService.get_priority_assessment(db, reference_id)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Priority assessment has not been generated for request '{reference_id}'.",
        )
    return assessment
