import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text

from app.database import Base


class CitizenRequest(Base):
    __tablename__ = "citizen_requests"

    reference_id = Column(String, primary_key=True, index=True)
    citizen_request = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    locality = Column(String, nullable=True)
    affected_households = Column(Integer, nullable=True)
    status = Column(String, nullable=False, default="RECEIVED")
    ai_extraction_status = Column(String, nullable=False, default="NOT_RUN")
    extracted_data = Column(JSON, nullable=True)
    retrieval_status = Column(String, nullable=False, default="NOT_RUN")
    retrieval_query = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class RequestEvidenceMatch(Base):
    __tablename__ = "request_evidence_matches"

    id = Column(String, primary_key=True)
    request_id = Column(String, ForeignKey("citizen_requests.reference_id"), nullable=False, index=True)
    evidence_id = Column(String, ForeignKey("evidences.evidence_identifier"), nullable=False, index=True)
    retrieval_method = Column(String, nullable=False)
    rank = Column(Integer, nullable=False)
    similarity_score = Column(Float, nullable=True)
    metadata_match_level = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)