from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class User_Create(BaseModel):
    name: str
    email: str
    password: str
    
    
class User_Return(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = "user"
    is_main_admin: Optional[bool] = False
    is_verified: Optional[bool] = False
    status: Optional[str] = "active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
    
    
class User_Login(BaseModel):
    email: str
    password: str
        
class User_Update(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None   
    
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
