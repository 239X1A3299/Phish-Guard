import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../services/api'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, token, setUser } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If we have a token but no user, fetch user info
    if (token && !user) {
      api
        .get('/api/me')
        .then((res) => {
          setUser(res.data)
        })
        .catch(() => {
          console.error('Failed to fetch user info')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token, user, setUser])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader"></div>
      </div>
    )
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Admin only route
  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute