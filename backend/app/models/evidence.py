import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Evidence(Base):
    __tablename__ = "evidences"

    id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, ForeignKey("datasets.id"), nullable=False)
    evidence_identifier = Column(String, unique=True, index=True, nullable=False)  # e.g., EVD-000123
    source_name = Column(String, nullable=False)
    source_organization = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    locality = Column(String, nullable=True)
    category = Column(String, nullable=False, index=True)
    reporting_period = Column(String, nullable=True)
    metric_name = Column(String, nullable=True)
    metric_value = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    extra_metadata = Column(JSON, nullable=True)
    verification_status = Column(String, default="VERIFIED_PUBLIC")
    embedding_index_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    dataset = relationship("Dataset", back_populates="evidences")
