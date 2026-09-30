import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from backend.database import Base

class HotspotAssessment(Base):
    __tablename__ = "hotspot_assessments"

    id = Column(Integer, primary_key=True, index=True)
    hotspot_id = Column(String(100), unique=True, index=True, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    locality = Column(String(150), index=True, nullable=True)
    category = Column(String(50), index=True, nullable=False)
    request_count = Column(Integer, nullable=False, default=0)
    affected_households = Column(Integer, nullable=True)
    evidence_count = Column(Integer, nullable=False, default=0)
    severity_distribution = Column(Text, nullable=False)  # JSON string
    methodology_version = Column(String(50), nullable=False, default="hotspot-v1")
    factors = Column(Text, nullable=False)  # JSON string of raw factors
    limitations = Column(Text, nullable=False)  # JSON string list
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
