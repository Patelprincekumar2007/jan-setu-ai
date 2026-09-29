import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("reports.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    report = relationship("Report", back_populates="attachments")
