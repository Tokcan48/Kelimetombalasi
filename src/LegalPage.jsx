import { useParams, Link, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { getSiteContent } from './utils/siteContent'
import { SECURE_LOGIN_URL } from './App'
import { setPageMeta } from './utils/seo'

function LegalPage() {
  const { page } = useParams()
  const location = useLocation()
  const content = getSiteContent()
  
  // Determine which page to show based on the URL
  const pageName = page || location.pathname.replace('/', '')
  const pageContent = content.legalPages[pageName]

  // Set SEO meta tags
  useEffect(() => {
    const titles = {
      privacy: 'Gizlilik Politikası - Kelime Tombalası',
      terms: 'Kullanım Koşulları - Kelime Tombalası'
    }
    const descriptions = {
      privacy: 'Kelime Tombalası gizlilik politikası. Kişisel verilerinizin korunması ve gizlilik haklarınız hakkında bilgi.',
      terms: 'Kelime Tombalası kullanım koşulları. Platform kullanımı, kullanıcı hakları ve sorumlulukları hakkında bilgi.'
    }
    
    setPageMeta({
      title: titles[pageName] || 'Yasal Sayfalar - Kelime Tombalası',
      description: descriptions[pageName] || 'Kelime Tombalası yasal sayfaları',
      path: location.pathname,
      robots: 'index, follow'
    })
  }, [location.pathname, pageName])

  // Check for maintenance mode
  if (content.siteStatus === 'maintenance') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-poppins mb-4">Site Bakımda</h1>
          <p className="text-gray-300 font-poppins mb-6">{content.maintenanceMessage}</p>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-poppins">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span>Sistem güncellemesi yapılıyor...</span>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-gray-500 text-xs font-poppins">
              Admin? <Link to={SECURE_LOGIN_URL} className="text-blue-400 hover:text-blue-300 underline">Buraya tıklayın</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  if (!pageContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sayfa Bulunamadı</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">Ana Sayfaya Dön</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-poppins">{content.siteTitle}</h1>
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all font-poppins text-sm font-semibold border border-white/20"
            >
              ← Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 font-poppins">
            {pageContent.title}
          </h2>
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 font-poppins leading-relaxed whitespace-pre-wrap">
              {pageContent.content}
            </div>
          </div>
          
          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-poppins text-sm">{content.copyright}</p>
        </div>
      </footer>
    </div>
  )
}

export default LegalPage

