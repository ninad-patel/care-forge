import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import { palette } from '../constants/palette'
import { UI_STRINGS } from '../constants/strings'
import { api } from '../services/api'
import type { BlogDetail, BrandDetail } from '../types'
import { getContrastTextColor, hexToRgba } from '../utils/contrast'
import {
  calculateReadingTime,
  calculateWordCount,
  getCompanyInitial,
} from '../utils/formatters'
import { blogPostStyles } from './BlogPostPage.styles'

export const BlogPostPage: React.FC = () => {
  const { brandId, slug } = useParams<{ brandId: string; slug: string }>()
  const [blog, setBlog] = useState<BlogDetail | null>(null)
  const [brand, setBrand] = useState<BrandDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  const strings = UI_STRINGS.blogPost

  useEffect(() => {
    let isMounted = true
    if (!brandId || !slug) return

    Promise.all([
      api.getBlogBySlug(brandId, slug),
      api.getBrandById(brandId),
    ])
      .then(([blogData, brandData]) => {
        if (isMounted) {
          setBlog(blogData)
          setBrand(brandData)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : strings.notFoundSubtitle
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [brandId, slug, strings.notFoundSubtitle])

  if (isLoading) {
    return (
      <div style={blogPostStyles.stateContainer}>
        <CircularProgress sx={{ color: palette.primary }} />
        <p style={blogPostStyles.stateSubtitle}>{strings.loading}</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div style={blogPostStyles.stateContainer}>
        <h2 style={blogPostStyles.stateTitle}>{strings.notFoundTitle}</h2>
        <p style={blogPostStyles.stateSubtitle}>
          {error || strings.notFoundSubtitle}
        </p>
        <Link to={brandId ? `/company/${brandId}` : '/'} style={blogPostStyles.backButton}>
          {strings.backToHub}
        </Link>
      </div>
    )
  }

  const brandColor = blog.brand_color || palette.primary
  const brandTint = hexToRgba(brandColor, 0.08)
  const footerTextColor = getContrastTextColor(brandColor)
  const companyName = blog.company_name || 'CareForge'
  const initial = getCompanyInitial(companyName)

  const wordCount = blog.word_count || calculateWordCount(blog.content_markdown || '')
  const readingTime = calculateReadingTime(wordCount)
  const category = blog.topic.split(/[:–-]/)[0].trim()

  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently published'

  const otherBlogs = (brand?.blogs || []).filter((b) => b.slug !== slug).slice(0, 3)

  const rootStyle: React.CSSProperties = {
    ...blogPostStyles.pageWrapper,
    ['--brand-color' as string]: brandColor,
    ['--brand-tint' as string]: brandTint,
  }

  const footerStyle: React.CSSProperties = {
    ...blogPostStyles.footer,
    color: footerTextColor,
  }

  return (
    <div style={rootStyle}>
      {/* Header — Logo + Company Name linking to Hub */}
      <header style={blogPostStyles.nav}>
        <Link to={`/company/${blog.brand_id}`} style={blogPostStyles.navBrand}>
          {blog.logo_url && !imgError ? (
            <img
              src={blog.logo_url}
              alt={`${companyName} logo`}
              style={blogPostStyles.brandLogoImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={blogPostStyles.brandAvatarFallback}>
              {initial}
            </div>
          )}
          <span style={blogPostStyles.brandTitle}>{companyName}</span>
        </Link>
      </header>

      {/* Main Article Container */}
      <article style={blogPostStyles.articleWrapper}>
        {/* Breadcrumb Navigation */}
        <nav style={blogPostStyles.breadcrumbs}>
          <Link to={`/company/${blog.brand_id}`} style={blogPostStyles.breadcrumbLink}>
            {strings.blogBreadcrumb}
          </Link>
          <span>/</span>
          <span style={blogPostStyles.breadcrumbCurrent}>{category}</span>
        </nav>

        {/* Category Pill */}
        <div style={blogPostStyles.categoryBadge}>{category}</div>

        {/* Article Headline */}
        <h1 style={blogPostStyles.articleTitle}>{blog.topic}</h1>

        {/* Author & Meta Row */}
        <div style={blogPostStyles.authorMetaRow}>
          <div style={blogPostStyles.authorAvatar}>{initial}</div>
          <div style={blogPostStyles.authorMetaText}>
            <span>
              {companyName} {strings.editorialTeamSuffix}
            </span>
            <span>·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>
              {readingTime} {strings.minReadSuffix}
            </span>
            <span>·</span>
            <span>
              {wordCount} {strings.wordsSuffix}
            </span>
          </div>
        </div>

        {/* Featured Image Banner */}
        <div style={blogPostStyles.featuredImageBanner}>
          <ImageOutlinedIcon sx={{ fontSize: 64, color: brandColor, opacity: 0.55 }} />
        </div>

        {/* Structured 1,000-Word Markdown Article */}
        <div style={blogPostStyles.markdownContainer}>
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 style={blogPostStyles.markdownH2}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={blogPostStyles.markdownH3}>{children}</h3>
              ),
              p: ({ children }) => (
                <p style={blogPostStyles.markdownP}>{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote style={blogPostStyles.markdownBlockquote}>
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul style={blogPostStyles.markdownUl}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={blogPostStyles.markdownOl}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={blogPostStyles.markdownLi}>{children}</li>
              ),
            }}
          >
            {blog.content_markdown}
          </ReactMarkdown>

          {/* Key Takeaways Card */}
          <div style={blogPostStyles.takeawaysCard}>
            <div style={blogPostStyles.takeawaysTitle}>
              {strings.keyTakeawaysTitle}
            </div>
            <div style={blogPostStyles.takeawayItem}>
              <CheckCircleIcon sx={{ fontSize: 18, color: brandColor }} />
              <span>Understand your clinical options and personalize your care journey.</span>
            </div>
            <div style={blogPostStyles.takeawayItem}>
              <CheckCircleIcon sx={{ fontSize: 18, color: brandColor }} />
              <span>Prepare all documentation and questions prior to your clinical visit.</span>
            </div>
            <div style={blogPostStyles.takeawayItem}>
              <CheckCircleIcon sx={{ fontSize: 18, color: brandColor }} />
              <span>Prioritize emotional, physical, and holistic well-being throughout recovery.</span>
            </div>
          </div>
        </div>
      </article>

      {/* "More from the blog" Section */}
      {otherBlogs.length > 0 && (
        <section style={blogPostStyles.moreSectionWrapper}>
          <h2 style={blogPostStyles.moreSectionHeading}>
            {strings.moreFromBlog}
          </h2>

          <div style={blogPostStyles.moreGrid}>
            {otherBlogs.map((other) => {
              const otherTime = calculateReadingTime(other.word_count || 1000)
              const otherCategory = other.topic.split(/[:–-]/)[0].trim()

              return (
                <Link
                  key={other.id}
                  to={`/company/${blog.brand_id}/${other.slug}`}
                  style={blogPostStyles.moreCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow =
                      '0 6px 16px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow =
                      '0 1px 4px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={blogPostStyles.moreCardImageArea}>
                    <ImageOutlinedIcon
                      sx={{ fontSize: 36, color: brandColor, opacity: 0.5 }}
                    />
                  </div>

                  <div style={blogPostStyles.moreCardBody}>
                    <div style={blogPostStyles.moreCategoryBadge}>
                      {otherCategory}
                    </div>

                    <h3 style={blogPostStyles.moreCardTitle}>{other.topic}</h3>

                    <div style={blogPostStyles.moreCardMetaRow}>
                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                      <span>
                        {otherTime} {strings.minReadSuffix}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={blogPostStyles.footerContainer}>
          <div style={blogPostStyles.footerBrandRow}>
            {blog.logo_url && !imgError ? (
              <img
                src={blog.logo_url}
                alt={`${companyName} logo`}
                style={blogPostStyles.footerLogoImg}
              />
            ) : (
              <div style={blogPostStyles.footerAvatarFallback}>{initial}</div>
            )}
            <span style={blogPostStyles.footerBrandTitle}>{companyName}</span>
          </div>

          <p style={blogPostStyles.footerTagline}>
            {UI_STRINGS.blogHub.footerTagline}
          </p>

          <div style={blogPostStyles.footerCopyright}>
            © {new Date().getFullYear()} {companyName} · {UI_STRINGS.blogHub.poweredBy}
          </div>
        </div>
      </footer>
    </div>
  )
}
