import React from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { dashboardStyles } from './Dashboard.styles'

export const EmptyState: React.FC = () => {
  return (
    <div style={dashboardStyles.emptyStateBox}>
      <div style={dashboardStyles.createIconCircle}>
        <AutoAwesomeIcon sx={{ fontSize: 24, color: palette.primary }} />
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: palette.ink,
          marginBottom: '8px',
        }}
      >
        {UI_STRINGS.dashboard.emptyTitle}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: palette.textSubtle,
          marginBottom: '20px',
          lineHeight: 1.5,
        }}
      >
        {UI_STRINGS.dashboard.emptySubtitle}
      </p>
      <Link to="/create" style={dashboardStyles.newSiteButton}>
        <AddIcon sx={{ fontSize: 18 }} />
        <span>{UI_STRINGS.dashboard.emptyCta}</span>
      </Link>
    </div>
  )
}
