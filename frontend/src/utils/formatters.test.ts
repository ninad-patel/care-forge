import { describe, expect, it } from 'vitest'
import {
  calculateReadingTime,
  calculateWordCount,
  formatRelativeTime,
  formatSubdomain,
  generateSlug,
  getCompanyInitial,
} from './formatters'

describe('formatters utility', () => {
  it('extracts uppercase initial from company name', () => {
    expect(getCompanyInitial('Aarogya Health')).toBe('A')
    expect(getCompanyInitial('care')).toBe('C')
    expect(getCompanyInitial('')).toBe('C')
    expect(getCompanyInitial('   ')).toBe('C')
  })

  it('formats clean careforge.app subdomains', () => {
    expect(formatSubdomain('Aarogya Health')).toBe('aarogya-health.careforge.app')
    expect(formatSubdomain('care-plus')).toBe('care-plus.careforge.app')
    expect(formatSubdomain('Hospital & Clinic!')).toBe('hospital-clinic.careforge.app')
    expect(formatSubdomain('')).toBe('careforge.app')
  })

  it('formats relative timestamps cleanly', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('Saved just now')

    const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000)
    expect(formatRelativeTime(tenMinsAgo.toISOString())).toBe('Updated 10m ago')

    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(twoDaysAgo.toISOString())).toBe('Updated 2 days ago')

    expect(formatRelativeTime('')).toBe('Updated recently')
  })

  it('generates clean URL slugs from topic titles', () => {
    expect(generateSlug('Why patient education improves treatment adherence')).toBe(
      'why-patient-education-improves-treatment-adherence'
    )
    expect(generateSlug('Heart health basics: Every adult should know!')).toBe(
      'heart-health-basics-every-adult-should-know'
    )
    expect(generateSlug('')).toBe('')
  })

  it('calculates word count accurately from markdown text', () => {
    expect(calculateWordCount('Hello world from CareForge')).toBe(4)
    expect(calculateWordCount('')).toBe(0)
    expect(calculateWordCount('   Multiple    spaces   between words   ')).toBe(4)
  })

  it('calculates estimated reading time at 200 words per minute', () => {
    expect(calculateReadingTime(1000)).toBe(5)
    expect(calculateReadingTime(980)).toBe(5)
    expect(calculateReadingTime(150)).toBe(1)
    expect(calculateReadingTime(0)).toBe(1)
  })
})
