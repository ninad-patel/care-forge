import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { BlogTopicsCard } from '../components/generator/BlogTopicsCard'
import { BrandDetailsCard } from '../components/generator/BrandDetailsCard'
import { GenerationOverlay } from '../components/generator/GenerationOverlay'
import { generatorStyles } from '../components/generator/Generator.styles'
import { Stepper } from '../components/generator/Stepper'
import { StickyActionBar } from '../components/generator/StickyActionBar'
import { DEFAULT_BRAND_COLOR } from '../constants/colors'
import { palette } from '../constants/palette'
import { DEFAULT_SAMPLE_TOPICS, UI_STRINGS } from '../constants/strings'
import { api } from '../services/api'
import {
  isValidHexColor,
  isValidTopic,
} from '../utils/validators'

const DRAFT_STORAGE_KEY = 'careforge_generator_draft'

interface ToastState {
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
}

interface DraftData {
  companyName?: string
  logoUrl?: string
  logoFileName?: string
  logoFileSize?: number
  brandColor?: string
  topics?: string[]
}

function getStoredDraft(): DraftData | null {
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as DraftData
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

export const GeneratorPage: React.FC = () => {
  const navigate = useNavigate()
  const initialDraft = getStoredDraft()
  const gStrings = UI_STRINGS.generator

  const [companyName, setCompanyName] = useState<string>(
    initialDraft?.companyName || ''
  )
  const [logoUrl, setLogoUrl] = useState<string>(initialDraft?.logoUrl || '')
  const [logoFileName, setLogoFileName] = useState<string>(
    initialDraft?.logoFileName || ''
  )
  const [logoFileSize, setLogoFileSize] = useState<number>(
    initialDraft?.logoFileSize || 0
  )
  const [brandColor, setBrandColor] = useState<string>(
    initialDraft?.brandColor || DEFAULT_BRAND_COLOR
  )
  const [topics, setTopics] = useState<string[]>(
    Array.isArray(initialDraft?.topics) && initialDraft.topics.length > 0
      ? initialDraft.topics
      : DEFAULT_SAMPLE_TOPICS
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev }
      delete copy[field]
      return copy
    })
  }

  const setFieldError = (field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!companyName.trim()) {
      newErrors.companyName = UI_STRINGS.validation.companyNameRequired
    }

    if (!isValidHexColor(brandColor)) {
      newErrors.brandColor = UI_STRINGS.validation.brandColorInvalid
    }

    topics.forEach((t, idx) => {
      if (!isValidTopic(t)) {
        newErrors[`topic_${idx}`] = `Topic ${idx + 1} ${UI_STRINGS.validation.topicTooShort}`
      }
    })

    if (topics.length === 0) {
      newErrors.topics = UI_STRINGS.validation.atLeastOneTopic
    }

    setErrors(newErrors)

    const errorCount = Object.keys(newErrors).length
    if (errorCount > 0) {
      setToast({
        type: 'error',
        title: `${gStrings.toasts.fixFieldsPrefix} ${errorCount} ${errorCount === 1 ? 'field' : 'fields'} ${gStrings.toasts.fixFieldsSuffix}`,
        message: gStrings.toasts.fixFieldsMessage,
      })
      return false
    }

    return true
  }

  const handleSaveDraft = () => {
    try {
      const draftData = {
        companyName,
        logoUrl,
        logoFileName,
        logoFileSize,
        brandColor,
        topics,
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
      setToast({
        type: 'success',
        title: gStrings.toasts.draftSavedTitle,
        message: gStrings.toasts.draftSavedMessage,
      })
    } catch {
      setToast({
        type: 'error',
        title: gStrings.toasts.draftErrorTitle,
        message: gStrings.toasts.draftErrorMessage,
      })
    }
  }

  const handleTopicLimitReached = () => {
    setToast({
      type: 'warning',
      title: gStrings.toasts.limitReachedTitle,
      message: gStrings.toasts.limitReachedMessage,
    })
  }

  const handleGenerate = async () => {
    if (!validateForm()) return

    setIsGenerating(true)
    try {
      const response = await api.generateBlogs({
        company_name: companyName.trim(),
        logo_url: logoUrl || '',
        brand_color: brandColor.trim(),
        topics: topics.map((t) => t.trim()).filter(Boolean),
      })

      localStorage.removeItem(DRAFT_STORAGE_KEY)
      navigate(`/company/${response.brand.id}`)
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Generation failed. Please try again.'
      setToast({
        type: 'error',
        title: gStrings.toasts.generationErrorTitle,
        message: errorMsg,
      })
      setIsGenerating(false)
    }
  }

  const isBrandValid =
    Boolean(companyName.trim()) &&
    isValidHexColor(brandColor) &&
    !errors.companyName &&
    !errors.brandColor &&
    !errors.logo

  const isTopicsValid =
    topics.length > 0 &&
    topics.every((t) => isValidTopic(t)) &&
    !Object.keys(errors).some((k) => k.startsWith('topic_'))

  const errorCount = Object.keys(errors).length
  const hasErrors = errorCount > 0
  const isReady = isBrandValid && isTopicsValid

  return (
    <div style={generatorStyles.pageWrapper}>
      {toast && (
        <div style={generatorStyles.toastBanner}>
          {toast.type === 'error' && (
            <ErrorOutlineIcon sx={{ fontSize: 20, color: palette.error }} />
          )}
          {toast.type === 'warning' && (
            <InfoOutlinedIcon sx={{ fontSize: 20, color: palette.warning }} />
          )}
          {toast.type === 'info' && (
            <InfoOutlinedIcon sx={{ fontSize: 20, color: palette.primary }} />
          )}
          {toast.type === 'success' && (
            <InfoOutlinedIcon sx={{ fontSize: 20, color: palette.success }} />
          )}

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: palette.ink }}>
              {toast.title}
            </div>
            <div style={{ fontSize: '13px', color: palette.textSubtle, marginTop: '2px' }}>
              {toast.message}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: palette.textMuted,
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      )}

      {isGenerating && (
        <GenerationOverlay
          companyName={companyName}
          brandColor={brandColor}
          logoUrl={logoUrl}
        />
      )}

      <div style={generatorStyles.container}>
        <Link
          to="/"
          style={generatorStyles.backLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = palette.ink
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = palette.textSubtle
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          <span>{UI_STRINGS.common.backToSites}</span>
        </Link>

        <div style={generatorStyles.titleGroup}>
          <h1 style={generatorStyles.pageTitle}>{gStrings.title}</h1>
          <p style={generatorStyles.pageSubtitle}>{gStrings.subtitle}</p>
        </div>

        <Stepper isBrandValid={isBrandValid} isTopicsValid={isTopicsValid} />

        <BrandDetailsCard
          companyName={companyName}
          setCompanyName={setCompanyName}
          logoUrl={logoUrl}
          setLogoUrl={setLogoUrl}
          logoFileName={logoFileName}
          setLogoFileName={setLogoFileName}
          logoFileSize={logoFileSize}
          setLogoFileSize={setLogoFileSize}
          brandColor={brandColor}
          setBrandColor={setBrandColor}
          errors={errors}
          clearError={clearError}
          setFieldError={setFieldError}
        />

        <BlogTopicsCard
          topics={topics}
          setTopics={setTopics}
          errors={errors}
          clearError={clearError}
          onTopicLimitReached={handleTopicLimitReached}
        />
      </div>

      <StickyActionBar
        topicsCount={topics.length}
        isReady={isReady}
        hasErrors={hasErrors}
        errorCount={errorCount}
        onSaveDraft={handleSaveDraft}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  )
}
