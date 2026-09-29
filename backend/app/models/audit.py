import datetime
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)
    target_type = Column(String, nullable=True)
    target_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
