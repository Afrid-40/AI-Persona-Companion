import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.ai.llm_service import llm_service

logger = logging.getLogger("app.api.journal")
router = APIRouter(prefix="/api/journal", tags=["journal"])

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

@router.get("", response_model=List[schemas.JournalResponse])
def get_journal_entries(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    entries = db.query(models.JournalEntry).filter(
        models.JournalEntry.user_id == user.id
    ).order_by(models.JournalEntry.created_at.desc()).all()
    return entries

@router.post("", response_model=schemas.JournalResponse)
async def create_journal_entry(data: schemas.JournalCreate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)

    # Optional AI summary generation for the journal entry
    ai_summary = None
    try:
        summary_prompt = f"Summarize this journal entry in 1-2 insightful sentences highlighting emotional state and key takeaway: Title: '{data.title}'. Content: '{data.content}'. Gratitude: '{data.gratitude or ''}'."
        ai_summary = await llm_service.generate_response(
            system_prompt="You are an empathetic, insightful journaling assistant. Provide a brief 2-sentence summary and encouraging insight.",
            context="",
            current_message=summary_prompt
        )
    except Exception as e:
        logger.warning(f"AI Journal summary failed: {e}")
        ai_summary = f"Reflected on {data.title} with focus on personal growth."

    entry = models.JournalEntry(
        user_id=user.id,
        date_label=data.date_label or datetime.utcnow().strftime("%B %d, %Y"),
        title=data.title,
        preview=data.preview or data.content[:100],
        content=data.content,
        category=data.category or "Reflection",
        gratitude=data.gratitude,
        ai_summary=ai_summary
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/{entry_id}", response_model=schemas.JournalResponse)
def get_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    entry = db.query(models.JournalEntry).filter(
        models.JournalEntry.id == entry_id,
        models.JournalEntry.user_id == user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return entry

@router.delete("/{entry_id}")
def delete_journal_entry(entry_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    entry = db.query(models.JournalEntry).filter(
        models.JournalEntry.id == entry_id,
        models.JournalEntry.user_id == user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted"}
