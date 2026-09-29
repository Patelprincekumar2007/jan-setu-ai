import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False, unique=True)
    summary = Column(Text, nullable=False)
    observations = Column(JSON, nullable=False)  # List of grounded observations
    evidence_used = Column(JSON, nullable=False)  # List of evidence IDs used
    limitations = Column(JSON, nullable=False)  # List of missing/insufficient data notes
    evidence_coverage = Column(String, nullable=False)  # STRONG, PARTIAL, INSUFFICIENT
    grounding_status = Column(String, default="GROUNDED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("Report", back_populates="analysis")
