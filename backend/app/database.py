"""Database engine, session factory, and lifecycle management for CareForge.

Supports cloud PostgreSQL (Supabase/Neon) and offline SQLite fallback.
Provides connection pooling, automated table creation, and connectivity checks.
"""

import logging
from collections.abc import Generator
from typing import Any

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# Configure engine arguments based on database driver
engine_kwargs: dict[str, Any] = {}

if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite requires check_same_thread=False for multi-threaded FastAPI execution
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL connection pool settings for cloud database stability
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

# Session factory for creating database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def init_db() -> None:
    """Initialize database tables on application startup.

    Imports declarative models to register metadata and creates all tables
    if they do not already exist (tbl_brand, tbl_blog).
    """
    from app.models import Base

    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully (tbl_brand, tbl_blog).")
    except SQLAlchemyError as exc:
        logger.error("Failed to initialize database tables: %s", exc)
        raise


def check_db_connection() -> bool:
    """Execute a lightweight SELECT 1 query to verify active connectivity."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except SQLAlchemyError as exc:
        logger.warning("Database connectivity check failed: %s", exc)
        return False


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session and guarantees closure."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
