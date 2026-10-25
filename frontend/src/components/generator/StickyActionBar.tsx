import React from 'react'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { generatorStyles } from './Generator.styles'

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

  return (
    <footer style={generatorStyles.stickyFooter}>
      <div style={generatorStyles.footerContainer}>
        <div style={generatorStyles.footerStatus}>
          {hasErrors ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: palette.error,
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 18 }} />
              <span>
                {errorCount}{' '}
                {errorCount === 1
                  ? sStrings.singleIssuePrefix
                  : sStrings.issuesPrefix}
              </span>
            </div>
          ) : isReady ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: palette.success,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <span>
                {sStrings.brandReady} · {topicsCount} of 10 topics
              </span>
            </div>
          ) : (
            <div style={{ color: palette.textSubtle }}>
              {topicsCount} {sStrings.incomplete}
            </div>
          )}
        </div>

        <div style={generatorStyles.footerActions}>
          <button
            type="button"
            style={generatorStyles.saveDraftButton}
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
            disabled={!isReady || hasErrors || isGenerating}
            onClick={onGenerate}
            style={{
              ...generatorStyles.generateButton,
              ...(!isReady || hasErrors || isGenerating
                ? generatorStyles.generateButtonDisabled
                : {}),
            }}
            onMouseEnter={(e) => {
              if (isReady && !hasErrors && !isGenerating) {
                e.currentTarget.style.backgroundColor = palette.primaryHover
              }
            }}
            onMouseLeave={(e) => {
              if (isReady && !hasErrors && !isGenerating) {
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
