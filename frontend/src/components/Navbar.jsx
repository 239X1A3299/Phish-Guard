import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { user, logout } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/scanner', label: 'Scanner' },
    ...(user
      ? [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/history', label: 'History' },
        ]
      : []),
    ...(user?.is_admin
      ? [{ path: '/admin', label: 'Admin' }]
      : []),
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="bg-navy-950/90 dark:bg-navy-950/90 backdrop-blur-md border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neon-500 rounded-lg flex items-center justify-center shadow-neon">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              Phish<span className="text-neon-400">Shield</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-neon-500/10 text-neon-400'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Auth buttons */}
            {user ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700">
                  <div className="w-7 h-7 rounded-full bg-neon-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium text-white">{user.username}</div>
                    <div className="text-[10px] text-neon-400">{user.is_admin ? 'Admin' : 'User'}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-neon-500 hover:bg-neon-400 text-white shadow-neon transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-800"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-navy-800 bg-navy-950/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-neon-500/10 text-neon-400'
                    : 'text-gray-300 hover:text-white hover:bg-navy-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-navy-800">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 text-sm text-gray-400">
                    Signed in as <span className="text-white font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-navy-800 text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-neon-500 hover:bg-neon-400 text-white text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar