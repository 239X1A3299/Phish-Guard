import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'

function ScannerPage() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const trimmedUrl = url.trim()
    if (!trimmedUrl) {
      toast.error('Please enter a URL to scan')
      return
    }

    // Basic URL format validation
    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/
    if (!urlRegex.test(trimmedUrl)) {
      toast.error('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    setScanning(true)
    setError(null)
    setResult(null)

    try {
      const res = await api.post('/api/scan', { url: trimmedUrl })
      setResult(res.data)
      toast.success('Scan completed successfully!')
    } catch (err) {
      const message = err.response?.data?.detail || 'Scan failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setScanning(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!result?.id) return
    setDownloadingPdf(true)
    try {
      const res = await api.get(`/api/report/${result.id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `phishshield_report_${result.id}.pdf`)
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          URL <span className="gradient-text">Security Scanner</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Enter any URL to analyze it with our AI-powered phishing detection system
        </p>
      </div>

      {/* Scanner Input */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input-field pl-12"
                placeholder="https://example.com"
                disabled={scanning}
              />
            </div>
            <button
              type="submit"
              disabled={scanning || !url.trim()}
              className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {scanning ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scanning...
                </span>
              ) : (
                'Scan URL'
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Example: try{' '}
          <button
            type="button"
            onClick={() => setUrl('http://paypal.com.login-verify.secure-update.net')}
            className="text-neon-500 hover:text-neon-400"
          >
            paypal.com.login-verify.secure-update.net
          </button>
        </p>
      </form>

      {/* Scanning Animation */}
      {scanning && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-navy-200 dark:border-navy-700" />
              <div className="absolute inset-0 rounded-full border-4 border-neon-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">🔍</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Analyzing URL...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Our AI is extracting features and running the machine learning model
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              {['Extracting URL features', 'Checking DNS records', 'Analyzing SSL certificate', 'Running ML model', 'Generating report'].map((step, i) => (
                <div key={step} className="flex items-center space-x-3 text-sm">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      i < 4
                        ? 'border-neon-500 bg-neon-500/10'
                        : 'border-navy-300 dark:border-navy-600'
                    }`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    {i < 4 ? (
                      <svg className="w-3 h-3 text-neon-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !scanning && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="card p-6 bg-red-500/5 border-red-500/20 text-center">
            <div className="text-4xl mb-3">❌</div>
            <h3 className="text-lg font-semibold text-red-500 mb-2">Scan Failed</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <button onClick={() => setError(null)} className="btn-secondary">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !scanning && (
        <div className="space-y-6 animate-slide-up">
          {/* Prediction Card */}
          <div className={`card p-6 ${getRiskStyles(result.prediction).bg}`}>
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
                    className={`${getRiskStyles(result.prediction).bar} transition-all duration-1000`}
                    strokeDasharray={`${(result.risk_score / 100) * 439.8} 439.8`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getRiskStyles(result.prediction).text}`}>
                    {result.risk_score}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Risk Score</span>
                </div>
              </div>

              {/* Result Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-all">
                    {result.url}
                  </h2>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${getRiskStyles(result.prediction).badge}`}>
                    {result.prediction?.toLowerCase() === 'safe' ? '✅' : result.prediction?.toLowerCase() === 'suspicious' ? '⚠️' : '🚨'} {result.prediction?.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-neon-500/10 border border-neon-500/30 text-sm font-semibold text-neon-500">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Risk Level: <span className={`font-semibold ${getRiskStyles(result.prediction).text}`}>{result.prediction}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={`/scan-result/${result.id}`} className="btn-primary">
              📄 View Full Report
            </Link>
            <button onClick={handleDownloadPdf} disabled={downloadingPdf} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
              {downloadingPdf ? 'Downloading...' : '⬇️ Download PDF'}
            </button>
          </div>

          {/* Detected Problems */}
          {result.detected_problems?.length > 0 && (
            <div className="card p-6">
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
            <div className="card p-6">
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
      )}
    </div>
  )
}

export default ScannerPage