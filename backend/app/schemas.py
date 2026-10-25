"""Pydantic v2 data validation and serialization schemas for CareForge.

Implements strict validation for company data, brand colors, and topic limits
according to backend-async-fastapi standards.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import (
    HEX_COLOR_REGEX,
    MAX_COMPANY_NAME_LENGTH,
    MAX_TOPICS_COUNT,
    MIN_COMPANY_NAME_LENGTH,
    MIN_LOGO_URL_LENGTH,
    MIN_TOPICS_COUNT,
)


class GenerateRequest(BaseModel):
    """Inbound payload for batch blog generation."""

    company_name: str = Field(
        ...,
        min_length=MIN_COMPANY_NAME_LENGTH,
        max_length=MAX_COMPANY_NAME_LENGTH,
        description="The name of the company or healthcare provider",
        examples=["Apollo Health"],
    )
    logo_url: str = Field(
        ...,
        min_length=MIN_LOGO_URL_LENGTH,
        description="Base64 Data URL or public image URL representing company logo",
        examples=["data:image/png;base64,iVBORw0KGgoAAAANSUhEUg..."],
    )
    brand_color: str = Field(
        ...,
        description="Brand primary color in 3-digit or 6-digit Hex format (e.g. #0066CC or #FFF)",
        examples=["#0066CC"],
    )
    topics: list[str] = Field(
        ...,
        min_length=MIN_TOPICS_COUNT,
        max_length=MAX_TOPICS_COUNT,
        description="Array of 1 to 10 distinct blog post topics",
        examples=[["Cardiology Innovations", "Managing Diabetes With Nutrition"]],
    )

    @field_validator("company_name")
    @classmethod
    def validate_company_name(cls, value: str) -> str:
        """Strip leading/trailing whitespace and ensure non-empty."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Company name cannot be blank or whitespace-only.")
        return cleaned

    @field_validator("brand_color")
    @classmethod
    def validate_brand_color(cls, value: str) -> str:
        """Enforce strict 3 or 6-character hex color code."""
        cleaned = value.strip()
        if not HEX_COLOR_REGEX.match(cleaned):
            raise ValueError(
                f"Invalid brand color '{value}'. Must be a valid Hex color code starting with '#' (e.g. #0066CC or #FFF)."
            )
        return cleaned

    @field_validator("logo_url")
    @classmethod
    def validate_logo_url(cls, value: str) -> str:
        """Ensure logo is a valid Data URL or HTTP/HTTPS image URL."""
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Logo cannot be empty.")
        if not cleaned.startswith(("data:image/", "http://", "https://")):
            raise ValueError(
                "Logo must be a valid Base64 Data URL (data:image/...) or web URL (http:// or https://)."
            )
        return cleaned

    @field_validator("topics")
    @classmethod
    def validate_topics(cls, topics: list[str]) -> list[str]:
        """Strip whitespace from each topic and reject blank topics."""
        cleaned_topics: list[str] = []
        for index, topic in enumerate(topics):
            cleaned = topic.strip()
            if not cleaned:
                raise ValueError(f"Topic at position {index + 1} cannot be blank.")
            cleaned_topics.append(cleaned)
        return cleaned_topics


class BlogSummary(BaseModel):
    """Concise representation of a blog post."""

    id: int
    brand_id: int
    topic: str
    slug: str
    word_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BlogDetail(BaseModel):
    """Full blog post representation including markdown content and brand styling."""

    id: int
    brand_id: int
    topic: str
    slug: str
    content_markdown: str
    word_count: int
    created_at: datetime

    # Parent brand styling tokens for dynamic UI theming
    company_name: str
    logo_url: str
    brand_color: str

    model_config = ConfigDict(from_attributes=True)


class BrandSummary(BaseModel):
    """Summary of a company campaign/workspace for the multi-use case list."""

    id: int
    company_name: str
    logo_url: str
    brand_color: str
    created_at: datetime
    blog_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class BrandDetail(BaseModel):
    """Complete company portal including all generated blog summaries."""

    id: int
    company_name: str
    logo_url: str
    brand_color: str
    created_at: datetime
    blogs: list[BlogSummary] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class GenerateResponse(BaseModel):
    """Response returned upon successful batch blog generation."""

    brand_id: int
    company_name: str
    brand_color: str
    blogs: list[BlogSummary]

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    """Diagnostic response for health check."""

    status: str
    database: str
    tables: list[str]
