import React, { useRef, useState } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import { PRESET_COLORS } from '../../constants/colors'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { formatSubdomain } from '../../utils/formatters'
import {
  fileToBase64,
  formatFileSize,
  isValidHexColor,
  isValidImageFile,
} from '../../utils/validators'
import { generatorStyles } from './Generator.styles'

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

  return (
    <div style={generatorStyles.card}>
      <div style={generatorStyles.cardHeader}>
        <h2 style={generatorStyles.cardTitle}>{bStrings.title}</h2>
        <p style={generatorStyles.cardSubtitle}>{bStrings.subtitle}</p>
      </div>

      <div style={generatorStyles.fieldGroup}>
        <label style={generatorStyles.label} htmlFor="company-name">
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
          style={{
            ...generatorStyles.input,
            ...(errors.companyName ? generatorStyles.inputError : {}),
          }}
        />
        <span style={generatorStyles.caption}>
          {bStrings.companyNameCaption}
        </span>
        {errors.companyName && (
          <div style={generatorStyles.errorMessage}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            <span>{errors.companyName}</span>
          </div>
        )}
      </div>

      <div style={generatorStyles.fieldGroup}>
        <label style={generatorStyles.label}>{bStrings.logoLabel}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        {logoUrl ? (
          <div style={generatorStyles.uploadedCard}>
            <div style={generatorStyles.uploadedInfo}>
              <img
                src={logoUrl}
                alt="Uploaded company logo"
                style={generatorStyles.uploadedThumb}
              />
              <div style={generatorStyles.uploadedMeta}>
                <span style={generatorStyles.uploadedName}>
                  {logoFileName || 'company-logo.png'}
                </span>
                <span style={generatorStyles.uploadedSizeBadge}>
                  <CheckIcon sx={{ fontSize: 14 }} />
                  {formatFileSize(logoFileSize || 150000)} - {UI_STRINGS.common.uploaded}
                </span>
              </div>
            </div>

            <div style={generatorStyles.uploadedActions}>
              <button
                type="button"
                style={{
                  ...generatorStyles.actionTextButton,
                  color: palette.primary,
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {UI_STRINGS.common.replace}
              </button>
              <button
                type="button"
                style={{
                  ...generatorStyles.actionTextButton,
                  color: palette.error,
                }}
                onClick={handleRemoveLogo}
              >
                {UI_STRINGS.common.remove}
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              ...generatorStyles.dropzone,
              ...(isDragOver ? generatorStyles.dropzoneActive : {}),
              ...(errors.logo ? generatorStyles.dropzoneError : {}),
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(false)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={generatorStyles.uploadIconCircle}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 24 }} />
            </div>
            <p style={{ fontSize: '14px', color: palette.ink, fontWeight: 500 }}>
              {bStrings.dropzonePrompt}{' '}
              <span style={{ color: palette.primary, textDecoration: 'underline' }}>
                {bStrings.browse}
              </span>
            </p>
            <span style={{ fontSize: '12px', color: palette.textMuted, marginTop: '4px' }}>
              {bStrings.dropzoneHint}
            </span>
          </div>
        )}

        {errors.logo && (
          <div style={generatorStyles.errorMessage}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            <span>{errors.logo}</span>
          </div>
        )}
      </div>

      <div style={generatorStyles.fieldGroup}>
        <label style={generatorStyles.label}>{bStrings.brandColorLabel}</label>
        <div style={generatorStyles.colorRow}>
          <div
            style={{
              ...generatorStyles.colorPreviewBox,
              backgroundColor: isValidHexColor(brandColor)
                ? brandColor
                : PRESET_COLORS[0].hex,
            }}
          />
          <input
            type="text"
            value={brandColor}
            onChange={handleColorChange}
            maxLength={7}
            placeholder={PRESET_COLORS[0].hex}
            style={{
              ...generatorStyles.hexInput,
              ...(errors.brandColor ? generatorStyles.inputError : {}),
            }}
          />

          <div style={generatorStyles.swatchList}>
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
                  style={{
                    ...generatorStyles.swatchDot,
                    backgroundColor: preset.hex,
                    ...(isSelected ? generatorStyles.swatchDotActive : {}),
                  }}
                />
              )
            })}
          </div>
        </div>
        <span style={generatorStyles.caption}>
          {bStrings.brandColorCaption}
        </span>
        {errors.brandColor && (
          <div style={generatorStyles.errorMessage}>
            <ErrorOutlineIcon sx={{ fontSize: 14 }} />
            <span>{errors.brandColor}</span>
          </div>
        )}
      </div>

      <div style={{ ...generatorStyles.fieldGroup, marginBottom: 0 }}>
        <label style={generatorStyles.label}>{bStrings.siteAddressLabel}</label>
        <input
          type="text"
          readOnly
          value={subdomain}
          style={{
            ...generatorStyles.input,
            backgroundColor: '#f9fafb',
            color: palette.textSubtle,
            fontFamily: 'var(--font-mono, monospace)',
          }}
        />
        <span style={generatorStyles.caption}>
          {bStrings.siteAddressCaption}
        </span>
      </div>
    </div>
  )
}
