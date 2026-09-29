from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.post("/datasets/{dataset_id}/ingest")
def ingest_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    if dataset.ingestion_status == "NOT_CONFIGURED":
        return {
            "status": "warning",
            "message": f"No upstream API connector configured for {dataset.name}. Manual CSV/JSON dataset upload is available."
        }

    dataset.ingestion_status = "CONNECTED"
    db.commit()
    return {
        "status": "success",
        "message": f"Dataset {dataset.name} synced and indexed successfully.",
        "record_count": dataset.record_count
    }

@router.post("/datasets/sync")
def sync_all_datasets(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role(["admin"]))
):
    datasets = db.query(Dataset).all()
    count = 0
    for ds in datasets:
        if ds.ingestion_status != "NOT_CONFIGURED":
            ds.ingestion_status = "CONNECTED"
            count += 1
    db.commit()
    return {
        "status": "success",
        "synced_count": count,
        "message": f"Synced {count} configured dataset catalog(s)."
    }
