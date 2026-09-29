from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class CitizenRequestCreate(BaseModel):
    citizen_request: str = Field(..., min_length=1, max_length=5000)
    category: str = Field(..., min_length=1, max_length=100)
    state: str = Field(..., min_length=1, max_length=100)
    district: str = Field(..., min_length=1, max_length=100)
    locality: Optional[str] = Field(None, max_length=255)
    affected_households: Optional[int] = Field(None, ge=0)


class CitizenRequestResponse(BaseModel):
    reference_id: str
    citizen_request: str
    category: str
    state: str
    district: str
    locality: Optional[str]
    affected_households: Optional[int]
    status: str
    ai_extraction_status: str
    extracted_data: Optional[dict[str, Any]]
    retrieval_status: str
    retrieval_query: Optional[str]
    evidence_count: int
    created_at: datetime


class RequestEvidenceResponse(BaseModel):
    reference_id: str
    retrieval_status: str
    evidence_count: int
    results: list[dict[str, Any]]