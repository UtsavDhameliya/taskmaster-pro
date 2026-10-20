import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config import ACCESS_TOKEN_EXPIRE_MINUTES
from database.database import get_db
from src.models.todo_models import Todo
from src.schemas.admin_schemas import User_Return
from src.models.user_models import User
from datetime import datetime
from src.utils.user_utils import (
    create_access_token,
    get_current_admin,
    get_main_admin,
    hash_password,
    verify_password,
)

admin = APIRouter()


@admin.post("/admin/login")
def admin_login(email: str, password: str, db: Session = Depends(get_db)):
    user = (
        db.query(User)
        .filter(User.email == email, User.role == "admin", User.is_deleted == False)
        .first()
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid admin email or password")

    if not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    data = {"email": user.email, "role": user.role, "id": user.id}
    token = create_access_token(data, ACCESS_TOKEN_EXPIRE_MINUTES)

    return {
        "msg": "Admin Login Successfully",
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_main_admin": user.is_main_admin,
            "is_verified": user.is_verified,
        }
    }


@admin.post("/create")
def create_admin(
    name: str,
    email: str,
    password: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_main_admin),
):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_admin = User(
        id=str(uuid.uuid4()),
        name=name,
        email=email,
        password=hash_password(password),
        role="admin",
        is_main_admin=False,
        is_verified=True
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "message": "Admin created successfully",
        "admin": {
            "id": new_admin.id,
            "name": new_admin.name,
            "email": new_admin.email,
            "role": new_admin.role,
            "is_main_admin": new_admin.is_main_admin
        },
    }


@admin.get("/admin/users/{user_id}")
def user_detail(
    user_id: str, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "is_main_admin": user.is_main_admin,
        "is_verified": user.is_verified,
        "status": user.status,
        "created_at": user.created_at,
        "is_deleted": user.is_deleted
    }


@admin.get("/all_users", response_model=list[User_Return])
def get_all_users(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)
):
    users = db.query(User).filter(User.is_deleted == False).order_by(User.created_at.desc()).all()
    return users


@admin.get("/admin/todos")
def get_all_user_todos(
    db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)
):
    todos = db.query(Todo).filter(Todo.is_deleted == False).order_by(Todo.created_at.desc()).all()

    result = []
    for todo in todos:
        user = db.query(User).filter(User.id == todo.user_id).first()
        result.append(
            {
                "id": todo.id,
                "todo_id": todo.id,
                "user_id": todo.user_id,
                "user_name": user.name if user else "Unknown",
                "user_email": user.email if user else "Unknown",
                "title": todo.title,
                "description": todo.description,
                "status": todo.status,
                "priority": todo.priority,
                "due_date": todo.due_date,
                "reminder_at": todo.reminder_at,
                "created_at": todo.created_at,
            }
        )

    return result


@admin.get("/users/{user_id}/todos")
def get_user_todos(
    user_id: str,
    todo_id: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    query = db.query(Todo).filter(
        Todo.user_id == user_id,
        Todo.is_deleted == False
    )

    if todo_id:
        query = query.filter(Todo.id == todo_id)

    if status and status.lower() != "all":
        query = query.filter(Todo.status == status.lower())

    if priority and priority.lower() != "all":
        query = query.filter(Todo.priority == priority.lower())

    todos = query.order_by(Todo.created_at.desc()).all()
    return todos


@admin.delete("/admin/user/{user_id}")
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.is_main_admin:
        raise HTTPException(status_code=403, detail="Cannot delete the main admin")

    if user.role == "admin" and not current_admin.is_main_admin:
        raise HTTPException(
            status_code=403, detail="Only the main admin can delete another admin"
        )

    user.is_deleted = True
    user.deleted_at = datetime.now()

    db.commit()
    db.refresh(user)

    return {"msg": "User deleted successfully", "user_id": user.id}


@admin.delete("/admin/user/{user_id}/todo/{todo_id}")
def delete_todo(
    user_id: str,
    todo_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    todo = (
        db.query(Todo)
        .filter(Todo.id == todo_id, Todo.user_id == user_id, Todo.is_deleted == False)
        .first()
    )

    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found for this user")

    todo.is_deleted = True
    todo.deleted_at = datetime.now()

    db.commit()
    db.refresh(todo)

    return {"msg": "Todo deleted successfully", "user_id": user_id, "todo_id": todo_id}
