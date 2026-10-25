import React from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { emptyStateStyles } from './EmptyState.styles'

export const EmptyState: React.FC = () => {
  return (
    <div style={emptyStateStyles.emptyStateBox}>
      <div style={emptyStateStyles.iconCircle}>
        <AutoAwesomeIcon sx={{ fontSize: 24, color: palette.primary }} />
      </div>
      <h3 style={emptyStateStyles.title}>
        {UI_STRINGS.dashboard.emptyTitle}
      </h3>
      <p style={emptyStateStyles.subtitle}>
        {UI_STRINGS.dashboard.emptySubtitle}
      </p>
      <Link to="/create" style={emptyStateStyles.ctaButton}>
        <AddIcon sx={{ fontSize: 18 }} />
        <span>{UI_STRINGS.dashboard.emptyCta}</span>
      </Link>
    </div>
  )
}
