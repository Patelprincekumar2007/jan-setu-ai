from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class CategoryDemandMetric(BaseModel):
    category: str
    request_count: int
    affected_households: Optional[int] = None
    percentage: float

class CategoryAnalyticsResponse(BaseModel):
    total_requests: int
    categories: List[CategoryDemandMetric]

class GeographicDemandMetric(BaseModel):
    state: str
    district: str
    locality: Optional[str] = None
    request_count: int
    affected_households: Optional[int] = None

class GeographicAnalyticsResponse(BaseModel):
    total_locations: int
    total_requests: int
    locations: List[GeographicDemandMetric]

class TimelinePoint(BaseModel):
    date: str  # YYYY-MM-DD
    request_count: int

class TimelineAnalyticsResponse(BaseModel):
    total_days: int
    timeline: List[TimelinePoint]

class EvidenceCoverageAnalyticsResponse(BaseModel):
    total_requests: int
    requests_with_evidence: int
    requests_without_evidence: int
    coverage_percentage: Optional[float] = None
    note: str = "Coverage measures the proportion of submitted requests with at least one linked public evidence item."

class SeverityAnalyticsResponse(BaseModel):
    total_requests: int
    counts: Dict[str, int]  # LOW, MEDIUM, HIGH, CRITICAL, UNSPECIFIED
