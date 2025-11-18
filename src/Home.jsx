import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { getRealAnalytics, subscribeToTotalPDFCount } from './utils/analytics'
import { getSiteContent } from './utils/siteContent'
import { getAdSenseSettings } from './utils/adsense'
import { getBrandingSettings, updateFavicon } from './utils/branding'
import { SECURE_LOGIN_URL } from './App'

function Home() {
  const [stats, setStats] = useState({
    estimatedUsers: 0,
    totalPDFs: 0,
    totalWords: 0
  })

  const [content, setContent] = useState(getSiteContent())
  const [adsenseSettings, setAdsenseSettings] = useState(getAdSenseSettings())
  const [branding, setBranding] = useState(getBrandingSettings())

  useEffect(() => {
    // Load analytics from Firebase (real-time)
    const loadAnalytics = async () => {
      try {
        const analytics = await getRealAnalytics()
        setStats({
          estimatedUsers: analytics.estimatedUsers,
          totalPDFs: analytics.totalPDFs,
          totalWords: analytics.totalWords
        })
      } catch (error) {
        console.error('Analytics yüklenirken hata:', error)
      }
    }
    
    loadAnalytics()
    
    // Real-time listener for total PDF count
    const unsubscribe = subscribeToTotalPDFCount((totalPDFs) => {
      setStats(prev => ({
        ...prev,
        totalPDFs: totalPDFs
      }))
    })
    
    // Reload content from localStorage in case it was updated
    setContent(getSiteContent())
    setAdsenseSettings(getAdSenseSettings())
    
    // Load branding settings
    const brandingSettings = getBrandingSettings()
    setBranding(brandingSettings)
    
    // Update favicon if exists
    if (brandingSettings.favicon) {
      updateFavicon(brandingSettings.favicon)
    }
    
    // Update page title
    document.title = brandingSettings.logoText + ' 🎲'
    
    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) unsubscribe()
    }

    // Add AdSense meta tag if exists
    const adsSettings = getAdSenseSettings()
    if (adsSettings.metaTag && adsSettings.enabled) {
      // Remove existing AdSense meta tags
      const existingMeta = document.querySelector('meta[name="google-adsense-account"]')
      if (existingMeta) {
        existingMeta.remove()
      }

      // Create temp div to parse HTML
      const temp = document.createElement('div')
      temp.innerHTML = adsSettings.metaTag.trim()
      const metaTag = temp.querySelector('meta')
      
      if (metaTag) {
        document.head.appendChild(metaTag)
      }
    }
    
    // Add OG meta tags for social media
    if (brandingSettings.socialMediaLogo) {
      // Remove existing OG image
      const existingOG = document.querySelector('meta[property="og:image"]')
      if (existingOG) {
        existingOG.remove()
      }
      
      const ogImage = document.createElement('meta')
      ogImage.setAttribute('property', 'og:image')
      ogImage.setAttribute('content', brandingSettings.socialMediaLogo)
      document.head.appendChild(ogImage)
    }
  }, [])

  const handleButtonClick = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981']
    })
  }


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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        </div>
        
        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {branding.useEmojiAsLogo ? (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{branding.logoEmoji}</span>
                </div>
              ) : branding.siteLogo ? (
                <img src={branding.siteLogo} alt={branding.logoText} className="h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900 font-poppins">{branding.logoText || content.siteTitle}</span>
            </div>
            <Link
              to="/feedback"
              className="px-5 py-2.5 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 rounded-lg transition-all font-poppins text-sm font-semibold text-gray-700 shadow-sm"
            >
              Geri Bildirim
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <span className="text-sm font-semibold text-gray-700 font-poppins">✨ Ücretsiz & Kolay Kullanım</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent font-poppins leading-tight">
              {content.mainHeading}
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-700 font-poppins leading-relaxed max-w-2xl mx-auto">
              {content.description}
            </p>
            
            {/* 3 Buton */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/generator"
                onClick={handleButtonClick}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all font-poppins text-lg flex items-center justify-center gap-3 transform hover:scale-105"
              >
                <span>🚀 Hemen Başla</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button 
                onClick={() => {
                  const element = document.getElementById('how-it-works')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-indigo-300 hover:border-indigo-400 text-gray-900 font-bold rounded-xl hover:bg-indigo-50 transition-all font-poppins text-lg shadow-md hover:shadow-lg transform hover:scale-105"
              >
                ❓ Nasıl Çalışır?
              </button>
              <Link
                to="/ready-kits"
                onClick={handleButtonClick}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all font-poppins text-lg flex items-center justify-center gap-3 transform hover:scale-105"
              >
                <span>⚡ Hazır Setler</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-gray-300">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-poppins mb-2">
                  {stats.totalPDFs > 0 ? stats.totalPDFs.toLocaleString() : '-'}
                </div>
                <div className="text-gray-700 text-sm font-poppins font-medium">PDF Oluşturuldu</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-poppins mb-2">
                  {stats.totalWords > 0 ? (stats.totalWords > 1000 ? (stats.totalWords / 1000).toFixed(1) + 'K' : stats.totalWords) : '-'}
                </div>
                <div className="text-gray-700 text-sm font-poppins font-medium">Kelime İşlendi</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-poppins mb-2">100%</div>
                <div className="text-gray-700 text-sm font-poppins font-medium">Ücretsiz</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-xl text-gray-600 font-poppins max-w-2xl mx-auto">
              Binlerce öğretmen ve öğrenci kelime öğrenmek için bizi tercih ediyor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">⚡ Hızlı ve Kolay</h3>
              <p className="text-gray-600 font-poppins leading-relaxed">
                Kelimelerinizi girin veya Word dosyası yükleyin. Saniyeler içinde profesyonel PDF'niz hazır!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">🎨 Özelleştirilebilir</h3>
              <p className="text-gray-600 font-poppins leading-relaxed">
                Renkli veya siyah-beyaz yazıcılar için optimize edilmiş PDF formatları arasından seçim yapın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">🔒 Tamamen Güvenli</h3>
              <p className="text-gray-600 font-poppins leading-relaxed">
                Tüm işlemler tarayıcınızda gerçekleşir. Verileriniz hiçbir sunucuya gönderilmez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reklam Alanı 1 - Horizontal Banner (After Content) */}
      {/* AdSense policy: Ads must come after content */}
      {/* Features bölümünden hemen sonra - "Neden Bizi Seçmelisiniz?" bölümünden sonra */}
      {(adsenseSettings.enabled && adsenseSettings.adSlots.headerBanner) ? (
        <div className="bg-white border-y border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-xs text-gray-500 font-poppins mb-2">REKLAM</p>
              <div dangerouslySetInnerHTML={{ __html: adsenseSettings.adSlots.headerBanner }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border-y border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-xs text-gray-500 font-poppins mb-2">REKLAM ALANI (728x90)</p>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-400 font-poppins text-sm">Üst Banner Reklam Alanı</p>
                <p className="text-xs text-gray-500 font-poppins mt-1">Admin panelinden reklam kodunu ekleyin</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nasıl Çalışır */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
                Nasıl Çalışır?
              </h2>
              <p className="text-xl text-gray-600 font-poppins max-w-2xl mx-auto">
                Sadece 3 basit adımda kelime kartlarınızı oluşturun
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 md:p-12 border-2 border-gray-200 shadow-xl">
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center font-bold font-poppins text-3xl shadow-lg">
                    1
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">📝 Kelimelerinizi Girin</h4>
                    <p className="text-gray-600 font-poppins text-lg leading-relaxed">
                      Kelimeleri manuel olarak yazın veya mevcut Word dosyanızı (.docx) yükleyin.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                  <div className="text-2xl">⬇️</div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold font-poppins text-3xl shadow-lg">
                    2
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">🖨️ Yazıcı Tipini Seçin</h4>
                    <p className="text-gray-600 font-poppins text-lg leading-relaxed">
                      Renkli veya siyah-beyaz yazıcınız için optimize edilmiş format seçin.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                  <div className="text-2xl">⬇️</div>
                  <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center font-bold font-poppins text-3xl shadow-lg">
                    3
                  </div>
                  <div className="flex-1 pt-2">
                    <h4 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">📥 PDF'i İndirin ve Yazdırın</h4>
                    <p className="text-gray-600 font-poppins text-lg leading-relaxed">
                      PDF'iniz otomatik olarak indirilir. Yazdırın, kesin ve öğrenmeye başlayın!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Kullanıcılarımız Ne Diyor?
            </h2>
            <p className="text-xl text-gray-600 font-poppins">
              Binlerce mutlu kullanıcıdan bazıları
            </p>
          </div>
              
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-lg border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 font-poppins mb-4 leading-relaxed">
                "Öğrencilerim için kelime kartları hazırlamak artık çok kolay. Harika bir araç!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-md">
                  AY
                </div>
                <div>
                  <p className="font-bold text-gray-900 font-poppins">Ayşe Yılmaz</p>
                  <p className="text-sm text-gray-500 font-poppins">İngilizce Öğretmeni</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 shadow-lg border-2 border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 font-poppins mb-4 leading-relaxed">
                "Sınavlara hazırlanırken kelime kartları çok işime yaradı. Teşekkürler!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-md">
                  MK
                </div>
                <div>
                  <p className="font-bold text-gray-900 font-poppins">Mehmet Kaya</p>
                  <p className="text-sm text-gray-500 font-poppins">Lise Öğrencisi</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 shadow-lg border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 font-poppins mb-4 leading-relaxed">
                "Çocuğum için kelime kartları hazırlamak hiç bu kadar kolay olmamıştı!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-md">
                  ZD
                </div>
                <div>
                  <p className="font-bold text-gray-900 font-poppins">Zeynep Demir</p>
                  <p className="text-sm text-gray-500 font-poppins">Veli</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reklam Alanı 3 - Bottom Banner */}
      {(adsenseSettings.enabled && adsenseSettings.adSlots.footerBanner) ? (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <p className="text-xs text-gray-500 font-poppins mb-3">REKLAM</p>
              <div dangerouslySetInnerHTML={{ __html: adsenseSettings.adSlots.footerBanner }} />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-md">
                <p className="text-xs text-gray-500 font-poppins mb-3">REKLAM</p>
                <div className="bg-gray-50 rounded-lg p-8 border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 font-poppins">AdSense Banner 970x90</p>
                  <p className="text-xs text-gray-500 font-poppins mt-2">Admin panelinden reklam kodunu ekleyin</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">
            Hemen Başlamaya Hazır Mısınız?
          </h2>
          <p className="text-xl mb-10 text-blue-100 font-poppins max-w-2xl mx-auto">
            Kelime kartlarınızı oluşturmak sadece birkaç tıklama uzağınızda!
          </p>
          <Link
            to="/generator"
            onClick={handleButtonClick}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:bg-gray-100 transform hover:scale-105 transition-all font-poppins text-xl"
          >
            <span>🚀 Ücretsiz Başla</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {branding.useEmojiAsLogo ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{branding.logoEmoji}</span>
                  </div>
                ) : branding.siteLogo ? (
                  <img src={branding.siteLogo} alt={branding.logoText} className="h-8 object-contain" />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📚</span>
                  </div>
                )}
                <span className="text-white font-bold font-poppins">{branding.logoText || content.siteTitle}</span>
              </div>
              <p className="text-sm font-poppins leading-relaxed">
                {content.footerDescription}
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 font-poppins">Ürün</h4>
              <ul className="space-y-2 text-sm font-poppins">
                {content.footerLinks.product.map((link, index) => (
                  <li key={index}>
                    {link.url.startsWith('/') ? (
                      <Link to={link.url} className="hover:text-white transition-colors">{link.text}</Link>
                    ) : (
                      <a href={link.url} className="hover:text-white transition-colors">{link.text}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 font-poppins">Destek</h4>
              <ul className="space-y-2 text-sm font-poppins">
                {content.footerLinks.support.map((link, index) => (
                  <li key={index}>
                    {link.url.startsWith('/') ? (
                      <Link to={link.url} className="hover:text-white transition-colors">{link.text}</Link>
                    ) : (
                      <a href={link.url} className="hover:text-white transition-colors">{link.text}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 font-poppins">Yasal</h4>
              <ul className="space-y-2 text-sm font-poppins">
                {content.footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    {link.url.startsWith('/') ? (
                      <Link to={link.url} className="hover:text-white transition-colors">{link.text}</Link>
                    ) : (
                      <a href={link.url} className="hover:text-white transition-colors">{link.text}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm font-poppins">
            <p>{content.copyright}</p>
        </div>
      </div>
      </footer>
    </div>
  )
}

export default Home
