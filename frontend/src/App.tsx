import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { appStyles } from './App.styles'
import { Navbar } from './components/layout/Navbar'
import { CompanyPlaceholder } from './pages/CompanyPlaceholder'
import { DashboardPage } from './pages/DashboardPage'
import { GeneratorPage } from './pages/GeneratorPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={appStyles.appWrapper}>
        <Navbar />
        <main style={appStyles.mainContent}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/create" element={<GeneratorPage />} />
            <Route path="/company/:id" element={<CompanyPlaceholder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
