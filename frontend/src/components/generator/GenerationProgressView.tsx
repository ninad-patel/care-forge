import React, { useEffect, useState } from 'react'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SyncIcon from '@mui/icons-material/Sync'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { progressViewStyles } from './GenerationProgressView.styles'

interface GenerationProgressViewProps {
  topics: string[]
  onOpenCancelModal: (currentDone: number) => void
}

export const GenerationProgressView: React.FC<GenerationProgressViewProps> = ({
  topics,
  onOpenCancelModal,
}) => {
  const strings = UI_STRINGS.generator.progressScreen
  const [completedIndex, setCompletedIndex] = useState<number>(0)
  const [currentWordCount, setCurrentWordCount] = useState<number>(320)

  useEffect(() => {
    const topicTimer = setInterval(() => {
      setCompletedIndex((prev) => {
        if (prev < topics.length - 1) {
          return prev + 1
        }
        return prev
      })
      setCurrentWordCount((prev) => (prev < 900 ? prev + 180 : 340))
    }, 1800)

    const wordTimer = setInterval(() => {
      setCurrentWordCount((prev) => (prev < 980 ? prev + 45 : prev))
    }, 400)

    return () => {
      clearInterval(topicTimer)
      clearInterval(wordTimer)
    }
  }, [topics.length])

  const progressPercentage = Math.round(
    ((completedIndex) / topics.length) * 100
  )

  const dynamicBarFillStyle: React.CSSProperties = {
    ...progressViewStyles.progressBarFill,
    width: `${progressPercentage}%`,
  }

  return (
    <div style={progressViewStyles.container}>
      <div style={progressViewStyles.card}>
        <div style={progressViewStyles.headerIconRow}>
          <div style={progressViewStyles.headerIconCircle}>
            <AutoAwesomeIcon sx={{ fontSize: 24 }} />
          </div>
        </div>

        <h2 style={progressViewStyles.title}>
          {strings.titlePrefix} {topics.length} {strings.titleSuffix}
        </h2>

        <p style={progressViewStyles.subtitle}>
          {strings.subtitle}
        </p>

        <div style={progressViewStyles.progressHeader}>
          <span style={progressViewStyles.progressLabel}>
            {strings.overallProgress}
          </span>
          <span style={progressViewStyles.progressCount}>
            {completedIndex} of {topics.length} {strings.doneSuffix}
          </span>
        </div>

        <div style={progressViewStyles.progressBarTrack}>
          <div style={dynamicBarFillStyle} />
        </div>

        <div style={progressViewStyles.topicsList}>
          {topics.map((topic, index) => {
            const isDone = index < completedIndex
            const isWriting = index === completedIndex

            if (isWriting) {
              return (
                <div key={index} style={progressViewStyles.topicRowWriting}>
                  <div style={progressViewStyles.topicLeftCol}>
                    <SyncIcon
                      sx={{
                        fontSize: 20,
                        color: palette.primary,
                        animation: 'spin 1.5s linear infinite',
                      }}
                    />
                    <span style={progressViewStyles.topicTitleWriting}>
                      {topic}
                    </span>
                  </div>

                  <span style={progressViewStyles.writingStatus}>
                    {strings.writingPrefix} {currentWordCount} {strings.wordsSuffix}
                  </span>
                </div>
              )
            }

            return (
              <div key={index} style={progressViewStyles.topicRow}>
                <div style={progressViewStyles.topicLeftCol}>
                  {isDone ? (
                    <CheckCircleIcon sx={{ fontSize: 20, color: palette.success }} />
                  ) : (
                    <AccessTimeIcon sx={{ fontSize: 20, color: palette.textMuted }} />
                  )}
                  <span
                    style={
                      isDone
                        ? progressViewStyles.topicTitleDone
                        : progressViewStyles.topicTitleQueued
                    }
                  >
                    {topic}
                  </span>
                </div>

                <span
                  style={
                    isDone
                      ? progressViewStyles.statusBadgeDone
                      : progressViewStyles.statusBadgeQueued
                  }
                >
                  {isDone ? strings.doneBadge : strings.queuedBadge}
                </span>
              </div>
            )
          })}
        </div>

        <div style={progressViewStyles.cancelButtonWrapper}>
          <button
            type="button"
            onClick={() => onOpenCancelModal(completedIndex)}
            style={progressViewStyles.cancelButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = palette.surface
            }}
          >
            {strings.cancelButton}
          </button>
        </div>
      </div>
    </div>
  )
}
