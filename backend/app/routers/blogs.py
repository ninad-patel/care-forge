"""Individual blog post router for CareForge.

Provides endpoints to retrieve full ~1,000-word markdown articles
along with dynamic brand styling tokens for frontend rendering.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.constants import ROUTE_BLOGS
from app.database import get_db
from app.models import Blog
from app.schemas import BlogDetail

logger = logging.getLogger(__name__)

router = APIRouter(prefix=ROUTE_BLOGS)


@router.get(
    "/{blog_id}",
    response_model=BlogDetail,
    summary="Retrieve an individual blog post with content and brand styling",
)
async def get_blog(
    blog_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> BlogDetail:
    """Retrieve full blog post markdown article and parent brand styling tokens.

    Enables dynamic color theming and logo header rendering on the frontend.
    """
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Blog article with ID {blog_id} not found.",
        )

    # Extract parent brand styling properties
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
