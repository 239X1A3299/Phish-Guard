import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pie, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/dashboard')
        setStats(res.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/scanner" className="btn-primary">Go to Scanner</Link>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Scans',
      value: stats?.total_scans || 0,
      icon: '🔍',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Safe URLs',
      value: stats?.safe_urls || 0,
      icon: '✅',
      color: 'text-neon-400',
      bg: 'bg-neon-500/10',
    },
    {
      label: 'Suspicious',
      value: stats?.suspicious_urls || 0,
      icon: '⚠️',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      label: 'Phishing',
      value: stats?.phishing_urls || 0,
      icon: '🚨',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ]

  const pieData = {
    labels: ['Safe', 'Suspicious', 'Phishing'],
    datasets: [
      {
        data: [
          stats?.safe_urls || 0,
          stats?.suspicious_urls || 0,
          stats?.phishing_urls || 0,
        ],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderColor: ['#166534', '#854d0e', '#7f1d1d'],
        borderWidth: 2,
      },
    ],
  }

  const barData = {
    labels: ['Safe', 'Suspicious', 'Phishing'],
    datasets: [
      {
        label: 'URL Count',
        data: [
          stats?.safe_urls || 0,
          stats?.suspicious_urls || 0,
          stats?.phishing_urls || 0,
        ],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af',
        },
      },
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Security Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.username}! Here's your security overview.
          </p>
        </div>
        <Link to="/scanner" className="btn-primary mt-4 md:mt-0">
          New Scan
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="card p-6">
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center text-2xl mb-4`}>
              {card.icon}
            </div>
            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Risk Distribution</h2>
          <div className="h-64">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">URL Analysis</h2>
          <div className="h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link to="/history" className="text-sm text-neon-500 hover:text-neon-400">
            View All
          </Link>
        </div>
        {stats?.recent_scans?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_scans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      scan.prediction === 'Safe'
                        ? 'bg-green-500'
                        : scan.prediction === 'Suspicious'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                      {scan.url}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(scan.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scan.prediction === 'Safe'
                        ? 'bg-green-500/10 text-green-500'
                        : scan.prediction === 'Suspicious'
                        ? 'bg-yellow-500/10 text-yellow-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {scan.prediction}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {scan.risk_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No scans yet</p>
            <Link to="/scanner" className="btn-primary">
              Start Your First Scan
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage