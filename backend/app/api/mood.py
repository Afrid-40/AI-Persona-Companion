import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.ai.llm_service import llm_service

logger = logging.getLogger("app.api.mood")
router = APIRouter(prefix="/api/mood", tags=["mood"])

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

@router.get("", response_model=List[schemas.MoodResponse])
def get_mood_history(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    moods = db.query(models.MoodCheckin).filter(
        models.MoodCheckin.user_id == user.id
    ).order_by(models.MoodCheckin.created_at.desc()).limit(30).all()
    return moods

@router.post("", response_model=schemas.MoodResponse)
def log_mood(data: schemas.MoodCreate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    mood = models.MoodCheckin(
        user_id=user.id,
        mood_type=data.mood_type,
        mood_score=max(1, min(10, data.mood_score)),
        note=data.note
    )
    db.add(mood)
    db.commit()
    db.refresh(mood)
    return mood

@router.get("/analytics")
async def get_mood_analytics(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    moods = db.query(models.MoodCheckin).filter(
        models.MoodCheckin.user_id == user.id
    ).order_by(models.MoodCheckin.created_at.asc()).all()

    if not moods:
        return {
            "average_score": 7.0,
            "total_checkins": 0,
            "top_mood": "Calm",
            "distribution": {"Calm": 1, "Driven": 0, "Inspired": 0, "Low": 0, "Tired": 0, "Anxious": 0},
            "ai_insight": "Start logging your daily mood to receive personalized emotional intelligence insights from your companion."
        }

    total_score = sum(m.mood_score for m in moods)
    avg_score = round(total_score / len(moods), 1)

    distribution: Dict[str, int] = {}
    for m in moods:
        distribution[m.mood_type] = distribution.get(m.mood_type, 0) + 1

    top_mood = max(distribution.items(), key=lambda x: x[1])[0]

    # AI Insight
    ai_insight = f"Your average mood score is {avg_score}/10, with '{top_mood}' being your most frequent emotional state. Continue regular reflection."
    try:
        prompt = f"User mood history: Average score {avg_score}/10, primary mood '{top_mood}', recent notes: {[m.note for m in moods[-3:] if m.note]}. Provide a 2-sentence psychological and emotional balance tip."
        ai_insight = await llm_service.generate_response(
            system_prompt="You are a compassionate emotional intelligence coach. Give a 2-sentence uplifting, practical insight.",
            context="",
            current_message=prompt
        )
    except Exception as e:
        logger.warning(f"AI Mood insight error: {e}")

    return {
        "average_score": avg_score,
        "total_checkins": len(moods),
        "top_mood": top_mood,
        "distribution": distribution,
        "ai_insight": ai_insight
    }
