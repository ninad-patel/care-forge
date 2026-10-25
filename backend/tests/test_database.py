"""Automated tests for database models, cascade deletion, and connectivity.

Tests tbl_brand and tbl_blog relational integrity using an isolated in-memory engine.
"""

from collections.abc import Generator

import pytest
from app.database import get_db
from app.main import app
from app.models import Base, Blog, Brand
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Isolated in-memory SQLite engine for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


# SQLite requires explicit PRAGMA to enforce foreign keys and ondelete="CASCADE"
@event.listens_for(test_engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(autouse=True)
def setup_test_database() -> Generator[None, None, None]:
    """Create all tables before each test and drop them afterward."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """Provide a transactional test database session."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_tbl_brand_and_tbl_blog_creation(db_session: Session) -> None:
    """Verify that tbl_brand and tbl_blog can be created and queried."""
    # Create brand
    brand = Brand(
        company_name="Apollo Health",
        logo_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        brand_color="#0052CC",
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    assert brand.id is not None
    assert brand.company_name == "Apollo Health"
    assert brand.brand_color == "#0052CC"

    # Create associated blogs
    blog1 = Blog(
        brand_id=brand.id,
        topic="Cardiology Advances",
        slug="cardiology-advances",
        content_markdown="# Cardiology Advances\n\nFull blog content...",
        word_count=950,
    )
    blog2 = Blog(
        brand_id=brand.id,
        topic="Managing Diabetes",
        slug="managing-diabetes",
        content_markdown="# Managing Diabetes\n\nFull blog content...",
        word_count=1020,
    )
    db_session.add_all([blog1, blog2])
    db_session.commit()

    # Verify relationship
    db_session.refresh(brand)
    assert len(brand.blogs) == 2
    assert brand.blogs[0].topic == "Cardiology Advances"
    assert brand.blogs[1].word_count == 1020


def test_cascade_delete_removes_associated_blogs(db_session: Session) -> None:
    """Verify that deleting a brand automatically cascade-deletes all associated blogs."""
    # Create brand with 3 blogs
    brand = Brand(
        company_name="CareFirst Clinic",
        logo_url="https://example.com/logo.png",
        brand_color="#E63946",
    )
    db_session.add(brand)
    db_session.commit()
    db_session.refresh(brand)

    for i in range(3):
        blog = Blog(
            brand_id=brand.id,
            topic=f"Healthcare Topic {i + 1}",
            slug=f"healthcare-topic-{i + 1}",
            content_markdown=f"# Topic {i + 1}\n\nContent...",
            word_count=900,
        )
        db_session.add(blog)
    db_session.commit()

    # Verify blogs are saved
    blogs_before = db_session.query(Blog).filter_by(brand_id=brand.id).all()
    assert len(blogs_before) == 3

    # Delete brand
    db_session.delete(brand)
    db_session.commit()

    # Verify that all 3 blogs were automatically cascade-deleted
    blogs_after = db_session.query(Blog).filter_by(brand_id=brand.id).all()
    assert len(blogs_after) == 0


def test_health_check_endpoint() -> None:
    """Verify that GET /api/health returns healthy status."""

    def override_get_db() -> Generator[Session, None, None]:
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "degraded"]
        assert "database" in data
        assert "tables" in data

    app.dependency_overrides.clear()
