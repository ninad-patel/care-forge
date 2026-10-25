import { describe, expect, it } from 'vitest'
import {
  calculateContrastRatio,
  getWcagEvaluation,
  hexToHsv,
  hsvToHex,
} from './contrast'

describe('contrast utility', () => {
  it('calculates contrast ratio for teal #0E7C86', () => {
    const ratio = calculateContrastRatio('#0E7C86', '#ffffff')
    expect(ratio).toBeGreaterThanOrEqual(4.5)
    expect(ratio).toBeCloseTo(4.9, 1)
  })

  it('evaluates passing WCAG AA colors correctly', () => {
    const evalResult = getWcagEvaluation('#0E7C86')
    expect(evalResult.passes).toBe(true)
    expect(evalResult.message).toContain('Great contrast')
  })

  it('evaluates failing WCAG AA colors correctly for light colors', () => {
    const evalResult = getWcagEvaluation('#ffff00') // Yellow
    expect(evalResult.passes).toBe(false)
    expect(evalResult.message).toContain('Low contrast')
  })

  it('calculates maximum contrast for pure black against white', () => {
    const ratio = calculateContrastRatio('#000000', '#ffffff')
    expect(ratio).toBeCloseTo(21.0, 0)
  })

  it('converts HSV to Hex and Hex to HSV reliably', () => {
    const hex = '#4F46E5'
    const hsv = hexToHsv(hex)
    const backToHex = hsvToHex(hsv.h, hsv.s, hsv.v)
    expect(backToHex.toUpperCase()).toBe(hex.toUpperCase())
  })
})
