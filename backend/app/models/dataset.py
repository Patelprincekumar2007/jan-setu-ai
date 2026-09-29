import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    source_url = Column(String, nullable=True)
    dataset_identifier = Column(String, unique=True, index=True, nullable=False)  # e.g., CGWB-2024-WTR
    category = Column(String, nullable=False, index=True)
    geographic_scope = Column(String, default="National")
    time_period = Column(String, nullable=True)
    record_count = Column(Integer, default=0)
    ingestion_status = Column(String, default="AVAILABLE")  # CONNECTED, AVAILABLE, INGESTING, INDEXING, ERROR, NOT_CONFIGURED
    verification_status = Column(String, default="VERIFIED_PUBLIC")
    is_demo = Column(String, default="false")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    evidences = relationship("Evidence", back_populates="dataset", cascade="all, delete-orphan")
