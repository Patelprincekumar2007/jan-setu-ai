from typing import Optional, List, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class StructuredReportExtra(BaseModel):
    problem_summary: str
    category: str
    problem_type: str
    severity: str
    affected_group: Optional[str] = None
    reported_impact: Optional[str] = None
    location_mentions: List[str] = []
    key_entities: List[str] = []
    evidence_requirements: List[str] = []

class ReportCreate(BaseModel):
    title: str
    original_narrative: str
    language: Optional[str] = "en"
    category: str
    subcategory: Optional[str] = None
    state: str
    district: str
    locality: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: Optional[str] = "medium"

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    locality: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None

class ReportOut(BaseModel):
    id: str
    user_id: str
    title: str
    original_narrative: str
    ai_structured_report: Optional[Dict[str, Any]] = None
    language: str
    category: str
    subcategory: Optional[str] = None
    state: str
    district: str
    locality: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: str
    status: str
    is_demo: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
