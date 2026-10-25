import React from 'react'
import { Link, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { palette } from '../constants/palette'
import { UI_STRINGS } from '../constants/strings'

export const CompanyPlaceholder: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: palette.textSubtle,
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '24px',
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <span>{UI_STRINGS.common.backToSites}</span>
      </Link>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: palette.ink,
          marginBottom: '8px',
        }}
      >
        Company Blog Hub
      </h1>
      <p style={{ color: palette.textSubtle, marginBottom: '32px' }}>
        Viewing brand portal: {id}
      </p>
    </div>
  )
}
