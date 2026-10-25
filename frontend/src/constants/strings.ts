export const APP_NAME = 'CareForge'

export const DEFAULT_SAMPLE_TOPICS: string[] = [
  'Why patient education improves treatment adherence',
  '5 ways AI is personalising healthcare communication',
  'Managing diabetes: a daily habits guide',
]

export const GENERATION_STEPS: string[] = [
  'Initializing campaign and brand theme...',
  'Dispatching 10 parallel Gemini generation tasks...',
  'Crafting ~1,000-word medical and wellness content...',
  'Formatting structured Markdown and clinical headers...',
  'Publishing 10 hosted pages to database...',
]

export const UI_STRINGS = {
  common: {
    backToSites: 'My sites',
    retry: 'Retry',
    uploaded: 'Uploaded',
    replace: 'Replace',
    remove: 'Remove',
    saveDraft: 'Save draft',
    generating: 'Generating...',
    reviewAndGenerate: 'Review & generate',
  },
  dashboard: {
    title: 'My sites',
    subtitle:
      'Each site is a branded blog with up to 10 AI-written pages. Create as many as you need.',
    newSite: 'New site',
    pagesLive: 'pages live',
    viewPages: 'View pages',
    createCardTitle: 'Create a new site',
    createCardSubtitle: 'Any brand, any use case',
    emptyTitle: 'No sites generated yet',
    emptySubtitle:
      'Generate your first branded healthcare portal with 10 AI-written, 1,000-word articles in seconds.',
    emptyCta: 'Create your first site',
    fetchError: 'Failed to fetch sites from server.',
  },
  generator: {
    title: 'Create a new blog site',
    subtitle:
      "Add your brand and up to 10 topics. We'll write and publish a branded page for each one.",
    steps: {
      brandDetails: 'Brand details',
      blogTopics: 'Blog topics',
      reviewGenerate: 'Review & generate',
    },
    brandDetails: {
      title: 'Brand details',
      subtitle: 'Used on every page we generate.',
      companyNameLabel: 'Company name',
      companyNamePlaceholder: 'e.g. Aarogya Health',
      companyNameCaption: 'Shown in your site header and footer.',
      logoLabel: 'Logo',
      dropzonePrompt: 'Drag & drop your logo, or',
      browse: 'Browse',
      dropzoneHint: 'PNG, JPG or SVG · up to 2 MB',
      brandColorLabel: 'Brand colour',
      brandColorCaption: 'Used for buttons, links and highlights on every page.',
      siteAddressLabel: 'Site address',
      siteAddressCaption:
        'We suggest this from your company name — derived automatically.',
    },
    blogTopics: {
      title: 'Blog topics',
      subtitle: "One page per topic. We'll write about 1,000 words for each.",
      counterLabel: 'Topics added',
      topicPlaceholder: 'e.g. 5 ways to improve patient follow-ups',
      addTopic: 'Add topic',
      limitReached: 'Topic limit reached (10 of 10)',
      tipText:
        'Be specific for better posts: "How to prepare for your first IVF consultation" beats "IVF".',
    },
    statusBar: {
      incomplete: 'of 10 topics · brand details incomplete',
      brandReady: 'Brand ready',
      issuesPrefix: 'issues to fix before you continue',
      singleIssuePrefix: 'issue to fix before you continue',
    },
    toasts: {
      draftSavedTitle: 'Draft saved',
      draftSavedMessage:
        'Your brand details and topics have been saved to local storage.',
      draftErrorTitle: 'Failed to save draft',
      draftErrorMessage: 'Could not access browser storage.',
      limitReachedTitle: 'Topic limit reached',
      limitReachedMessage: 'You can add up to 10 topics per site.',
      fixFieldsPrefix: 'Please fix',
      fixFieldsSuffix: 'to continue',
      fixFieldsMessage:
        'Review the highlighted fields above before generating your blog site.',
      generationErrorTitle: 'Generation Error',
    },
    overlay: {
      generatingPrefix: 'Generating',
      generatingSuffix: 'Portal',
      defaultBrand: 'CareForge',
      notice:
        'Concurrently generating 10 articles (~15–20 seconds). Please do not close this window.',
    },
  },
  validation: {
    companyNameRequired: 'Company name is required.',
    brandColorInvalid: 'Enter a valid 6-digit hex code, e.g. #0E7C86.',
    topicTooShort: 'is too short — use at least 5 characters.',
    atLeastOneTopic: 'Please provide at least 1 topic.',
    noFile: 'No file provided.',
    invalidImageType:
      'Please upload an image file (PNG, JPG, SVG or WEBP).',
    fileReadError: 'Failed to read file. Please try again.',
  },
} as const
