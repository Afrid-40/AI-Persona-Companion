from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Memory, Goal, UserPreference, User

class MemoryEngine:
    @staticmethod
    def build_user_context(db: Session, user: User, persona_id: str) -> str:
        """
        Retrieves relevant active memories, preferences, and goals for context injection into LLM.
        """
        context_parts = []
        
        # 1. User Preference Context
        pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
        if pref:
            if user.preferred_name:
                context_parts.append(f"User's preferred name: {user.preferred_name}")
            if pref.main_goals:
                goals_str = ", ".join(pref.main_goals)
                context_parts.append(f"User's core goals: {goals_str}")
            if pref.personal_context:
                context_parts.append(f"User personal background: {pref.personal_context}")
            if pref.communication_preference:
                context_parts.append(f"Preferred communication tone: {pref.communication_preference}")

        # 2. Active Goals
        active_goals = db.query(Goal).filter(Goal.user_id == user.id, Goal.status == "active").limit(5).all()
        if active_goals:
            goal_titles = [g.title for g in active_goals]
            context_parts.append(f"Current active goals: {', '.join(goal_titles)}")

        # 3. Memories
        memories = db.query(Memory).filter(Memory.user_id == user.id).order_by(Memory.created_at.desc()).limit(10).all()
        if memories:
            memory_items = [f"- [{m.category}] {m.content}" for m in memories]
            context_parts.append("Stored Long-Term Memories:\n" + "\n".join(memory_items))

        return "\n\n".join(context_parts) if context_parts else "No prior memory stored."

    @staticmethod
    def extract_memories_from_text(user_input: str) -> List[Dict[str, str]]:
        """
        Detects if user input contains important personal info or goal commitments that should be remembered.
        """
        detected = []
        lower = user_input.lower()
        
        if "my goal is" in lower or "i want to achieve" in lower or "meditate" in lower or "i plan to" in lower:
            detected.append({"category": "Goal", "content": user_input})
        elif "i feel" in lower or "i am struggling with" in lower or "breakthrough" in lower:
            detected.append({"category": "Mood Pattern", "content": user_input})
        elif "i love" in lower or "i prefer" in lower or "my favorite" in lower:
            detected.append({"category": "Preference", "content": user_input})
        elif "i started" in lower or "i completed" in lower or "i decided" in lower:
            detected.append({"category": "Achievement", "content": user_input})

        return detected
