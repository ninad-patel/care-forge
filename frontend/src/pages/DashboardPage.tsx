import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import { CreateSiteCard } from '../components/dashboard/CreateSiteCard'
import { dashboardStyles } from '../components/dashboard/Dashboard.styles'
import { EmptyState } from '../components/dashboard/EmptyState'
import { SiteCard } from '../components/dashboard/SiteCard'
import { palette } from '../constants/palette'
import { UI_STRINGS } from '../constants/strings'
import { api } from '../services/api'
import type { BrandSummary } from '../types'

export const DashboardPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadBrands = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.getBrands()
      setBrands(data)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : UI_STRINGS.dashboard.fetchError
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    api
      .getBrands()
      .then((data) => {
        if (isMounted) {
          setBrands(data)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : UI_STRINGS.dashboard.fetchError
          )
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div style={dashboardStyles.pageWrapper}>
      <div style={dashboardStyles.container}>
        <div style={dashboardStyles.headerRow}>
          <div style={dashboardStyles.titleGroup}>
            <h1 style={dashboardStyles.pageTitle}>{UI_STRINGS.dashboard.title}</h1>
            <p style={dashboardStyles.pageSubtitle}>
              {UI_STRINGS.dashboard.subtitle}
            </p>
          </div>

          <Link
            to="/create"
            style={dashboardStyles.newSiteButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = palette.primaryHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = palette.primary
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
            <span>{UI_STRINGS.dashboard.newSite}</span>
          </Link>
        </div>

        {error && (
          <div style={dashboardStyles.errorBanner}>
            <div style={dashboardStyles.errorContent}>
              <ErrorOutlineIcon sx={{ fontSize: 20 }} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadBrands}
              style={dashboardStyles.retryButton}
            >
              <RefreshIcon sx={{ fontSize: 16 }} />
              {UI_STRINGS.common.retry}
            </button>
          </div>
        )}

        {isLoading ? (
          <div style={dashboardStyles.loadingGrid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={dashboardStyles.skeletonCard}>
                <div style={dashboardStyles.skeletonRow}>
                  <div style={dashboardStyles.skeletonAvatar} />
                  <div style={dashboardStyles.skeletonCol}>
                    <div style={dashboardStyles.skeletonTitle} />
                    <div style={dashboardStyles.skeletonSub} />
                  </div>
                </div>
                <div style={dashboardStyles.skeletonBadge} />
                <div style={dashboardStyles.skeletonButton} />
              </div>
            ))}
          </div>
        ) : brands.length === 0 && !error ? (
          <EmptyState />
        ) : (
          <div style={dashboardStyles.grid}>
            {brands.map((brand) => (
              <SiteCard key={brand.id} brand={brand} />
            ))}
            <CreateSiteCard />
          </div>
        )}
      </div>
    </div>
  )
}
