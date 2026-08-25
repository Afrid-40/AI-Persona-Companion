import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    preferred_name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    profession = Column(String(100), nullable=True)
    interests = Column(JSON, default=list)
    onboarding_completed = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    avatar = Column(String(255), default="default")
    bio = Column(Text, nullable=True)
    role = Column(String(50), default="user")
    active_persona_id = Column(String(50), default="krishna")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    habits = relationship("Habit", back_populates="user", cascade="all, delete-orphan")
    reflections = relationship("DailyReflection", back_populates="user", cascade="all, delete-orphan")
    moods = relationship("MoodCheckin", back_populates="user", cascade="all, delete-orphan")
    journals = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("UserFeedback", back_populates="user", cascade="all, delete-orphan")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    main_goals = Column(JSON, default=list)  # list of tags like ["Focus", "Wisdom"]
    personal_context = Column(Text, nullable=True)
    communication_preference = Column(String(50), default="Balanced") # Gentle, Balanced, Direct, Motivational, Reflective
    memory_enabled = Column(Boolean, default=True)
    theme = Column(String(50), default="Aurora Dark")
    voice_preference = Column(String(50), default="Warm")
    notifications = Column(String(50), default="All")

    user = relationship("User", back_populates="preferences")


class Persona(Base):
    __tablename__ = "personas"

    id = Column(String(50), primary_key=True)  # e.g., "krishna", "chhava", "chanakya"
    name = Column(String(100), nullable=False)
    subtitle = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    personality_traits = Column(JSON, default=list) # e.g., ["Wise", "Compassionate"]
    purpose = Column(Text, nullable=False)
    quote = Column(Text, nullable=False)
    avatar_type = Column(String(50), default="orb")
    system_prompt = Column(Text, nullable=False)
    default_greeting = Column(Text, nullable=False)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    persona_id = Column(String(50), ForeignKey("personas.id"), nullable=False)
    title = Column(String(255), default="Chat Session")
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    sender = Column(String(20), nullable=False)  # "user" or "ai"
    content = Column(Text, nullable=False)
    attachment_url = Column(String(255), nullable=True)
    attachment_type = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Memory(Base):
    __tablename__ = "memories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    category = Column(String(50), default="Personal")  # Personal, Goal, Preference, Event, Learning, Mood Pattern, Relationship, Dream, Project
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    source_event = Column(String(255), nullable=True)
    date_label = Column(String(50), default="TODAY")
    importance = Column(String(20), default="medium")  # high, medium, low
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="memories")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Personal")
    start_date = Column(String(50), nullable=True)
    target_date = Column(String(50), nullable=True)
    progress = Column(Integer, default=0)  # 0 to 100
    status = Column(String(50), default="active")  # active, completed

    user = relationship("User", back_populates="goals")
    milestones = relationship("GoalMilestone", back_populates="goal", cascade="all, delete-orphan")


class GoalMilestone(Base):
    __tablename__ = "goal_milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    goal_id = Column(String(36), ForeignKey("goals.id"), nullable=False)
    title = Column(String(255), nullable=False)
    completed = Column(Boolean, default=False)

    goal = relationship("Goal", back_populates="milestones")


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    icon = Column(String(50), default="🧘")
    category = Column(String(50), default="Wellness")
    frequency = Column(String(50), default="Daily")
    streak_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="habits")
    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    habit_id = Column(String(36), ForeignKey("habits.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date_completed = Column(String(20), nullable=False)  # "YYYY-MM-DD"

    habit = relationship("Habit", back_populates="logs")


class DailyReflection(Base):
    __tablename__ = "daily_reflections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date = Column(String(20), nullable=False)
    prompt_answers = Column(JSON, default=dict)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reflections")


class MoodCheckin(Base):
    __tablename__ = "mood_checkins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    mood_type = Column(String(50), nullable=False)  # Calm, Driven, Low, Inspired, Tired, Anxious
    mood_score = Column(Integer, default=5)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="moods")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    date_label = Column(String(50), nullable=False)  # "JULY 12"
    title = Column(String(255), nullable=False)
    preview = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(50), default="Reflection")
    gratitude = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="journals")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="system")  # goal_reminder, habit_reminder, journal_reminder, ai_recommendation, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    category = Column(String(50), default="Book")  # Books, Courses, Meditation, Career, Learning, Health, Productivity
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    reason = Column(Text, nullable=True)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class UserFeedback(Base):
    __tablename__ = "user_feedbacks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    category = Column(String(50), default="General")
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")


class ApiUsageLog(Base):
    __tablename__ = "api_usage_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    endpoint = Column(String(100), nullable=False)
    model_used = Column(String(100), default="openai/gpt-4o-mini")
    tokens_prompt = Column(Integer, default=0)
    tokens_completion = Column(Integer, default=0)
    cost_estimate = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
