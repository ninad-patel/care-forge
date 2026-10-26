"""Brand workspace management router for CareForge.

Provides list, retrieve, and delete endpoints supporting the
"multiple use cases" (multi-tenancy) requirement.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.constants import ROUTE_BRANDS
from app.database import get_db
from app.models import Blog, Brand
from app.schemas import BlogDetail, BlogSummary, BrandDetail, BrandSummary

logger = logging.getLogger(__name__)

router = APIRouter(prefix=ROUTE_BRANDS)


@router.get(
    "",
    response_model=list[BrandSummary],
    summary="List all generated brand campaigns and workspaces",
)
async def list_brands(
    db: Annotated[Session, Depends(get_db)],
) -> list[BrandSummary]:
    """Retrieve all previously generated company workspaces ordered by newest first.

    Fulfills the 'Multiple Use Cases' requirement.
    """
    # Query brands with total blog count per brand
    query = (
        db.query(
            Brand.id,
            Brand.company_name,
            Brand.logo_url,
            Brand.brand_color,
            Brand.created_at,
            func.count(Blog.id).label("blog_count"),
        )
        .outerjoin(Blog, Brand.id == Blog.brand_id)
        .group_by(Brand.id)
        .order_by(desc(Brand.created_at))
    )

    results = query.all()

    return [
        BrandSummary(
            id=r.id,
            company_name=r.company_name,
            logo_url=r.logo_url,
            brand_color=r.brand_color,
            created_at=r.created_at,
            blog_count=r.blog_count,
        )
        for r in results
    ]


@router.get(
    "/{brand_id}",
    response_model=BrandDetail,
    summary="Retrieve brand campaign details and its associated blog cards",
)
async def get_brand(
    brand_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> BrandDetail:
    """Retrieve a specific company workspace and all its generated blog summaries."""
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand workspace with ID {brand_id} not found.",
        )

    # Sort associated blogs by ID
    blogs = (
        db.query(Blog).filter(Blog.brand_id == brand_id).order_by(Blog.id.asc()).all()
    )

    return BrandDetail(
        id=brand.id,
        company_name=brand.company_name,
        logo_url=brand.logo_url,
        brand_color=brand.brand_color,
        created_at=brand.created_at,
        blogs=[BlogSummary.model_validate(b) for b in blogs],
    )


@router.get(
    "/{brand_id}/blogs/{slug}",
    response_model=BlogDetail,
    summary="Retrieve an individual blog post by brand ID and topic slug",
)
async def get_brand_blog_by_slug(
    brand_id: int,
    slug: str,
    db: Annotated[Session, Depends(get_db)],
) -> BlogDetail:
    """Retrieve full blog post markdown article and brand styling tokens using brand ID and slug."""
    blog = db.query(Blog).filter(Blog.brand_id == brand_id, Blog.slug == slug).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog article with slug '{slug}' not found for brand ID {brand_id}.",
        )

    brand = blog.brand
    return BlogDetail(
        id=blog.id,
        brand_id=blog.brand_id,
        topic=blog.topic,
        slug=blog.slug,
        content_markdown=blog.content_markdown,
        word_count=blog.word_count,
        created_at=blog.created_at,
        company_name=brand.company_name if brand else "CareForge",
        logo_url=brand.logo_url if brand else "",
        brand_color=brand.brand_color if brand else "#0066CC",
    )


@router.delete(
    "/{brand_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a brand workspace and cascade delete all its blog posts",
)
async def delete_brand(
    brand_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete a brand workspace.

    The database foreign key automatically cascades and deletes all associated blogs.
    """
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Brand workspace with ID {brand_id} not found.",
        )

    db.delete(brand)
    db.commit()
    logger.info("Successfully deleted brand %d and cascaded blog deletions.", brand_id)
