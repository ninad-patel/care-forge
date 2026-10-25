import React from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { stepperStyles } from './Stepper.styles'

interface StepperProps {
  isBrandValid: boolean
  isTopicsValid: boolean
}

export const Stepper: React.FC<StepperProps> = ({
  isBrandValid,
  isTopicsValid,
}) => {
  return (
    <div style={stepperStyles.stepperRow}>
      {/* Step 1: Brand details */}
      <div style={stepperStyles.stepItem}>
        {isBrandValid ? (
          <CheckCircleIcon sx={{ fontSize: 24, color: palette.success }} />
        ) : (
          <div style={stepperStyles.stepCircleActive}>
            1
          </div>
        )}
        <span
          style={
            isBrandValid
              ? stepperStyles.stepLabelCompleted
              : stepperStyles.stepLabelActive
          }
        >
          {UI_STRINGS.generator.steps.brandDetails}
        </span>
      </div>

      <div style={stepperStyles.stepDivider} />

      {/* Step 2: Blog topics */}
      <div style={stepperStyles.stepItem}>
        {isTopicsValid ? (
          <CheckCircleIcon sx={{ fontSize: 24, color: palette.success }} />
        ) : (
          <div
            style={
              isBrandValid
                ? stepperStyles.stepCircleActive
                : stepperStyles.stepCircleInactive
            }
          >
            2
          </div>
        )}
        <span
          style={
            isTopicsValid
              ? stepperStyles.stepLabelCompleted
              : isBrandValid
                ? stepperStyles.stepLabelActive
                : stepperStyles.stepLabelInactive
          }
        >
          {UI_STRINGS.generator.steps.blogTopics}
        </span>
      </div>

      <div style={stepperStyles.stepDivider} />

      {/* Step 3: Review & generate */}
      <div style={stepperStyles.stepItem}>
        <div
          style={
            isBrandValid && isTopicsValid
              ? stepperStyles.stepCircleActive
              : stepperStyles.stepCircleInactive
          }
        >
          3
        </div>
        <span
          style={
            isBrandValid && isTopicsValid
              ? stepperStyles.stepLabelActive
              : stepperStyles.stepLabelInactive
          }
        >
          {UI_STRINGS.generator.steps.reviewGenerate}
        </span>
      </div>
    </div>
  )
}
