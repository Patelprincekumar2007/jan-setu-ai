import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class PrioritySignal(Base):
    __tablename__ = "priority_signals"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False, unique=True)
    score = Column(Float, nullable=True)  # Numerical score (0-100) if supported, else None
    status = Column(String, nullable=False)  # supported, insufficient_evidence, missing_vulnerability_data
    factors = Column(JSON, nullable=False)  # List of factor objects with name, status, value, weight
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("Report", back_populates="priority_signal")
