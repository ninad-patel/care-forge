"""Automated integration tests for CareForge API endpoints.

Covers POST /api/generate, GET /api/brands, GET /api/brands/{id},
and GET /api/blogs/{id} using an isolated in-memory database and mocked LLM calls.
Respects review-checklist and backend-async-fastapi standards.
"""

from collections.abc import Generator
from unittest.mock import AsyncMock, patch

import pytest
from app.database import get_db
from app.main import app
from app.models import Base
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Isolated in-memory engine for endpoint testing
TEST_DB_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


# SQLite requires explicit PRAGMA to enforce foreign key cascade deletes
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
def setup_test_db() -> Generator[None, None, None]:
    """Rebuild database schema before each test."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Provide a TestClient with overridden database dependency."""

    def override_get_db() -> Generator[Session, None, None]:
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_generate_endpoint_creates_brand_and_blogs(client: TestClient) -> None:
    """Verify that POST /api/generate saves brand and blogs concurrently."""
    mock_blogs_output = [
        {
            "topic": "Preventative Cardiology",
            "slug": "preventative-cardiology",
            "content_markdown": "# Preventative Cardiology\n\nFull post for Apollo.",
            "word_count": 980,
        },
        {
            "topic": "Diet & Diabetes",
            "slug": "diet-diabetes",
            "content_markdown": "# Diet & Diabetes\n\nFull post for Apollo.",
            "word_count": 1020,
        },
    ]

    payload = {
        "company_name": "Apollo Care",
        "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        "brand_color": "#0052CC",
        "topics": ["Preventative Cardiology", "Diet & Diabetes"],
    }

    with patch(
        "app.routers.generate.llm_service.generate_blogs_parallel",
        new_callable=AsyncMock,
        return_value=mock_blogs_output,
    ):
        response = client.post("/api/generate", json=payload)
        assert response.status_code == 201
        data = response.json()

        assert data["company_name"] == "Apollo Care"
        assert data["brand_color"] == "#0052CC"
        assert len(data["blogs"]) == 2
        assert data["blogs"][0]["topic"] == "Preventative Cardiology"
        assert data["blogs"][0]["word_count"] == 980
        assert data["blogs"][1]["slug"] == "diet-diabetes"


def test_get_brands_multi_tenancy(client: TestClient) -> None:
    """Verify that GET /api/brands returns multiple generated company campaigns."""
    # Create two different brand campaigns
    for company, color in [("Apollo Health", "#0052CC"), ("CardioFirst", "#E63946")]:
        payload = {
            "company_name": company,
            "logo_url": "https://example.com/logo.png",
            "brand_color": color,
            "topics": ["Healthcare Innovation"],
        }
        with patch(
            "app.routers.generate.llm_service.generate_blogs_parallel",
            new_callable=AsyncMock,
            return_value=[
                {
                    "topic": "Healthcare Innovation",
                    "slug": "healthcare-innovation",
                    "content_markdown": "# Healthcare Innovation",
                    "word_count": 900,
                }
            ],
        ):
            res = client.post("/api/generate", json=payload)
            assert res.status_code == 201

    # Fetch all brands
    get_res = client.get("/api/brands")
    assert get_res.status_code == 200
    brands = get_res.json()

    assert len(brands) == 2
    names = [b["company_name"] for b in brands]
    assert "Apollo Health" in names
    assert "CardioFirst" in names
    assert all(b["blog_count"] == 1 for b in brands)


def test_get_brand_detail_and_not_found(client: TestClient) -> None:
    """Verify GET /api/brands/{id} returns brand and associated blogs, or 404."""
    # Test 404 for non-existent brand
    res_404 = client.get("/api/brands/99999")
    assert res_404.status_code == 404

    # Create a brand
    payload = {
        "company_name": "ClinicOne",
        "logo_url": "https://example.com/logo.png",
        "brand_color": "#10B981",
        "topics": ["Family Medicine"],
    }
    with patch(
        "app.routers.generate.llm_service.generate_blogs_parallel",
        new_callable=AsyncMock,
        return_value=[
            {
                "topic": "Family Medicine",
                "slug": "family-medicine",
                "content_markdown": "# Family Medicine",
                "word_count": 890,
            }
        ],
    ):
        post_res = client.post("/api/generate", json=payload)
        brand_id = post_res.json()["brand_id"]

    # Retrieve brand detail
    detail_res = client.get(f"/api/brands/{brand_id}")
    assert detail_res.status_code == 200
    data = detail_res.json()
    assert data["company_name"] == "ClinicOne"
    assert len(data["blogs"]) == 1
    assert data["blogs"][0]["topic"] == "Family Medicine"


def test_get_blog_detail_with_brand_styling(client: TestClient) -> None:
    """Verify that GET /api/blogs/{id} includes the parent brand styling tokens."""
    payload = {
        "company_name": "MetroCare",
        "logo_url": "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
        "brand_color": "#8B5CF6",
        "topics": ["Orthopedic Health"],
    }
    with patch(
        "app.routers.generate.llm_service.generate_blogs_parallel",
        new_callable=AsyncMock,
        return_value=[
            {
                "topic": "Orthopedic Health",
                "slug": "orthopedic-health",
                "content_markdown": "# Orthopedic Health\n\nFull article.",
                "word_count": 1050,
            }
        ],
    ):
        post_res = client.post("/api/generate", json=payload)
        blog_id = post_res.json()["blogs"][0]["id"]

    # Fetch individual blog
    blog_res = client.get(f"/api/blogs/{blog_id}")
    assert blog_res.status_code == 200
    blog_data = blog_res.json()

    assert blog_data["topic"] == "Orthopedic Health"
    assert blog_data["word_count"] == 1050
    assert blog_data["company_name"] == "MetroCare"
    assert blog_data["brand_color"] == "#8B5CF6"
    assert blog_data["logo_url"].startswith("data:image/")


def test_delete_brand_cascades(client: TestClient) -> None:
    """Verify that DELETE /api/brands/{id} removes the brand and its blogs."""
    payload = {
        "company_name": "DeleteMe Health",
        "logo_url": "https://example.com/logo.png",
        "brand_color": "#000000",
        "topics": ["Temporary Topic"],
    }
    with patch(
        "app.routers.generate.llm_service.generate_blogs_parallel",
        new_callable=AsyncMock,
        return_value=[
            {
                "topic": "Temporary Topic",
                "slug": "temporary-topic",
                "content_markdown": "# Temp Content",
                "word_count": 500,
            }
        ],
    ):
        post_res = client.post("/api/generate", json=payload)
        brand_id = post_res.json()["brand_id"]
        blog_id = post_res.json()["blogs"][0]["id"]

    # Delete brand
    del_res = client.delete(f"/api/brands/{brand_id}")
    assert del_res.status_code == 204

    # Both brand and blog should now return 404
    assert client.get(f"/api/brands/{brand_id}").status_code == 404
    assert client.get(f"/api/blogs/{blog_id}").status_code == 404
