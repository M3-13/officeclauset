from auth import create_access_token, get_password_hash, verify_password
from database import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from models import User
from schemas import AuthResponse, UserCreate, UserLogin
from sqlalchemy.orm import Session

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=AuthResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)) -> dict:  # noqa: B008
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Password must be at least 8 characters",
        )
    if not user_data.privacy_consent:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Data privacy consent is required",
        )
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email},
    }


@router.post("/login", response_model=AuthResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)) -> dict:  # noqa: B008
    user = db.query(User).filter(User.email == login_data.email).first()
    if user is None or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email},
    }


@router.post("/logout")
def logout() -> dict:
    return {"message": "Logged out successfully"}
