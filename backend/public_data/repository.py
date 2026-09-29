import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.public_data.models import Dataset, PublicDataRecord
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate

def create_dataset(db: Session, dataset_in: DatasetCreate) -> Dataset:
    """Create and persist a new dataset metadata entry."""
    db_dataset = Dataset(
        dataset_id=dataset_in.dataset_id,
        title=dataset_in.title,
        description=dataset_in.description,
        source_name=dataset_in.source_name,
        source_url=dataset_in.source_url,
        publisher=dataset_in.publisher,
        data_type=dataset_in.data_type,
        geographic_scope=dataset_in.geographic_scope,
        last_updated=dataset_in.last_updated,
        license=dataset_in.license,
        ingestion_status=dataset_in.ingestion_status,
        record_count=0,
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_dataset(db: Session, dataset_id: str) -> Optional[Dataset]:
    """Retrieve dataset metadata by ID."""
    return db.query(Dataset).filter(Dataset.dataset_id == dataset_id).first()

def list_datasets(db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Dataset], int]:
    """List all registered datasets with total count."""
    query = db.query(Dataset)
    total = query.count()
    items = query.order_by(Dataset.created_at.desc()).offset(skip).limit(limit).all()
    return items, total

def update_dataset_status(
    db: Session,
    dataset_id: str,
    status: str,
    record_count: int,
    ingested_at: Optional[datetime.datetime] = None,
) -> Optional[Dataset]:
    """Update ingestion status and record count for a dataset."""
    db_dataset = get_dataset(db, dataset_id)
    if db_dataset:
        db_dataset.ingestion_status = status
        db_dataset.record_count = record_count
        db_dataset.ingested_at = ingested_at or datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        db.refresh(db_dataset)
    return db_dataset

def create_public_record(db: Session, record_in: PublicDataRecordCreate) -> PublicDataRecord:
    """Create and persist a single normalized public data record."""
    db_record = PublicDataRecord(
        record_id=record_in.record_id,
        dataset_id=record_in.dataset_id,
        state=record_in.state,
        district=record_in.district,
        locality=record_in.locality,
        category=record_in.category,
        metric_name=record_in.metric_name,
        metric_value=record_in.metric_value,
        unit=record_in.unit,
        year=record_in.year,
        period=record_in.period,
        geographic_level=record_in.geographic_level,
        source_reference=record_in.source_reference,
        notes=record_in.notes,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

def bulk_create_public_records(
    db: Session, records_in: List[PublicDataRecordCreate]
) -> int:
    """Bulk insert normalized public data records."""
    if not records_in:
        return 0

    dataset_id = records_in[0].dataset_id
    # Clear any existing records for idempotency
    db.query(PublicDataRecord).filter(PublicDataRecord.dataset_id == dataset_id).delete()

    db_records = [
        PublicDataRecord(
            record_id=r.record_id,
            dataset_id=r.dataset_id,
            state=r.state,
            district=r.district,
            locality=r.locality,
            category=r.category,
            metric_name=r.metric_name,
            metric_value=r.metric_value,
            unit=r.unit,
            year=r.year,
            period=r.period,
            geographic_level=r.geographic_level,
            source_reference=r.source_reference,
            notes=r.notes,
        )
        for r in records_in
    ]
    db.bulk_save_objects(db_records)
    db.commit()
    return len(db_records)

def get_public_record(db: Session, record_id: str) -> Optional[PublicDataRecord]:
    """Retrieve a single public data record by ID."""
    return db.query(PublicDataRecord).filter(PublicDataRecord.record_id == record_id).first()

def list_public_records(
    db: Session,
    dataset_id: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> Tuple[List[PublicDataRecord], int]:
    """List public data records with optional filters."""
    query = db.query(PublicDataRecord)
    if dataset_id:
        query = query.filter(PublicDataRecord.dataset_id == dataset_id)
    if state:
        query = query.filter(PublicDataRecord.state.ilike(f"%{state}%"))
    if district:
        query = query.filter(PublicDataRecord.district.ilike(f"%{district}%"))
    if category:
        query = query.filter(PublicDataRecord.category == category)

    total = query.count()
    items = query.order_by(PublicDataRecord.record_id.asc()).offset(skip).limit(limit).all()
    return items, total
