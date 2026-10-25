import React from 'react'
import {
  createSkeletonBlock,
  generatorSkeletonStyles,
} from './GeneratorSkeleton.styles'

export const GeneratorSkeleton: React.FC = () => {
  return (
    <div className="skeleton-pulse">
      {/* Card 1: Brand Details Skeleton */}
      <div style={generatorSkeletonStyles.card}>
        <div style={generatorSkeletonStyles.sectionMargin}>
          <div style={createSkeletonBlock(140, 20, 6, 8)} />
          <div style={createSkeletonBlock(220, 14, 4)} />
        </div>

        {/* Company Name */}
        <div style={generatorSkeletonStyles.sectionMargin}>
          <div style={createSkeletonBlock(110, 14, 4, 8)} />
          <div style={createSkeletonBlock('100%', 44, 8)} />
        </div>

        {/* Logo Dropzone */}
        <div style={generatorSkeletonStyles.sectionMargin}>
          <div style={createSkeletonBlock(50, 14, 4, 8)} />
          <div style={createSkeletonBlock('100%', 120, 12)} />
        </div>

        {/* Brand Color */}
        <div style={generatorSkeletonStyles.sectionMargin}>
          <div style={createSkeletonBlock(90, 14, 4, 8)} />
          <div style={generatorSkeletonStyles.colorRow}>
            <div style={createSkeletonBlock(44, 44, 8)} />
            <div style={createSkeletonBlock(140, 44, 8)} />
            <div style={generatorSkeletonStyles.swatchesRow}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={createSkeletonBlock(28, 28, 9999)} />
              ))}
            </div>
          </div>
        </div>

        {/* Site Address */}
        <div>
          <div style={createSkeletonBlock(90, 14, 4, 8)} />
          <div style={createSkeletonBlock('100%', 44, 8)} />
        </div>
      </div>

      {/* Card 2: Blog Topics Skeleton */}
      <div style={generatorSkeletonStyles.card}>
        <div style={generatorSkeletonStyles.topicsHeaderRow}>
          <div>
            <div style={createSkeletonBlock(120, 20, 6, 8)} />
            <div style={createSkeletonBlock(240, 14, 4)} />
          </div>
          <div style={createSkeletonBlock(110, 26, 100)} />
        </div>

        {/* Topic Rows */}
        {[1, 2, 3].map((row) => (
          <div key={row} style={generatorSkeletonStyles.topicSkeletonRow}>
            <div style={createSkeletonBlock(28, 28, 9999)} />
            <div style={createSkeletonBlock('100%', 44, 8)} />
            <div style={createSkeletonBlock(28, 28, 6)} />
          </div>
        ))}

        <div style={generatorSkeletonStyles.addTopicSkeleton}>
          <div style={createSkeletonBlock('100%', 44, 8)} />
        </div>
      </div>
    </div>
  )
}
