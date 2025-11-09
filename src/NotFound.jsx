import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { addSystemLog } from './utils/systemLogs'

function NotFound() {
  const location = useLocation()

  useEffect(() => {
    // Log unauthorized admin access attempts
    if (location.pathname === '/admin' || location.pathname === '/login') {
      const timestamp = new Date().toLocaleString('tr-TR')
      const userAgent = navigator.userAgent
      const attemptInfo = {
        path: location.pathname,
        timestamp: timestamp,
        userAgent: userAgent,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language
      }

      addSystemLog(
        'warning',
        `⚠️ Yetkisiz erişim denemesi: ${location.pathname} | Tarayıcı: ${userAgent.substring(0, 50)}...`,
        'Bilinmeyen'
      )

      // Also store in a separate log for security tracking
      const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
      securityLogs.unshift({
        ...attemptInfo,
        id: Date.now()
      })
      if (securityLogs.length > 100) securityLogs.splice(100) // Keep last 100 attempts
      localStorage.setItem('securityLogs', JSON.stringify(securityLogs))

      console.warn('Unauthorized access attempt logged:', attemptInfo)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 animate-pulse relative z-10">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🚫</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-poppins">Sayfa Bulunamadı</h2>
          </div>
          
          <p className="text-gray-300 text-lg font-poppins mb-6">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold font-poppins text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound

