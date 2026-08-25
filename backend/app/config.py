import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from backend directory or project root
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")
load_dotenv(backend_dir.parent / ".env")
load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "AI Persona by Origen"
    DEBUG: bool = True
    SECRET_KEY: str = os.getenv("SECRET_KEY", "origen_ai_persona_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL - SQLite for easy zero-config local execution, PostgreSQL compatible
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ai_persona.db")
    
    # LLM API Configuration - dynamic properties to read live env vars with override
    @property
    def OPENROUTER_API_KEY(self) -> str:
        load_dotenv(backend_dir / ".env", override=True)
        return os.getenv("OPENROUTER_API_KEY", "")

    @property
    def OPENROUTER_MODEL(self) -> str:
        load_dotenv(backend_dir / ".env", override=True)
        return os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    @property
    def OPENROUTER_BASE_URL(self) -> str:
        load_dotenv(backend_dir / ".env", override=True)
        return os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    @property
    def GEMINI_API_KEY(self) -> str:
        load_dotenv(backend_dir / ".env", override=True)
        return os.getenv("GEMINI_API_KEY", "")

    @property
    def OPENAI_API_KEY(self) -> str:
        load_dotenv(backend_dir / ".env", override=True)
        return os.getenv("OPENAI_API_KEY", "")

settings = Settings()
