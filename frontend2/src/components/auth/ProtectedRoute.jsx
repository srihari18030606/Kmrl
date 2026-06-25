import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--depot-bg)' }}
      >
        <div className="panel p-8 text-center">
          <h2
            className="font-display text-xl font-bold mb-3"
            style={{ color: 'var(--depot-red)' }}
          >
            ACCESS DENIED
          </h2>

          <p style={{ color: 'var(--depot-muted)' }}>
            You do not have permission to access this module.
          </p>
        </div>
      </div>
    )
  }

  return children
}