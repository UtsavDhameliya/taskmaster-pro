from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User_Return(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_main_admin: Optional[bool] = False
    is_verified: Optional[bool] = False
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
