import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { generatorStyles } from './Generator.styles'

interface StepperProps {
  isBrandValid: boolean
  isTopicsValid: boolean
}

export const Stepper: React.FC<StepperProps> = ({
  isBrandValid,
  isTopicsValid,
}) => {
  return (
    <div style={generatorStyles.stepperRow}>
      <div style={generatorStyles.stepItem}>
        {isBrandValid ? (
          <CheckCircleIcon sx={{ fontSize: 24, color: palette.success }} />
        ) : (
          <div
            style={{
              ...generatorStyles.stepCircle,
              backgroundColor: palette.primary,
              color: palette.surface,
            }}
          >
            1
          </div>
        )}
        <span
          style={{
            color: isBrandValid ? palette.success : palette.ink,
            fontWeight: 600,
          }}
        >
          {UI_STRINGS.generator.steps.brandDetails}
        </span>
      </div>

      <div style={generatorStyles.stepDivider} />

      <div style={generatorStyles.stepItem}>
        {isTopicsValid ? (
          <CheckCircleIcon sx={{ fontSize: 24, color: palette.success }} />
        ) : (
          <div
            style={{
              ...generatorStyles.stepCircle,
              backgroundColor: isBrandValid
                ? palette.primary
                : palette.borderSubtle,
              color: isBrandValid ? palette.surface : palette.textSubtle,
            }}
          >
            2
          </div>
        )}
        <span
          style={{
            color: isTopicsValid
              ? palette.success
              : isBrandValid
                ? palette.ink
                : palette.textSubtle,
            fontWeight: 500,
          }}
        >
          {UI_STRINGS.generator.steps.blogTopics}
        </span>
      </div>

      <div style={generatorStyles.stepDivider} />

      <div style={generatorStyles.stepItem}>
        <div
          style={{
            ...generatorStyles.stepCircle,
            backgroundColor:
              isBrandValid && isTopicsValid
                ? palette.primary
                : palette.borderSubtle,
            color:
              isBrandValid && isTopicsValid
                ? palette.surface
                : palette.textSubtle,
          }}
        >
          3
        </div>
        <span
          style={{
            color:
              isBrandValid && isTopicsValid
                ? palette.ink
                : palette.textSubtle,
            fontWeight: 500,
          }}
        >
          {UI_STRINGS.generator.steps.reviewGenerate}
        </span>
      </div>
    </div>
  )
}
