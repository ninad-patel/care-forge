import React, { useRef, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { PRESET_COLORS } from '../../constants/colors'
import { UI_STRINGS } from '../../constants/strings'
import { formatSubdomain } from '../../utils/formatters'
import {
  fileToBase64,
  formatFileSize,
  isValidHexColor,
  isValidImageFile,
} from '../../utils/validators'
import {
  brandDetailsStyles,
  getColorPreviewStyle,
  getSwatchDotStyle,
} from './BrandDetailsCard.styles'
import { ColorPickerModal } from './ColorPickerModal'

interface BrandDetailsCardProps {
  companyName: string
  setCompanyName: (val: string) => void
  logoUrl: string
  setLogoUrl: (val: string) => void
  logoFileName: string
  setLogoFileName: (val: string) => void
  logoFileSize: number
  setLogoFileSize: (val: number) => void
  brandColor: string
  setBrandColor: (val: string) => void
  errors: Record<string, string>
  clearError: (field: string) => void
  setFieldError: (field: string, error: string) => void
}

export const BrandDetailsCard: React.FC<BrandDetailsCardProps> = ({
  companyName,
  setCompanyName,
  logoUrl,
  setLogoUrl,
  logoFileName,
  setLogoFileName,
  logoFileSize,
  setLogoFileSize,
  brandColor,
  setBrandColor,
  errors,
  clearError,
  setFieldError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  const handleFileProcess = async (file: File) => {
    const validation = isValidImageFile(file)
    if (!validation.valid) {
      setFieldError('logo', validation.error || UI_STRINGS.validation.invalidImageType)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      setLogoUrl(base64)
      setLogoFileName(file.name)
      setLogoFileSize(file.size)
      clearError('logo')
    } catch {
      setFieldError('logo', UI_STRINGS.validation.fileReadError)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0])
    }
  }

  const handleRemoveLogo = () => {
    setLogoUrl('')
    setLogoFileName('')
    setLogoFileSize(0)
    clearError('logo')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim()
    if (!val.startsWith('#')) {
      val = `#${val}`
    }
    setBrandColor(val)
    if (isValidHexColor(val)) {
      clearError('brandColor')
    }
  }

  const subdomain = formatSubdomain(companyName)
  const bStrings = UI_STRINGS.generator.brandDetails

  const effectivePreviewColor = isValidHexColor(brandColor)
    ? brandColor
    : PRESET_COLORS[0].hex

  const dropzoneStyle: React.CSSProperties = {
    ...brandDetailsStyles.dropzone,
    ...(isDragOver ? brandDetailsStyles.dropzoneActive : {}),
    ...(errors.logo ? brandDetailsStyles.dropzoneError : {}),
  }

  const companyNameInputStyle: React.CSSProperties = {
    ...brandDetailsStyles.input,
    ...(errors.companyName ? brandDetailsStyles.inputError : {}),
  }

  const hexInputStyle: React.CSSProperties = {
    ...brandDetailsStyles.hexInput,
    ...(errors.brandColor ? brandDetailsStyles.inputError : {}),
  }

  return (
    <div style={brandDetailsStyles.card}>
      <div style={brandDetailsStyles.cardHeader}>
        <h2 style={brandDetailsStyles.cardTitle}>{bStrings.title}</h2>
        <p style={brandDetailsStyles.cardSubtitle}>{bStrings.subtitle}</p>
      </div>

      <div style={brandDetailsStyles.fieldGroup}>
        <label style={brandDetailsStyles.label} htmlFor="company-name">
          {bStrings.companyNameLabel}
        </label>
        <input
          id="company-name"
          type="text"
          placeholder={bStrings.companyNamePlaceholder}
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value)
            if (e.target.value.trim()) clearError('companyName')
          }}
          style={companyNameInputStyle}
        />
        <span style={brandDetailsStyles.caption}>
          {bStrings.companyNameCaption}
        </span>
        {errors.companyName && (
          <div style={brandDetailsStyles.errorMessage}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            <span>{errors.companyName}</span>
          </div>
        )}
      </div>

      <div style={brandDetailsStyles.fieldGroup}>
        <label style={brandDetailsStyles.label}>{bStrings.logoLabel}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          style={brandDetailsStyles.hiddenInput}
          onChange={handleFileSelect}
        />

        {logoUrl ? (
          <div style={brandDetailsStyles.uploadedCard}>
            <div style={brandDetailsStyles.uploadedInfo}>
              <img
                src={logoUrl}
                alt="Uploaded company logo"
                style={brandDetailsStyles.uploadedThumb}
              />
              <div style={brandDetailsStyles.uploadedMeta}>
                <span style={brandDetailsStyles.uploadedName}>
                  {logoFileName || 'company-logo.png'}
                </span>
                <span style={brandDetailsStyles.uploadedSizeBadge}>
                  <CheckIcon sx={{ fontSize: 14 }} />
                  {formatFileSize(logoFileSize || 150000)} - {UI_STRINGS.common.uploaded}
                </span>
              </div>
            </div>

            <div style={brandDetailsStyles.uploadedActions}>
              <button
                type="button"
                style={brandDetailsStyles.replaceButton}
                onClick={() => fileInputRef.current?.click()}
              >
                {UI_STRINGS.common.replace}
              </button>
              <button
                type="button"
                style={brandDetailsStyles.removeButton}
                onClick={handleRemoveLogo}
              >
                {UI_STRINGS.common.remove}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={dropzoneStyle}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(false)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={brandDetailsStyles.uploadIconCircle}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
            </div>
            <p style={brandDetailsStyles.dropzonePrompt}>
              {bStrings.dropzonePrompt}{' '}
              <span style={brandDetailsStyles.dropzoneBrowse}>
                {bStrings.browse}
              </span>
            </p>
            <span style={brandDetailsStyles.dropzoneHint}>
              {bStrings.dropzoneHint}
            </span>
          </div>
        )}

        {errors.logo && (
          <div style={brandDetailsStyles.errorMessage}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            <span>{errors.logo}</span>
          </div>
        )}
      </div>

      <div style={brandDetailsStyles.fieldGroup}>
        <label style={brandDetailsStyles.label}>{bStrings.brandColorLabel}</label>
        <div style={brandDetailsStyles.colorRow}>
          <div
            style={getColorPreviewStyle(effectivePreviewColor)}
            title="Choose custom brand colour"
            onClick={() => setIsColorPickerOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          />
          <input
            type="text"
            value={brandColor}
            onChange={handleColorChange}
            maxLength={7}
            placeholder={PRESET_COLORS[0].hex}
            style={hexInputStyle}
          />

          <div style={brandDetailsStyles.swatchList}>
            {PRESET_COLORS.map((preset) => {
              const isSelected =
                brandColor.toLowerCase() === preset.hex.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  type="button"
                  title={preset.label}
                  onClick={() => {
                    setBrandColor(preset.hex)
                    clearError('brandColor')
                  }}
                  style={getSwatchDotStyle(preset.hex, isSelected)}
                />
              )
            })}
          </div>
        </div>
        <span style={brandDetailsStyles.caption}>
          {bStrings.brandColorCaption}
        </span>
        {errors.brandColor && (
          <div style={brandDetailsStyles.errorMessage}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            <span>{errors.brandColor}</span>
          </div>
        )}
      </div>

      <div style={brandDetailsStyles.lastFieldGroup}>
        <label style={brandDetailsStyles.label}>{bStrings.siteAddressLabel}</label>
        <input
          type="text"
          readOnly
          value={subdomain}
          style={brandDetailsStyles.readonlyInput}
        />
        <span style={brandDetailsStyles.caption}>
          {bStrings.siteAddressCaption}
        </span>
      </div>

      {isColorPickerOpen && (
        <ColorPickerModal
          initialColor={brandColor}
          onClose={() => setIsColorPickerOpen(false)}
          onApply={(newHex) => {
            setBrandColor(newHex)
            clearError('brandColor')
          }}
        />
      )}
    </div>
  )
}
