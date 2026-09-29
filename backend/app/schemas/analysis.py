from typing import List, Any
from datetime import datetime
from pydantic import BaseModel

class AnalysisOut(BaseModel):
    id: str
    report_id: str
    summary: str
    observations: List[Any]
    evidence_used: List[str]
    limitations: List[str]
    evidence_coverage: str
    grounding_status: str
    created_at: datetime

    class Config:
        from_attributes = True
