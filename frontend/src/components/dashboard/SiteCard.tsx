import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import type { BrandSummary } from '../../types'
import {
  formatRelativeTime,
  formatSubdomain,
  getCompanyInitial,
} from '../../utils/formatters'
import { dashboardStyles } from './Dashboard.styles'

interface SiteCardProps {
  brand: BrandSummary
}

export const SiteCard: React.FC<SiteCardProps> = ({ brand }) => {
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const initial = getCompanyInitial(brand.name)
  const subdomain = formatSubdomain(brand.slug || brand.name)
  const relativeTime = formatRelativeTime(brand.created_at)
  const pagesCount = brand.blogs_count ?? 10

  const cardStyle: React.CSSProperties = {
    ...dashboardStyles.card,
    ...(isHovered
      ? {
          borderColor: palette.borderInput,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transform: 'translateY(-2px)',
        }
      : {}),
  }

  const avatarStyle: React.CSSProperties = {
    ...dashboardStyles.avatar,
    backgroundColor: brand.brand_color || '#0e7c86',
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <div style={dashboardStyles.cardTopRow}>
          <div style={dashboardStyles.cardBrandInfo}>
            <div style={avatarStyle}>
              {brand.logo_url && !imgError ? (
                <img
                  src={brand.logo_url}
                  alt={`${brand.name} logo`}
                  style={dashboardStyles.avatarImg}
                  onError={() => setImgError(true)}
                />
              ) : (
                initial
              )}
            </div>
            <div style={dashboardStyles.nameAndSlug}>
              <div style={dashboardStyles.brandName}>{brand.name}</div>
              <div style={dashboardStyles.subdomain}>{subdomain}</div>
            </div>
          </div>
        </div>

        <div style={dashboardStyles.cardMiddleRow}>
          <div style={dashboardStyles.statusBadge}>
            <span style={dashboardStyles.statusDot} />
            <span>
              {pagesCount} {UI_STRINGS.dashboard.pagesLive}
            </span>
          </div>
          <span style={dashboardStyles.updatedAt}>{relativeTime}</span>
        </div>
      </div>

      <Link
        to={`/company/${brand.id}`}
        style={dashboardStyles.viewPagesButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f9fafb'
          e.currentTarget.style.borderColor = palette.borderInput
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = palette.surface
          e.currentTarget.style.borderColor = palette.borderSubtle
        }}
      >
        <span>{UI_STRINGS.dashboard.viewPages}</span>
        <ArrowForwardIcon sx={{ fontSize: 16, color: palette.textSubtle }} />
      </Link>
    </div>
  )
}
