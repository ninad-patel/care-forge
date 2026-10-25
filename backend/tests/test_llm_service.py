"""Automated tests for LLM service, prompt generation, slugification, and resilience.

All external AI API calls are strictly mocked with AsyncMock according to
review-checklist standards, ensuring zero API credit consumption during tests.
"""

from unittest.mock import AsyncMock, patch

import pytest
from app.prompts import build_blog_prompt
from app.services.llm_service import (
    LLMService,
    calculate_word_count,
    clean_markdown_output,
    generate_slug,
)


def test_generate_slug_pure_function() -> None:
    """Verify that topics are transformed into clean, URL-friendly slugs."""
    assert (
        generate_slug("Cardiology & Heart Care (2026)!") == "cardiology-heart-care-2026"
    )
    assert (
        generate_slug("  Managing Diabetes with Diet & Exercise  ")
        == "managing-diabetes-with-diet-exercise"
    )
    assert generate_slug("AI in Healthcare???") == "ai-in-healthcare"
    # Special character edge case
    assert generate_slug("!@#$%^&*()") == "healthcare-article"


def test_calculate_word_count_accurate() -> None:
    """Verify that word count accurately discounts markdown syntax tokens."""
    sample_markdown = """# Top Title

## Introduction
This is a standard paragraph with **bold** words and *italic* words.

- Bullet point one
- Bullet point two

```python
# Code block should be excluded from article word count
x = 10
```

[Link text](https://example.com) should count only the link text.
"""
    count = calculate_word_count(sample_markdown)
    # The words inside code block (x = 10) are stripped, words in text counted
    assert count > 15
    assert count < 50


def test_clean_markdown_output_removes_fences() -> None:
    """Verify that triple-backtick markdown wrappers are stripped if emitted."""
    raw_with_fence = "```markdown\n# Health Title\n\nArticle body.\n```"
    cleaned = clean_markdown_output(raw_with_fence)
    assert cleaned == "# Health Title\n\nArticle body."

    raw_generic_fence = "```\n# Health Title\n```"
    assert clean_markdown_output(raw_generic_fence) == "# Health Title"


def test_build_blog_prompt_injects_brand_and_structure() -> None:
    """Verify that prompts inject the company name and mandate 6-section structure."""
    prompt = build_blog_prompt(
        topic="Pediatric Asthma Care", company_name="CareFirst Health"
    )
    assert "Pediatric Asthma Care" in prompt
    assert "CareFirst Health" in prompt
    assert "Target Word Count" in prompt
    assert "1,000-word" in prompt
    assert "Introduction" in prompt
    assert "Conclusion" in prompt


@pytest.mark.asyncio
async def test_generate_single_blog_mocked() -> None:
    """Verify single blog generation with mocked LLM response (zero API cost)."""
    service = LLMService(api_key="test-api-key")

    mock_markdown = (
        "# Pediatric Asthma Care\n\n"
        "## Introduction\n"
        "Asthma in children is a critical health condition requiring early intervention.\n\n"
        "## Core Foundations\n"
        "Detailed clinical background and inflammatory mechanisms in the lungs.\n\n"
        "## Conclusion\n"
        "Contact CareFirst Health for comprehensive pediatric respiratory care."
    )

    with patch.object(
        service,
        "_call_gemini_with_fallback",
        new_callable=AsyncMock,
        return_value=mock_markdown,
    ):
        result = await service.generate_single_blog(
            topic="Pediatric Asthma Care",
            company_name="CareFirst Health",
        )

        assert result["topic"] == "Pediatric Asthma Care"
        assert result["slug"] == "pediatric-asthma-care"
        assert result["word_count"] > 10
        assert "CareFirst Health" in result["content_markdown"]


@pytest.mark.asyncio
async def test_generate_blogs_parallel_mocked() -> None:
    """Verify parallel batch generation with asyncio.gather using mocked LLM."""
    service = LLMService(api_key="test-api-key")

    topics = ["Cardiology", "Neurology", "Pediatrics"]

    def mock_return_blog(topic: str, company: str, idx: int, total: int) -> dict:
        return {
            "topic": topic,
            "slug": generate_slug(topic),
            "content_markdown": f"# {topic}\n\nComprehensive content for {company}.",
            "word_count": 950,
        }

    with patch.object(
        service,
        "generate_single_blog",
        side_effect=lambda topic,
        company_name,
        topic_index,
        total_topics: mock_return_blog(topic, company_name, topic_index, total_topics),
    ):
        results = await service.generate_blogs_parallel(
            topics=topics, company_name="CareFirst"
        )

        assert len(results) == 3
        assert results[0]["topic"] == "Cardiology"
        assert results[1]["topic"] == "Neurology"
        assert results[2]["topic"] == "Pediatrics"
        assert all(r["word_count"] == 950 for r in results)


@pytest.mark.asyncio
async def test_llm_resilience_fallback_on_failure() -> None:
    """Verify that if an LLM call fails completely, a graceful fallback is produced."""
    service = LLMService(api_key="test-api-key")

    with patch.object(
        service,
        "_call_gemini_with_fallback",
        new_callable=AsyncMock,
        side_effect=TimeoutError("Connection timed out after 35s"),
    ):
        result = await service.generate_single_blog(
            topic="Rare Oncology Cases",
            company_name="CareFirst",
        )

        # Must not raise an exception; must return graceful fallback content
        assert result["topic"] == "Rare Oncology Cases"
        assert result["slug"] == "rare-oncology-cases"
        assert "Important Notice on Content Generation" in result["content_markdown"]
        assert result["word_count"] > 0
