import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

logger = logging.getLogger("app.api.notifications")
router = APIRouter(prefix="/api/notifications", tags=["notifications"])

def get_current_user_obj(db: Session) -> models.User:
    user = db.query(models.User).first()
    if not user:
        user = models.User(
            email="explorer@origen.ai",
            hashed_password="mock_password_hash",
            full_name="Explorer",
            preferred_name="Explorer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

DEFAULT_NOTIFICATIONS = [
    {
        "title": "Welcome to AI Persona SaaS",
        "message": "Your personal AI companion is ready to assist your growth, goals, and daily reflection.",
        "type": "system"
    },
    {
        "title": "Habit Streak Reminder",
        "message": "Don't forget to complete your daily habits and keep your streak alive today!",
        "type": "habit_reminder"
    },
    {
        "title": "Daily Reflection Prompt",
        "message": "Take 3 minutes to log your evening reflection and gratitude in your journal.",
        "type": "journal_reminder"
    }
]

@router.get("", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    
    # If empty, seed default notifications
    existing = db.query(models.Notification).filter(models.Notification.user_id == user.id).all()
    if not existing:
        for n in DEFAULT_NOTIFICATIONS:
            notif = models.Notification(user_id=user.id, **n)
            db.add(notif)
        db.commit()
        existing = db.query(models.Notification).filter(models.Notification.user_id == user.id).all()

    return sorted(existing, key=lambda x: x.created_at, reverse=True)

@router.put("/{notif_id}/read")
def mark_notification_read(notif_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    return {"id": notif.id, "is_read": True}

@router.put("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    db.query(models.Notification).filter(
        models.Notification.user_id == user.id,
        models.Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/clear-all")
def clear_all_notifications(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    db.query(models.Notification).filter(models.Notification.user_id == user.id).delete()
    db.commit()
    return {"message": "Notifications cleared"}
