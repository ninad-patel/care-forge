import React from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME } from '../../constants/strings'
import { navbarStyles } from './Navbar.styles'

export const Navbar: React.FC = () => {
  return (
    <header style={navbarStyles.header}>
      <div style={navbarStyles.container}>
        <Link to="/" style={navbarStyles.brandGroup}>
          <div style={navbarStyles.logoBox}>C</div>
          <span style={navbarStyles.brandText}>{APP_NAME}</span>
        </Link>
      </div>
    </header>
  )
}
