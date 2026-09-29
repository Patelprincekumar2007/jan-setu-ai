from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class DatasetCreate(BaseModel):
    name: str
    organization: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    dataset_identifier: str
    category: str
    geographic_scope: Optional[str] = "National"
    time_period: Optional[str] = None

class DatasetOut(BaseModel):
    id: str
    name: str
    organization: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    dataset_identifier: str
    category: str
    geographic_scope: str
    time_period: Optional[str] = None
    record_count: int
    ingestion_status: str
    verification_status: str
    is_demo: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
