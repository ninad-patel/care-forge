"""SQLAlchemy declarative models for CareForge.

Defines tbl_brand and tbl_blog with relational foreign key integrity
and cascading deletes according to database-async-postgres standards.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""


class Brand(Base):
    """Brand model representing a company campaign/workspace.

    Table: tbl_brand
    """

    __tablename__ = "tbl_brand"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    logo_url: Mapped[str] = mapped_column(Text, nullable=False)
    brand_color: Mapped[str] = mapped_column(String(7), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # 1-to-Many relationship with tbl_blog
    # Cascade delete ensures deleting a brand purges all its associated blogs
    blogs: Mapped[list["Blog"]] = relationship(
        "Blog",
        back_populates="brand",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Brand(id={self.id}, company_name='{self.company_name}')>"


class Blog(Base):
    """Blog model representing an individual generated article.

    Table: tbl_blog
    """

    __tablename__ = "tbl_blog"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tbl_brand.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    topic: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    content_markdown: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Many-to-1 relationship with tbl_brand
    brand: Mapped["Brand"] = relationship("Brand", back_populates="blogs")

    def __repr__(self) -> str:
        return f"<Blog(id={self.id}, topic='{self.topic}', brand_id={self.brand_id})>"
