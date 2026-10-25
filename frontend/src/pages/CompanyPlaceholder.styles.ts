import type { CSSProperties } from 'react'
import { palette } from '../constants/palette'

export const companyPlaceholderStyles: Record<string, CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: palette.textSubtle,
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '24px',
    textDecoration: 'none',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: palette.ink,
    marginBottom: '8px',
  },
  subtitle: {
    color: palette.textSubtle,
    marginBottom: '32px',
  },
}
