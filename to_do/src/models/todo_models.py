from database.database import Base
from datetime import datetime
from sqlalchemy import Column, Date, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import uuid


class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(String(50), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    due_date = Column(Date, nullable=True)
    reminder_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    user = relationship("User", back_populates="todos")
    deleted_at = Column(DateTime, nullable=True)
    task_date = Column(Date, nullable=True)
