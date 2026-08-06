function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 border-t border-navy-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neon-500 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-300">
              PhishShield <span className="text-neon-400">·</span> AI-Based Phishing Detection
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © {year} PhishShield. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <a href="/api/docs" target="_blank" rel="noreferrer" className="hover:text-neon-400 transition-colors">
              API Docs
            </a>
            <span>·</span>
            <span>Privacy</span>
            <span>·</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer