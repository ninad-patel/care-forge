import React from 'react'
import { Link, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { UI_STRINGS } from '../constants/strings'
import { companyPlaceholderStyles } from './CompanyPlaceholder.styles'

export const CompanyPlaceholder: React.FC = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <div style={companyPlaceholderStyles.container}>
      <Link to="/" style={companyPlaceholderStyles.backLink}>
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <span>{UI_STRINGS.common.backToSites}</span>
      </Link>
      <h1 style={companyPlaceholderStyles.title}>Company Blog Hub</h1>
      <p style={companyPlaceholderStyles.subtitle}>
        Viewing brand portal: {id}
      </p>
    </div>
  )
}
