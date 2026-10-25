"""LLM generation service with concurrency, resilience, and word count analysis.

Integrates Gemini 2.5 Flash via google-genai async SDK, tenacity retries,
and partial failure handling with asyncio.gather according to
llm-resilience-handling standards.
"""

import asyncio
import logging
import re
import time
from typing import Any

from google import genai
from google.genai.errors import APIError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import get_settings
from app.constants import (
    DEFAULT_FALLBACK_SLUG,
    FALLBACK_GEMINI_MODELS,
    LLM_MAX_RETRIES,
    LLM_RETRY_MAX_WAIT,
    LLM_RETRY_MIN_WAIT,
    LLM_RETRY_MULTIPLIER,
    LLM_TIMEOUT_SECONDS,
    PRIMARY_GEMINI_MODEL,
)
from app.prompts import build_blog_prompt

logger = logging.getLogger(__name__)
settings = get_settings()

# Primary high-speed Flash model and resilient fallbacks
PRIMARY_MODEL = PRIMARY_GEMINI_MODEL
FALLBACK_MODELS = list(FALLBACK_GEMINI_MODELS)


def generate_slug(topic: str) -> str:
    """Generate a clean, URL-friendly alphanumeric slug from a topic title.

    Example: "Cardiology & Preventive Care (2026)!" -> "cardiology-preventive-care-2026"
    """
    cleaned = topic.lower().strip()
    # Replace non-alphanumeric characters with hyphens
    cleaned = re.sub(r"[^\w\s-]", "", cleaned)
    # Replace spaces and underscores with a single hyphen
    cleaned = re.sub(r"[\s_]+", "-", cleaned)
    # Strip leading/trailing hyphens
    slug = cleaned.strip("-")
    return slug or DEFAULT_FALLBACK_SLUG


def calculate_word_count(markdown_text: str) -> int:
    """Calculate the genuine word count of a markdown document.

    Strips markdown heading hashes, bullet markers, and formatting symbols.
    """
    # Remove markdown code blocks
    cleaned = re.sub(r"```[\s\S]*?```", "", markdown_text)
    # Remove markdown links, keeping link text
    cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
    # Remove markdown heading hashes, bold/italic markers, and blockquotes
    cleaned = re.sub(r"[#*_>`~-]", " ", cleaned)
    words = [w for w in cleaned.split() if any(c.isalnum() for c in w)]
    return len(words)


def clean_markdown_output(raw_text: str) -> str:
    """Remove accidental surrounding triple-backtick markdown blocks if outputted by LLM."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```markdown"):
        cleaned = cleaned[len("```markdown") :].strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:].strip()

    if cleaned.endswith("```"):
        cleaned = cleaned[:-3].strip()

    return cleaned


def create_fallback_content(topic: str, company_name: str, error_msg: str) -> str:
    """Generate a graceful, informative fallback article when generation fails."""
    return f"""# {topic}

## Important Notice on Content Generation

This educational article on **{topic}** for **{company_name}** could not be fully generated due to a temporary service rate limit or timeout ({error_msg}).

### Key Discussion Points for {topic}:
- Clinical background and relevance in contemporary patient care.
- Diagnostic markers and preventive lifestyle strategies.
- Evidence-based therapeutic advancements and treatment protocols.

