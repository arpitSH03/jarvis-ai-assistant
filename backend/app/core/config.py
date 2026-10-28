import os
from pathlib import Path
from typing import List, Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "JARVIS AI Desktop Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Base paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    DB_PATH: Path = DATA_DIR / "jarvis.db"
    OUTPUTS_DIR: Path = DATA_DIR / "outputs"
    
    # AI Provider Settings
    AI_PROVIDER: str = "gemini"  # "gemini", "openai", "groq", "offline_mock"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", "")
    LLM_MODEL: str = "gemini-2.0-flash"
    
    # Mock Mode: when True, falls back to realistic mock data for email/calendar if OAuth keys missing
    MOCK_MODE: bool = True
    
    # Voice Settings
    TTS_VOICE: str = "en-US-ChristopherNeural"  # High-quality calm British/US AI voice (Edge TTS)
    TTS_RATE: str = "+0%"
    TTS_VOLUME: str = "+0%"
    TTS_ENGINE: str = "edge_tts"  # "edge_tts" or "pyttsx3"
    
    # Google OAuth 2.0 Credentials (Optional, if empty MOCK_MODE will handle)
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_CREDENTIALS_FILE: Optional[str] = os.getenv("GOOGLE_CREDENTIALS_FILE", "")
    GOOGLE_TOKEN_FILE: Optional[str] = os.getenv("GOOGLE_TOKEN_FILE", "")
    
    # Permitted desktop applications allowlist (safety layer)
    ALLOWED_APPLICATIONS: List[str] = [
        "notepad",
        "calc",
        "calculator",
        "chrome",
        "msedge",
        "firefox",
        "code",
        "explorer",
        "spotify",
        "cmd",
        "powershell",
        "mspaint",
        "taskmgr",
        "settings",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure critical data directories exist
settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
