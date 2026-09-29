import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id = Column(String(100), primary_key=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_name = Column(String(200), nullable=False)
    source_url = Column(String(500), nullable=True)
    publisher = Column(String(200), nullable=True)
    data_type = Column(String(100), default="tabular", nullable=False)
    geographic_scope = Column(String(100), default="National", nullable=False)
    last_updated = Column(String(50), nullable=True)
    license = Column(String(200), default="Open Government Data License - India", nullable=False)
    ingestion_status = Column(String(30), default="NOT_INGESTED", nullable=False)
    record_count = Column(Integer, default=0, nullable=False)
    ingested_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    records = relationship("PublicDataRecord", back_populates="dataset", cascade="all, delete-orphan")

class PublicDataRecord(Base):
    __tablename__ = "public_data_records"

    record_id = Column(String(100), primary_key=True, index=True, nullable=False)
    dataset_id = Column(String(100), ForeignKey("datasets.dataset_id"), index=True, nullable=False)
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
    source_reference = Column(String(150), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    dataset = relationship("Dataset", back_populates="records")

Index("idx_public_data_lookup", PublicDataRecord.dataset_id, PublicDataRecord.state, PublicDataRecord.district, PublicDataRecord.category)
