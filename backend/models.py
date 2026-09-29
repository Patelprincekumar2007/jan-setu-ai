import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class CitizenRequest(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    citizen_request = Column(Text, nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    locality = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    affected_household_count = Column(Integer, nullable=True)
    status = Column(String(30), default="RECEIVED", nullable=False)
    ai_extraction_status = Column(String(30), default="NOT_PROCESSED", nullable=False)
    language = Column(String(50), nullable=True)
    problem_summary = Column(Text, nullable=True)
    severity = Column(String(20), nullable=True)
    affected_group = Column(String(200), nullable=True)
    location_hint = Column(String(200), nullable=True)
    retrieval_status = Column(String(30), default="NOT_RUN", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    evidence_matches = relationship("RequestEvidenceMatch", back_populates="request", cascade="all, delete-orphan", order_by="RequestEvidenceMatch.rank.asc()")


class RequestEvidenceMatch(Base):
    __tablename__ = "request_evidence_matches"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False, index=True)
    evidence_id = Column(String(120), nullable=False, index=True)
    retrieval_method = Column(String(50), nullable=False)  # "hybrid", "semantic", "metadata"
    rank = Column(Integer, nullable=False)
    similarity_score = Column(Float, default=0.0, nullable=False)
    metadata_match_level = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    request = relationship("CitizenRequest", back_populates="evidence_matches")
