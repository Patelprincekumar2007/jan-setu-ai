from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.dataset import Dataset
from app.schemas.dataset import DatasetOut

router = APIRouter(prefix="/datasets", tags=["Public Datasets"])

@router.get("", response_model=List[DatasetOut])
def list_datasets(db: Session = Depends(get_db)):
    return db.query(Dataset).order_by(Dataset.name.asc()).all()

@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset
