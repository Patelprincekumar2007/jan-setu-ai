import datetime
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from backend.public_data.models import Dataset, PublicDataRecord, DatasetIngestionRun
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate, DatasetQualityReport
from backend.knowledge.models import KnowledgeEvidence
from backend.public_data.validators import DataRecordValidator

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
        geographic_level=dataset_in.geographic_level,
        category=dataset_in.category,
        year=dataset_in.year,
        period=dataset_in.period,
        last_updated=dataset_in.last_updated,
        license=dataset_in.license,
        ingestion_status=dataset_in.ingestion_status,
        record_count=0,
        retrieval_method=dataset_in.retrieval_method,
        source_format=dataset_in.source_format,
        notes=dataset_in.notes,
    )
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_dataset(db: Session, dataset_id: str) -> Optional[Dataset]:
    """Retrieve dataset metadata by ID."""
    return db.query(Dataset).filter(Dataset.dataset_id == dataset_id).first()

def list_datasets(
    db: Session,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> Tuple[List[Dataset], int]:
    """List registered datasets with optional category/status filter."""
    query = db.query(Dataset)
    if category:
        query = query.filter(Dataset.category.ilike(f"%{category}%"))
    if status:
        query = query.filter(Dataset.ingestion_status == status)
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
    """Bulk insert normalized public data records with idempotent replacement."""
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
    year: Optional[int] = None,
    geographic_level: Optional[str] = None,
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
    if year:
        query = query.filter(PublicDataRecord.year == year)
    if geographic_level:
        query = query.filter(PublicDataRecord.geographic_level.ilike(f"%{geographic_level}%"))

    total = query.count()
    items = query.order_by(PublicDataRecord.record_id.asc()).offset(skip).limit(limit).all()
    return items, total

def log_ingestion_run(
    db: Session,
    dataset_id: str,
    status: str,
    raw_records: int,
    normalized_records: int,
    inserted_records: int,
    skipped_records: int = 0,
    duplicate_records: int = 0,
    error_count: int = 0,
    warning_count: int = 0,
    message: Optional[str] = None,
) -> DatasetIngestionRun:
    """Records an ingestion lifecycle event into dataset_ingestion_runs."""
    run = DatasetIngestionRun(
        dataset_id=dataset_id,
        started_at=datetime.datetime.now(datetime.timezone.utc),
        completed_at=datetime.datetime.now(datetime.timezone.utc),
        status=status,
        raw_records=raw_records,
        normalized_records=normalized_records,
        inserted_records=inserted_records,
        skipped_records=skipped_records,
        duplicate_records=duplicate_records,
        error_count=error_count,
        warning_count=warning_count,
        message=message,
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

def get_dataset_quality_report(db: Session, dataset_id: str) -> Optional[DatasetQualityReport]:
    """Calculates factual quality metrics and flags for a registered dataset."""
    dataset = get_dataset(db, dataset_id)
    if not dataset:
        return None

    records = db.query(PublicDataRecord).filter(PublicDataRecord.dataset_id == dataset_id).all()
    evidence_count = db.query(KnowledgeEvidence).filter(KnowledgeEvidence.dataset_id == dataset_id).count()

    total_records = len(records)
    null_metrics = sum(1 for r in records if r.metric_value is None)
    states = set(r.state for r in records if r.state)
    districts = set(r.district for r in records if r.district)

    flags: List[Dict[str, Any]] = []
    valid_count = 0
    invalid_count = 0

    for r in records:
        r_flags = DataRecordValidator.validate_record(r)
        if r_flags:
            flags.extend(r_flags)
            if any(f.get("severity") == "ERROR" for f in r_flags):
                invalid_count += 1
            else:
                valid_count += 1
        else:
            valid_count += 1

    return DatasetQualityReport(
        dataset_id=dataset.dataset_id,
        title=dataset.title,
        category=dataset.category,
        status=dataset.ingestion_status,
        raw_row_count=total_records,
        normalized_row_count=total_records,
        valid_row_count=valid_count,
        invalid_row_count=invalid_count,
        duplicate_count=0,
        null_metric_count=null_metrics,
        geographic_coverage_states=len(states),
        geographic_coverage_districts=len(districts),
        knowledge_evidence_count=evidence_count,
        quality_flags=flags[:50],
        generated_at=datetime.datetime.now(datetime.timezone.utc),
    )

