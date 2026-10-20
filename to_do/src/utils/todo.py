from fastapi import HTTPException 
from sqlalchemy.orm import Session 
from src.models.todo_models import Todo

def find_todo(todo_id: str, user_id: str, db: Session):
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id,
        Todo.is_deleted == False
    ).first()

    if todo is None:
        raise HTTPException(
            status_code=404,
            detail="Todo not found"
        )
    
    return todo


def description_exists(description: str | None, user_id: str, db: Session):
    if not description or not description.strip():
        return None
        
    todo = db.query(Todo).filter(
        Todo.description == description.strip(),
        Todo.user_id == user_id,
        Todo.is_deleted == False
    ).first()

    return todo
