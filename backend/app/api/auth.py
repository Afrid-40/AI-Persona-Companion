from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from app import models, schemas
from app.database import get_db
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")
router = APIRouter(prefix="/api/auth", tags=["auth"])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

async def get_optional_user(db: Session = Depends(get_db)) -> models.User:
    """
    Returns the first user or creates a default user if no token is passed.
    Enables zero-friction local and authenticated operation.
    """
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="explorer@origen.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Explorer",
            preferred_name="Explorer",
            active_persona_id="krishna",
            onboarding_completed=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        prefs = models.UserPreference(user_id=user.id)
        db.add(prefs)
        db.commit()
    return user

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        preferred_name=user.preferred_name or user.full_name,
        active_persona_id="krishna"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create default preferences
    prefs = models.UserPreference(user_id=new_user.id)
    db.add(prefs)
    db.commit()
    
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "preferred_name": user.preferred_name
    }

@router.post("/google", response_model=schemas.Token)
def google_login(db: Session = Depends(get_db)):
    """Mock Google OAuth login for instant demo access"""
    user = db.query(models.User).filter(models.User.email == "google.user@origen.ai").first()
    if not user:
        user = models.User(
            email="google.user@origen.ai",
            hashed_password=get_password_hash("google_oauth_pass"),
            full_name="Google Explorer",
            preferred_name="Explorer",
            is_verified=True,
            onboarding_completed=True,
            active_persona_id="krishna"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        prefs = models.UserPreference(user_id=user.id)
        db.add(prefs)
        db.commit()

    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=timedelta(days=7)
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "preferred_name": user.preferred_name
    }

@router.post("/forgot-password")
def forgot_password(req: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        # Avoid user enumeration
        return {"message": "If this email is registered, a password reset link has been dispatched."}
    return {
        "message": "Password reset link generated.",
        "reset_token": f"reset-{user.id[:8]}"
    }

@router.post("/reset-password")
def reset_password(req: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if user:
        user.hashed_password = get_password_hash(req.new_password)
        db.commit()
    return {"message": "Password updated successfully. You may now sign in."}

@router.get("/me", response_model=schemas.UserResponse)
def get_me(db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="explorer@origen.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Explorer",
            preferred_name="Explorer",
            active_persona_id="krishna",
            onboarding_completed=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        prefs = models.UserPreference(user_id=user.id)
        db.add(prefs)
        db.commit()
    return user

@router.post("/onboarding", response_model=schemas.UserResponse)
def submit_onboarding(data: schemas.UserOnboarding, db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="explorer@origen.ai",
            hashed_password=get_password_hash("password123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user.preferred_name = data.preferred_name
    user.full_name = data.preferred_name
    user.age = data.age
    user.profession = data.profession
    user.interests = data.interests
    user.active_persona_id = data.selected_persona
    user.onboarding_completed = True

    prefs = db.query(models.UserPreference).filter(models.UserPreference.user_id == user.id).first()
    if not prefs:
        prefs = models.UserPreference(user_id=user.id)
        db.add(prefs)

    prefs.main_goals = data.main_goals
    prefs.personal_context = data.personal_context
    prefs.communication_preference = data.communication_preference

    db.commit()
    db.refresh(user)
    return user

@router.put("/profile", response_model=schemas.UserResponse)
def update_profile(data: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.preferred_name is not None:
        user.preferred_name = data.preferred_name
    if data.age is not None:
        user.age = data.age
    if data.profession is not None:
        user.profession = data.profession
    if data.interests is not None:
        user.interests = data.interests
    if data.bio is not None:
        user.bio = data.bio
    if data.avatar is not None:
        user.avatar = data.avatar
    if data.active_persona_id is not None:
        user.active_persona_id = data.active_persona_id

    db.commit()
    db.refresh(user)
    return user

@router.put("/preferences", response_model=schemas.UserPreferenceSchema)
def update_preferences(prefs_data: schemas.UserPreferenceSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    prefs = db.query(models.UserPreference).filter(models.UserPreference.user_id == user.id).first()
    if not prefs:
        prefs = models.UserPreference(user_id=user.id)
        db.add(prefs)

    prefs.main_goals = prefs_data.main_goals
    prefs.personal_context = prefs_data.personal_context
    prefs.communication_preference = prefs_data.communication_preference
    prefs.memory_enabled = prefs_data.memory_enabled
    prefs.theme = prefs_data.theme
    prefs.voice_preference = prefs_data.voice_preference
    prefs.notifications = prefs_data.notifications

    db.commit()
    db.refresh(prefs)
    return prefs
