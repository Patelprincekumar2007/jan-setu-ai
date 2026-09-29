import datetime

from sqlalchemy import Column, DateTime, ForeignKey, JSON, String, Text

from app.database import Base


class RequestAnalysis(Base):
    __tablename__ = "request_analyses"

    id = Column(String, primary_key=True, index=True)
    request_id = Column(String, ForeignKey("citizen_requests.reference_id"), nullable=False, unique=True)
    model_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    structured_result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)