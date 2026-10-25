"""FastAPI main entrypoint for CareForge.

Configures CORS, lifespan events (database auto-table initialization),
and exposes core health check and diagnostic endpoints.
"""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from app.config import get_settings
from app.constants import (
    API_PREFIX,
    ROUTE_HEALTH,
    TABLE_BLOG,
    TABLE_BRAND,
    TAG_BLOGS,
    TAG_BRANDS,
    TAG_GENERATION,
)
from app.database import check_db_connection, init_db
from app.routers.blogs import router as blogs_router
from app.routers.brands import router as brands_router
from app.routers.generate import router as generate_router

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan context manager for startup and shutdown events."""
    logger.info("Application starting up: initializing database tables...")
    try:
        init_db()
        logger.info("Database initialized successfully.")
    except SQLAlchemyError as exc:
        logger.error("Database initialization encountered an error: %s", exc)
    yield
    logger.info("Application shutting down.")


app = FastAPI(
    title="CareForge API",
    description="Backend API for CareForge Multimodal Healthcare Content Generator",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for local development and production frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(generate_router, prefix=API_PREFIX, tags=[TAG_GENERATION])
app.include_router(brands_router, prefix=API_PREFIX, tags=[TAG_BRANDS])
app.include_router(blogs_router, prefix=API_PREFIX, tags=[TAG_BLOGS])


@app.get("/")
async def root() -> dict[str, str]:
    """Root health check endpoint."""
    return {
        "status": "ok",
        "app": "CareForge API",
        "version": "0.1.0",
    }


@app.get(f"{API_PREFIX}{ROUTE_HEALTH}")
async def health_check() -> dict[str, Any]:
    """API health and database connectivity status endpoint."""
    db_connected = check_db_connection()
    return {
        "status": "healthy" if db_connected else "degraded",
        "database": "connected" if db_connected else "disconnected",
        "tables": [TABLE_BRAND, TABLE_BLOG] if db_connected else [],
    }
