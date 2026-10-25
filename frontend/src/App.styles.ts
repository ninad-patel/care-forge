import type { CSSProperties } from 'react'

export const appStyles: Record<string, CSSProperties> = {
  appWrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
  },
}
