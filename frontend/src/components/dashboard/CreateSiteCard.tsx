import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import { palette } from '../../constants/palette'
import { UI_STRINGS } from '../../constants/strings'
import { dashboardStyles } from './Dashboard.styles'

export const CreateSiteCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false)

  const cardStyle: React.CSSProperties = {
    ...dashboardStyles.createCard,
    ...(isHovered
      ? {
          borderColor: palette.primary,
          backgroundColor: palette.primaryTint,
          transform: 'translateY(-2px)',
        }
      : {}),
  }

  const iconCircleStyle: React.CSSProperties = {
    ...dashboardStyles.createIconCircle,
    ...(isHovered
      ? {
          backgroundColor: palette.primary,
          color: palette.surface,
        }
      : {}),
  }

  return (
    <Link
      to="/create"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={iconCircleStyle}>
        <AddIcon sx={{ fontSize: 28 }} />
      </div>
      <div style={dashboardStyles.createTitle}>
        {UI_STRINGS.dashboard.createCardTitle}
      </div>
      <div style={dashboardStyles.createSubtitle}>
        {UI_STRINGS.dashboard.createCardSubtitle}
      </div>
    </Link>
  )
}
