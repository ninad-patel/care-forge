import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { resultViewStyles } from './GenerationResultView.styles'

export interface ResultTopicItem {
  index: number
  topic: string
  slug: string
  status: 'live' | 'failed'
  blogId?: number | string
  errorMessage?: string
}

interface GenerationResultViewProps {
  brandId: number | string
  companyName: string
  brandColor: string
  subdomain: string
  items: ResultTopicItem[]
  isRetrying?: boolean
  onRetryFailed: (failedTopics: string[]) => void
  onEditTopics: () => void
  onShowToast: (toast: {
    type: 'success' | 'warning' | 'info'
    title: string
    message: string
  }) => void
}

export const GenerationResultView: React.FC<GenerationResultViewProps> = ({
  brandId,
  subdomain,
  items,
  isRetrying = false,
  onRetryFailed,
  onEditTopics,
  onShowToast,
}) => {
  const strings = UI_STRINGS.generator.resultScreen

  const liveItems = items.filter((item) => item.status === 'live')
  const failedItems = items.filter((item) => item.status === 'failed')
  const isFullSuccess = failedItems.length === 0

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const hubUrl = `${origin}/company/${brandId}`

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      onShowToast({
        type: 'success',
        title: strings.copySuccessToastTitle,
        message: `${url} ${strings.copySuccessToastSuffix}`,
      })
    } catch {
      onShowToast({
        type: 'info',
        title: strings.copySuccessToastTitle,
        message: url,
      })
    }
  }

  const handleRetryClick = () => {
    const topicsToRetry = failedItems.map((f) => f.topic)
    onRetryFailed(topicsToRetry)
  }

  return (
    <div style={resultViewStyles.container}>
      {/* Top Banner: Success or Partial Failure */}
      {isFullSuccess ? (
        <div style={resultViewStyles.successBanner}>
          <div style={resultViewStyles.bannerLeft}>
            <div style={resultViewStyles.successIconCircle}>
              <CheckCircleIcon sx={{ fontSize: 28, color: palette.surface }} />
            </div>

            <div style={resultViewStyles.bannerTitles}>
              <h2 style={resultViewStyles.bannerHeading}>
                {strings.successTitlePrefix} {items.length}{' '}
                {strings.successTitleSuffix}
              </h2>

              <div style={resultViewStyles.subdomainPill}>
                <span>{subdomain}</span>
                <button
                  type="button"
                  title="Copy link"
                  onClick={() => handleCopyLink(hubUrl)}
                  style={resultViewStyles.subdomainCopyButton}
                >
                  <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          </div>

          <div style={resultViewStyles.bannerActions}>
            <a
              href={`/company/${brandId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={resultViewStyles.primaryPillButton}
            >
              {strings.viewBlogHub}
            </a>
          </div>
        </div>
      ) : (
        <div style={resultViewStyles.warningBanner}>
          <div style={resultViewStyles.bannerLeft}>
            <div style={resultViewStyles.warningIconCircle}>
              <WarningAmberOutlinedIcon sx={{ fontSize: 28, color: palette.surface }} />
            </div>

            <div style={resultViewStyles.bannerTitles}>
              <h2 style={resultViewStyles.bannerHeading}>
                {liveItems.length} {strings.failureTitlePrefix} {items.length}{' '}
                {strings.failureTitleSuffix}
              </h2>

              <p style={resultViewStyles.bannerSubtitle}>
                {strings.failureSubtitlePrefix} {failedItems.length}{' '}
                {strings.failureSubtitleMiddle}
              </p>
            </div>
          </div>

          <div style={resultViewStyles.bannerActions}>
            <button
              type="button"
              disabled={isRetrying}
              onClick={handleRetryClick}
              style={resultViewStyles.primaryPillButton}
            >
              {isRetrying
                ? strings.retryingButton
                : `${strings.retryButtonPrefix} ${failedItems.length} ${strings.retryButtonSuffix}`}
            </button>

            <a
              href={`/company/${brandId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={resultViewStyles.secondaryPillButton}
            >
              {strings.viewBlogHub}
            </a>
          </div>
        </div>
      )}

      {/* Header Row: Count & Edit Link */}
      <div style={resultViewStyles.sectionHeaderRow}>
        <div style={resultViewStyles.sectionTitle}>
          {isFullSuccess ? (
            <span>
              {strings.yourPagesPrefix} ({items.length})
            </span>
          ) : (
            <span>
              {strings.yourPagesPrefix} ({liveItems.length} {strings.liveSuffix} ·{' '}
              {failedItems.length} {strings.needAttentionSuffix})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onEditTopics}
          style={resultViewStyles.editTopicsLink}
        >
          {strings.editTopics}
        </button>
      </div>

      {/* 10 Live/Failed Topic Cards */}
      <div style={resultViewStyles.cardsList}>
        {items.map((item, index) => {
          const isLive = item.status === 'live'
          const pageUrl = `${subdomain}/${item.slug}`
          const realArticleUrl = `${origin}/company/${brandId}/${item.slug}`

          return (
            <div key={index} style={resultViewStyles.articleCard}>
              <div style={resultViewStyles.cardLeft}>
                <div style={resultViewStyles.numberBadge}>{index + 1}</div>

                <div style={resultViewStyles.cardTextCol}>
                  <div style={resultViewStyles.cardTopicTitle} title={item.topic}>
                    {item.topic}
                  </div>

                  {isLive ? (
                    <div style={resultViewStyles.cardUrl}>{pageUrl}</div>
                  ) : (
                    <div style={resultViewStyles.cardFailedError}>
                      {item.errorMessage || strings.failedReason}
                    </div>
                  )}
                </div>
              </div>

              <div style={resultViewStyles.cardRight}>
                {isLive ? (
                  <>
                    <div style={resultViewStyles.liveBadge}>
                      <span style={resultViewStyles.liveDot} />
                      <span>{strings.liveBadge}</span>
                    </div>

                    <button
                      type="button"
                      title="Copy link"
                      onClick={() => handleCopyLink(realArticleUrl)}
                      style={resultViewStyles.iconButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = palette.ink
                        e.currentTarget.style.borderColor = palette.borderInput
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = palette.textSubtle
                        e.currentTarget.style.borderColor = palette.borderSubtle
                      }}
                    >
                      <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
                    </button>

                    <a
                      href={`/company/${brandId}/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open page"
                      style={resultViewStyles.iconButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = palette.ink
                        e.currentTarget.style.borderColor = palette.borderInput
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = palette.textSubtle
                        e.currentTarget.style.borderColor = palette.borderSubtle
                      }}
                    >
                      <OpenInNewIcon sx={{ fontSize: 18 }} />
                    </a>
                  </>
                ) : (
                  <div style={resultViewStyles.failedBadge}>
                    <span style={resultViewStyles.failedDot} />
                    <span>{strings.failedBadge}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
