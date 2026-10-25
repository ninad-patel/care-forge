import React from 'react'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { stickyBarStyles } from './StickyActionBar.styles'

interface StickyActionBarProps {
  topicsCount: number
  isReady: boolean
  hasErrors: boolean
  errorCount: number
  onSaveDraft: () => void
  onGenerate: () => void
  isGenerating: boolean
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  topicsCount,
  isReady,
  hasErrors,
  errorCount,
  onSaveDraft,
  onGenerate,
  isGenerating,
}) => {
  const sStrings = UI_STRINGS.generator.statusBar
  const canGenerate = isReady && !hasErrors && !isGenerating

  return (
    <footer style={stickyBarStyles.stickyFooter}>
      <div style={stickyBarStyles.footerContainer}>
        <div style={stickyBarStyles.footerStatus}>
          {hasErrors ? (
            <div style={stickyBarStyles.errorStatus}>
              <ErrorOutlineIcon sx={{ fontSize: 18 }} />
              <span>
                {errorCount}{' '}
                {errorCount === 1
                  ? sStrings.singleIssuePrefix
                  : sStrings.issuesPrefix}
              </span>
            </div>
          ) : isReady ? (
            <div style={stickyBarStyles.readyStatus}>
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <span>
                {sStrings.brandReady} · {topicsCount} of 10 topics
              </span>
            </div>
          ) : (
            <div style={stickyBarStyles.incompleteStatus}>
              {topicsCount} {sStrings.incomplete}
            </div>
          )}
        </div>

        <div style={stickyBarStyles.footerActions}>
          <button
            type="button"
            style={stickyBarStyles.saveDraftButton}
            onClick={onSaveDraft}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = palette.borderInput
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = palette.surface
              e.currentTarget.style.borderColor = palette.borderSubtle
            }}
          >
            {UI_STRINGS.common.saveDraft}
          </button>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={onGenerate}
            style={
              canGenerate
                ? stickyBarStyles.generateButton
                : stickyBarStyles.generateButtonDisabled
            }
            onMouseEnter={(e) => {
              if (canGenerate) {
                e.currentTarget.style.backgroundColor = palette.primaryHover
              }
            }}
            onMouseLeave={(e) => {
              if (canGenerate) {
                e.currentTarget.style.backgroundColor = palette.primary
              }
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            <span>
              {isGenerating
                ? UI_STRINGS.common.generating
                : UI_STRINGS.common.reviewAndGenerate}
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}
