import type { CSSProperties } from 'react'
import { palette } from '../../constants/palette'

export const navbarStyles: Record<string, CSSProperties> = {
  header: {
    backgroundColor: palette.surface,
    borderBottom: `1px solid ${palette.hairline}`,
    position: 'sticky',
    top: 0,
    zIndex: 50,
    width: '100%',
  },
  container: {
    width: '100%',
    padding: '0 32px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    color: 'inherit',
  },
  logoBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: palette.primary,
    color: palette.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '18px',
    letterSpacing: '-0.5px',
    boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
  },
  brandText: {
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '-0.4px',
    color: palette.ink,
  },
}
