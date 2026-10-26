import React from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { isValidTopic } from '../../utils/validators'
import { blogTopicsStyles } from './BlogTopicsCard.styles'

interface BlogTopicsCardProps {
  topics: string[]
  setTopics: React.Dispatch<React.SetStateAction<string[]>>
  errors: Record<string, string>
  clearError: (field: string) => void
  onTopicLimitReached: () => void
}

const MAX_TOPICS_COUNT = 10

export const BlogTopicsCard: React.FC<BlogTopicsCardProps> = ({
  topics,
  setTopics,
  errors,
  clearError,
  onTopicLimitReached,
}) => {
  const bStrings = UI_STRINGS.generator.blogTopics

  const handleTopicChange = (index: number, value: string) => {
    const updated = [...topics]
    updated[index] = value
    setTopics(updated)

    if (isValidTopic(value)) {
      clearError(`topic_${index}`)
    }
  }

  const handleAddTopic = () => {
    if (topics.length >= MAX_TOPICS_COUNT) {
      onTopicLimitReached()
      return
    }
    setTopics([...topics, ''])
  }

  const handleRemoveTopic = (index: number) => {
    if (topics.length <= 1) return
    const updated = topics.filter((_, idx) => idx !== index)
    setTopics(updated)
    clearError(`topic_${index}`)
  }

  const isLimitReached = topics.length >= MAX_TOPICS_COUNT

  return (
    <div style={blogTopicsStyles.card}>
      <div style={blogTopicsStyles.topicsHeaderRow}>
        <div>
          <h2 style={blogTopicsStyles.cardTitle}>
            {bStrings.title}
            <span style={blogTopicsStyles.requiredAsterisk}>*</span>
          </h2>
          <p style={blogTopicsStyles.cardSubtitle}>{bStrings.subtitle}</p>
        </div>
        <div style={blogTopicsStyles.topicCounterBadge}>
          {bStrings.counterLabel} {topics.length} / {MAX_TOPICS_COUNT}
        </div>
      </div>

      {topics.map((topic, index) => {
        const fieldKey = `topic_${index}`
        const error = errors[fieldKey]

        const inputStyle: React.CSSProperties = {
          ...blogTopicsStyles.input,
          ...(error ? blogTopicsStyles.inputError : {}),
        }

        return (
          <div key={index} style={blogTopicsStyles.topicItemWrapper}>
            <div style={blogTopicsStyles.topicRow}>
              <div style={blogTopicsStyles.topicPrefix}>
                <div style={blogTopicsStyles.topicNumberBadge}>{index + 1}</div>
                <span style={blogTopicsStyles.topicRowAsterisk}>*</span>
              </div>
              <input
                type="text"
                placeholder={`${bStrings.topicPlaceholder} *`}
                value={topic}
                onChange={(e) => handleTopicChange(index, e.target.value)}
                style={inputStyle}
              />
              {topics.length > 1 && (
                <button
                  type="button"
                  title="Remove topic"
                  style={blogTopicsStyles.deleteButton}
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
              <div style={blogTopicsStyles.errorMessage}>
                <ErrorOutlineIcon sx={{ fontSize: 14 }} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )
      })}

      {isLimitReached ? (
        <div style={blogTopicsStyles.addTopicDisabled}>
          <LockOutlinedIcon sx={{ fontSize: 16 }} />
          <span>{bStrings.limitReached}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAddTopic}
          style={blogTopicsStyles.addTopicButton}
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
    </div>
  )
}
