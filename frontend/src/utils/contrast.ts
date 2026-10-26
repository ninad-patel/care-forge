/**
 * Pure utility functions for calculating WCAG relative luminance, contrast ratios, and HSV color conversions.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.trim().replace(/^#/, '')
  let fullHex = cleanHex

  if (cleanHex.length === 3) {
    fullHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  if (fullHex.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(fullHex)) {
    return null
  }

  const num = parseInt(fullHex, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const s = val / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function calculateContrastRatio(hex: string, backgroundHex = '#ffffff'): number {
  const rgb1 = hexToRgb(hex)
  const rgb2 = hexToRgb(backgroundHex)

  if (!rgb1 || !rgb2) return 1.0

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  const ratio = (lighter + 0.05) / (darker + 0.05)
  return Math.round(ratio * 10) / 10
}

export interface WcagEvaluation {
  passes: boolean
  ratio: number
  message: string
}

export function getWcagEvaluation(hexColor: string): WcagEvaluation {
  const ratio = calculateContrastRatio(hexColor, '#ffffff')
  const passes = ratio >= 4.5

  if (passes) {
    return {
      passes: true,
      ratio,
      message: `Great contrast — white text on this colour passes WCAG AA (${ratio} : 1).`,
    }
  }

  return {
    passes: false,
    ratio,
    message: `Low contrast (${ratio} : 1) — white text on this colour fails WCAG AA.`,
  }
}

export interface HsvColor {
  h: number // 0 - 360
  s: number // 0 - 1
  v: number // 0 - 1
}

export function hexToHsv(hex: string): HsvColor {
  const rgb = hexToRgb(hex)
  if (!rgb) return { h: 184, s: 0.887, v: 0.525 } // fallback #0E7C86

  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else {
      h = (r - g) / delta + 4
    }
    h = h * 60
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : delta / max
  const v = max

  return { h, s, v }
}

export function hsvToHex(h: number, s: number, v: number): string {
  const hNorm = ((h % 360) + 360) % 360
  const sNorm = Math.max(0, Math.min(1, s))
  const vNorm = Math.max(0, Math.min(1, v))

  const c = vNorm * sNorm
  const x = c * (1 - Math.abs(((hNorm / 60) % 2) - 1))
  const m = vNorm - c

  let rPrime = 0
  let gPrime = 0
  let bPrime = 0

  if (hNorm < 60) {
    rPrime = c
    gPrime = x
  } else if (hNorm < 120) {
    rPrime = x
    gPrime = c
  } else if (hNorm < 180) {
    gPrime = c
    bPrime = x
  } else if (hNorm < 240) {
    gPrime = x
    bPrime = c
  } else if (hNorm < 300) {
    rPrime = x
    bPrime = c
  } else {
    rPrime = c
    bPrime = x
  }

  const r = Math.round((rPrime + m) * 255)
  const g = Math.round((gPrime + m) * 255)
  const b = Math.round((bPrime + m) * 255)

  const toHex = (n: number) => n.toString(16).padStart(2, '0').toUpperCase()
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function getContrastTextColor(bgHex: string): string {
  const ratio = calculateContrastRatio(bgHex, '#ffffff')
  return ratio >= 3.0 ? '#ffffff' : '#111827'
}

export function hexToRgba(hex: string, alpha = 0.08): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(14, 124, 134, ${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}
