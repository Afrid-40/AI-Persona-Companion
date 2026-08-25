import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.ai.llm_service import llm_service

logger = logging.getLogger("app.api.recommendations")
router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

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

DEFAULT_RECOMMENDATIONS = [
    {
        "category": "Books",
        "title": "Atomic Habits by James Clear",
        "description": "An easy & proven way to build good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
        "link": "https://jamesclear.com/atomic-habits",
        "reason": "Tailored for your goal of building disciplined execution systems."
    },
    {
        "category": "Meditation",
        "title": "Box Breathing & Mind Stillness",
        "description": "4-4-4-4 Navy SEAL breathing technique to instantly lower cortisol, enhance cognitive focus, and restore calm clarity.",
        "link": "#",
        "reason": "Recommended by Krishna for maintaining emotional equilibrium."
    },
    {
        "category": "Courses",
        "title": "Strategic Thinking & Decision Making",
        "description": "Frameworks for game theory, financial modeling, risk analysis, and high-stakes corporate execution.",
        "link": "#",
        "reason": "Recommended by Chanakya for business and career advancement."
    },
    {
        "category": "Productivity",
        "title": "Time Blocking & Deep Work Protocol",
        "description": "Structuring your day into uninterrupted 90-minute hyperfocus sprints with zero digital distraction.",
        "link": "#",
        "reason": "Aligned with your active habits and focus milestones."
    },
    {
        "category": "Health",
        "title": "Circadian Rhythm & Sleep Optimization",
        "description": "Morning sunlight exposure, temperature regulation, and evening wind-down protocols to optimize recovery.",
        "link": "#",
        "reason": "Supports sustained physical stamina and mental energy."
    },
    {
        "category": "Career",
        "title": "The Art of Negotiation & Persuasion",
        "description": "Principles of ethical influence, boundary setting, and collaborative value creation.",
        "link": "#",
        "reason": "Enhances leadership presence and relationship depth."
    }
]

@router.get("", response_model=List[schemas.RecommendationResponse])
def get_recommendations(category: Optional[str] = None, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    
    # Check if user has recommendations in DB; if not, seed defaults
    existing = db.query(models.Recommendation).filter(models.Recommendation.user_id == user.id).all()
    if not existing:
        for r_data in DEFAULT_RECOMMENDATIONS:
            rec = models.Recommendation(user_id=user.id, **r_data)
            db.add(rec)
        db.commit()
        existing = db.query(models.Recommendation).filter(models.Recommendation.user_id == user.id).all()

    if category and category.lower() != "all":
        existing = [r for r in existing if r.category.lower() == category.lower()]

    return existing

@router.post("/{rec_id}/toggle-save")
def toggle_save_recommendation(rec_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    rec = db.query(models.Recommendation).filter(
        models.Recommendation.id == rec_id,
        models.Recommendation.user_id == user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    rec.is_saved = not rec.is_saved
    db.commit()
    return {"id": rec.id, "is_saved": rec.is_saved}

@router.post("/generate-custom")
async def generate_custom_recommendations(db: Session = Depends(get_db)):
    """Generate fresh AI recommendations based on user goals and active persona"""
    user = get_current_user_obj(db)
    goals = db.query(models.Goal).filter(models.Goal.user_id == user.id).all()
    goal_titles = [g.title for g in goals] or ["Personal Growth", "Productivity"]

    prompt = f"User has goals: {goal_titles} and persona '{user.active_persona_id}'. Recommend 2 unique books/courses/habits with title, 1-sentence description, and why it fits. Format as JSON list."
    try:
        response = await llm_service.generate_response(
            system_prompt="You are a high-performance life advisor. Output valid JSON.",
            context="",
            current_message=prompt
        )
        return {"status": "success", "raw": response}
    except Exception as e:
        return {"status": "fallback", "message": "Updated recommendations with curated list."}
