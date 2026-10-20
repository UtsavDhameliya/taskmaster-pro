from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.database import get_db
from src.models.todo_models import Todo
from src.schemas.todo_schemas import Todo_Create, Todo_Return, Todo_Update
from src.models.user_models import User
from src.utils.user_utils import get_current_user, send_email
from datetime import datetime, timedelta, date
from src.utils.todo import find_todo, description_exists
import uuid

todo_router = APIRouter()


@todo_router.post("/create", response_model=Todo_Return) 
def create_todo(
    todo_data: Todo_Create,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if todo_data.due_date and todo_data.due_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be before today"
        )

    if todo_data.description and todo_data.description.strip():
        existing_todo = description_exists(
            todo_data.description,
            current_user.id,
            db
        )
        if existing_todo:
            raise HTTPException(
                status_code=400,
                detail="A task with this description already exists"
            )

    new_todo = Todo(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        title=todo_data.title,
        description=todo_data.description.strip() if todo_data.description else None,
        status=todo_data.status or "pending",
        priority=todo_data.priority or "medium",
        due_date=todo_data.due_date,
        reminder_at=todo_data.reminder_at,
        task_date=todo_data.task_date
    )

    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)

    return new_todo


@todo_router.get("/Todo_data/{todo_id}", response_model=Todo_Return)
def todo_data(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    single_todo = find_todo(todo_id, current_user.id, db)
    return single_todo


@todo_router.get("/all_task", response_model=list[Todo_Return])
def all_tasks(
    status: str | None = None,
    priority: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Todo).filter(
        Todo.user_id == current_user.id,
        Todo.is_deleted == False
    )
    if status and status.lower() != "all":
        query = query.filter(Todo.status == status.lower())
        
    if priority and priority.lower() != "all":
        query = query.filter(Todo.priority == priority.lower())

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Todo.title.ilike(term)) | (Todo.description.ilike(term))
        )

    query = query.order_by(Todo.created_at.desc())
    return query.all()


@todo_router.get("/trash", response_model=list[Todo_Return])
def get_trash_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve soft-deleted tasks that can be restored."""
    deleted_todos = db.query(Todo).filter(
        Todo.user_id == current_user.id,
        Todo.is_deleted == True
    ).order_by(Todo.deleted_at.desc()).all()
    return deleted_todos


@todo_router.put("/Todo_update", response_model=Todo_Return)
def todo_update(
    todo_id: str,
    todo_data: Todo_Update,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todo = find_todo(todo_id, current_user.id, db)

    if todo_data.title is not None:
        todo.title = todo_data.title

    if todo_data.description is not None:
        todo.description = todo_data.description

    if todo_data.status is not None:
        todo.status = todo_data.status

    if todo_data.priority is not None:
        todo.priority = todo_data.priority

    if todo_data.due_date is not None:
        todo.due_date = todo_data.due_date

    if todo_data.reminder_at is not None:
        todo.reminder_at = todo_data.reminder_at

    if todo_data.task_date is not None:
        todo.task_date = todo_data.task_date
        
    todo.updated_at = datetime.now()
    db.commit()
    db.refresh(todo)

    return todo


@todo_router.delete("/delete_todo")
def delete_todo(
    todo_id: str,
    user_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Authenticated user ID is always respected
    todo = find_todo(todo_id, current_user.id, db)

    todo.is_deleted = True
    todo.deleted_at = datetime.now()

    db.commit()
    db.refresh(todo)

    return {"message": "Todo deleted successfully", "todo_id": todo.id}


@todo_router.delete("/permanent_delete/{todo_id}")
def permanent_delete_todo(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    ).first()

    if not todo:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(todo)
    db.commit()
    return {"message": "Task permanently deleted"}


@todo_router.put("/restore_todo", response_model=Todo_Return)
def restore_todo(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    todo = (
        db.query(Todo)
        .filter(
            Todo.id == todo_id,
            Todo.user_id == current_user.id,
            Todo.is_deleted == True
        )
        .first()
    )

    if not todo:
        raise HTTPException(status_code=404, detail="Deleted todo not found")

    # Recovery window allowed (e.g. within 7 days)
    if todo.deleted_at is not None:
        seven_days = datetime.now() - timedelta(days=7)
        if todo.deleted_at < seven_days:
            raise HTTPException(
                status_code=400, detail="Todo cannot be recovered after 7 days"
            )

    todo.is_deleted = False
    todo.deleted_at = None
    todo.updated_at = datetime.now()

    db.commit()
    db.refresh(todo)

    return todo


@todo_router.post("/send-reminder")
def send_task_reminder(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.is_deleted:
        raise HTTPException(
            status_code=400,
            detail="User has been deleted"
        )

    tomorrow = date.today() + timedelta(days=1)

    tasks = db.query(Todo).filter(
        Todo.user_id == current_user.id,
        (Todo.task_date == tomorrow) | (Todo.due_date == tomorrow),
        Todo.is_deleted == False,
        Todo.status == "pending"
    ).all()

    if not tasks:
        return {
            "message": "No tasks due tomorrow",
            "total_tasks": 0
        }

    for task in tasks:
        subject = f"Todo Task Reminder: {task.title}"
        body = f"""Hello {current_user.name},

This is a reminder that your task is due tomorrow.

Title: {task.title}
Description: {task.description or 'No description'}
Due Date: {task.due_date or task.task_date}
Priority: {task.priority.capitalize()}

Please complete your task on time!
Thank you.
"""
        send_email(
            receiver=current_user.email,
            subject=subject,
            body=body
        )

    return {
        "message": f"Reminder emails sent for {len(tasks)} task(s)",
        "total_tasks": len(tasks)
    }
