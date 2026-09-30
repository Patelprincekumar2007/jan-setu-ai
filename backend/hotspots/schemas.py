from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class HotspotFactorMetrics(BaseModel):
    request_count: int
    affected_households: Optional[int] = None
    high_severity_request_count: int
    evidence_coverage: float  # Percentage of requests in cluster with >= 1 linked public evidence item
    category_concentration: float  # Percentage of requests in this geography belonging to this category

class HotspotDetailResponse(BaseModel):
    hotspot_id: str
    state: str
    district: str
    locality: Optional[str] = None
    category: str
    request_count: int
    affected_households: Optional[int] = None
    evidence_count: int
    severity_distribution: Dict[str, int]
    methodology_version: str = "hotspot-v1"
    factors: HotspotFactorMetrics
    limitations: List[str] = []
    created_at: datetime

class HotspotListResponse(BaseModel):
    total_hotspots: int
    methodology_version: str = "hotspot-v1"
    hotspots: List[HotspotDetailResponse]

class AnalyticsOverviewResponse(BaseModel):
    total_requests: int
    requests_with_evidence: int
    requests_without_evidence: int
    priority_assessments_generated: int
    hotspot_groups: int
    verified_datasets: int
    evidence_records: int
