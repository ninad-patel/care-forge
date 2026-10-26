---
name: backend-async-fastapi
description: Enforces non-blocking async Python, asyncio.gather concurrency, Pydantic v2 validation, CORS, and pytest standards for the CareForge backend.
---

# Backend Async FastAPI Standards

## Purpose
This skill ensures the FastAPI backend is built for high concurrency, specifically addressing the bottleneck of generating up to ten 1,000-word LLM responses simultaneously without timing out the server or blocking the event loop.

## Key Rules

### 1. True Concurrency (MANDATORY)
- **Never generate blog posts sequentially** in a standard `for topic in topics:` loop.
- **Always use `asyncio.gather(*tasks)`** to execute all LLM calls concurrently in parallel.
  ```python
  tasks = [llm_service.generate_blog(topic=topic, company_name=req.company_name) for topic in req.topics]
  results = await asyncio.gather(*tasks, return_exceptions=True)
  ```
- Generating 10 blogs in parallel should complete in ~15–20 seconds (the same time as generating 1 blog).

### 2. Async Route Handlers & Non-Blocking I/O
- All FastAPI endpoint functions must use `async def`.
- Use async HTTP clients (`httpx.AsyncClient`, `AsyncGroq`, or async Gemini SDK) for network requests to AI providers.
- Never use blocking synchronous calls (like `requests.get` or `time.sleep`) inside route handlers.

### 3. Strict Pydantic v2 Validation
- **Brand Color**: Validate as a 3-character or 6-character Hex string using regex: `^#(?:[0-9a-fA-F]{3}){1,2}$`.
- **Topics Array**: Constrain with `min_length=1` and `max_length=10`.
- **Company Name**: Validate `min_length=1`, stripped of leading/trailing whitespace.
- **Logo**: Accept Base64 data URL string or image URL with length bounds.

### 4. Endpoints Structure
- `POST /api/generate`: Receives company name, logo, hex color, and array of up to 10 topics. Creates the Brand, executes concurrent blog generation, saves records, and returns the Brand ID and list of generated blog slugs.
- `GET /api/brands`: Fetches all previously generated companies/campaigns (fulfilling the "Multiple Use Cases" requirement).
- `GET /api/brands/{brand_id}`: Fetches a specific brand and its 10 generated blogs.
- `GET /api/brands/{brand_id}/blogs/{slug}`: Fetches an individual blog post with content and brand styling metadata.

### 5. CORS & Configuration
- Configure `CORSMiddleware` with configurable allowed origins (including `http://localhost:5173` and deployed Vercel URL).
- Read all configurations (Supabase `DATABASE_URL`, API Keys) strictly from environment variables via `pydantic-settings` or `os.getenv()`.

### 6. Testing & Quality Standards (pytest)
- **Directory Structure**: Mirror source code in `backend/tests/` (e.g., `tests/test_schemas.py`, `tests/test_api.py`, `tests/test_llm_service.py`).
- **Schema Validation Tests**: Test boundary conditions (empty company name, 11 topics, invalid hex colors like `"blue"` or `"#GG1234"` returning HTTP 422).
- **Mocking External APIs**: Never call live external LLM APIs during unit tests; use `unittest.mock.AsyncMock` or `pytest-mock` to mock `llm_service.generate_blog`.
- **FastAPI TestClient**: Use `httpx.AsyncClient` or `starlette.testclient.TestClient` for fast in-memory API testing.
- **Run Command**: `cd backend && pytest tests/ -v`.
