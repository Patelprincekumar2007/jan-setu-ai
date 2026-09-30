from typing import Optional, List, Literal
from datetime import datetime
from pydantic import BaseModel, Field

PriorityBandType = Literal["LOW", "MODERATE", "HIGH", "VERY HIGH"]

class PriorityFactorDetail(BaseModel):
    factor: str = Field(..., description="Factor name")
    raw_value: Optional[float] = Field(None, description="Raw input value before normalization")
    normalized_value: Optional[float] = Field(None, description="Normalized score contribution between 0 and 100")
    weight: float = Field(..., description="Base configured weight in percentage points")
    available: bool = Field(..., description="Whether required underlying data was available")
    contribution: Optional[float] = Field(None, description="Effective point contribution to overall score")
    source: Optional[str] = Field(None, description="Data origin or reference identifier")
    evidence_ids: List[str] = Field(default_factory=list, description="Associated knowledge evidence IDs")
    explanation: str = Field(..., description="Factual description of factor evaluation")

class PriorityAssessmentResponse(BaseModel):
    id: Optional[int] = None
    request_reference_id: str
    overall_priority: float = Field(..., ge=0.0, le=100.0, description="Overall deterministic priority score (0-100)")
    priority_band: PriorityBandType
    methodology_version: str = "priority-v1"
    evidence_count: int = 0
    factors: List[PriorityFactorDetail] = []
    limitations: List[str] = []
    generated_at: datetime
