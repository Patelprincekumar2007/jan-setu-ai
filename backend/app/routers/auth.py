import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut
from app.dependencies import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    hashed_pwd = get_password_hash(user_in.password)
    
    # Restrict role assignment to default citizen unless development
    user_role = user_in.role if user_in.role in ("citizen", "analyst", "admin") else "citizen"

    user = User(
        id=user_id,
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_pwd,
        role=user_role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user
