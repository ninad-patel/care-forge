---
name: review-checklist
description: Pre-release verification checklist and architectural standards for the CareForge platform.
---

# CareForge Production Release Checklist

## Purpose
Acts as the final verification gate to ensure the platform meets production standards, multi-tenant data integrity, and high-throughput concurrency before staging deployment or public release.

## Release Verification Items

### 1. Functional Specifications
- [ ] **Input & Generator**: User can enter Company Name, upload Logo Image (or paste URL/Base64), pick Brand Hex Color, and enter up to 10 distinct blog topics.
- [ ] **10 Separate Hosted Pages**: Generating creates 10 individual, directly navigable blog post URLs (e.g. `/company/:brandId/:slug`).
- [ ] **1,000-Word Content**: Each page contains a well-structured, multi-section markdown blog post approaching ~800–1,000 words.
- [ ] **Consistent Layout & Theming**: All 10 pages display the uploaded logo in the header and dynamically apply the user's input hex color to navbars, borders, buttons, and accents.
- [ ] **Multi-Tenancy / Multiple Use Cases**: Creating a new company campaign does NOT overwrite previous data. Users can navigate back to previous company campaigns from the Dashboard.

### 2. High-Throughput & Architectural Standards
- [ ] **Parallel Async Concurrency**: FastAPI backend uses `asyncio.gather` for the 10 blog topics, generating all 10 posts in ~15–20 seconds rather than blocking sequentially for 3+ minutes.
- [ ] **Relational Integrity**: PostgreSQL schema has `brands` and `blogs` tables connected by a foreign key with `ondelete="CASCADE"`.
- [ ] **Clean Code & Pre-Commit**: Pre-commit hooks (`ruff`, `end-of-file-fixer`, `trailing-whitespace`, type-checking) pass cleanly across all staged files.
- [ ] **Resilience**: The backend gracefully handles potential LLM rate limits without crashing the entire batch (`return_exceptions=True` and retry backoff).
- [ ] **Clean Typography**: Markdown renders cleanly using `react-markdown` with readable line-height, clear heading sizes, and word count / reading time badges.

### 3. Automated Testing & Verification
- [ ] **Unit Tests Present**: Backend includes `backend/tests/` with `test_schemas.py` (Pydantic validation) and `test_api.py` (FastAPI route tests) using `pytest`.
- [ ] **LLM Calls Strictly Mocked**: Unit tests must never make real external network requests or spend API credits; all AI calls are mocked using `unittest.mock.AsyncMock`.
- [ ] **Frontend Pure Utilities Tested**: Word count, reading time, and slug generation functions are isolated in pure modules (`src/utils/formatters.ts`, `src/utils/contrast.ts`) and covered with unit tests.
- [ ] **Passing Suite**: Running `pytest` in `backend/` and `npm run test:unit` / `npm run type-check` in `frontend/` executes cleanly with 0 failures before release.

### 4. Production Deployment & Architecture Documentation
- [ ] **Live Hosted URLs**: Frontend hosted on Vercel and backend hosted on Render/Railway with cloud PostgreSQL (Supabase/Neon).
- [ ] **Product Walkthrough**:
  - Live walkthrough demonstrating:
    1. Creating a new company portal (e.g. Healthcare clinic with custom logo, hex color, and 10 topics).
    2. Parallel generation (~15s) with live progress indicator.
    3. Navigating through multiple hosted blog posts showing custom branding, logo header, and ~1,000-word formatting.
    4. Switching to another company campaign to showcase multi-tenant isolation and persistent history.
    5. High-level architecture walkthrough of the async generation pipeline (`asyncio.gather`).
- [ ] **Technical Architecture Document**:
  - Clear technical markdown document covering:
    1. Model selection rationale (Groq / Gemini Flash: output token velocity, latency, cost efficiency).
    2. Prompt engineering strategy for structured 1,000-word generation.
    3. Concurrency architecture (`asyncio.gather` non-blocking I/O).
    4. Database schema & relational cascade integrity.
