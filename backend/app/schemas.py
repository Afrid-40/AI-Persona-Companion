from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    preferred_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    preferred_name: Optional[str] = None

class UserPreferenceSchema(BaseModel):
    main_goals: List[str] = []
    personal_context: Optional[str] = None
    communication_preference: str = "Balanced"
    memory_enabled: bool = True
    theme: str = "Aurora Dark"
    voice_preference: str = "Warm"
    notifications: str = "All"

    class Config:
        from_attributes = True

class UserOnboarding(BaseModel):
    preferred_name: str
    age: Optional[int] = None
    profession: Optional[str] = None
    interests: List[str] = []
    main_goals: List[str] = []
    personal_context: Optional[str] = None
    communication_preference: str = "Balanced"
    selected_persona: str = "krishna"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_name: Optional[str] = None
    age: Optional[int] = None
    profession: Optional[str] = None
    interests: Optional[List[str]] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    active_persona_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    preferred_name: Optional[str] = None
    age: Optional[int] = None
    profession: Optional[str] = None
    interests: List[str] = []
    bio: Optional[str] = None
    avatar: Optional[str] = "default"
    role: str = "user"
    onboarding_completed: bool = False
    is_verified: bool = False
    active_persona_id: str = "krishna"
    preferences: Optional[UserPreferenceSchema] = None

    class Config:
        from_attributes = True

# Persona Schema
class PersonaResponse(BaseModel):
    id: str
    name: str
    subtitle: str
    description: str
    personality_traits: List[str]
    purpose: str
    quote: str
    avatar_type: str
    default_greeting: str

    class Config:
        from_attributes = True

# Chat Schemas
class MessageRequest(BaseModel):
    content: str
    conversation_id: Optional[str] = None
    persona_id: Optional[str] = None
    model: Optional[str] = None
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    attachment_url: Optional[str] = None
    attachment_type: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: str
    persona_id: str
    title: str
    is_pinned: bool = False
    messages: List[MessageResponse] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Memory Schemas
class MemoryCreate(BaseModel):
    category: str = "Personal"
    title: Optional[str] = None
    content: str
    date_label: str = "TODAY"
    importance: str = "medium"

class MemoryUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    importance: Optional[str] = None

class MemoryResponse(BaseModel):
    id: str
    category: str
    title: Optional[str] = None
    content: str
    date_label: str
    importance: str = "medium"
    created_at: datetime

    class Config:
        from_attributes = True

# Goal Schemas
class MilestoneCreate(BaseModel):
    title: str
    completed: bool = False

class MilestoneResponse(BaseModel):
    id: str
    title: str
    completed: bool

    class Config:
        from_attributes = True

class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Personal"
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    progress: int = 0
    milestones: List[str] = []

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    progress: Optional[int] = None
    status: Optional[str] = None

class GoalResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    category: str
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    progress: int
    status: str
    milestones: List[MilestoneResponse] = []

    class Config:
        from_attributes = True

# Habit Schemas
class HabitCreate(BaseModel):
    title: str
    icon: str = "🧘"
    category: str = "Wellness"
    frequency: str = "Daily"

class HabitResponse(BaseModel):
    id: str
    title: str
    icon: str
    category: str
    frequency: str
    streak_count: int
    completed_today: bool = False
    history: List[str] = []

    class Config:
        from_attributes = True

# Reflection Schemas
class ReflectionCreate(BaseModel):
    date: str
    prompt_answers: Dict[str, str]

class ReflectionResponse(BaseModel):
    id: str
    date: str
    prompt_answers: Dict[str, str]
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Mood Schemas
class MoodCreate(BaseModel):
    mood_type: str
    mood_score: int = 5
    note: Optional[str] = None

class MoodResponse(BaseModel):
    id: str
    mood_type: str
    mood_score: int
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Journal Schemas
class JournalCreate(BaseModel):
    title: str
    content: str
    date_label: Optional[str] = None
    preview: Optional[str] = None
    category: str = "Reflection"
    gratitude: Optional[str] = None

class JournalResponse(BaseModel):
    id: str
    date_label: str
    title: str
    preview: str
    content: str
    category: str
    gratitude: Optional[str] = None
    ai_summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: str
    category: str
    title: str
    description: str
    link: Optional[str] = None
    reason: Optional[str] = None
    is_saved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Feedback Schemas
class FeedbackCreate(BaseModel):
    category: str = "General"
    message: str
    rating: int = 5

class FeedbackResponse(BaseModel):
    id: str
    category: str
    message: str
    rating: int
    created_at: datetime

    class Config:
        from_attributes = True

# Search & Analytics Schemas
class SearchResultItem(BaseModel):
    type: str # "chat", "goal", "habit", "journal", "memory"
    id: str
    title: str
    snippet: str
    link: str

class AnalyticsSummary(BaseModel):
    goal_completion_rate: float
    total_goals: int
    active_habits: int
    longest_streak: int
    mood_average: float
    total_journals: int
    total_conversations: int
    total_memories: int
    weekly_mood_trend: List[Dict[str, Any]]
    habit_consistency: List[Dict[str, Any]]
