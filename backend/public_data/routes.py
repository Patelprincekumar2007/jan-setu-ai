from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.public_data.schemas import (
    DatasetResponse,
    DatasetListResponse,
    PublicRecordListResponse,
    PublicDataRecordResponse,
)
from backend.public_data.service import PublicDataService

router = APIRouter(prefix="/api/public-data", tags=["Public Data Foundation"])

@router.get("/datasets", response_model=DatasetListResponse, status_code=status.HTTP_200_OK)
def list_datasets(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Retrieve all registered public civic datasets.
    Returns metadata, provenance details, and ingestion status.
    """
    datasets, total = PublicDataService.list_datasets(db, skip=skip, limit=limit)
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
                update_frequency=getattr(d, "update_frequency", "Annual") or "Annual",
                last_updated=d.last_updated,
                license=d.license,
                ingestion_status=d.ingestion_status,
                record_count=d.record_count,
                ingested_at=d.ingested_at,
                created_at=d.created_at,
            )
            for d in datasets
        ],
    )

@router.get("/datasets/{dataset_id}", response_model=DatasetResponse, status_code=status.HTTP_200_OK)
def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """
    Retrieve metadata for a specific public dataset by dataset_id.
    """
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
        update_frequency=getattr(dataset, "update_frequency", "Annual") or "Annual",
        last_updated=dataset.last_updated,
        license=dataset.license,
        ingestion_status=dataset.ingestion_status,
        record_count=dataset.record_count,
        ingested_at=dataset.ingested_at,
        created_at=dataset.created_at,
    )

@router.get("/datasets/{dataset_id}/records", response_model=PublicRecordListResponse, status_code=status.HTTP_200_OK)
def list_dataset_records(
    dataset_id: str,
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Retrieve normalized civic metric records for a specific dataset with optional geographic filters.
    """
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
