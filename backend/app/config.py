import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "supersecretjwtkeyforlocaldevelopmentonlychangeinproduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    DATABASE_URL: str = "sqlite:///./skillpath.db"
    GEMINI_API_KEY: str = ""

    class Config:
        # Pydantic v2 settings config
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore" # ignore extra env variables

settings = Settings()
