import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

logger = logging.getLogger("app.api.memories")
router = APIRouter(prefix="/api/memories", tags=["memories"])

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

@router.get("", response_model=List[schemas.MemoryResponse])
def get_memories(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    user = get_current_user_obj(db)
    query = db.query(models.Memory).filter(models.Memory.user_id == user.id)

    if category and category.lower() != "all":
        query = query.filter(models.Memory.category.ilike(category))

    if search:
        query = query.filter(models.Memory.content.ilike(f"%{search}%"))

    memories = query.order_by(models.Memory.created_at.desc()).all()
    return memories

@router.post("", response_model=schemas.MemoryResponse)
def create_memory(data: schemas.MemoryCreate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    mem = models.Memory(
        user_id=user.id,
        category=data.category,
        title=data.title,
        content=data.content,
        date_label=data.date_label,
        importance=data.importance or "medium"
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem

@router.put("/{memory_id}", response_model=schemas.MemoryResponse)
def update_memory(memory_id: str, data: schemas.MemoryUpdate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    mem = db.query(models.Memory).filter(
        models.Memory.id == memory_id,
        models.Memory.user_id == user.id
    ).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")

    if data.category is not None:
        mem.category = data.category
    if data.title is not None:
        mem.title = data.title
    if data.content is not None:
        mem.content = data.content
    if data.importance is not None:
        mem.importance = data.importance

    db.commit()
    db.refresh(mem)
    return mem

@router.delete("/{memory_id}")
def delete_memory(memory_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    mem = db.query(models.Memory).filter(
        models.Memory.id == memory_id,
        models.Memory.user_id == user.id
    ).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    db.delete(mem)
    db.commit()
    return {"message": "Memory deleted"}

@router.get("/export")
def export_memories(db: Session = Depends(get_db)):
    """Export all user memories as structured JSON"""
    user = get_current_user_obj(db)
    memories = db.query(models.Memory).filter(models.Memory.user_id == user.id).all()
    return {
        "user_email": user.email,
        "exported_at": user.created_at.isoformat(),
        "total_memories": len(memories),
        "memories": [
            {
                "id": m.id,
                "category": m.category,
                "title": m.title,
                "content": m.content,
                "importance": m.importance,
                "created_at": m.created_at.isoformat()
            }
            for m in memories
        ]
    }
