import React, { useCallback, useEffect, useRef, useState } from 'react'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { PRESET_COLORS } from '../../constants/colors'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import {
  getWcagEvaluation,
  hexToHsv,
  hsvToHex,
} from '../../utils/contrast'
import { isValidHexColor } from '../../utils/validators'
import { colorPickerModalStyles } from './ColorPickerModal.styles'

interface ColorPickerModalProps {
  initialColor: string
  onClose: () => void
  onApply: (hex: string) => void
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  initialColor,
  onClose,
  onApply,
}) => {
  const strings = UI_STRINGS.generator.colorPickerModal
  const [currentColor, setCurrentColor] = useState<string>(initialColor)
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() =>
    hexToHsv(initialColor)
  )

  const satValRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)
  const isDraggingSatVal = useRef(false)
  const isDraggingHue = useRef(false)

  const updateFromHsv = useCallback(
    (newHsv: { h: number; s: number; v: number }) => {
      setHsv(newHsv)
      const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v)
      setCurrentColor(hex)
    },
    []
  )

  const handleSatValMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!satValRef.current) return
      const rect = satValRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))

      const s = x / rect.width
      const v = 1 - y / rect.height

      updateFromHsv({ ...hsv, s, v })
    },
    [hsv, updateFromHsv]
  )

  const handleHueMove = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!hueRef.current) return
      const rect = hueRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
      const h = Math.round((x / rect.width) * 360) % 360

      updateFromHsv({ ...hsv, h })
    },
    [hsv, updateFromHsv]
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSatVal.current) {
        handleSatValMove(e)
      } else if (isDraggingHue.current) {
        handleHueMove(e)
      }
    }

    const handleMouseUp = () => {
      isDraggingSatVal.current = false
      isDraggingHue.current = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleSatValMove, handleHueMove])

  const handleSatValMouseDown = (e: React.MouseEvent) => {
    isDraggingSatVal.current = true
    handleSatValMove(e)
  }

  const handleHueMouseDown = (e: React.MouseEvent) => {
    isDraggingHue.current = true
    handleHueMove(e)
  }

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim()
    if (!val.startsWith('#')) {
      val = `#${val}`
    }
    setCurrentColor(val)
    if (isValidHexColor(val)) {
      setHsv(hexToHsv(val))
    }
  }

  const handleSwatchClick = (presetHex: string) => {
    setCurrentColor(presetHex)
    setHsv(hexToHsv(presetHex))
  }

  const wcag = getWcagEvaluation(currentColor)

  const colorCanvasStyle: React.CSSProperties = {
    ...colorPickerModalStyles.colorCanvasBase,
    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
  }

  const colorThumbStyle: React.CSSProperties = {
    ...colorPickerModalStyles.colorCanvasThumb,
    left: `${hsv.s * 100}%`,
    top: `${(1 - hsv.v) * 100}%`,
    backgroundColor: currentColor,
  }

  const hueThumbStyle: React.CSSProperties = {
    ...colorPickerModalStyles.hueThumb,
    left: `${(hsv.h / 360) * 100}%`,
    backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
  }

  const previewBoxStyle: React.CSSProperties = {
    ...colorPickerModalStyles.colorPreviewBox,
    backgroundColor: currentColor,
  }

  const wcagBadgeStyle: React.CSSProperties = {
    ...colorPickerModalStyles.wcagBadgeBase,
    backgroundColor: wcag.passes ? palette.successBg : palette.errorBg,
    borderColor: wcag.passes ? palette.successBorder : palette.errorBorder,
    color: wcag.passes ? palette.successText : palette.error,
    borderWidth: '1px',
    borderStyle: 'solid',
  }

  const getSwatchStyle = (hex: string, isSelected: boolean): React.CSSProperties => ({
    ...colorPickerModalStyles.swatchButton,
    backgroundColor: hex,
    border: isSelected
      ? `2.5px solid ${palette.ink}`
      : '2px solid transparent',
    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
  })

  return (
    <div style={colorPickerModalStyles.overlay} onClick={onClose}>
      <div style={colorPickerModalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={colorPickerModalStyles.header}>
          <div>
            <h3 style={colorPickerModalStyles.title}>{strings.title}</h3>
            <p style={colorPickerModalStyles.subtitle}>{strings.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={colorPickerModalStyles.closeButton}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div
          ref={satValRef}
          onMouseDown={handleSatValMouseDown}
          style={colorCanvasStyle}
        >
          <div style={colorThumbStyle} />
        </div>

        <div
          ref={hueRef}
          onMouseDown={handleHueMouseDown}
          style={colorPickerModalStyles.hueSlider}
        >
          <div style={hueThumbStyle} />
        </div>

        <div style={colorPickerModalStyles.hexRow}>
          <div style={previewBoxStyle} />
          <div style={colorPickerModalStyles.hexInputContainer}>
            <span style={colorPickerModalStyles.hexPrefix}>
              {strings.hexPrefix}
            </span>
            <input
              type="text"
              value={currentColor}
              onChange={handleHexInputChange}
              maxLength={7}
              style={colorPickerModalStyles.hexInput}
            />
          </div>
        </div>

        <div style={colorPickerModalStyles.swatchSection}>
          <div style={colorPickerModalStyles.swatchTitle}>
            {strings.suggestedTitle}
          </div>
          <div style={colorPickerModalStyles.swatchRow}>
            {PRESET_COLORS.map((preset) => {
              const isSelected =
                currentColor.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  title={preset.label}
                  onClick={() => handleSwatchClick(preset.hex)}
                  style={getSwatchStyle(preset.hex, isSelected)}
                />
              )
            })}
          </div>
        </div>

        <div style={wcagBadgeStyle}>
          {wcag.passes ? (
            <CheckCircleIcon sx={{ fontSize: 16, color: palette.success }} />
          ) : (
            <ErrorOutlineIcon sx={{ fontSize: 16, color: palette.error }} />
          )}
          <span>{wcag.message}</span>
        </div>

        <div style={colorPickerModalStyles.actionsRow}>
          <button
            type="button"
            onClick={onClose}
            style={colorPickerModalStyles.cancelButton}
          >
            {strings.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isValidHexColor(currentColor)) {
                onApply(currentColor)
                onClose()
              }
            }}
            style={colorPickerModalStyles.applyButton}
          >
            {strings.apply}
          </button>
        </div>
      </div>
    </div>
  )
}
