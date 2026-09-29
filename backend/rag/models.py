import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class RequestAnalysis(Base):
    __tablename__ = "request_analyses"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"), nullable=False, index=True)
    model_name = Column(String(100), nullable=False)
    status = Column(String(50), default="COMPLETED", nullable=False)  # "COMPLETED", "INSUFFICIENT_EVIDENCE", "FAILED"
    summary = Column(Text, nullable=True)
    structured_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    request = relationship("CitizenRequest", foreign_keys=[request_id])
