import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

function ScanResultPage() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/api/scan/${id}`)
        setResult(res.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load scan result')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      const res = await api.get(`/api/report/${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `phishshield_report_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('PDF report downloaded!')
    } catch (err) {
      toast.error('Failed to download PDF report')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const getRiskStyles = (riskLevel) => {
    const level = riskLevel?.toLowerCase()
    switch (level) {
      case 'safe':
        return {
          badge: 'bg-green-500/10 text-green-500 border-green-500/30',
          text: 'text-green-500',
          bar: 'bg-green-500',
          bg: 'bg-green-500/5 border-green-500/20',
        }
      case 'suspicious':
        return {
          badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
          text: 'text-yellow-500',
          bar: 'bg-yellow-500',
          bg: 'bg-yellow-500/5 border-yellow-500/20',
        }
      case 'phishing':
        return {
          badge: 'bg-red-500/10 text-red-500 border-red-500/30',
          text: 'text-red-500',
          bar: 'bg-red-500',
          bg: 'bg-red-500/5 border-red-500/20',
        }
      default:
        return {
          badge: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
          text: 'text-gray-500',
          bar: 'bg-gray-500',
          bg: 'bg-gray-500/5 border-gray-500/20',
        }
    }
  }

  const formatFeatureName = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const renderFeatureValue = (key, value) => {
    const booleanKeys = [
      'uses_https',
      'has_ip_address',
      'has_at_symbol',
      'has_hyphen',
      'has_suspicious_tld',
      'is_shortened',
      'has_dns_record',
      'has_valid_ssl',
      'has_whois',
      'has_hex_chars',
      'has_encoded_chars',
    ]
    if (booleanKeys.includes(key)) {
      return value ? 'Yes' : 'No'
    }
    if (Array.isArray(value)) return value.join(', ')
    return String(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="loader"></div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="card p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error || 'Scan result not found'}</p>
          <Link to="/history" className="btn-primary">Back to History</Link>
        </div>
      </div>
    )
  }

  const styles = getRiskStyles(result.prediction)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Scan Report
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Detailed analysis for {result.url}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link to="/history" className="btn-secondary">← Back</Link>
          <button onClick={handleDownloadPdf} disabled={downloadingPdf} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {downloadingPdf ? 'Downloading...' : '⬇️ Download PDF'}
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className={`card p-6 mb-6 ${styles.bg}`}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Risk Gauge */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" strokeWidth="12" className="stroke-navy-200 dark:stroke-navy-700" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                className={`${styles.bar} transition-all duration-1000`}
                strokeDasharray={`${(result.risk_score / 100) * 439.8} 439.8`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${styles.text}`}>{result.risk_score}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Risk Score</span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${styles.badge}`}>
                {result.prediction?.toLowerCase() === 'safe' ? '✅' : result.prediction?.toLowerCase() === 'suspicious' ? '⚠️' : '🚨'} {result.prediction?.toUpperCase()}
              </span>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-neon-500/10 border border-neon-500/30 text-sm font-semibold text-neon-500">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">URL: </span>
                <span className="break-all">{result.url}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Scanned: </span>
                {new Date(result.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Risk Level: </span>
                <span className={styles.text}>{result.prediction}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Problems */}
      {result.detected_problems?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-red-500">⚠️</span> Detected Problems
          </h3>
          <ul className="space-y-2">
            {result.detected_problems.map((problem, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="text-red-500 flex-shrink-0 mt-0.5">•</span>
                {problem}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>🛡️</span> Security Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span className="text-neon-500 flex-shrink-0 mt-0.5">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feature Analysis */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Feature Analysis
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(result.features || {}).map(([key, value]) => (
            <div key={key} className="p-3 rounded-lg bg-gray-50 dark:bg-navy-800 border border-gray-200 dark:border-navy-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {formatFeatureName(key)}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {renderFeatureValue(key, value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ScanResultPage