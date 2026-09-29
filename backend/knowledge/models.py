import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from backend.database import Base

class KnowledgeEvidence(Base):
    __tablename__ = "knowledge_evidence"

    evidence_id = Column(String(120), primary_key=True, index=True, nullable=False)
    dataset_id = Column(String(100), ForeignKey("datasets.dataset_id"), index=True, nullable=False)
    record_id = Column(String(100), ForeignKey("public_data_records.record_id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    locality = Column(String(150), nullable=True)
    category = Column(String(100), index=True, nullable=False)
    metric_name = Column(String(150), nullable=False)
    metric_value = Column(Float, nullable=True)
    unit = Column(String(50), nullable=True)
    year = Column(Integer, nullable=True)
    period = Column(String(50), nullable=True)
    geographic_level = Column(String(50), default="District", nullable=False)
    source_name = Column(String(200), nullable=False)
    source_url = Column(String(500), nullable=True)
    source_reference = Column(String(150), nullable=False)
    publisher = Column(String(200), nullable=True)
    license = Column(String(200), nullable=True)
    last_updated = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

Index("idx_knowledge_evidence_geo_cat", KnowledgeEvidence.state, KnowledgeEvidence.district, KnowledgeEvidence.category)
