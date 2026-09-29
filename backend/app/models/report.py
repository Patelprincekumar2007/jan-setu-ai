import datetime
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    original_narrative = Column(Text, nullable=False)
    ai_structured_report = Column(JSON, nullable=True)  # Structured JSON from Gemini
    language = Column(String, default="en")
    category = Column(String, nullable=False, index=True)
    subcategory = Column(String, nullable=True)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)
    locality = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    severity = Column(String, default="medium", index=True)  # low, medium, high, critical
    status = Column(String, default="submitted", index=True)  # submitted, structuring, analyzed, in_review, resolved
    is_demo = Column(String, default="false")  # "true" or "false"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    locations = relationship("ReportLocation", back_populates="report", cascade="all, delete-orphan")
    analysis = relationship("Analysis", back_populates="report", uselist=False, cascade="all, delete-orphan")
    priority_signal = relationship("PrioritySignal", back_populates="report", uselist=False, cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="report", cascade="all, delete-orphan")

class ReportLocation(Base):
    __tablename__ = "report_locations"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    locality = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    report = relationship("Report", back_populates="locations")
