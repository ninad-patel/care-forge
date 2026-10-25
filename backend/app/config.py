"""Application configuration using Pydantic v2 Settings.

Reads settings from environment variables and local .env files.
Enforces validation, driver normalization (e.g. postgresql+psycopg),
and safe fallbacks for local and testing environments.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core application settings with environment variable bindings."""

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./careforge.db"

    # AI Model Providers
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # CORS & Network Configuration
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Application Environment
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str | None) -> str:
        """Normalize PostgreSQL connection strings to use the psycopg v3 driver.

        SQLAlchemy 2.0 requires postgresql+psycopg:// to use the modern psycopg v3 driver.
        Supabase defaults to 'postgresql://', so this automatically converts it.
        Also strips any accidental placeholder brackets (e.g. [YOUR-PASSWORD]).
        """
        if not value:
            return "sqlite:///./careforge.db"

        # Strip accidental placeholder brackets if present
        value = value.replace("[", "").replace("]", "")

        # Auto-convert postgresql:// or postgres:// to postgresql+psycopg://
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)
        if value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg://", 1)

        return value

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str] | None) -> list[str]:
        """Parse comma-separated string of origins into a list of strings."""
        if value is None:
            return [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
            ]
        if isinstance(value, str):
            # Split comma-separated string, trimming whitespace and trailing slashes
            origins = [
                origin.strip().rstrip("/")
                for origin in value.split(",")
                if origin.strip()
            ]
            return origins
        return value


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton instance of application settings."""
    return Settings()
