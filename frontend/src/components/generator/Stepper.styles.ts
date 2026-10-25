import type { CSSProperties } from 'react'
import { palette } from '../../constants/palette'

export const stepperStyles: Record<string, CSSProperties> = {
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepCircleActive: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: palette.primary,
    color: palette.surface,
  },
  stepCircleInactive: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 600,
    backgroundColor: palette.borderSubtle,
    color: palette.textSubtle,
  },
  stepLabelCompleted: {
    color: palette.success,
    fontWeight: 600,
    fontSize: '14px',
  },
  stepLabelActive: {
    color: palette.ink,
    fontWeight: 600,
    fontSize: '14px',
  },
  stepLabelInactive: {
    color: palette.textSubtle,
    fontWeight: 500,
    fontSize: '14px',
  },
  stepDivider: {
    width: '32px',
    height: '1px',
    backgroundColor: palette.hairline,
    margin: '0 4px',
  },
}
