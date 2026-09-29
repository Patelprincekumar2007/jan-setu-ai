from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

IngestionStatusType = Literal["NOT_INGESTED", "INGESTED", "FAILED"]
CategoryType = Literal["Water", "Roads", "Healthcare", "Sanitation", "Other"]

class DatasetCreate(BaseModel):
    dataset_id: str = Field(..., min_length=2, max_length=100)
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    source_name: str = Field(..., min_length=2, max_length=200)
    source_url: Optional[str] = None
    publisher: Optional[str] = None
    data_type: str = "tabular"
    geographic_scope: str = "National"
    update_frequency: str = "Annual"
    last_updated: Optional[str] = None
    license: str = "Open Government Data License - India"
    ingestion_status: IngestionStatusType = "NOT_INGESTED"

    @field_validator("dataset_id", "title", "source_name", "data_type", "geographic_scope", "license", mode="before")
    @classmethod
    def check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or whitespace only.")
            return cleaned
        raise ValueError("Field must be a valid string.")

class DatasetResponse(BaseModel):
    dataset_id: str
    title: str
    description: Optional[str] = None
    source_name: str
    source_url: Optional[str] = None
    publisher: Optional[str] = None
    data_type: str
    geographic_scope: str
    update_frequency: str
    last_updated: Optional[str] = None
    license: str
    ingestion_status: str
    record_count: int
    ingested_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

class DatasetListResponse(BaseModel):
    total: int
    datasets: List[DatasetResponse]

class PublicDataRecordCreate(BaseModel):
    record_id: str
    dataset_id: str
    state: str = Field(..., min_length=1, max_length=100)
    district: str = Field(..., min_length=1, max_length=100)
    locality: Optional[str] = None
    category: CategoryType
    metric_name: str = Field(..., min_length=1, max_length=150)
    metric_value: Optional[float] = Field(None, description="Numeric metric value")
    unit: Optional[str] = None
    year: Optional[int] = None
    period: Optional[str] = None
    geographic_level: str = "District"
    source_reference: str = Field(..., min_length=1, max_length=150)
    notes: Optional[str] = None

    @field_validator("state", "district", "metric_name", "source_reference", mode="before")
    @classmethod
    def check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or whitespace only.")
            return cleaned
        raise ValueError("Field must be a valid string.")

class PublicDataRecordResponse(BaseModel):
    record_id: str
    dataset_id: str
    state: str
    district: str
    locality: Optional[str] = None
    category: CategoryType
    metric_name: str
    metric_value: Optional[float] = None
    unit: Optional[str] = None
    year: Optional[int] = None
    period: Optional[str] = None
    geographic_level: str
    source_reference: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

class PublicRecordListResponse(BaseModel):
    total: int
    records: List[PublicDataRecordResponse]
