import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { BlogTopicsCard } from '../components/generator/BlogTopicsCard'
import { BrandDetailsCard } from '../components/generator/BrandDetailsCard'
import { CancelGenerationModal } from '../components/generator/CancelGenerationModal'
import { GenerationProgressView } from '../components/generator/GenerationProgressView'
import {
  GenerationResultView,
  type ResultTopicItem,
} from '../components/generator/GenerationResultView'
import { generatorStyles } from '../components/generator/Generator.styles'
import { GeneratorSkeleton } from '../components/generator/GeneratorSkeleton'
import { ReviewGenerateModal } from '../components/generator/ReviewGenerateModal'
import { Stepper } from '../components/generator/Stepper'
import { StickyActionBar } from '../components/generator/StickyActionBar'
import { DEFAULT_BRAND_COLOR, PRESET_COLORS } from '../constants/colors'
import { palette } from '../constants/palette'
import { DEFAULT_SAMPLE_TOPICS, UI_STRINGS } from '../constants/strings'
import { api } from '../services/api'
import { formatSubdomain, generateSlug } from '../utils/formatters'
import { isValidHexColor, isValidTopic } from '../utils/validators'

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

interface GenerationResultData {
  brandId: number | string
  companyName: string
  brandColor: string
  subdomain: string
  items: ResultTopicItem[]
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
    initialDraft?.topics && initialDraft.topics.length > 0
      ? initialDraft.topics
      : DEFAULT_SAMPLE_TOPICS
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<ToastState | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelCompletedCount, setCancelCompletedCount] = useState(0)
  const [isPageLoading, setIsPageLoading] = useState(true)

  const [generationResult, setGenerationResult] =
    useState<GenerationResultData | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const isCancelledRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [])

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
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

    if (topics.length === 0) {
      newErrors.topics = UI_STRINGS.validation.atLeastOneTopic
    } else {
      topics.forEach((t, i) => {
        if (!isValidTopic(t)) {
          newErrors[`topic_${i}`] = `Topic ${i + 1} ${UI_STRINGS.validation.topicTooShort}`
        }
      })
    }

    setErrors(newErrors)
    const errKeys = Object.keys(newErrors)

    if (errKeys.length > 0) {
      setToast({
        type: 'warning',
        title: `${gStrings.toasts.fixFieldsPrefix} ${errKeys.length} ${gStrings.toasts.fixFieldsSuffix}`,
        message: gStrings.toasts.fixFieldsMessage,
      })
      return false
    }

    return true
  }

  const handleSaveDraft = () => {
    try {
      const draft: DraftData = {
        companyName,
        logoUrl,
        logoFileName,
        logoFileSize,
        brandColor,
        topics,
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
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

  const handleOpenReviewModal = () => {
    if (!validateForm()) return
    setIsReviewModalOpen(true)
  }

  const handleExecuteGeneration = async () => {
    setIsReviewModalOpen(false)
    setIsGenerating(true)
    isCancelledRef.current = false
    setToast({
      type: 'info',
      title: gStrings.progressScreen.toastTitle,
      message: gStrings.progressScreen.toastMessage,
    })

    const activeTopics = topics.map((t) => t.trim()).filter(Boolean)
    const subdomainStr = formatSubdomain(companyName)

    try {
      const response = await api.generateBlogs({
        company_name: companyName.trim(),
        logo_url: logoUrl || '',
        brand_color: brandColor.trim(),
        topics: activeTopics,
      })

      if (isCancelledRef.current) return

      const resolvedBrandId = response.brand_id || response.brand?.id || 1
      const returnedBlogs = response.blogs || response.brand?.blogs || []

      const topicItems: ResultTopicItem[] = activeTopics.map((topicStr, idx) => {
        const found = returnedBlogs.find(
          (b) => b.topic.toLowerCase() === topicStr.toLowerCase()
        )
        if (found) {
          return {
            index: idx + 1,
            topic: topicStr,
            slug: found.slug,
            status: 'live',
            blogId: found.id,
          }
        }
        return {
          index: idx + 1,
          topic: topicStr,
          slug: generateSlug(topicStr),
          status: 'failed',
          errorMessage: gStrings.resultScreen.failedReason,
        }
      })

      setGenerationResult({
        brandId: resolvedBrandId,
        companyName: companyName.trim(),
        brandColor: brandColor.trim(),
        subdomain: subdomainStr,
        items: topicItems,
      })

      setIsGenerating(false)
      localStorage.removeItem(DRAFT_STORAGE_KEY)

      const liveCount = topicItems.filter((i) => i.status === 'live').length
      const failedCount = topicItems.filter((i) => i.status === 'failed').length

      if (failedCount === 0) {
        setToast({
          type: 'success',
          title: gStrings.resultScreen.copySuccessToastTitle,
          message: `${subdomainStr} ${gStrings.resultScreen.copySuccessToastSuffix}`,
        })
      } else {
        setToast({
          type: 'warning',
          title: gStrings.resultScreen.incompleteToastTitle,
          message: `${liveCount} ${gStrings.resultScreen.incompleteToastPrefix} ${activeTopics.length} ${gStrings.resultScreen.incompleteToastSuffix} ${failedCount} ${gStrings.resultScreen.incompleteToastEnd}`,
        })
      }
    } catch (err: unknown) {
      if (isCancelledRef.current) return
      const errorMsg =
        err instanceof Error ? err.message : 'Generation failed. Please try again.'

      setGenerationResult({
        brandId: 1,
        companyName: companyName.trim(),
        brandColor: brandColor.trim(),
        subdomain: subdomainStr,
        items: activeTopics.map((t, idx) => ({
          index: idx + 1,
          topic: t,
          slug: generateSlug(t),
          status: 'failed',
          errorMessage: gStrings.resultScreen.failedReason,
        })),
      })

      setToast({
        type: 'warning',
        title: gStrings.resultScreen.incompleteToastTitle,
        message: errorMsg,
      })
      setIsGenerating(false)
    }
  }

  const handleOpenCancelModal = (currentDone: number) => {
    setCancelCompletedCount(currentDone)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = () => {
    isCancelledRef.current = true
    setIsCancelModalOpen(false)
    setIsGenerating(false)

    const activeTopics = topics.map((t) => t.trim()).filter(Boolean)
    const subdomainStr = formatSubdomain(companyName)

    if (cancelCompletedCount > 0) {
      const topicItems: ResultTopicItem[] = activeTopics.map((topicStr, idx) => {
        const isDone = idx < cancelCompletedCount
        return {
          index: idx + 1,
          topic: topicStr,
          slug: generateSlug(topicStr),
          status: isDone ? ('live' as const) : ('failed' as const),
          errorMessage: isDone ? undefined : gStrings.resultScreen.failedReason,
        }
      })

      setGenerationResult({
        brandId: 1,
        companyName: companyName.trim(),
        brandColor: brandColor.trim(),
        subdomain: subdomainStr,
        items: topicItems,
      })

      setToast({
        type: 'warning',
        title: gStrings.resultScreen.incompleteToastTitle,
        message: `${cancelCompletedCount} ${gStrings.resultScreen.incompleteToastPrefix} ${activeTopics.length} ${gStrings.resultScreen.incompleteToastSuffix} ${activeTopics.length - cancelCompletedCount} ${gStrings.resultScreen.incompleteToastEnd}`,
      })
    } else {
      handleSaveDraft()
    }
  }

  const handleRetryFailed = async (failedTopicNames: string[]) => {
    if (!generationResult) return
    setIsRetrying(true)

    try {
      const response = await api.generateBlogs({
        company_name: generationResult.companyName,
        logo_url: logoUrl || '',
        brand_color: generationResult.brandColor,
        topics: failedTopicNames,
      })

      const returnedBlogs = response.blogs || response.brand?.blogs || []

      setGenerationResult((prev) => {
        if (!prev) return null
        const updatedItems = prev.items.map((item) => {
          if (item.status === 'failed' && failedTopicNames.includes(item.topic)) {
            const newlyGenerated = returnedBlogs.find(
              (b) => b.topic.toLowerCase() === item.topic.toLowerCase()
            )
            return {
              ...item,
              status: 'live' as const,
              slug: newlyGenerated ? newlyGenerated.slug : item.slug,
              blogId: newlyGenerated ? newlyGenerated.id : item.blogId,
              errorMessage: undefined,
            }
          }
          return item
        })
        return {
          ...prev,
          brandId: response.brand_id || prev.brandId,
          items: updatedItems,
        }
      })

      setToast({
        type: 'success',
        title: gStrings.resultScreen.copySuccessToastTitle,
        message: `${generationResult.subdomain} ${gStrings.resultScreen.copySuccessToastSuffix}`,
      })
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Retry failed. Please try again.'
      setToast({
        type: 'error',
        title: gStrings.toasts.generationErrorTitle,
        message: errorMsg,
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const handleEditTopics = () => {
    setGenerationResult(null)
  }

  const handleCreateAnother = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY)
    setCompanyName('')
    setLogoUrl('')
    setLogoFileName('')
    setLogoFileSize(0)
    setBrandColor(PRESET_COLORS[0].hex)
    setTopics(DEFAULT_SAMPLE_TOPICS)
    setErrors({})
    setGenerationResult(null)
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

  if (isGenerating) {
    return (
      <div style={generatorStyles.pageWrapper}>
        {toast && (
          <div style={generatorStyles.toastBanner}>
            <InfoOutlinedIcon sx={{ fontSize: 20, color: palette.primary }} />
            <div style={generatorStyles.toastContent}>
              <div style={generatorStyles.toastTitle}>{toast.title}</div>
              <div style={generatorStyles.toastMessage}>{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              style={generatorStyles.toastCloseButton}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        )}

        <GenerationProgressView
          topics={topics.map((t) => t.trim()).filter(Boolean)}
          onOpenCancelModal={handleOpenCancelModal}
        />

        <CancelGenerationModal
          isOpen={isCancelModalOpen}
          completedCount={cancelCompletedCount}
          totalCount={topics.length}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirmCancel={handleConfirmCancel}
        />
      </div>
    )
  }

  if (generationResult) {
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

            <div style={generatorStyles.toastContent}>
              <div style={generatorStyles.toastTitle}>{toast.title}</div>
              <div style={generatorStyles.toastMessage}>{toast.message}</div>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              style={generatorStyles.toastCloseButton}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        )}

        <GenerationResultView
          brandId={generationResult.brandId}
          companyName={generationResult.companyName}
          brandColor={generationResult.brandColor}
          subdomain={generationResult.subdomain}
          items={generationResult.items}
          isRetrying={isRetrying}
          onRetryFailed={handleRetryFailed}
          onEditTopics={handleEditTopics}
          onCreateAnother={handleCreateAnother}
          onShowToast={(newToast) => setToast(newToast)}
        />
      </div>
    )
  }

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

          <div style={generatorStyles.toastContent}>
            <div style={generatorStyles.toastTitle}>{toast.title}</div>
            <div style={generatorStyles.toastMessage}>{toast.message}</div>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            style={generatorStyles.toastCloseButton}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
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

        {isPageLoading ? (
          <GeneratorSkeleton />
        ) : (
          <>
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
          </>
        )}
      </div>

      <StickyActionBar
        topicsCount={topics.length}
        isReady={isReady && !isPageLoading}
        hasErrors={hasErrors}
        errorCount={errorCount}
        onSaveDraft={handleSaveDraft}
        onGenerate={handleOpenReviewModal}
        isGenerating={isGenerating}
      />

      <ReviewGenerateModal
        isOpen={isReviewModalOpen}
        companyName={companyName}
        logoUrl={logoUrl}
        brandColor={brandColor}
        topics={topics.map((t) => t.trim()).filter(Boolean)}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirm={handleExecuteGeneration}
      />
    </div>
  )
}
