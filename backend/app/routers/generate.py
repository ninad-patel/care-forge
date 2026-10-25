"""Batch blog generation router for CareForge.

Coordinates Pydantic input validation, brand workspace creation,
and parallel AI generation via asyncio.gather.
Respects backend-async-fastapi standards.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.constants import ROUTE_GENERATE
from app.database import get_db
from app.models import Blog, Brand
from app.schemas import BlogSummary, GenerateRequest, GenerateResponse
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    ROUTE_GENERATE,
    response_model=GenerateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate concurrent blogs for a company brand workspace",
)
async def generate_blogs(
    request: GenerateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> GenerateResponse:
    """Accept company details and up to 10 topics, create a brand workspace,

    generate all ~1,000-word articles in parallel via asyncio.gather,
    and persist records to the database.
    """
    logger.info(
        "Received blog generation request for '%s' with %d topics.",
        request.company_name,
        len(request.topics),
    )

    # 1. Create and persist the Brand workspace
    brand = Brand(
        company_name=request.company_name,
        logo_url=request.logo_url,
        brand_color=request.brand_color,
    )
    db.add(brand)
    db.commit()
    db.refresh(brand)

    # 2. Concurrently generate all blog articles via asyncio.gather
    generated_data = await llm_service.generate_blogs_parallel(
        topics=request.topics,
        company_name=brand.company_name,
    )

    # 3. Persist all generated blog records linked to the new brand
    blog_records: list[Blog] = []
    for item in generated_data:
        blog = Blog(
            brand_id=brand.id,
            topic=item["topic"],
            slug=item["slug"],
            content_markdown=item["content_markdown"],
            word_count=item["word_count"],
        )
        blog_records.append(blog)

    db.add_all(blog_records)
    db.commit()

    for blog in blog_records:
        db.refresh(blog)

    logger.info(
        "Successfully saved brand %d ('%s') and %d blogs to database.",
        brand.id,
        brand.company_name,
        len(blog_records),
    )

    return GenerateResponse(
        brand_id=brand.id,
        company_name=brand.company_name,
        brand_color=brand.brand_color,
        blogs=[BlogSummary.model_validate(b) for b in blog_records],
    )
