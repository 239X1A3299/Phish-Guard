import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

function HistoryPage() {
  const [scans, setScans] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (search) params.search = search
      if (status) params.status = status

      const res = await api.get('/api/history', { params })
      setScans(res.data.scans)
      setTotal(res.data.total)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, status])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const handleStatusFilter = (value) => {
    setPage(1)
    setStatus(value)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // Fetch all data for export (no pagination)
      const params = {}
      if (search) params.search = search
      if (status) params.status = status

      const res = await api.get('/api/history/export', { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'scan_history.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('History exported successfully!')
    } catch (err) {
      toast.error('Failed to export history')
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const getPredictionStyles = (prediction) => {
    const p = prediction?.toLowerCase()
    if (p === 'safe') {
      return 'bg-green-500/10 text-green-500'
    } else if (p === 'suspicious') {
      return 'bg-yellow-500/10 text-yellow-500'
    } else {
      return 'bg-red-500/10 text-red-500'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Scan History
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and manage all your URL scans
          </p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="btn-secondary mt-4 md:mt-0">
          {exporting ? 'Exporting...' : '⬇️ Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by URL..."
              />
            </div>
          </form>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !status
                  ? 'bg-neon-500 text-white'
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('Safe')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'Safe'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
              }`}
            >
              Safe
            </button>
            <button
              onClick={() => handleStatusFilter('Suspicious')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'Suspicious'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
              }`}
            >
              Suspicious
            </button>
            <button
              onClick={() => handleStatusFilter('Phishing')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === 'Phishing'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-navy-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-navy-700'
              }`}
            >
              Phishing
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="loader"></div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No scans found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {search || status ? 'Try adjusting your search or filters' : 'Start scanning URLs to see them here'}
            </p>
            <Link to="/scanner" className="btn-primary">
              Go to Scanner
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prediction</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confidence</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Risk Score</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan.id} className="border-b border-gray-100 dark:border-navy-800 hover:bg-gray-50 dark:hover:bg-navy-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white max-w-[200px] lg:max-w-sm truncate">
                        {scan.url}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPredictionStyles(scan.prediction)}`}>
                        {scan.prediction}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {(scan.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${
                        scan.risk_score <= 33 ? 'text-green-500' : scan.risk_score <= 66 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {scan.risk_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/scan-result/${scan.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg bg-neon-500/10 text-neon-500 hover:bg-neon-500/20 transition-colors"
                      >
                        View Report
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && scans.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-navy-800 border-t border-gray-200 dark:border-navy-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * pageSize, total)}</span> of{' '}
              <span className="font-medium">{total}</span> scans
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors"
              >
                ← Prev
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage