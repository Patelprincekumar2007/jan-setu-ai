from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class GroundedObservation(BaseModel):
    statement: str = Field(..., description="Fact-checked observation grounded in evidence")
    evidence_ids: List[str] = Field(default_factory=list, description="List of evidence IDs supporting this observation")


class GroundedAnalysis(BaseModel):
    summary: str = Field(..., description="High-level objective summary of the situation")
    observations: List[GroundedObservation] = Field(default_factory=list)
    evidence_used: List[str] = Field(default_factory=list)
    evidence_gaps: List[str] = Field(default_factory=list)
    source_references: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    reference_id: str
    model_name: str
    status: str  # "COMPLETED", "INSUFFICIENT_EVIDENCE", "FAILED"
    analysis: GroundedAnalysis
    created_at: datetime
