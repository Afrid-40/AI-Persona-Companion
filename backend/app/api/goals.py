import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.ai.llm_service import llm_service

logger = logging.getLogger("app.api.goals")
router = APIRouter(prefix="/api/goals", tags=["goals"])

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

@router.get("", response_model=List[schemas.GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    goals = db.query(models.Goal).filter(models.Goal.user_id == user.id).all()
    return goals

@router.post("", response_model=schemas.GoalResponse)
def create_goal(goal_data: schemas.GoalCreate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    new_goal = models.Goal(
        user_id=user.id,
        title=goal_data.title,
        description=goal_data.description,
        category=goal_data.category,
        start_date=goal_data.start_date,
        target_date=goal_data.target_date,
        progress=goal_data.progress or 0,
        status="active"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    # Add milestones if provided
    for m_title in goal_data.milestones:
        if m_title.strip():
            ms = models.GoalMilestone(goal_id=new_goal.id, title=m_title.strip(), completed=False)
            db.add(ms)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.put("/{goal_id}", response_model=schemas.GoalResponse)
def update_goal(goal_id: str, data: schemas.GoalUpdate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.user_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    if data.title is not None:
        goal.title = data.title
    if data.description is not None:
        goal.description = data.description
    if data.category is not None:
        goal.category = data.category
    if data.start_date is not None:
        goal.start_date = data.start_date
    if data.target_date is not None:
        goal.target_date = data.target_date
    if data.progress is not None:
        goal.progress = max(0, min(100, data.progress))
        if goal.progress == 100:
            goal.status = "completed"
    if data.status is not None:
        goal.status = data.status

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(goal_id: str, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.user_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

@router.post("/{goal_id}/milestones", response_model=schemas.MilestoneResponse)
def add_milestone(goal_id: str, data: schemas.MilestoneCreate, db: Session = Depends(get_db)):
    user = get_current_user_obj(db)
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id, models.Goal.user_id == user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    ms = models.GoalMilestone(goal_id=goal.id, title=data.title, completed=data.completed)
    db.add(ms)
    db.commit()
    db.refresh(ms)
    
    # Recalculate goal progress
    total = len(goal.milestones)
    if total > 0:
        completed_count = sum(1 for m in goal.milestones if m.completed)
        goal.progress = int((completed_count / total) * 100)
        db.commit()

    return ms

@router.put("/milestones/{milestone_id}/toggle")
def toggle_milestone(milestone_id: str, db: Session = Depends(get_db)):
    ms = db.query(models.GoalMilestone).filter(models.GoalMilestone.id == milestone_id).first()
    if not ms:
        raise HTTPException(status_code=404, detail="Milestone not found")
    ms.completed = not ms.completed
    db.commit()

    # Recalculate goal progress
    goal = db.query(models.Goal).filter(models.Goal.id == ms.goal_id).first()
    if goal:
        total = len(goal.milestones)
        if total > 0:
            completed_count = sum(1 for m in goal.milestones if m.completed)
            goal.progress = int((completed_count / total) * 100)
            if goal.progress == 100:
                goal.status = "completed"
            db.commit()

    return {"id": ms.id, "completed": ms.completed, "goal_progress": goal.progress if goal else 0}

@router.post("/{goal_id}/ai-breakdown")
async def ai_breakdown_goal(goal_id: str, db: Session = Depends(get_db)):
    """Generate smart milestone suggestions for a goal using AI"""
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    prompt = f"Break down this goal into 3-5 concise, actionable SMART milestones: '{goal.title}'. Description: '{goal.description or ''}'. Output only the milestone titles, one per line."
    try:
        response = await llm_service.generate_response(
            system_prompt="You are a productivity expert. Output only concise bullet points for milestones.",
            context="",
            current_message=prompt
        )
        milestones = [line.strip("- *1234567890. ") for line in response.split("\n") if line.strip()]
        return {"suggested_milestones": milestones[:5]}
    except Exception as e:
        return {"suggested_milestones": [
            "Define initial requirements and timeline",
            "Complete core execution phase",
            "Review progress and refine strategy",
            "Finalize and achieve milestone completion"
        ]}
