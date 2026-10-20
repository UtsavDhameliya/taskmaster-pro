from database.database import get_db
from src.models.user_models import User
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
import re
from bcrypt import hashpw, checkpw, gensalt
from logs.log import logger
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import random
from config import SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from jose.exceptions import JWTError
from typing import Optional, Union
from datetime import datetime, timedelta, timezone


def email_exists(email: str, db: Session = Depends(get_db)):
    user_find = db.query(User).filter(User.email == email).first()
    if user_find:
        logger.error(f"Email {email} already exists")
        raise HTTPException(status_code=400, detail="Email already exists")


def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long"
        )

    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter"
        )

    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one lowercase letter"
        )

    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one number"
        )

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one special character"
        )

    return True


def hash_password(password: str) -> str:
    return hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')


def verify_password(user_password: str, database_password: str) -> bool:
    try:
        return checkpw(user_password.encode('utf-8'), database_password.encode('utf-8'))
    except Exception:
        return False


def generate_otp() -> str:
    return str(random.randint(1000, 9999))


def send_email(receiver: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = SMTP_USERNAME
    msg["To"] = receiver
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, receiver, msg.as_string())
        logger.info(f"Email sent successfully to {receiver}")
        return "Email sent successfully!"
    except Exception as e:
        logger.warning(f"Failed to send email to {receiver}: {e}. OTP/Notification was: {body}")
        return f"Failed to send email: {e}"


security = HTTPBearer(auto_error=False)


def create_access_token(data: dict, expires_delta: Optional[Union[timedelta, int, float]] = None):
    to_encode = data.copy()
    if isinstance(expires_delta, timedelta):
        expire = datetime.now(timezone.utc) + expires_delta
    elif isinstance(expires_delta, (int, float)):
        expire = datetime.now(timezone.utc) + timedelta(minutes=float(expires_delta))
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    token = credentials.credentials
    payload = verify_token(token)
    email = payload.get("email")

    find_user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if find_user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found or deleted"
        )

    return find_user


def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and not current_user.is_main_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user


def get_main_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_main_admin:
        raise HTTPException(
            status_code=403,
            detail="Only main admin can perform this action"
        )
    return current_user
