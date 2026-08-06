import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If token exists, try to fetch user info
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // We'll validate on first API call; for now just set token
    }
  }, [token])

  const login = async (username, password) => {
    setLoading(true)
    try {
      const res = await api.post('/api/login', { username, password })
      const { access_token, user: userData } = res.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/api/register', {
        username,
        email,
        password,
      })
      const { access_token, user: userData } = res.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      return { success: true, data: res.data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}