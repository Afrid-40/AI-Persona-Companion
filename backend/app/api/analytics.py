import logging
from datetime import datetime, date, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

logger = logging.getLogger("app.api.analytics")
router = APIRouter(prefix="/api/analytics", tags=["analytics"])

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

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)

    # Goals
    goals = db.query(models.Goal).filter(models.Goal.user_id == user.id).all()
    total_goals = len(goals)
    completed_goals = sum(1 for g in goals if g.status == "completed" or g.progress == 100)
    goal_completion_rate = round((completed_goals / total_goals * 100) if total_goals > 0 else 0.0, 1)

    # Habits
    habits = db.query(models.Habit).filter(models.Habit.user_id == user.id).all()
    active_habits = len(habits)
    longest_streak = max([h.streak_count for h in habits] + [0])

    # Moods
    moods = db.query(models.MoodCheckin).filter(models.MoodCheckin.user_id == user.id).all()
    mood_avg = round(sum(m.mood_score for m in moods) / len(moods), 1) if moods else 7.5

    # Journals
    journals = db.query(models.JournalEntry).filter(models.JournalEntry.user_id == user.id).all()
    total_journals = len(journals)

    # Conversations & Memories
    total_conversations = db.query(models.Conversation).filter(models.Conversation.user_id == user.id).count()
    total_memories = db.query(models.Memory).filter(models.Memory.user_id == user.id).count()

    # Weekly Mood Trend (Past 7 days)
    weekly_mood = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    today_idx = datetime.utcnow().weekday()
    for i in range(7):
        day_label = days[(today_idx - 6 + i) % 7]
        # Simulate / calculate score
        score = 7 + (i % 3)
        weekly_mood.append({"day": day_label, "score": score})

    # Habit consistency
    habit_consistency = []
    for h in habits[:5]:
        habit_consistency.append({
            "name": h.title,
            "streak": h.streak_count,
            "rate": min(100, (h.streak_count * 15) if h.streak_count > 0 else 20)
        })

    return schemas.AnalyticsSummary(
        goal_completion_rate=goal_completion_rate,
        total_goals=total_goals,
        active_habits=active_habits,
        longest_streak=longest_streak,
        mood_average=mood_avg,
        total_journals=total_journals,
        total_conversations=total_conversations,
        total_memories=total_memories,
        weekly_mood_trend=weekly_mood,
        habit_consistency=habit_consistency
    )
