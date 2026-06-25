// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/layout/Sidebar'
import TopBar  from './components/layout/TopBar'
import DataUpdates from './pages/DataUpdates'
import AIApprovals from './pages/AIApprovals'

import InductionPanel         from './pages/InductionPanel'
import DepotLayout            from './pages/DepotLayout'
import CleaningManagement     from './pages/CleaningManagement'
import BrandingExposure       from './pages/BrandingExposure'
import AlertsFleetHealth      from './pages/AlertsFleetHealth'
import InductionHistory       from './pages/InductionHistory'
import ResourceUtilisation    from './pages/ResourceUtilisation'
import DecisionExplainability from './pages/DecisionExplainability'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import UserManagement from './pages/UserManagement'
import SecurityCenter from './pages/SecurityCenter'
import ProtectedRoute from './components/auth/ProtectedRoute'

export default function App() {

  const { isAuthenticated } = useAuth()

if (!isAuthenticated) {
  return <Login />
}
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--depot-bg)' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64 min-w-0">
          <TopBar />
          <main
            className="flex-1 overflow-y-auto px-6 py-5 mt-14"
            style={{ background: 'var(--depot-bg)' }}
          >
            <Routes>
              <Route path="/"               element={<InductionPanel />} />
              <Route path="/depot"          element={<DepotLayout />} />
              <Route path="/cleaning"       element={<CleaningManagement />} />
              <Route path="/branding"       element={<BrandingExposure />} />
              <Route path="/alerts"         element={<AlertsFleetHealth />} />
              <Route path="/history"        element={<InductionHistory />} />
              <Route path="/resources"      element={<ResourceUtilisation />} />
              <Route path="/explainability" element={<DecisionExplainability />} />
              <Route path="/updates" element={<DataUpdates />} />
              <Route
  path="/users"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <UserManagement />
    </ProtectedRoute>
  }
/>
              <Route
  path="/approvals"
  element={
    <ProtectedRoute allowedRoles={['admin', 'operations']}>
      <AIApprovals />
    </ProtectedRoute>
  }
/>
              <Route
  path="/security"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <SecurityCenter />
    </ProtectedRoute>
  }
/>
            </Routes>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}