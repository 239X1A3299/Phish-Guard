import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'

function AdminPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats')
        setStats(res.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load admin dashboard')
        toast.error('Failed to load admin dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const toggleUserActive = async (user) => {
    setUpdatingId(user.id)
    try {
      const res = await api.patch(`/api/admin/users/${user.id}`, {
        is_active: !user.is_active,
      })
      setStats((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === user.id ? res.data : u)),
      }))
      toast.success(`User ${user.username} ${res.data.is_active ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user')
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleUserAdmin = async (user) => {
    setUpdatingId(user.id)
    try {
      const res = await api.patch(`/api/admin/users/${user.id}`, {
        is_admin: !user.is_admin,
      })
      setStats((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === user.id ? res.data : u)),
      }))
      toast.success(`User ${user.username} admin role updated`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update user')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">{error || 'Admin access required'}</p>
        </div>
      </div>
    )
  }

  const totalScans = stats.scan_distribution?.Safe + stats.scan_distribution?.Suspicious + stats.scan_distribution?.Phishing || 0
  const safePct = totalScans ? Math.round((stats.scan_distribution.Safe / totalScans) * 100) : 0
  const suspiciousPct = totalScans ? Math.round((stats.scan_distribution.Suspicious / totalScans) * 100) : 0
  const phishingPct = totalScans ? Math.round((stats.scan_distribution.Phishing / totalScans) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          System overview and user management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-500/10 flex items-center justify-center text-neon-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
          <div className="text-xs text-neon-500 mt-1">{stats.active_users} active</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-neon-500/10 flex items-center justify-center text-neon-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_scans}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Scans</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scans_today}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Scans Today</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalScans}</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Classified</div>
        </div>
      </div>

      {/* Scan Distribution */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          📊 Scan Distribution
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-500 font-medium">Safe</span>
              <span className="text-gray-500 dark:text-gray-400">{safePct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-navy-800">
              <div className="h-2 rounded-full bg-green-500 transition-all duration-1000" style={{ width: `${safePct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-500 font-medium">Suspicious</span>
              <span className="text-gray-500 dark:text-gray-400">{suspiciousPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-navy-800">
              <div className="h-2 rounded-full bg-yellow-500 transition-all duration-1000" style={{ width: `${suspiciousPct}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-500 font-medium">Phishing</span>
              <span className="text-gray-500 dark:text-gray-400">{phishingPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-navy-800">
              <div className="h-2 rounded-full bg-red-500 transition-all duration-1000" style={{ width: `${phishingPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          👥 User Management
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-navy-700">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Registered</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-navy-800">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-gray-900 dark:text-white">{user.username}</span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="py-3 pr-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      user.is_active
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {user.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      user.is_admin
                        ? 'bg-neon-500/10 text-neon-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleUserActive(user)}
                        disabled={updatingId === user.id}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-800 disabled:opacity-50 transition-colors"
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => toggleUserAdmin(user)}
                        disabled={updatingId === user.id}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-neon-500/30 text-neon-500 bg-neon-500/5 hover:bg-neon-500/10 disabled:opacity-50 transition-colors"
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminPage