---
name: database-async-postgres
description: Enforces relational PostgreSQL standards with SQLAlchemy/SQLModel, one-to-many Brand-to-Blog relations, cascade deletes, and cloud DB connection.
---

# Database Async Postgres Standards

## Purpose
Ensures a production-ready, cloud-compatible database schema using a one-to-many relationship between Brands and Blogs, supporting the "multiple use cases" requirement without data loss or orphan records.

## Key Rules

### 1. Relational Modeling (1-to-Many)
- Strictly use two relational tables/models:
  1. **`brands`**:
     - `id`: UUID or Auto-increment Integer (Primary Key)
     - `company_name`: String, non-nullable
     - `logo_url`: Text (Base64 data URI or public image URL)
     - `brand_color`: String(7), non-nullable (e.g. `#0066CC`)
     - `created_at`: DateTime(timezone=True), default UTC now
  2. **`blogs`**:
     - `id`: UUID or Auto-increment Integer (Primary Key)
     - `brand_id`: Foreign Key pointing to `brands.id`
     - `topic`: String, non-nullable
     - `slug`: String, non-nullable, unique per brand
     - `content_markdown`: Text, non-nullable (the ~1000-word article)
     - `word_count`: Integer, calculated from markdown text
     - `created_at`: DateTime(timezone=True), default UTC now

### 2. Cascade Deletion & Foreign Key Integrity
- The foreign key relationship on `blogs.brand_id` MUST include `ondelete="CASCADE"`.
- If a brand/campaign is deleted, all associated blog posts are automatically removed, preventing orphaned records and database bloat.

### 3. Support for Multiple Use Cases
- Do not overwrite single rows. Each submission from the frontend creates a new `Brand` row and 10 associated `Blog` rows.
- This allows users to switch between different company workspaces and view historical generated campaigns.

### 4. Cloud-Ready Database Connection
- Connect directly to cloud PostgreSQL (Supabase or Neon) via the `DATABASE_URL` environment variable.
- Use `Base.metadata.create_all(bind=engine)` during application startup (in FastAPI `lifespan` handler) so tables are created automatically without requiring manual migration scripts or PgAdmin setup.
