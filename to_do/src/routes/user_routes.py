from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.models.user_models import User
from src.models.otp_models import OTP_Model
from database.database import get_db
from src.schemas.user_schemas import User_Create, User_Return, User_Update, User_Login
from src.utils.user_utils import (
    validate_password,
    email_exists,
    hash_password,
    verify_password,
    generate_otp,
    send_email,
    create_access_token,
    get_current_user
)
from datetime import datetime, timedelta, timezone
from config import ACCESS_TOKEN_EXPIRE_MINUTES
import uuid
from logs.log import logger

user_routers = APIRouter()


@user_routers.post("/register", response_model=User_Return)
def user_create(user_data: User_Create, db: Session = Depends(get_db)):
    validate_password(user_data.password)
    email_exists(user_data.email, db)
    logger.info(f"Creating a new user: {user_data.email}")
    user_id = str(uuid.uuid4())
    user_create = User(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        is_verified=False,
        role="user",
        is_main_admin=False
    )
    db.add(user_create)
    db.commit()
    db.refresh(user_create)
    logger.success(f"User {user_data.email} created successfully")
    return user_create


@user_routers.get("/me", response_model=User_Return)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


@user_routers.get("/single_user_data/{email}", response_model=User_Return)
def user_data(email: str, db: Session = Depends(get_db)):
    single_user = (
        db.query(User).filter(User.email == email, User.is_deleted == False).first()
    )
    if not single_user:
        raise HTTPException(status_code=404, detail="No user found")

    return single_user


@user_routers.get("/all_data_read", response_model=list[User_Return])
def all_data(
    db: Session = Depends(get_db), find_user: User = Depends(get_current_user)
):
    all_user = db.query(User).filter(User.is_deleted == False).all()
    if not all_user:
        raise HTTPException(status_code=404, detail="No data found")
    return all_user


# Authenticate The User
@user_routers.post("/login")
def user_login(user_data: User_Login, db: Session = Depends(get_db)):
    find_user = (
        db.query(User)
        .filter(User.email == user_data.email, User.is_deleted == False)
        .first()
    )

    now = datetime.now()
    if not find_user:
        raise HTTPException(status_code=404, detail="User not found")

    if find_user.blocked_until and find_user.blocked_until > now:
        raise HTTPException(
            status_code=429, detail="Too many attempts. Try again after 24 hours"
        )

    if not verify_password(user_data.password, find_user.password):
        if find_user.login_attempts is None:
            find_user.login_attempts = 0

        find_user.login_attempts += 1

        if find_user.login_attempts >= 5:
            find_user.blocked_until = now + timedelta(hours=24)

        db.commit()

        remaining = max(0, 5 - find_user.login_attempts)

        raise HTTPException(
            status_code=401, detail=f"Password error. {remaining} attempts remaining."
        )

    find_user.login_attempts = 0
    find_user.blocked_until = None
    find_user.last_login_at = now
    db.commit()

    data = {"email": find_user.email, "role": find_user.role, "id": find_user.id}
    token = create_access_token(data, ACCESS_TOKEN_EXPIRE_MINUTES)

    return {
        "msg": "Login Successfully With Password!!!",
        "token": token,
        "user": {
            "id": find_user.id,
            "name": find_user.name,
            "email": find_user.email,
            "role": find_user.role,
            "is_main_admin": find_user.is_main_admin,
            "is_verified": find_user.is_verified
        }
    }


