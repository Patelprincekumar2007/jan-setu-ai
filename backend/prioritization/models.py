import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base

class RequestPriorityAssessment(Base):
    __tablename__ = "request_priority_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(Integer, ForeignKey("requests.id"), index=True, nullable=False)
    request_reference_id = Column(String(50), index=True, nullable=False)
    overall_priority = Column(Float, nullable=False)
    priority_band = Column(String(20), nullable=False)
    methodology_version = Column(String(50), default="priority-v1", nullable=False)
    evidence_count = Column(Integer, default=0, nullable=False)
    limitations = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    factors = relationship(
        "RequestPriorityFactor",
        back_populates="assessment",
        cascade="all, delete-orphan",
        order_by="RequestPriorityFactor.id",
    )


class RequestPriorityFactor(Base):
    __tablename__ = "request_priority_factors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("request_priority_assessments.id"), index=True, nullable=False)
    factor = Column(String(100), nullable=False)
    raw_value = Column(Float, nullable=True)
    normalized_value = Column(Float, nullable=True)
    weight = Column(Float, nullable=False)
    available = Column(Boolean, default=True, nullable=False)
    contribution = Column(Float, nullable=True)
    source = Column(String(200), nullable=True)
    evidence_ids = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    assessment = relationship("RequestPriorityAssessment", back_populates="factors")
