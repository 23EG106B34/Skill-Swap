import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getUsers, getMarketplaceSkills, toApiError } from './api'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import SkillsPage from './pages/SkillsPage'
import MarketplacePage from './pages/MarketplacePage'
import RequestsPage from './pages/RequestsPage'
import CommunityPage from './pages/CommunityPage'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [flash, setFlash] = useState({ type: '', text: '' })
  const [publicDataVersion, setPublicDataVersion] = useState(0)

  const notify = (type, text) => {
    setFlash({ type, text })
  }

  useEffect(() => {
    if (!flash.text) {
      return undefined
    }
    const id = window.setTimeout(() => setFlash({ type: '', text: '' }), 4200)
    return () => window.clearTimeout(id)
  }, [flash])

  const handleLogout = () => {
    setCurrentUser(null)
    notify('success', 'Logged out successfully.')
  }

  const handleDataChange = () => {
    setPublicDataVersion((prev) => prev + 1)
  }

  return (
    <BrowserRouter>
      <Layout currentUser={currentUser} onLogout={handleLogout}>
        {flash.text ? <div className={`flash ${flash.type}`}>{flash.text}</div> : null}

        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route
            path="/auth"
            element={<AuthPage onLogin={setCurrentUser} notify={notify} />}
          />
          <Route
            path="/dashboard"
            element={<DashboardPage currentUser={currentUser} notify={notify} />}
          />
          <Route
            path="/skills"
            element={
              <SkillsPage
                currentUser={currentUser}
                notify={notify}
                onDataChange={handleDataChange}
              />
            }
          />
          <Route
            path="/marketplace"
            element={<MarketplacePage currentUser={currentUser} notify={notify} refreshKey={publicDataVersion} />}
          />
          <Route
            path="/requests"
            element={
              <RequestsPage
                currentUser={currentUser}
                notify={notify}
                onDataChange={handleDataChange}
              />
            }
          />
          <Route
            path="/community"
            element={<CommunityPage currentUser={currentUser} notify={notify} />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App