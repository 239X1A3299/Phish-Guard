import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function LandingPage() {
  const { user } = useAuth()

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning models analyze URL patterns to detect phishing attempts with high accuracy.',
    },
    {
      icon: '🔍',
      title: 'Real-Time Scanning',
      description: 'Scan any URL instantly and get immediate security analysis with detailed feature extraction.',
    },
    {
      icon: '📊',
      title: 'Security Score',
      description: 'Get a comprehensive 0-100 risk score with clear risk levels: Safe, Suspicious, or Phishing.',
    },
    {
      icon: '📄',
      title: 'PDF Reports',
      description: 'Generate professional PDF security reports with full feature analysis and recommendations.',
    },
    {
      icon: '🛡️',
      title: 'Multi-Layer Analysis',
      description: 'Analyzes 18+ URL features including domain age, DNS records, SSL certificates, and more.',
    },
    {
      icon: '📈',
      title: 'Model Comparison',
      description: 'Compare Random Forest, XGBoost, SVM, and more to find the best performing detection model.',
    },
  ]

  const stats = [
    { value: '18+', label: 'URL Features' },
    { value: '5', label: 'ML Models' },
    { value: '99%', label: 'Accuracy' },
    { value: '24/7', label: 'Protection' },
  ]

  const steps = [
    { num: '01', title: 'Create Account', desc: 'Register for free to start scanning URLs' },
    { num: '02', title: 'Enter URL', desc: 'Paste any website URL into the scanner' },
    { num: '03', title: 'Get Analysis', desc: 'Receive instant AI-powered security verdict' },
    { num: '04', title: 'Stay Protected', desc: 'Track history and generate PDF reports' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/30 mb-6">
              <span className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
              <span className="text-sm text-neon-300 font-medium">AI-Based Website Phishing Detection</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Detect Phishing
              <br />
              <span className="gradient-text">Before It's Too Late</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              PhishShield uses advanced machine learning to analyze URLs in real-time,
              protecting you from sophisticated phishing attacks with industry-leading accuracy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to={user ? '/scanner' : '/register'}
                className="btn-primary text-lg px-8 py-3"
              >
                {user ? 'Scan a URL' : 'Get Started Free'}
              </Link>
              <Link
                to="/scanner"
                className="btn-secondary text-lg px-8 py-3"
              >
                Try Scanner
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl bg-white/5 border border-navy-700 backdrop-blur-sm">
                  <div className="text-2xl md:text-3xl font-bold text-neon-400">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced <span className="gradient-text">Security Features</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to identify and protect against phishing websites
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-xl bg-navy-900 border border-navy-700 hover:border-neon-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-navy-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400">Get protected in four simple steps</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="text-5xl font-bold text-neon-500/20 mb-4">{step.num}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
                {step.num !== '04' && (
                  <div className="hidden md:block absolute top-8 right-[-1rem] w-8 h-px bg-navy-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 border border-neon-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-500 to-transparent" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Stay <span className="gradient-text">Protected?</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join PhishShield today and get access to real-time AI-powered phishing detection
            </p>
            <Link
              to={user ? '/scanner' : '/register'}
              className="btn-primary text-lg px-10 py-3"
            >
              {user ? 'Start Scanning' : 'Create Free Account'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage