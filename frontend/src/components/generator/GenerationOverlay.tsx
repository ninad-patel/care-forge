import React, { useEffect, useState } from 'react'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { palette } from '../../constants/palette'
import { GENERATION_STEPS, UI_STRINGS } from '../../constants/strings'
import { getCompanyInitial } from '../../utils/formatters'
import { generatorStyles } from './Generator.styles'

interface GenerationOverlayProps {
  companyName: string
  brandColor: string
  logoUrl?: string
}

export const GenerationOverlay: React.FC<GenerationOverlayProps> = ({
  companyName,
  brandColor,
  logoUrl,
}) => {
  const [stepIndex, setStepIndex] = useState(0)
  const oStrings = UI_STRINGS.generator.overlay

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) =>
        prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev
      )
    }, 3200)
    return () => clearInterval(timer)
  }, [])

  const initial = getCompanyInitial(companyName)

  return (
    <div style={generatorStyles.overlayBackdrop}>
      <div style={generatorStyles.overlayModal}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: brandColor || palette.primary,
            color: palette.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '20px',
            boxShadow: `0 8px 24px ${brandColor ? `${brandColor}40` : 'rgba(79, 70, 229, 0.3)'}`,
            overflow: 'hidden',
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            initial
          )}
        </div>

        <h3
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: palette.ink,
            marginBottom: '8px',
          }}
        >
          {oStrings.generatingPrefix} {companyName || oStrings.defaultBrand}{' '}
          {oStrings.generatingSuffix}
        </h3>

        <p
          style={{
            fontSize: '14px',
            color: palette.primary,
            fontWeight: 500,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 16 }} />
          <span>{GENERATION_STEPS[stepIndex]}</span>
        </p>

        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: palette.hairlineSoft,
            borderRadius: '100px',
            overflow: 'hidden',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: brandColor || palette.primary,
              width: `${((stepIndex + 1) / GENERATION_STEPS.length) * 100}%`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        <span style={{ fontSize: '12px', color: palette.textMuted }}>
          {oStrings.notice}
        </span>
      </div>
    </div>
  )
}
