"""Automated tests for Pydantic v2 schemas and validation rules.

Verifies strict input constraints (hex regex, topic length bounds, whitespace handling)
according to backend-async-fastapi standards.
"""

from datetime import UTC, datetime

import pytest
from app.schemas import (
    BlogDetail,
    BlogSummary,
    BrandSummary,
    GenerateRequest,
    GenerateResponse,
)
from pydantic import ValidationError


def test_valid_generate_request_with_data_url() -> None:
    """Verify that a well-formed request with Base64 Data URL succeeds."""
    payload = {
        "company_name": "  Apollo Health  ",
        "logo_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
        "brand_color": "#0052CC",
        "topics": ["Cardiology Care", "Diabetes Diet"],
    }
    req = GenerateRequest(**payload)

    # Whitespace must be stripped
    assert req.company_name == "Apollo Health"
    assert req.brand_color == "#0052CC"
    assert req.logo_url.startswith("data:image/")
    assert len(req.topics) == 2


def test_valid_generate_request_with_3_char_hex_and_http_url() -> None:
    """Verify that 3-character hex codes and web URLs are valid."""
    payload = {
        "company_name": "CareFirst",
        "logo_url": "https://floccare.ai/logo.png",
        "brand_color": "#FFF",
        "topics": ["Healthcare AI"],
    }
    req = GenerateRequest(**payload)
    assert req.brand_color == "#FFF"
    assert req.logo_url == "https://floccare.ai/logo.png"


@pytest.mark.parametrize(
    "invalid_color",
    [
        "blue",
        "#GG1234",
        "#12345",
        "0066CC",  # Missing #
        "#1234567",  # 7 hex chars
        "",
        "   ",
    ],
)
def test_invalid_brand_colors_fail_validation(invalid_color: str) -> None:
    """Verify that invalid hex color codes raise ValidationError."""
    with pytest.raises(ValidationError) as exc_info:
        GenerateRequest(
            company_name="Test Company",
            logo_url="https://example.com/logo.png",
            brand_color=invalid_color,
            topics=["Topic 1"],
        )
    assert "brand_color" in str(exc_info.value)


def test_topics_bounds_validation() -> None:
    """Verify that 0 topics or more than 10 topics fail validation."""
    # 0 topics
    with pytest.raises(ValidationError) as exc_0:
        GenerateRequest(
            company_name="Test Company",
            logo_url="https://example.com/logo.png",
            brand_color="#0066CC",
            topics=[],
        )
    assert "topics" in str(exc_0.value)

    # 11 topics (exceeds max_length=10)
    eleven_topics = [f"Topic {i}" for i in range(11)]
    with pytest.raises(ValidationError) as exc_11:
        GenerateRequest(
            company_name="Test Company",
            logo_url="https://example.com/logo.png",
            brand_color="#0066CC",
            topics=eleven_topics,
        )
    assert "topics" in str(exc_11.value)


def test_blank_topic_in_list_fails_validation() -> None:
    """Verify that whitespace-only topics inside the array are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        GenerateRequest(
            company_name="Test Company",
            logo_url="https://example.com/logo.png",
            brand_color="#0066CC",
            topics=["Valid Topic", "   ", "Another Topic"],
        )
    assert "Topic at position 2 cannot be blank" in str(exc_info.value)


def test_blank_company_name_fails_validation() -> None:
    """Verify that whitespace-only company names are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        GenerateRequest(
            company_name="     ",
            logo_url="https://example.com/logo.png",
            brand_color="#0066CC",
            topics=["Topic 1"],
        )
    assert "company_name" in str(exc_info.value)


def test_invalid_logo_scheme_fails_validation() -> None:
    """Verify that unsupported logo formats/schemes are rejected."""
    with pytest.raises(ValidationError) as exc_info:
        GenerateRequest(
            company_name="Test Company",
            logo_url="ftp://example.com/logo.png",
            brand_color="#0066CC",
            topics=["Topic 1"],
        )
    assert "logo_url" in str(exc_info.value)


def test_outbound_response_schemas() -> None:
    """Verify that outbound response models serialize correctly."""
    now = datetime.now(UTC)
    summary = BlogSummary(
        id=1,
        brand_id=10,
        topic="Cardiology",
        slug="cardiology",
        word_count=980,
        created_at=now,
    )
    assert summary.id == 1
    assert summary.slug == "cardiology"

    detail = BlogDetail(
        id=1,
        brand_id=10,
        topic="Cardiology",
        slug="cardiology",
        content_markdown="# Cardiology\n\nFull post...",
        word_count=980,
        created_at=now,
        company_name="Apollo",
        logo_url="https://example.com/logo.png",
        brand_color="#0052CC",
    )
    assert detail.company_name == "Apollo"
    assert detail.brand_color == "#0052CC"

    gen_res = GenerateResponse(
        brand_id=10,
        company_name="Apollo",
        brand_color="#0052CC",
        blogs=[summary],
    )
    assert gen_res.brand_id == 10
    assert len(gen_res.blogs) == 1

    brand_summary = BrandSummary(
        id=10,
        company_name="Apollo",
        logo_url="https://example.com/logo.png",
        brand_color="#0052CC",
        created_at=now,
        blog_count=1,
    )
    assert brand_summary.blog_count == 1
