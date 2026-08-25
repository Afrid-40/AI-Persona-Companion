import logging
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

logger = logging.getLogger("app.api.search")
router = APIRouter(prefix="/api/search", tags=["search"])

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

@router.get("", response_model=List[schemas.SearchResultItem])
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    query_term = f"%{q.strip()}%"
    results: List[schemas.SearchResultItem] = []

    # 1. Search Goals
    goals = db.query(models.Goal).filter(
        models.Goal.user_id == user.id,
        (models.Goal.title.ilike(query_term) | models.Goal.description.ilike(query_term))
    ).limit(5).all()
    for g in goals:
        results.append(schemas.SearchResultItem(
            type="goal",
            id=g.id,
            title=f"Goal: {g.title}",
            snippet=g.description or f"Progress: {g.progress}%",
            link="/dashboard/goals"
        ))

    # 2. Search Habits
    habits = db.query(models.Habit).filter(
        models.Habit.user_id == user.id,
        models.Habit.title.ilike(query_term)
    ).limit(5).all()
    for h in habits:
        results.append(schemas.SearchResultItem(
            type="habit",
            id=h.id,
            title=f"Habit: {h.title}",
            snippet=f"Streak: {h.streak_count} days ({h.frequency})",
            link="/dashboard/habits"
        ))

    # 3. Search Journals
    journals = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == user.id,
        (models.JournalEntry.title.ilike(query_term) | models.JournalEntry.content.ilike(query_term))
    ).limit(5).all()
    for j in journals:
        results.append(schemas.SearchResultItem(
            type="journal",
            id=j.id,
            title=f"Journal: {j.title}",
            snippet=j.preview or j.content[:80],
            link="/dashboard/journal"
        ))

    # 4. Search Memories
    memories = db.query(models.Memory).filter(
        models.Memory.user_id == user.id,
        models.Memory.content.ilike(query_term)
    ).limit(5).all()
    for m in memories:
        results.append(schemas.SearchResultItem(
            type="memory",
            id=m.id,
            title=f"Memory ({m.category})",
            snippet=m.content[:90],
            link="/dashboard/memories"
        ))

    # 5. Search Messages / Conversations
    messages = db.query(models.Message).join(models.Conversation).filter(
        models.Conversation.user_id == user.id,
        models.Message.content.ilike(query_term)
    ).limit(5).all()
    for msg in messages:
        results.append(schemas.SearchResultItem(
            type="chat",
            id=msg.conversation_id,
            title=f"Chat: {msg.content[:40]}...",
            snippet=msg.content[:90],
            link="/dashboard/chat"
        ))

    return results
