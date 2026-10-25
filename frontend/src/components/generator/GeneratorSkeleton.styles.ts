import type { CSSProperties } from 'react'
import { palette } from '../../constants/palette'

export const generatorSkeletonStyles: Record<string, CSSProperties> = {
  card: {
    backgroundColor: palette.surface,
    borderRadius: '16px',
    border: `1px solid ${palette.hairline}`,
    padding: '28px',
    marginBottom: '24px',
  },
  sectionMargin: {
    marginBottom: '24px',
  },
  colorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  swatchesRow: {
    display: 'flex',
    gap: '8px',
  },
  topicsHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  topicSkeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  addTopicSkeleton: {
    marginTop: '16px',
  },
}

export const createSkeletonBlock = (
  width: string | number,
  height: number,
  radius = 8,
  extraMarginBottom = 0
): CSSProperties => ({
  width,
  height: `${height}px`,
  borderRadius: `${radius}px`,
  backgroundColor: '#f3f4f6',
  marginBottom: extraMarginBottom ? `${extraMarginBottom}px` : undefined,
})
