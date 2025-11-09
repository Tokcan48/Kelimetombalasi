import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { getRealAnalytics } from './utils/analytics'
import { getSiteContent } from './utils/siteContent'
import { readyKits } from './utils/readyKits'
import { PDFDocument, rgb } from 'pdf-lib'
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
    const analytics = getRealAnalytics()
    setStats({
      estimatedUsers: analytics.estimatedUsers,
      totalPDFs: analytics.totalPDFs,
      totalWords: analytics.totalWords
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

  // Turkish to ASCII converter
  const turkishToAscii = (text) => {
    return text
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
  }

  // Generate PDF from ready kit (same as Generator)
  const generateReadyKitPDF = async (kit, printerType = 'color') => {
    try {
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont('Helvetica-Bold')

      // A4 boyutları
      const pageWidth = 595.28
      const pageHeight = 841.89
      
      const mm = 2.83465
      const marginLeft = 20 * mm
      const marginRight = 20 * mm
      const marginTop = 15 * mm
      const marginBottom = 15 * mm
      const gap = 0.5 * mm
      
      const usableWidth = pageWidth - marginLeft - marginRight
      const usableHeight = pageHeight - marginTop - marginBottom
      
      const wordsPerRow = 4
      const maxRows = 12
      const wordsPerPage = wordsPerRow * maxRows // 48
      
      const cardWidth = (usableWidth - (gap * (wordsPerRow - 1))) / wordsPerRow
      const cardHeight = (usableHeight - (gap * (maxRows - 1))) / maxRows
      
      // Convert Turkish characters
      const convertedWords = kit.words.map(word => ({
        english: turkishToAscii(word.english),
        turkish: turkishToAscii(word.turkish)
      }))
      
      const totalWords = convertedWords.length
      
      // Function to draw a page
      const drawPage = (page, getTextFunc, startIndex, wordsToDraw) => {
        const wordsOnThisPage = Math.min(wordsToDraw, wordsPerPage)
        const actualRows = Math.ceil(wordsOnThisPage / wordsPerRow)
        
        let wordIndex = startIndex
        for (let row = 0; row < actualRows && wordIndex < startIndex + wordsOnThisPage; row++) {
          const wordsInRow = Math.min(wordsPerRow, (startIndex + wordsOnThisPage) - wordIndex)
          if (wordsInRow === 0) break
          
          const rowWidth = (cardWidth * wordsInRow) + (gap * (wordsInRow - 1))
          const startX = wordsInRow === wordsPerRow 
            ? marginLeft + (usableWidth - rowWidth) / 2
            : marginLeft
          const y = pageHeight - marginTop - (row * (cardHeight + gap)) - cardHeight
          
          for (let col = 0; col < wordsInRow; col++) {
            const word = convertedWords[wordIndex]
            const text = getTextFunc(word)
            const x = startX + col * (cardWidth + gap)
            
            // Rectangle based on printer type
            if (printerType === 'color') {
              const colorPalette = [
                rgb(0.4, 0.8, 1.0),   // Blue
                rgb(1.0, 0.8, 0.4),   // Yellow
                rgb(1.0, 0.6, 0.8),   // Pink
                rgb(0.6, 1.0, 0.6),   // Green
                rgb(1.0, 0.7, 0.4),   // Orange
              ]
              const borderPalette = [
                rgb(0.2, 0.6, 0.9),
                rgb(0.9, 0.6, 0.2),
                rgb(0.9, 0.4, 0.6),
                rgb(0.4, 0.9, 0.4),
                rgb(0.9, 0.5, 0.2),
              ]
              const colorIndex = wordIndex % colorPalette.length
              
              page.drawRectangle({
                x: x,
                y: y,
                width: cardWidth,
                height: cardHeight,
                color: colorPalette[colorIndex],
                borderColor: borderPalette[colorIndex],
                borderWidth: 0.5,
              })
            } else {
              // Black and white
              page.drawRectangle({
                x: x,
                y: y,
                width: cardWidth,
                height: cardHeight,
                color: rgb(1, 1, 1), // White
                borderColor: rgb(0, 0, 0), // Black
                borderWidth: 0.5,
              })
            }

            // Draw text centered
            let fontSize = 16
            let textWidth = font.widthOfTextAtSize(text, fontSize)
            const maxWidth = cardWidth * 0.9
            
            if (textWidth > maxWidth) {
              fontSize = (maxWidth / textWidth) * fontSize
              textWidth = font.widthOfTextAtSize(text, fontSize)
            }
            
            page.drawText(text, {
              x: x + (cardWidth - textWidth) / 2,
              y: y + (cardHeight - fontSize) / 2,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0)
            })
            
            wordIndex++
          }
        }
      }

      // Generate pages for English and Turkish
      for (let startIndex = 0; startIndex < totalWords; startIndex += wordsPerPage) {
        const wordsInThisBatch = Math.min(wordsPerPage, totalWords - startIndex)
        
        // English page
        const englishPage = pdfDoc.addPage([pageWidth, pageHeight])
        drawPage(englishPage, (pair) => pair.english, startIndex, wordsInThisBatch)
        
        // Turkish page
        const turkishPage = pdfDoc.addPage([pageWidth, pageHeight])
        drawPage(turkishPage, (pair) => pair.turkish, startIndex, wordsInThisBatch)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${kit.title.replace(/\s+/g, '_')}.pdf`
      link.click()

      // Confetti on success
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      alert('PDF oluştururken bir hata oluştu: ' + error.message)
    }
  }

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+'
    }
    return num.toString()
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>
      
      {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* Navigation */}
        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {branding.useEmojiAsLogo ? (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">{branding.logoEmoji}</span>
                </div>
              ) : branding.siteLogo ? (
                <img src={branding.siteLogo} alt={branding.logoText} className="h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
              )}
              <span className="text-xl font-bold font-poppins">{branding.logoText || content.siteTitle}</span>
            </div>
            <Link
              to="/feedback"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all font-poppins text-sm font-semibold border border-white/20"
            >
              Geri Bildirim
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <span className="text-white font-poppins text-sm font-semibold">✨ Ücretsiz & Kolay</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-poppins leading-tight">
              {content.mainHeading}
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 font-poppins leading-relaxed max-w-3xl mx-auto">
              {content.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/generator"
                onClick={handleButtonClick}
                className="group px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-2xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all font-poppins text-lg flex items-center gap-3"
              >
                <span>Hemen Başla</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button 
                onClick={() => {
                  const element = document.getElementById('how-it-works')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="px-10 py-5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-all font-poppins text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Nasıl Çalışır?
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold font-poppins mb-2">
                  {stats.totalPDFs > 0 ? stats.totalPDFs.toLocaleString() : '-'}
                </div>
                <div className="text-blue-100 text-sm font-poppins">PDF Oluşturuldu</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold font-poppins mb-2">
                  {stats.totalWords > 0 ? (stats.totalWords > 1000 ? (stats.totalWords / 1000).toFixed(1) + 'K' : stats.totalWords) : '-'}
                </div>
                <div className="text-blue-100 text-sm font-poppins">Kelime İşlendi</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold font-poppins mb-2">100%</div>
                <div className="text-blue-100 text-sm font-poppins">Ücretsiz</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Reklam Alanı 1 - Horizontal Banner (Top) */}
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
            <div className="max-w-5xl mx-auto">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <p className="text-xs text-gray-500 font-poppins mb-2">REKLAM</p>
                <div className="bg-white rounded-lg p-8 border-2 border-dashed border-gray-300">
                  <p className="text-gray-400 font-poppins">AdSense Banner 728x90</p>
                  <p className="text-xs text-gray-500 font-poppins mt-2">Admin panelinden reklam kodunu ekleyin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">Hızlı ve Kolay</h3>
              <p className="text-gray-700 font-poppins leading-relaxed">
                Kelimelerinizi girin veya Word dosyası yükleyin. Saniyeler içinde profesyonel PDF'niz hazır!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">Özelleştirilebilir</h3>
              <p className="text-gray-700 font-poppins leading-relaxed">
                Renkli veya siyah-beyaz yazıcılar için optimize edilmiş PDF formatları arasından seçim yapın.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-8 border-2 border-pink-200 hover:border-pink-400 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">Tamamen Güvenli</h3>
              <p className="text-gray-700 font-poppins leading-relaxed">
                Tüm işlemler tarayıcınızda gerçekleşir. Verileriniz hiçbir sunucuya gönderilmez.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl Çalışır - Moved Up */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-indigo-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">❓</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                    Nasıl Çalışır?
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl flex items-center justify-center font-bold font-poppins text-xl shadow-lg">
                      1
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Kelimelerinizi Girin</h4>
                      <p className="text-gray-600 font-poppins">
                        Kelimeleri manuel olarak yazın veya mevcut Word dosyanızı (.docx) yükleyin.
              </p>
            </div>
          </div>

                  <div className="flex gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center font-bold font-poppins text-xl shadow-lg">
                      2
                </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Yazıcı Tipini Seçin</h4>
                      <p className="text-gray-600 font-poppins">
                        Renkli veya siyah-beyaz yazıcınız için optimize edilmiş format seçin.
                      </p>
              </div>
            </div>

                  <div className="flex gap-4 p-4 bg-pink-50 rounded-xl border border-pink-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 text-white rounded-xl flex items-center justify-center font-bold font-poppins text-xl shadow-lg">
                      3
                </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2 font-poppins">PDF'i İndirin ve Yazdırın</h4>
                      <p className="text-gray-600 font-poppins">
                        PDF'iniz otomatik olarak indirilir. Yazdırın, kesin ve öğrenmeye başlayın!
                      </p>
                </div>
              </div>
            </div>

                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/generator"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition-all font-poppins"
                    >
                      <span>Şimdi Deneyin</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => {
                        const element = document.getElementById('ready-kits')
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all font-poppins"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>Hazır Setlere Göz At</span>
                    </button>
                  </div>
                </div>
              </div>
                </div>

            {/* Reklam Sidebar */}
            <div className="lg:col-span-1">
              {(adsenseSettings.enabled && adsenseSettings.adSlots.sidebar) ? (
                <div className="sticky top-4">
                  <p className="text-xs text-gray-500 font-poppins mb-3 text-center">REKLAM</p>
                  <div dangerouslySetInnerHTML={{ __html: adsenseSettings.adSlots.sidebar }} />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200 sticky top-4 shadow-lg">
                  <p className="text-xs text-indigo-600 font-poppins mb-3 text-center font-semibold">REKLAM</p>
                  <div className="bg-white rounded-lg p-6 border-2 border-dashed border-indigo-300">
                    <div className="text-center text-indigo-400 font-poppins">
                      <p className="mb-2 font-semibold">AdSense</p>
                      <p className="text-sm">300x600</p>
                      <p className="text-xs mt-2">Vertical Banner</p>
                      <p className="text-xs text-indigo-500 mt-3">Admin panelinden kodu ekleyin</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Hazır Kelime Setleri */}
      <section id="ready-kits" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              ⚡ Hazır Kelime Setleri
            </h2>
            <p className="text-xl text-gray-600 font-poppins max-w-2xl mx-auto">
              Tek tıkla PDF indir! Haftanın günleri, sayılar, renkler ve daha fazlası...
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {readyKits.map((kit) => (
              <div 
                key={kit.id}
                className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-200 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${kit.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{kit.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                  {kit.title}
                </h3>
                <p className="text-gray-600 font-poppins mb-4 text-sm">
                  {kit.description}
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500 font-poppins">
                      {kit.words.length} kelime
                    </span>
                    <span className="text-xs text-gray-400 font-poppins">
                      Yazıcı seçin:
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        generateReadyKitPDF(kit, 'color')
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins text-sm shadow-md hover:shadow-lg"
                    >
                      <span>🎨</span>
                      <span>Renkli</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        generateReadyKitPDF(kit, 'bw')
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all font-poppins text-sm shadow-md hover:shadow-lg"
                    >
                      <span>⚫</span>
                      <span>S/B</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Set CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 font-poppins mb-6 text-lg">
              Kendi kelime setinizi mi oluşturmak istiyorsunuz?
            </p>
            <Link
              to="/generator"
              onClick={handleButtonClick}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Özel Set Oluştur</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials / Social Proof */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
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
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
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
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-lg">
                  AY
                </div>
                <div>
                  <p className="font-bold text-gray-900 font-poppins">Ayşe Yılmaz</p>
                  <p className="text-sm text-gray-500 font-poppins">İngilizce Öğretmeni</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-lg">
                  MK
                  </div>
                <div>
                  <p className="font-bold text-gray-900 font-poppins">Mehmet Kaya</p>
                  <p className="text-sm text-gray-500 font-poppins">Lise Öğrencisi</p>
                </div>
                  </div>
                </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
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
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-lg">
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
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]"></div>
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
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 font-bold rounded-xl shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all font-poppins text-xl"
            >
            <span>Ücretsiz Başla</span>
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
