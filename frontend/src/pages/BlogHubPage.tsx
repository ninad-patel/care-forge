import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import { palette } from '../constants/palette'
import { UI_STRINGS } from '../constants/strings'
import { api } from '../services/api'
import type { BrandDetail } from '../types'
import { getContrastTextColor, hexToRgba } from '../utils/contrast'
import {
  calculateReadingTime,
  getCompanyInitial,
} from '../utils/formatters'
import { blogHubStyles } from './BlogHubPage.styles'

export const BlogHubPage: React.FC = () => {
  const { brandId } = useParams<{ brandId: string }>()
  const [brand, setBrand] = useState<BrandDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  const strings = UI_STRINGS.blogHub

  useEffect(() => {
    let isMounted = true
    if (!brandId) return

    api
      .getBrandById(brandId)
      .then((data) => {
        if (isMounted) {
          setBrand(data)
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
  }, [brandId, strings.notFoundSubtitle])

  if (isLoading) {
    return (
      <div style={blogHubStyles.stateContainer}>
        <CircularProgress sx={{ color: palette.primary }} />
        <p style={blogHubStyles.stateSubtitle}>{strings.loading}</p>
      </div>
    )
  }

  if (error || !brand) {
    return (
      <div style={blogHubStyles.stateContainer}>
        <h2 style={blogHubStyles.stateTitle}>{strings.notFoundTitle}</h2>
        <p style={blogHubStyles.stateSubtitle}>
          {error || strings.notFoundSubtitle}
        </p>
        <Link to="/" style={blogHubStyles.backButton}>
          {strings.backToDashboard}
        </Link>
      </div>
    )
  }

  const brandColor = brand.brand_color || palette.primary
  const brandTint = hexToRgba(brandColor, 0.08)
  const heroTextColor = getContrastTextColor(brandColor)
  const companyName = brand.company_name || brand.name || 'CareForge'
  const initial = getCompanyInitial(companyName)

  const blogs = brand.blogs || []
  const featuredBlog = blogs[0]
  const gridBlogs = blogs.slice(1)

  const heroStyle: React.CSSProperties = {
    ...blogHubStyles.heroSection,
    color: heroTextColor,
  }

  const footerStyle: React.CSSProperties = {
    ...blogHubStyles.footer,
    color: heroTextColor,
  }

  const rootStyle: React.CSSProperties = {
    ...blogHubStyles.pageWrapper,
    ['--brand-color' as string]: brandColor,
    ['--brand-tint' as string]: brandTint,
  }

  return (
    <div style={rootStyle}>
      {/* Top Header — Logo + Company Name only */}
      <header style={blogHubStyles.nav}>
        <Link to={`/company/${brand.id}`} style={blogHubStyles.navBrand}>
          {brand.logo_url && !imgError ? (
            <img
              src={brand.logo_url}
              alt={`${companyName} logo`}
              style={blogHubStyles.brandLogoImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={blogHubStyles.brandAvatarFallback}>
              {initial}
            </div>
          )}
          <span style={blogHubStyles.brandTitle}>{companyName}</span>
        </Link>
      </header>

      {/* Hero Section */}
      <section style={heroStyle}>
        <div style={blogHubStyles.heroContainer}>
          <h1 style={blogHubStyles.heroTitle}>
            {companyName} {strings.blogSuffix}
          </h1>
          <p style={blogHubStyles.heroSubtitle}>{strings.defaultSubtitle}</p>
        </div>
      </section>

      {/* Main Content: 1 Featured + 9 Grid Articles */}
      <main style={blogHubStyles.mainContent}>
        {featuredBlog && (
          <Link
            to={`/company/${brand.id}/${featuredBlog.slug}`}
            style={blogHubStyles.featuredCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.07)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={blogHubStyles.featuredImageCol}>
              <ImageOutlinedIcon sx={{ fontSize: 52, color: brandColor, opacity: 0.6 }} />
            </div>

            <div style={blogHubStyles.featuredContentCol}>
              <div style={blogHubStyles.featuredCategoryBadge}>
                {strings.featuredPrefix} {featuredBlog.topic.split(/[:–-]/)[0].trim()}
              </div>

              <h2 style={blogHubStyles.featuredTitle}>{featuredBlog.topic}</h2>

              <p style={blogHubStyles.featuredExcerpt}>
                Evidence-based patient guidance on {featuredBlog.topic.toLowerCase()} with clear takeaways from our clinical team.
              </p>

              <span style={blogHubStyles.featuredReadLink}>
                <span>{strings.readArticle}</span>
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </span>
            </div>
          </Link>
        )}

        {/* 9 Remaining Blogs Grid */}
        {gridBlogs.length > 0 && (
          <div style={blogHubStyles.articlesGrid}>
            {gridBlogs.map((blog) => {
              const readingTime = calculateReadingTime(blog.word_count || 1000)
              const category = blog.topic.split(/[:–-]/)[0].trim()

              return (
                <Link
                  key={blog.id}
                  to={`/company/${brand.id}/${blog.slug}`}
                  style={blogHubStyles.gridCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <div style={blogHubStyles.gridCardImageArea}>
                    <ImageOutlinedIcon
                      sx={{ fontSize: 40, color: brandColor, opacity: 0.5 }}
                    />
                  </div>

                  <div style={blogHubStyles.gridCardBody}>
                    <div style={blogHubStyles.gridCategoryBadge}>{category}</div>

                    <h3 style={blogHubStyles.gridTitle}>{blog.topic}</h3>

                    <p style={blogHubStyles.gridExcerpt}>
                      Practical health guidance on {blog.topic.toLowerCase()}.
                    </p>

                    <div style={blogHubStyles.gridMetaRow}>
                      <AccessTimeIcon sx={{ fontSize: 14 }} />
                      <span>
                        {readingTime} {strings.minReadSuffix}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={footerStyle}>
        <div style={blogHubStyles.footerContainer}>
          <div style={blogHubStyles.footerBrandRow}>
            {brand.logo_url && !imgError ? (
              <img
                src={brand.logo_url}
                alt={`${companyName} logo`}
                style={blogHubStyles.footerLogoImg}
              />
            ) : (
              <div style={blogHubStyles.footerAvatarFallback}>{initial}</div>
            )}
            <span style={blogHubStyles.footerBrandTitle}>{companyName}</span>
          </div>

          <p style={blogHubStyles.footerTagline}>{strings.footerTagline}</p>

          <div style={blogHubStyles.footerCopyright}>
            © {new Date().getFullYear()} {companyName} · {strings.poweredBy}
          </div>
        </div>
      </footer>
    </div>
  )
}
