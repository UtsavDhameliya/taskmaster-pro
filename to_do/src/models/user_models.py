from database.database import Base
from sqlalchemy import Boolean, Column, DateTime, Integer, String
import uuid
from datetime import datetime
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(), nullable=False)
    email = Column(String(), unique=True, index=True, nullable=False)
    password = Column(String(), nullable=False)
    status = Column(String(20), default="active", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False, nullable=False)
    otp = relationship("OTP_Model", back_populates="user", cascade="all,delete-orphan")
    todos = relationship("Todo", back_populates="user", cascade="all,delete-orphan")
    login_attempts = Column(Integer, default=0)
    blocked_until = Column(DateTime, nullable=True)
    role = Column(String(20), default="user", nullable=False)
    is_main_admin = Column(Boolean, default=False, nullable=False)