# Update The User Details
@user_routers.put("/update", response_model=User_Return)
def user_update(
    user_data: User_Update,
    db: Session = Depends(get_db),
    find_user: User = Depends(get_current_user),
):
    if not find_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.email and user_data.email != find_user.email:
        existing = db.query(User).filter(User.email == user_data.email, User.id != find_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email is already in use by another account")
        find_user.email = user_data.email
        find_user.is_verified = False

    if user_data.name:
        find_user.name = user_data.name

    find_user.updated_at = datetime.now()
    db.commit()
    db.refresh(find_user)

    return find_user


# Send OTP through email
@user_routers.post("/send_otp")
def send_email_otp(email: str, db: Session = Depends(get_db)):
    find_user = (
        db.query(User).filter(User.email == email, User.is_deleted == False).first()
    )

    if not find_user:
        raise HTTPException(status_code=404, detail="Email not found")

    otp = generate_otp()
    now = datetime.now(timezone.utc)
    expire_time = now + timedelta(minutes=5)
    
    OTP_entry = db.query(OTP_Model).filter(
        OTP_Model.email == email,
        OTP_Model.otp_type == "email_verification"
    ).first()

    if OTP_entry:
        OTP_entry.otp = otp
        OTP_entry.is_verified = False
        OTP_entry.created_at = datetime.now()
        OTP_entry.expire_at = expire_time
    else:
        new_otp = OTP_Model(
            id=str(uuid.uuid4()),
            user_id=find_user.id,
            email=email,
            otp=otp,
            otp_type="email_verification",
            created_at=datetime.now(),
            expire_at=expire_time,
        )
        db.add(new_otp)

    db.commit()

    email_status = send_email(
        receiver=email,
        subject="Todo App - Email Verification OTP",
        body=f"Hello {find_user.name},\n\nYour OTP for email verification is: {otp}\nThis code is valid for 5 minutes.\n\nThank you!"
    )
    return {"message": "OTP sent successfully", "status": email_status}


# Verify email OTP
@user_routers.post("/verify_otp")
def verify_otp(email: str, otp: str, db: Session = Depends(get_db)):
    find_otp = (
        db.query(OTP_Model)
        .filter(
            OTP_Model.email == email,
            OTP_Model.otp == otp,
            OTP_Model.otp_type == "email_verification",
            OTP_Model.is_verified == False
        )
        .first()
    )

    if not find_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    current_time = datetime.now(timezone.utc)
    if find_otp.expire_at < current_time:
        raise HTTPException(status_code=400, detail="OTP has expired.")

    find_user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not find_user:
        raise HTTPException(status_code=404, detail="User not found")

    find_user.is_verified = True
    find_otp.is_verified = True
    db.commit()
    db.refresh(find_user)

    return {"message": "OTP verified successfully"}


# Forget password through OTP
@user_routers.post("/forget_password/send_otp")
def forget_password_send_otp(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found with this email")
        
    otp = generate_otp()
    now = datetime.now(timezone.utc)
    expire_time = now + timedelta(minutes=5)

    old_otp = db.query(OTP_Model).filter(
        OTP_Model.email == email,
        OTP_Model.otp_type == "forget_password"
    ).first()

    if old_otp:
        old_otp.otp = otp
        old_otp.is_verified = False
        old_otp.created_at = datetime.now()
        old_otp.expire_at = expire_time
    else:
        new_otp = OTP_Model(
            id=str(uuid.uuid4()),
            user_id=user.id,
            email=email,
            otp=otp,
            otp_type="forget_password",
            created_at=datetime.now(),
            expire_at=expire_time
        )
        db.add(new_otp)

    db.commit()

    email_status = send_email(
        receiver=email,
        subject="Todo App - Password Reset OTP",
        body=f"Hello {user.name},\n\nYour OTP to reset your password is: {otp}\nThis code is valid for 5 minutes.\n\nIf you did not request this, please ignore this email."
    )
    return {"message": "Forget password OTP sent successfully", "status": email_status}


# Forget password verify OTP
@user_routers.post("/forget_password/verify_otp")
def forget_password_verify_otp(
    email: str, otp: str, new_pass: str, db: Session = Depends(get_db)
):
    validate_password(new_pass)
    
    find_otp = (
        db.query(OTP_Model)
        .filter(
            OTP_Model.email == email,
            OTP_Model.otp == otp,
            OTP_Model.otp_type == "forget_password",
            OTP_Model.is_verified == False
        )
        .first()
    )
    if not find_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    current_time = datetime.now(timezone.utc)
    if find_otp.expire_at < current_time:
        raise HTTPException(status_code=400, detail="OTP has expired")

    find_user = db.query(User).filter(User.email == email, User.is_deleted == False).first()
    if not find_user:
        raise HTTPException(status_code=404, detail="User not found")

    find_user.password = hash_password(new_pass)
    find_otp.is_verified = True
    db.commit()
    db.refresh(find_user)
    
    return {"message": "Password updated successfully!"}


# Reset password when logged in
@user_routers.post("/reset_password")
def reset_password(
    email: str, old_pass: str, new_pass: str, db: Session = Depends(get_db)
):
    find_user = (
        db.query(User).filter(User.email == email, User.is_deleted == False).first()
    )

    if not find_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(old_pass, find_user.password):
        raise HTTPException(status_code=401, detail="Invalid current password. Try 'Forgot Password' if you cannot recall it.")

    validate_password(new_pass)
    find_user.password = hash_password(new_pass)

    db.commit()
    db.refresh(find_user)

    return {"message": "Password reset successfully."}


# Delete the User
@user_routers.delete("/delete")
def delete(
    id: str | None = None,
    password: str | None = None,
    db: Session = Depends(get_db),
    find_user: User = Depends(get_current_user),
):
    if find_user.role == "user":
        if id and id != find_user.id:
            raise HTTPException(
                status_code=403, detail="You can only delete your own account."
            )

        if not password:
            raise HTTPException(status_code=400, detail="Password is required.")

        if not verify_password(password, find_user.password):
            raise HTTPException(status_code=401, detail="Invalid password.")

        find_user.is_deleted = True
        find_user.deleted_at = datetime.now()

    elif find_user.role in ["admin", "is_main_admin"]:
        if not id:
            raise HTTPException(status_code=400, detail="User ID is required.")

        target_user = (
            db.query(User).filter(User.id == id, User.is_deleted == False).first()
        )

        if not target_user:
            raise HTTPException(status_code=404, detail="User not found.")

        if target_user.is_main_admin:
            raise HTTPException(status_code=403, detail="Main admin cannot be deleted.")

        if target_user.role == "admin" and not find_user.is_main_admin:
            raise HTTPException(
                status_code=403, detail="Only the main admin can delete an admin."
            )

        target_user.is_deleted = True
        target_user.deleted_at = datetime.now()

    else:
        raise HTTPException(
            status_code=403, detail="You do not have permission to delete accounts."
        )

    db.commit()
    return {"message": "User deleted successfully."}
