from database.database import Base
from sqlalchemy import Boolean, Column, DateTime, String, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
import uuid

class OTP_Model(Base):
    __tablename__ = "OTP"

    id = Column(String(50), primary_key=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    email = Column(String, nullable=False)
    otp = Column(String, nullable=False)  
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now, nullable=False)
    otp_type = Column(String(40), nullable=False)
    expire_at = Column(DateTime(timezone=True), nullable=False)
    user = relationship("User", back_populates="otp")
