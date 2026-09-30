from typing import Optional, Literal, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

IngestionStatusType = Literal["NOT_INGESTED", "INGESTED", "FAILED", "VERIFIED", "VALIDATING", "DEPRECATED"]
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
    geographic_level: str = "District"
    category: str = "Other"
    year: Optional[int] = None
    period: Optional[str] = None
    last_updated: Optional[str] = None
    license: str = "Government Open Data License - India (GODL)"
    ingestion_status: IngestionStatusType = "NOT_INGESTED"
    retrieval_method: Optional[str] = "official_download"
    source_format: Optional[str] = "CSV"
    notes: Optional[str] = None

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
    geographic_level: str
    category: str
    year: Optional[int] = None
    period: Optional[str] = None
    last_updated: Optional[str] = None
    license: str
    ingestion_status: str
    record_count: int
    retrieval_method: Optional[str] = None
    source_format: Optional[str] = None
    notes: Optional[str] = None
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
    page: int = 1
    limit: int = 50
    records: List[PublicDataRecordResponse]

class DatasetQualityReport(BaseModel):
    dataset_id: str
    title: str
    category: str
    status: str
    raw_row_count: int
    normalized_row_count: int
    valid_row_count: int
    invalid_row_count: int
    duplicate_count: int
    null_metric_count: int
    geographic_coverage_states: int
    geographic_coverage_districts: int
    knowledge_evidence_count: int
    quality_flags: List[Dict[str, Any]] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class DatasetIngestionRunResponse(BaseModel):
    id: int
    dataset_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    status: str
    raw_records: int
    normalized_records: int
    inserted_records: int
    skipped_records: int
    duplicate_records: int
    error_count: int
    warning_count: int
    message: Optional[str] = None
