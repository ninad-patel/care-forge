import React from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { MAX_TOPICS_COUNT } from '../../utils/validators'
import { generatorStyles } from './Generator.styles'

interface BlogTopicsCardProps {
  topics: string[]
  setTopics: (topics: string[]) => void
  errors: Record<string, string>
  clearError: (field: string) => void
  onTopicLimitReached: () => void
}

export const BlogTopicsCard: React.FC<BlogTopicsCardProps> = ({
  topics,
  setTopics,
  errors,
  clearError,
  onTopicLimitReached,
}) => {
  const isLimitReached = topics.length >= MAX_TOPICS_COUNT
  const bStrings = UI_STRINGS.generator.blogTopics

  const handleTopicChange = (index: number, value: string) => {
    const updated = [...topics]
    updated[index] = value
    setTopics(updated)
    clearError(`topic_${index}`)
  }

  const handleAddTopic = () => {
    if (isLimitReached) {
      onTopicLimitReached()
      return
    }
    setTopics([...topics, ''])
  }

  const handleRemoveTopic = (index: number) => {
    if (topics.length <= 1) return
    const updated = topics.filter((_, i) => i !== index)
    setTopics(updated)
    clearError(`topic_${index}`)
  }

  return (
    <div style={generatorStyles.card}>
      <div style={generatorStyles.topicsHeaderRow}>
        <div>
          <h2 style={generatorStyles.cardTitle}>{bStrings.title}</h2>
          <p style={generatorStyles.cardSubtitle}>{bStrings.subtitle}</p>
        </div>
        <div style={generatorStyles.topicCountBadge}>
          {bStrings.counterLabel} {topics.length} / {MAX_TOPICS_COUNT}
        </div>
      </div>

      {topics.map((topic, index) => {
        const fieldKey = `topic_${index}`
        const error = errors[fieldKey]

        return (
          <div key={index} style={{ marginBottom: '16px' }}>
            <div style={generatorStyles.topicRow}>
              <div style={generatorStyles.topicNumberBadge}>{index + 1}</div>
              <input
                type="text"
                placeholder={bStrings.topicPlaceholder}
                value={topic}
                onChange={(e) => handleTopicChange(index, e.target.value)}
                style={{
                  ...generatorStyles.input,
                  ...(error ? generatorStyles.inputError : {}),
                }}
              />
              {topics.length > 1 && (
                <button
                  type="button"
                  title="Remove topic"
                  style={generatorStyles.deleteButton}
                  onClick={() => handleRemoveTopic(index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = palette.error
                    e.currentTarget.style.backgroundColor = palette.errorBg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = palette.textMuted
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                </button>
              )}
            </div>

            {error && (
              <div
                style={{
                  ...generatorStyles.errorMessage,
                  marginLeft: '40px',
                }}
              >
                <ErrorOutlineIcon sx={{ fontSize: 14 }} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
      })}

      {isLimitReached ? (
        <div
          style={{
            ...generatorStyles.addTopicButton,
            ...generatorStyles.addTopicDisabled,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 16 }} />
          <span>{bStrings.limitReached}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAddTopic}
          style={generatorStyles.addTopicButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = palette.primaryTint
            e.currentTarget.style.borderColor = palette.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = palette.surface
            e.currentTarget.style.borderColor = palette.borderInput
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          <span>{bStrings.addTopic}</span>
        </button>
      )}

      <div style={generatorStyles.tipBox}>
        <InfoOutlinedIcon sx={{ fontSize: 20, color: palette.primary, flexShrink: 0 }} />
        <span>{bStrings.tipText}</span>
      </div>
    </div>
  )
}
