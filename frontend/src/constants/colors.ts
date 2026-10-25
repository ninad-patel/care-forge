export interface PresetColor {
  hex: string
  label: string
}

export const PRESET_COLORS: PresetColor[] = [
  { hex: '#0E7C86', label: 'Teal' },
  { hex: '#4F46E5', label: 'Indigo' },
  { hex: '#D946EF', label: 'Magenta' },
  { hex: '#EA580C', label: 'Orange' },
  { hex: '#059669', label: 'Emerald' },
  { hex: '#111827', label: 'Dark Slate' },
]

export const DEFAULT_BRAND_COLOR = '#0E7C86'
