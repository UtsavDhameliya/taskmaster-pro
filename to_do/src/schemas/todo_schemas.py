from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class Todo_Create(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    due_date: Optional[date] = None 
    reminder_at: Optional[datetime] = None 
    task_date: Optional[date] = None 

class Todo_Update(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    reminder_at: Optional[datetime] = None
    task_date: Optional[date] = None

class Todo_Return(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[date] = None
    reminder_at: Optional[datetime] = None
    task_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
