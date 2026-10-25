import React from 'react'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { formatSubdomain, getCompanyInitial } from '../../utils/formatters'
import { reviewModalStyles } from './ReviewGenerateModal.styles'

interface ReviewGenerateModalProps {
  isOpen: boolean
  companyName: string
  logoUrl?: string
  brandColor: string
  topics: string[]
  onClose: () => void
  onConfirm: () => void
}

export const ReviewGenerateModal: React.FC<ReviewGenerateModalProps> = ({
  isOpen,
  companyName,
  logoUrl,
  brandColor,
  topics,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null

  const strings = UI_STRINGS.generator.reviewModal
  const initial = getCompanyInitial(companyName)
  const subdomain = formatSubdomain(companyName)

  const midpoint = Math.ceil(topics.length / 2)
  const leftColumnTopics = topics.slice(0, midpoint)
  const rightColumnTopics = topics.slice(midpoint)

  const brandAvatarStyle: React.CSSProperties = {
    ...reviewModalStyles.brandAvatarBase,
    backgroundColor: brandColor || palette.primary,
  }

  const colorPillDotStyle: React.CSSProperties = {
    ...reviewModalStyles.colorPillDotBase,
    backgroundColor: brandColor,
  }

  return (
    <div style={reviewModalStyles.overlay} onClick={onClose}>
      <div style={reviewModalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={reviewModalStyles.header}>
          <div>
            <h3 style={reviewModalStyles.title}>{strings.title}</h3>
            <p style={reviewModalStyles.subtitle}>{strings.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={reviewModalStyles.closeButton}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div style={reviewModalStyles.brandSummaryBox}>
          <div style={reviewModalStyles.brandLeft}>
            <div style={brandAvatarStyle}>
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  style={reviewModalStyles.brandLogoImg}
                />
              ) : (
                initial
              )}
            </div>

            <div style={reviewModalStyles.brandMeta}>
              <span style={reviewModalStyles.brandName}>{companyName}</span>
              <span style={reviewModalStyles.brandSubdomain}>{subdomain}</span>
            </div>
          </div>

          <div style={reviewModalStyles.colorPill}>
            <div style={colorPillDotStyle} />
            <span style={reviewModalStyles.colorPillText}>
              {brandColor.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={reviewModalStyles.topicsSection}>
          <div style={reviewModalStyles.topicsHeader}>
            <span style={reviewModalStyles.topicsTitle}>
              {topics.length} {strings.topicsArrow} {topics.length} {strings.pages}
            </span>
            <button
              type="button"
              onClick={onClose}
              style={reviewModalStyles.editLink}
            >
              {strings.edit}
            </button>
          </div>

          <div style={reviewModalStyles.topicsGrid}>
            <div style={reviewModalStyles.topicsColumn}>
              {leftColumnTopics.map((topic, idx) => (
                <div key={idx} style={reviewModalStyles.topicItem}>
                  <div style={reviewModalStyles.topicIndex}>
                    {idx + 1}
                  </div>
                  <span style={reviewModalStyles.topicText}>
                    {topic}
                  </span>
                </div>
              ))}
            </div>

            <div style={reviewModalStyles.topicsColumn}>
              {rightColumnTopics.map((topic, idx) => {
                const actualIndex = midpoint + idx
                return (
                  <div key={actualIndex} style={reviewModalStyles.topicItem}>
                    <div style={reviewModalStyles.topicIndex}>
                      {actualIndex + 1}
                    </div>
                    <span style={reviewModalStyles.topicText}>
                      {topic}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div style={reviewModalStyles.noticeBox}>
          <AutoAwesomeIcon sx={{ fontSize: 18, color: palette.primary, flexShrink: 0 }} />
          <span>{strings.bannerNotice}</span>
        </div>

        <div style={reviewModalStyles.actionsRow}>
          <button
            type="button"
            onClick={onClose}
            style={reviewModalStyles.backButton}
          >
            {strings.backToEdit}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={reviewModalStyles.generateButton}
          >
            {strings.generateActionPrefix} {topics.length} {strings.pages}
          </button>
        </div>
      </div>
    </div>
  )
}
