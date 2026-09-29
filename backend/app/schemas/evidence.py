from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class EvidenceSearchQuery(BaseModel):
    query: str
    state: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None
    top_k: Optional[int] = 10

class EvidenceOut(BaseModel):
    id: str
    dataset_id: str
    evidence_identifier: str
    source_name: str
    source_organization: str
    source_url: Optional[str] = None
    title: str
    description: str
    state: str
    district: str
    locality: Optional[str] = None
    category: str
    reporting_period: Optional[str] = None
    metric_name: Optional[str] = None
    metric_value: Optional[str] = None
    raw_text: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    verification_status: str
    created_at: datetime
    similarity_score: Optional[float] = None

    class Config:
        from_attributes = True

class EvidenceSearchResult(BaseModel):
    results: List[EvidenceOut]
    evidence_coverage: str  # STRONG, PARTIAL, INSUFFICIENT
    total: int