## Next Steps with {company_name}
Please regenerate this topic or contact {company_name} for direct access to our comprehensive healthcare publications and clinical resources.
"""


class LLMService:
    """Asynchronous LLM service coordinating batch blog generation and resilience."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.GEMINI_API_KEY
        self._client: genai.Client | None = None

    @property
    def client(self) -> genai.Client:
        """Lazily initialize and cache the google-genai client."""
        if self._client is None:
            if not self.api_key:
                raise ValueError(
                    "GEMINI_API_KEY is not configured. Please add your API key to backend/.env."
                )
            self._client = genai.Client(api_key=self.api_key)
        return self._client

    async def _call_gemini_with_fallback(self, prompt: str) -> str:
        """Attempt generation with primary model and gracefully fall back to alternative models."""
        models_to_try = [PRIMARY_MODEL, *FALLBACK_MODELS]
        last_exception: Exception | None = None

        for model_name in models_to_try:
            try:
                response = await self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text
            except APIError as api_err:
                last_exception = api_err
                logger.warning(
                    "Model %s failed with APIError: %s. Trying fallback model...",
                    model_name,
                    api_err,
                )
            except Exception as exc:  # noqa: BLE001
                last_exception = exc
                logger.warning(
                    "Model %s encountered error: %s. Trying fallback...",
                    model_name,
                    exc,
                )

        if last_exception:
            raise last_exception
        raise RuntimeError("LLM returned an empty response across all models.")

    async def generate_single_blog(
        self,
        topic: str,
        company_name: str,
        topic_index: int = 1,
        total_topics: int = 1,
    ) -> dict[str, Any]:
        """Generate a single ~1,000-word blog post with retries, timeout guard, and fallback handling.

        Args:
            topic: The article topic.
            company_name: The brand/company name.
            topic_index: Progress index (e.g. 1 of 10).
            total_topics: Total topics in batch.

        Returns:
            Dictionary with topic, slug, content_markdown, and word_count.
        """
        start_time = time.monotonic()
        slug = generate_slug(topic)
        prompt = build_blog_prompt(topic=topic, company_name=company_name)

        logger.info(
            "[%d/%d] Starting generation for topic: '%s'...",
            topic_index,
            total_topics,
            topic,
        )

        @retry(
            stop=stop_after_attempt(LLM_MAX_RETRIES),
            wait=wait_exponential(
                multiplier=LLM_RETRY_MULTIPLIER,
                min=LLM_RETRY_MIN_WAIT,
                max=LLM_RETRY_MAX_WAIT,
            ),
            retry=retry_if_exception_type((APIError, TimeoutError, ConnectionError)),
            reraise=True,
        )
        async def _execute_with_retry() -> str:
            # Enforce timeout guard per individual topic call
            return await asyncio.wait_for(
                self._call_gemini_with_fallback(prompt),
                timeout=LLM_TIMEOUT_SECONDS,
            )

        try:
            raw_markdown = await _execute_with_retry()
            content = clean_markdown_output(raw_markdown)
            word_count = calculate_word_count(content)
            duration = time.monotonic() - start_time

            logger.info(
                "[%d/%d] Successfully generated '%s' in %.2fs (%d words).",
                topic_index,
                total_topics,
                topic,
                duration,
                word_count,
            )

            return {
                "topic": topic,
                "slug": slug,
                "content_markdown": content,
                "word_count": word_count,
            }
        except Exception as exc:  # noqa: BLE001
            duration = time.monotonic() - start_time
            logger.error(
                "[%d/%d] Failed generation for '%s' after retries (%.2fs): %s. Using graceful fallback.",
                topic_index,
                total_topics,
                topic,
                duration,
                exc,
            )
            fallback_text = create_fallback_content(
                topic=topic,
                company_name=company_name,
                error_msg=str(exc),
            )
            return {
                "topic": topic,
                "slug": slug,
                "content_markdown": fallback_text,
                "word_count": calculate_word_count(fallback_text),
            }

    async def generate_blogs_parallel(
        self,
        topics: list[str],
        company_name: str,
    ) -> list[dict[str, Any]]:
        """Generate all blog posts concurrently in parallel using asyncio.gather.

        Generating 10 topics in parallel completes in ~15-20s (the time of 1 blog)
        instead of sequentially blocking for 3+ minutes.

        Args:
            topics: List of up to 10 topics.
            company_name: Brand/company name.

        Returns:
            List of generated blog dictionaries.
        """
        total = len(topics)
        logger.info(
            "Triggering concurrent generation of %d blogs for '%s' via asyncio.gather...",
            total,
            company_name,
        )
        start_batch = time.monotonic()

        tasks = [
            self.generate_single_blog(
                topic=topic,
                company_name=company_name,
                topic_index=index + 1,
                total_topics=total,
            )
            for index, topic in enumerate(topics)
        ]

        # Concurrently execute all tasks with return_exceptions=True
        raw_results = await asyncio.gather(*tasks, return_exceptions=True)
        batch_duration = time.monotonic() - start_batch

        blogs: list[dict[str, Any]] = []
        for index, res in enumerate(raw_results):
            if isinstance(res, Exception):
                logger.error(
                    "Unhandled exception in task %d for topic '%s': %s",
                    index + 1,
                    topics[index],
                    res,
                )
                fallback = create_fallback_content(
                    topics[index],
                    company_name,
                    str(res),
                )
                blogs.append(
                    {
                        "topic": topics[index],
                        "slug": generate_slug(topics[index]),
                        "content_markdown": fallback,
                        "word_count": calculate_word_count(fallback),
                    }
                )
            else:
                blogs.append(res)

        total_words = sum(b["word_count"] for b in blogs)
        logger.info(
            "Batch generation of %d blogs complete in %.2fs (Total ~%d words).",
            total,
            batch_duration,
            total_words,
        )
        return blogs


# Default singleton instance
llm_service = LLMService()
