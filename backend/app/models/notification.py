import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, default="info")  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
