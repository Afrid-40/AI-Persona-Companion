import logging
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

logger = logging.getLogger("app.api.habits")
router = APIRouter(prefix="/api/habits", tags=["habits"])

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

@router.get("", response_model=List[schemas.HabitResponse])
def get_habits(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    habits = db.query(models.Habit).filter(models.Habit.user_id == user.id).all()
    today_str = date.today().isoformat()

    result = []
    for h in habits:
        is_completed_today = db.query(models.HabitLog).filter(
            models.HabitLog.habit_id == h.id,
            models.HabitLog.date_completed == today_str
        ).first() is not None

        # Fetch past 7 days history
        past_logs = db.query(models.HabitLog).filter(
            models.HabitLog.habit_id == h.id
        ).all()
        history_dates = [log.date_completed for log in past_logs]

        result.append(schemas.HabitResponse(
            id=h.id,
            title=h.title,
            icon=h.icon or "🧘",
            category=h.category or "Wellness",
            frequency=h.frequency or "Daily",
            streak_count=h.streak_count or 0,
            completed_today=is_completed_today,
            history=history_dates
        ))
    return result

@router.post("", response_model=schemas.HabitResponse)
def create_habit(habit_data: schemas.HabitCreate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    new_habit = models.Habit(
        user_id=user.id,
        title=habit_data.title,
        icon=habit_data.icon or "🧘",
        category=habit_data.category or "Wellness",
        frequency=habit_data.frequency or "Daily",
        streak_count=0
    )
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)

    return schemas.HabitResponse(
        id=new_habit.id,
        title=new_habit.title,
        icon=new_habit.icon,
        category=new_habit.category,
        frequency=new_habit.frequency,
        streak_count=0,
        completed_today=False,
        history=[]
    )

@router.post("/{habit_id}/toggle")
def toggle_habit_today(habit_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    today_str = date.today().isoformat()
    existing_log = db.query(models.HabitLog).filter(
        models.HabitLog.habit_id == habit.id,
        models.HabitLog.date_completed == today_str
    ).first()

    if existing_log:
        db.delete(existing_log)
        habit.streak_count = max(0, habit.streak_count - 1)
        completed = False
    else:
        new_log = models.HabitLog(
            habit_id=habit.id,
            user_id=user.id,
            date_completed=today_str
        )
        db.add(new_log)
        habit.streak_count = (habit.streak_count or 0) + 1
        completed = True

    db.commit()
    return {"habit_id": habit.id, "completed_today": completed, "streak_count": habit.streak_count}

@router.delete("/{habit_id}")
def delete_habit(habit_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == user.id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    db.delete(habit)
    db.commit()
    return {"message": "Habit deleted"}
