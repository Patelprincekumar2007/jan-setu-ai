from pydantic import BaseModel, ConfigDict, Field


class GroundedObservation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    statement: str = Field(..., min_length=1)
    evidence_ids: list[str] = Field(..., min_length=1)


class GroundedAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(..., min_length=1)
    observations: list[GroundedObservation]
    evidence_used: list[str]
    evidence_gaps: list[str]
    source_references: list[str]
    limitations: list[str]