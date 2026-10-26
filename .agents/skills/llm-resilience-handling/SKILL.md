---
name: llm-resilience-handling
description: Ensures resilience during concurrent LLM calls with automatic retries, rate-limit backoff, and partial failure handling via asyncio.gather.
---

# LLM Resilience Handling Standards

## Purpose
When firing up to 10 concurrent requests to a free-tier LLM API (Groq or Google Gemini), rate limits (HTTP 429) or transient timeouts are common. This skill ensures the platform never crashes the entire batch if a single call fails, delivering a resilient user experience.

## Key Rules

### 1. Automatic Retries with Exponential Backoff
- Wrap individual LLM calls with retry logic using `tenacity` or an async loop:
  ```python
  from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

  @retry(
      stop=stop_after_attempt(3),
      wait=wait_exponential(multiplier=1.5, min=2, max=10),
      reraise=True
  )
  async def call_llm_with_retry(prompt: str) -> str:
      ...
  ```
- Catch rate-limit errors and transient 5xx server errors specifically.

### 2. Partial Success Handling (`return_exceptions=True`)
- Always use `return_exceptions=True` in `asyncio.gather(*tasks)`:
  ```python
  results = await asyncio.gather(*tasks, return_exceptions=True)
  ```
- If 9 out of 10 topics succeed and 1 fails, do NOT crash the batch or abort the database save.
- For any failed topic, insert a graceful fallback message in markdown (e.g., *"# [Topic]\n\nBlog generation timed out for this topic. Click regenerate to retry."*) so the user still gets their other 9 completed articles and a working company portal.

### 3. Timeout Guard per Task
- Wrap individual LLM calls in `asyncio.wait_for(coro, timeout=35.0)` to ensure a hung socket never blocks the entire request indefinitely.

### 4. Transparent Progress & Logging
- Log start, completion, and duration for each topic generation with correlation (e.g. `[Topic 3/10] Completed in 2.4s`).
