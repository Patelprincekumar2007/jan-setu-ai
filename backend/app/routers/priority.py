from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.priority import PrioritySignal
from app.schemas.priority import PrioritySignalOut

router = APIRouter(prefix="/priority", tags=["Priority Engine"])

@router.get("/report/{report_id}", response_model=PrioritySignalOut)
def get_report_priority(report_id: str, db: Session = Depends(get_db)):
    signal = db.query(PrioritySignal).filter(PrioritySignal.report_id == report_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Priority signal not found for this report")
    return signal
