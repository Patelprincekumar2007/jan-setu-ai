from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

CategoryType = Literal["Water", "Roads", "Healthcare", "Sanitation", "Other"]
SeverityType = Literal["Low", "Medium", "High", "Critical"]

class GeminiExtractionResult(BaseModel):
    category: Optional[CategoryType] = None
    severity: Optional[SeverityType] = None
    problem_summary: Optional[str] = None
    affected_group: Optional[str] = None
    location_hint: Optional[str] = None
    language: Optional[str] = None

class CitizenRequestCreate(BaseModel):
    citizen_request: str = Field(..., min_length=5, max_length=5000, description="Detailed description of the civic problem")
    state: str = Field(..., min_length=2, max_length=100)
    district: str = Field(..., min_length=2, max_length=100)
    locality: str = Field(..., min_length=2, max_length=150)
    category: CategoryType
    affected_household_count: Optional[int] = Field(None, ge=0, description="Estimated number of households affected")

    @field_validator("citizen_request", "state", "district", "locality", mode="before")
    @classmethod
    def check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or whitespace only.")
            return cleaned
        raise ValueError("Field must be a valid string.")

class CitizenRequestCreateResponse(BaseModel):
    reference_id: str
    status: str
    message: str

class RequestLocation(BaseModel):
    state: str
    district: str
    locality: str

class CitizenRequestDetailResponse(BaseModel):
    reference_id: str
    citizen_request: str
    location: RequestLocation
    category: str
    affected_household_count: Optional[int] = None
    status: str
    ai_extraction_status: str
    language: Optional[str] = None
    problem_summary: Optional[str] = None
    severity: Optional[str] = None
    affected_group: Optional[str] = None
    location_hint: Optional[str] = None
    retrieval_status: str = "NOT_RUN"
    evidence_count: int = 0
    created_at: datetime
