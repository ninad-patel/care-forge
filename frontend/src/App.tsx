import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { appStyles } from './App.styles'
import { Navbar } from './components/layout/Navbar'
import { BlogHubPage } from './pages/BlogHubPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { DashboardPage } from './pages/DashboardPage'
import { GeneratorPage } from './pages/GeneratorPage'

const PlatformLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div style={appStyles.appWrapper}>
      <Navbar />
      <main style={appStyles.mainContent}>{children}</main>
    </div>
  )
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PlatformLayout>
              <DashboardPage />
            </PlatformLayout>
          }
        />
        <Route
          path="/create"
          element={
            <PlatformLayout>
              <GeneratorPage />
            </PlatformLayout>
          }
        />
        <Route path="/company/:brandId" element={<BlogHubPage />} />
        <Route path="/company/:brandId/:slug" element={<BlogPostPage />} />
        <Route path="/sites/:brandId" element={<BlogHubPage />} />
        <Route path="/sites/:brandId/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
