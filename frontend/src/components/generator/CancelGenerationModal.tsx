import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { UI_STRINGS } from '../../constants/strings'
import { cancelModalStyles } from './CancelGenerationModal.styles'

interface CancelGenerationModalProps {
  isOpen: boolean
  completedCount: number
  totalCount: number
  onClose: () => void
  onConfirmCancel: () => void
}

export const CancelGenerationModal: React.FC<CancelGenerationModalProps> = ({
  isOpen,
  completedCount,
  totalCount,
  onClose,
  onConfirmCancel,
}) => {
  if (!isOpen) return null

  const strings = UI_STRINGS.generator.cancelModal
  const remainingCount = Math.max(0, totalCount - completedCount)

  return (
    <div style={cancelModalStyles.overlay} onClick={onClose}>
      <div style={cancelModalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          style={cancelModalStyles.closeButton}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </button>

        <div style={cancelModalStyles.warningIconBox}>
          <WarningAmberOutlinedIcon sx={{ fontSize: 24 }} />
        </div>

        <h3 style={cancelModalStyles.title}>{strings.title}</h3>

        <p style={cancelModalStyles.description}>
          {completedCount} {strings.descriptionPrefix} {remainingCount}{' '}
          {strings.descriptionSuffix}
        </p>

        <div style={cancelModalStyles.actionsRow}>
          <button
            type="button"
            onClick={onClose}
            style={cancelModalStyles.keepButton}
          >
            {strings.keepGenerating}
          </button>

          <button
            type="button"
            onClick={onConfirmCancel}
            style={cancelModalStyles.cancelButton}
          >
            {strings.confirmCancel}
          </button>
        </div>
      </div>
    </div>
  )
}
