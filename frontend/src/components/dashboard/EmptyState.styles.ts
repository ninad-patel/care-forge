import type { CSSProperties } from 'react'
import { palette } from '../../constants/palette'

export const emptyStateStyles: Record<string, CSSProperties> = {
  emptyStateBox: {
    backgroundColor: palette.surface,
    borderRadius: '16px',
    border: `1px solid ${palette.hairline}`,
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '480px',
    margin: '40px auto 0',
  },
  iconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: palette.primarySoft,
    color: palette.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: palette.ink,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: palette.textSubtle,
    marginBottom: '20px',
    lineHeight: 1.5,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: palette.primary,
    color: palette.surface,
    fontSize: '14px',
    fontWeight: 500,
    padding: '10px 20px',
    borderRadius: '100px',
    textDecoration: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.15s ease',
  },
}
