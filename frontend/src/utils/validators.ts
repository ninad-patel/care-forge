/**
 * Pure validation and file utility functions for CareForge.
 */

const HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3}){1,2}$/
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
export const MIN_TOPIC_LENGTH = 5
export const MAX_TOPICS_COUNT = 10

export function isValidHexColor(hex: string): boolean {
  if (!hex) return false
  return HEX_COLOR_REGEX.test(hex.trim())
}

export function isValidTopic(topic: string): boolean {
  if (!topic) return false
  return topic.trim().length >= MIN_TOPIC_LENGTH
}

export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' }
  }

  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload an image file (PNG, JPG, SVG or WEBP).',
    }
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Please upload an image under 2 MB.`,
    }
  }

  return { valid: true }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert file to base64.'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
