import { describe, expect, it } from 'vitest'
import {
  formatFileSize,
  isValidHexColor,
  isValidImageFile,
  isValidTopic,
  MAX_LOGO_SIZE_BYTES,
} from './validators'

describe('validators utility', () => {
  describe('isValidHexColor', () => {
    it('accepts valid 6-digit hex codes', () => {
      expect(isValidHexColor('#0E7C86')).toBe(true)
      expect(isValidHexColor('#4f46e5')).toBe(true)
      expect(isValidHexColor('#ffffff')).toBe(true)
      expect(isValidHexColor('#000000')).toBe(true)
    })

    it('accepts valid 3-digit hex codes', () => {
      expect(isValidHexColor('#fff')).toBe(true)
      expect(isValidHexColor('#000')).toBe(true)
      expect(isValidHexColor('#abc')).toBe(true)
    })

    it('rejects invalid hex codes', () => {
      expect(isValidHexColor('')).toBe(false)
      expect(isValidHexColor('0E7C86')).toBe(false)
      expect(isValidHexColor('#0E7C')).toBe(false)
      expect(isValidHexColor('#0E7C86FF12')).toBe(false)
      expect(isValidHexColor('#xyz123')).toBe(false)
      expect(isValidHexColor('blue')).toBe(false)
    })
  })

  describe('isValidTopic', () => {
    it('accepts topics with 5 or more characters', () => {
      expect(isValidTopic('Heart health basics')).toBe(true)
      expect(isValidTopic('12345')).toBe(true)
      expect(isValidTopic('  Valid topic with whitespace  ')).toBe(true)
    })

    it('rejects topics shorter than 5 characters or empty', () => {
      expect(isValidTopic('')).toBe(false)
      expect(isValidTopic('   ')).toBe(false)
      expect(isValidTopic('IVF')).toBe(false)
      expect(isValidTopic('care')).toBe(false)
    })
  })

  describe('isValidImageFile', () => {
    it('validates supported image types under 2MB', () => {
      const file = new File(['mock content'], 'logo.png', { type: 'image/png' })
      const result = isValidImageFile(file)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects non-image file types', () => {
      const file = new File(['mock pdf'], 'doc.pdf', { type: 'application/pdf' })
      const result = isValidImageFile(file)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Please upload an image file')
    })

    it('rejects files larger than 2MB', () => {
      // Mock large file
      const largeFile = new File([''], 'huge.png', { type: 'image/png' })
      Object.defineProperty(largeFile, 'size', { value: MAX_LOGO_SIZE_BYTES + 1024 })
      const result = isValidImageFile(largeFile)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File is too large')
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes, KB, and MB accurately', () => {
      expect(formatFileSize(500)).toBe('500 B')
      expect(formatFileSize(151552)).toBe('148 KB')
      expect(formatFileSize(3565158)).toBe('3.4 MB')
    })
  })
})
