from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class PriorityFactor(BaseModel):
    name: str
    status: str  # supported, insufficient_evidence, missing_vulnerability_data
    value: Optional[float] = None
    weight: float

class PrioritySignalOut(BaseModel):
    id: str
    report_id: str
    score: Optional[float] = None
    status: str  # supported, insufficient_evidence, missing_vulnerability_data
    factors: List[Dict[str, Any]]
    explanation: str
    created_at: datetime

    class Config:
        from_attributes = True
