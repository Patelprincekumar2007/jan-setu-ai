from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.public_data.schemas import (
    DatasetResponse,
    DatasetListResponse,
    PublicRecordListResponse,
    PublicDataRecordResponse,
    DatasetQualityReport,
)
from backend.public_data.service import PublicDataService

router = APIRouter(tags=["Public Data Foundation"])

def _list_datasets_impl(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = None,
) -> DatasetListResponse:
    datasets, total = PublicDataService.list_datasets(
        db, category=category, status=status_filter, skip=skip, limit=limit
    )
    return DatasetListResponse(
        total=total,
        datasets=[
            DatasetResponse(
                dataset_id=d.dataset_id,
                title=d.title,
                description=d.description,
                source_name=d.source_name,
                source_url=d.source_url,
                publisher=d.publisher,
                data_type=d.data_type,
                geographic_scope=d.geographic_scope,
                geographic_level=d.geographic_level or "District",
                category=d.category or "Other",
                year=d.year,
                period=d.period,
                last_updated=d.last_updated,
                license=d.license,
                ingestion_status=d.ingestion_status,
                record_count=d.record_count,
                retrieval_method=d.retrieval_method,
                source_format=d.source_format,
                notes=d.notes,
                ingested_at=d.ingested_at,
                created_at=d.created_at,
            )
            for d in datasets
        ],
    )

def _get_dataset_impl(dataset_id: str, db: Session) -> DatasetResponse:
    dataset = PublicDataService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )
    return DatasetResponse(
        dataset_id=dataset.dataset_id,
        title=dataset.title,
        description=dataset.description,
        source_name=dataset.source_name,
        source_url=dataset.source_url,
        publisher=dataset.publisher,
        data_type=dataset.data_type,
        geographic_scope=dataset.geographic_scope,
        geographic_level=dataset.geographic_level or "District",
        category=dataset.category or "Other",
        year=dataset.year,
        period=dataset.period,
        last_updated=dataset.last_updated,
        license=dataset.license,
        ingestion_status=dataset.ingestion_status,
        record_count=dataset.record_count,
        retrieval_method=dataset.retrieval_method,
        source_format=dataset.source_format,
        notes=dataset.notes,
        ingested_at=dataset.ingested_at,
        created_at=dataset.created_at,
    )

def _list_records_impl(
    dataset_id: str,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    year: Optional[int] = None,
    geographic_level: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = None,
) -> PublicRecordListResponse:
    dataset = PublicDataService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )

    records, total = PublicDataService.list_records(
        db,
        dataset_id=dataset_id,
        state=state,
        district=district,
        category=category,
        year=year,
        geographic_level=geographic_level,
        skip=skip,
        limit=limit,
    )

    return PublicRecordListResponse(
        total=total,
        records=[
            PublicDataRecordResponse(
                record_id=r.record_id,
                dataset_id=r.dataset_id,
                state=r.state,
                district=r.district,
                locality=r.locality,
                category=r.category,  # type: ignore
                metric_name=r.metric_name,
                metric_value=r.metric_value,
                unit=r.unit,
                year=r.year,
                period=r.period,
                geographic_level=r.geographic_level,
                source_reference=r.source_reference,
                notes=r.notes,
                created_at=r.created_at,
            )
            for r in records
        ],
    )

def _get_quality_impl(dataset_id: str, db: Session) -> DatasetQualityReport:
    report = PublicDataService.get_quality_report(db, dataset_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{dataset_id}' not found.",
        )
    return report

# Direct /api/datasets endpoints
@router.get("/api/datasets", response_model=DatasetListResponse, status_code=status.HTTP_200_OK)
@router.get("/api/public-data/datasets", response_model=DatasetListResponse, status_code=status.HTTP_200_OK)
def list_datasets(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by ingestion status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve all registered public civic datasets."""
    return _list_datasets_impl(category=category, status_filter=status, skip=skip, limit=limit, db=db)

@router.get("/api/datasets/{dataset_id}", response_model=DatasetResponse, status_code=status.HTTP_200_OK)
@router.get("/api/public-data/datasets/{dataset_id}", response_model=DatasetResponse, status_code=status.HTTP_200_OK)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieve metadata for a specific public dataset by dataset_id."""
    return _get_dataset_impl(dataset_id=dataset_id, db=db)

@router.get("/api/datasets/{dataset_id}/records", response_model=PublicRecordListResponse, status_code=status.HTTP_200_OK)
@router.get("/api/public-data/datasets/{dataset_id}/records", response_model=PublicRecordListResponse, status_code=status.HTTP_200_OK)
def list_dataset_records(
    dataset_id: str,
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    year: Optional[int] = Query(None, description="Filter by year"),
    geographic_level: Optional[str] = Query(None, description="Filter by geographic level"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Retrieve normalized civic metric records for a specific dataset with optional geographic filters."""
    return _list_records_impl(
        dataset_id=dataset_id,
        state=state,
        district=district,
        category=category,
        year=year,
        geographic_level=geographic_level,
        skip=skip,
        limit=limit,
        db=db,
    )

@router.get("/api/datasets/{dataset_id}/quality", response_model=DatasetQualityReport, status_code=status.HTTP_200_OK)
@router.get("/api/public-data/datasets/{dataset_id}/quality", response_model=DatasetQualityReport, status_code=status.HTTP_200_OK)
def get_dataset_quality(dataset_id: str, db: Session = Depends(get_db)):
    """Retrieve non-destructive factual data quality report for a specific dataset."""
    return _get_quality_impl(dataset_id=dataset_id, db=db)

