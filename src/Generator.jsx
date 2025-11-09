import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import mammoth from 'mammoth'
import { PDFDocument, rgb } from 'pdf-lib'
import confetti from 'canvas-confetti'
import { trackPDFGeneration, trackActiveSession, updateSessionActivity } from './utils/analytics'
import { getSiteContent } from './utils/siteContent'
import { SECURE_LOGIN_URL } from './App'

function Generator() {
  const [wordInput, setWordInput] = useState('')
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [printerType, setPrinterType] = useState('color') // 'color' veya 'bw'
  const [modal, setModal] = useState({ show: false, message: '', type: 'info' }) // 'info', 'success', 'error'
  const fileInputRef = useRef(null)
  const [sessionId] = useState(() => trackActiveSession())

  // Update session activity every minute
  useEffect(() => {
    const interval = setInterval(() => {
      updateSessionActivity(sessionId)
    }, 60000) // 1 minute
    
    return () => clearInterval(interval)
  }, [sessionId])

  const showModal = (message, type = 'info') => {
    setModal({ show: true, message, type })
  }

  const hideModal = () => {
    setModal({ show: false, message: '', type: 'info' })
  }

  const handleInputChange = (e) => {
    let value = e.target.value
    // Eğer kullanıcı " - " formatında girerse, " : " ile değiştir
    value = value.replace(/\s*-\s*/g, ': ')
    setWordInput(value)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.docx')) {
      showModal('Lütfen .docx uzantılı bir Word dosyası seçin!', 'error')
      return
    }

    setIsLoadingWord(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      const text = result.value

      // Kelimeleri formatla (her satırı kontrol et)
      const lines = text.split('\n').filter(line => line.trim())
      const formattedText = lines
        .map(line => {
          // Eğer zaten "ingilizce : türkçe" formatındaysa olduğu gibi bırak
          if (line.includes(':')) {
            return line.trim().replace(/[-–—]/g, ':').replace(/:\s*/g, ': ')
          }
          // Eğer " - " formatındaysa " : " ile değiştir
          if (line.includes(' - ')) {
            return line.trim().replace(/\s*-\s*/g, ': ')
          }
          // Eğer sadece boşlukla ayrılmışsa, ":" ile değiştir
          const parts = line.trim().split(/\s+/)
          if (parts.length >= 2) {
            return `${parts[0]}: ${parts.slice(1).join(' ')}`
          }
          return line.trim()
        })
        .filter(line => line.length > 0)
        .join('\n')

      setWordInput(formattedText)
      // Word yüklendiğinde textarea açılmayacak, sadece elle girişte açılacak
      showModal('Word dosyası başarıyla yüklendi! ✨', 'success')
      
      // Konfeti animasyonu
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1']
      })
    } catch (error) {
      console.error('Word dosyası okuma hatası:', error)
      showModal('Word dosyası okunurken bir hata oluştu. Lütfen dosyanın doğru formatta olduğundan emin olun.', 'error')
    } finally {
      setIsLoadingWord(false)
      // File input'u temizle
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleGeneratePDF = async (forcePrinterType = null) => {
    if (!wordInput.trim()) {
      showModal('Lütfen önce kelimeleri girin!', 'error')
      return
    }

    setIsLoadingPDF(true)
    
    // Use forced printer type if provided, otherwise use state
    const activePrinterType = forcePrinterType || printerType
    
    try {
      // Kelimeleri parse et
      const lines = wordInput.split('\n').filter(line => line.trim())
      const parsedPairs = lines.map(line => {
        const parts = line.split(':').map(p => p.trim())
        if (parts.length >= 2) {
          return {
            english: parts[0],
            turkish: parts.slice(1).join(': ')
          }
        }
        return null
      }).filter(pair => pair !== null)

      if (parsedPairs.length === 0) {
        showModal('Geçerli kelime çifti bulunamadı! Format: cat: kedi', 'error')
        setIsLoadingPDF(false)
        return
      }

      // Türkçe karakterleri ASCII'ye çevir
      const turkishToAscii = (text) => {
        return text
          .replace(/ş/g, 's').replace(/Ş/g, 'S')
          .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
          .replace(/ü/g, 'u').replace(/Ü/g, 'U')
          .replace(/ı/g, 'i').replace(/İ/g, 'I')
          .replace(/ö/g, 'o').replace(/Ö/g, 'O')
          .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      }

      // Kelime çiftlerindeki Türkçe karakterleri çevir
      const convertedPairs = parsedPairs.map(pair => ({
        english: turkishToAscii(pair.english),
        turkish: turkishToAscii(pair.turkish)
      }))

      // PDF oluştur
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont('Helvetica-Bold')
      const fontSize = 16

      // A4 boyutları (points)
      const pageWidth = 595.28
      const pageHeight = 841.89
      
      // Kenar boşlukları (mm to points: 1mm = 2.83465pt)
      const mm = 2.83465
      const marginLeft = 20 * mm
      const marginRight = 20 * mm
      const marginTop = 15 * mm
      const marginBottom = 15 * mm
      const gap = 0.5 * mm // Dikdörtgenler arası 0.5mm
      
      const usableWidth = pageWidth - marginLeft - marginRight
      const usableHeight = pageHeight - marginTop - marginBottom
      
      // Her satırda max 4 kelime, max 12 satır
      const wordsPerRow = 4
      const maxRows = 12
      const wordsPerPage = wordsPerRow * maxRows // 48 kelime per sayfa
      const totalWords = convertedPairs.length
      
      // Sabit kart boyutları (tüm satırlarda aynı)
      // 4 kelimelik satır ve 12 satır için optimal boyut hesapla
      const cardWidth = (usableWidth - (gap * (wordsPerRow - 1))) / wordsPerRow
      const cardHeight = (usableHeight - (gap * (maxRows - 1))) / maxRows
      
      // Sayfa çizme fonksiyonu (belirli bir başlangıç index'i ve kelime sayısı ile)
      const drawPage = (page, getTextFunc, startIndex, wordsToDraw) => {
        const wordsOnThisPage = Math.min(wordsToDraw, wordsPerPage)
        const actualRows = Math.ceil(wordsOnThisPage / wordsPerRow)
        
        let wordIndex = startIndex
        for (let row = 0; row < actualRows && wordIndex < startIndex + wordsOnThisPage; row++) {
          const wordsInRow = Math.min(wordsPerRow, (startIndex + wordsOnThisPage) - wordIndex)
          if (wordsInRow === 0) break
          
          // Satırı hizala: 4 kelime varsa ortala, az kelime varsa soldan başla
          const rowWidth = (cardWidth * wordsInRow) + (gap * (wordsInRow - 1))
          const startX = wordsInRow === wordsPerRow 
            ? marginLeft + (usableWidth - rowWidth) / 2  // Ortala
            : marginLeft  // Soldan başla
          const y = pageHeight - marginTop - (row * (cardHeight + gap)) - cardHeight
          
          for (let col = 0; col < wordsInRow; col++) {
            const pair = convertedPairs[wordIndex]
            const text = getTextFunc(pair)
            const x = startX + col * (cardWidth + gap)
            
            // Yazıcı tipine göre kutucuk rengi
            if (activePrinterType === 'color') {
              // Renkli yazıcı: Her kutuya farklı canlı renk
              const colorPalette = [
                rgb(0.4, 0.8, 1.0),   // Canlı mavi
                rgb(1.0, 0.8, 0.4),   // Canlı sarı
                rgb(1.0, 0.6, 0.8),   // Canlı pembe
                rgb(0.6, 1.0, 0.6),   // Canlı yeşil
                rgb(1.0, 0.7, 0.4),   // Canlı turuncu
              ]
              const borderPalette = [
                rgb(0.2, 0.6, 0.9),   // Koyu mavi kenarlık
                rgb(0.9, 0.6, 0.2),   // Koyu sarı kenarlık
                rgb(0.9, 0.4, 0.6),   // Koyu pembe kenarlık
                rgb(0.4, 0.9, 0.4),   // Koyu yeşil kenarlık
                rgb(0.9, 0.5, 0.2),   // Koyu turuncu kenarlık
              ]
              const colorIndex = wordIndex % colorPalette.length
              page.drawRectangle({
                x: x,
                y: y,
                width: cardWidth,
                height: cardHeight,
                color: colorPalette[colorIndex],
                borderColor: borderPalette[colorIndex],
                borderWidth: 0.5, // İnce kenarlık
              })
            } else {
              // Siyah-beyaz yazıcı: Beyaz kutucuk, siyah kenarlık
              page.drawRectangle({
                x: x,
                y: y,
                width: cardWidth,
                height: cardHeight,
                color: rgb(1, 1, 1), // Beyaz
                borderColor: rgb(0, 0, 0), // Siyah
                borderWidth: 0.5, // İnce kenarlık
              })
            }

            // Metni kutucuğa sığdır (font boyutunu dinamik ayarla)
            let actualFontSize = fontSize
            const maxWidth = cardWidth * 0.9 // %10 kenar boşluğu
            let textWidth = font.widthOfTextAtSize(text, actualFontSize)
            
            // Eğer metin kutucuktan büyükse font boyutunu küçült
            if (textWidth > maxWidth) {
              actualFontSize = (maxWidth / textWidth) * fontSize
              textWidth = font.widthOfTextAtSize(text, actualFontSize)
            }
            
            // Metni ortala
            const textX = x + (cardWidth - textWidth) / 2
            const textY = y + (cardHeight / 2) - (actualFontSize * 0.35)
            
            page.drawText(text, {
              x: textX,
              y: textY,
              size: actualFontSize,
              font: font,
              color: rgb(0, 0, 0),
            })
            
            wordIndex++
          }
        }
      }
      
      // İngilizce sayfaları oluştur
      for (let pageIndex = 0; pageIndex * wordsPerPage < totalWords; pageIndex++) {
        const startIndex = pageIndex * wordsPerPage
        const remainingWords = totalWords - startIndex
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        drawPage(page, (pair) => pair.english, startIndex, remainingWords)
      }

      // Türkçe sayfaları oluştur
      for (let pageIndex = 0; pageIndex * wordsPerPage < totalWords; pageIndex++) {
        const startIndex = pageIndex * wordsPerPage
        const remainingWords = totalWords - startIndex
        const page = pdfDoc.addPage([pageWidth, pageHeight])
        drawPage(page, (pair) => pair.turkish, startIndex, remainingWords)
      }

      // PDF'i indir
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'kelime-tombalasi.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Track PDF generation for analytics
      trackPDFGeneration(totalWords, activePrinterType, sessionId)

      const totalPages = Math.ceil(totalWords / wordsPerPage)
      const message = totalPages > 1 
        ? `${totalWords} kelime çifti ile ${totalPages * 2} sayfalık PDF başarıyla oluşturuldu! 🎉`
        : `${totalWords} kelime çifti ile PDF başarıyla oluşturuldu! 🎉`
      
      showModal(message, 'success')
      
      // Konfeti animasyonu
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']
      })
      
      // Ekstra konfeti patlamaları
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        })
      }, 250)
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      showModal('PDF oluşturulurken bir hata oluştu: ' + error.message, 'error')
    } finally {
      setIsLoadingPDF(false)
    }
  }

  // Check for maintenance mode
  const siteContent = getSiteContent()
  if (siteContent.siteStatus === 'maintenance') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-3xl font-bold text-white font-poppins mb-4">Site Bakımda</h1>
          <p className="text-gray-300 font-poppins mb-6">{siteContent.maintenanceMessage}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-poppins font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Ana Sayfa
          </Link>
          
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-poppins font-semibold">PDF Oluşturucu</span>
            </div>
          </div>
        </div>

        {/* Başlık */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">📚</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-poppins">
            Kelime Kartı Oluşturucu
          </h1>
          <p className="text-lg text-gray-600 font-poppins max-w-2xl mx-auto">
            İngilizce-Türkçe kelime kartlarınızı kolayca PDF'e dönüştürün
          </p>
        </div>

        {/* Ana Kart */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
            {/* Word Dosyası ve Metin Girişi - Yan Yana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Sol: Word Dosyası Yükleme */}
              <div className="flex flex-col">
                <label 
                  htmlFor="word-file" 
                  className="block text-sm font-semibold text-gray-700 mb-3 font-poppins flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Word Dosyası Yükle
                </label>
                <input
                  type="file"
                  id="word-file"
                  ref={fileInputRef}
                  accept=".docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="word-file"
                  className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 text-gray-800 font-semibold py-8 px-4 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all duration-300 font-poppins min-h-[180px]"
                >
                  {isLoadingWord ? (
                    <>
                      <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-600">Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-center text-gray-800 font-bold">Word Dosyası Seç</span>
                      <span className="text-xs text-gray-600 text-center">(.docx formatında)</span>
                    </>
                  )}
                </label>
              </div>

              {/* Sağ: Doğrudan Giriş */}
              <div className="flex flex-col">
                <label 
                  htmlFor="word-input" 
                  className="block text-sm font-semibold text-gray-700 mb-3 font-poppins flex items-center gap-2"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Manuel Giriş
                </label>
                <div className="flex-1 flex flex-col">
                  {!showManualInput ? (
                    <button
                      onClick={() => setShowManualInput(true)}
                      className="flex-1 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-300 text-gray-800 font-semibold py-8 px-4 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all duration-300 font-poppins min-h-[180px]"
                    >
                      <svg className="w-16 h-16 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-center text-gray-800 font-bold">Kelimeleri Manuel Girin</span>
                      <span className="text-xs text-gray-600 text-center">cat: kedi formatında</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600 font-poppins">
                          Format: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">cat: kedi</span>
                        </span>
                        <button
                          onClick={() => setShowManualInput(false)}
                          className="text-gray-400 hover:text-red-600 font-poppins text-sm transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <textarea
                        id="word-input"
                        value={wordInput}
                        onChange={handleInputChange}
                        placeholder="cat: kedi&#10;dog: köpek&#10;bird: kuş&#10;fish: balık"
                        className="flex-1 w-full min-h-[180px] p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-poppins text-sm bg-white transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-poppins flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {wordInput.split('\n').filter(line => line.trim()).length} kelime çifti
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Yazıcı Tipi Seçimi ve PDF Oluştur Butonları */}
            <div className="border-t border-gray-200 pt-8 mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4 font-poppins">
                Yazıcı Tipi Seçin:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Renkli Yazıcı Butonu */}
                <button
                  onClick={() => {
                    setPrinterType('color')
                    handleGeneratePDF('color')
                  }}
                  disabled={!wordInput.trim() || isLoadingPDF}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 font-poppins"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <div className="flex-1 text-left">
                    {isLoadingPDF && printerType === 'color' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Oluşturuluyor...
                      </span>
                    ) : (
                      <>
                        <div className="font-bold">Renkli Yazıcı</div>
                        <div className="text-xs opacity-90">Canlı renklerle yazdırın</div>
                      </>
                    )}
                  </div>
                </button>

                {/* Siyah-Beyaz Yazıcı Butonu */}
                <button
                  onClick={() => {
                    setPrinterType('bw')
                    handleGeneratePDF('bw')
                  }}
                  disabled={!wordInput.trim() || isLoadingPDF}
                  className="flex items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 font-poppins"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <div className="flex-1 text-left">
                    {isLoadingPDF && printerType === 'bw' ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Oluşturuluyor...
                      </span>
                    ) : (
                      <>
                        <div className="font-bold">Siyah-Beyaz Yazıcı</div>
                        <div className="text-xs opacity-90">Mürekkep tasarrufu yapın</div>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Bilgi Notu */}
            <div className="mt-8 p-5 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-300 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-800 font-poppins">
                  <strong className="text-gray-900 font-bold">Format Bilgisi:</strong> Her satırda bir kelime çifti yazın. 
                  <span className="block mt-2">
                    Örnek: <span className="font-mono bg-white px-3 py-1.5 rounded-lg border-2 border-blue-300 font-semibold">cat: kedi</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 font-poppins text-sm">
          <p>Profesyonel kelime kartı oluşturma aracı</p>
        </div>
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
            <div className="flex flex-col items-center text-center">
              {/* İkon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                modal.type === 'success' ? 'bg-green-100' :
                modal.type === 'error' ? 'bg-red-100' :
                'bg-blue-100'
              }`}>
                <svg className={`w-8 h-8 ${
                  modal.type === 'success' ? 'text-green-600' :
                  modal.type === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {modal.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : modal.type === 'error' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              
              {/* Mesaj */}
              <p className={`text-base font-poppins font-semibold mb-6 whitespace-pre-line ${
                modal.type === 'success' ? 'text-gray-900' :
                modal.type === 'error' ? 'text-red-700' :
                'text-gray-700'
              }`}>
                {modal.message}
              </p>
              
              {/* Kapat Butonu */}
              <button
                onClick={hideModal}
                className={`w-full py-3 px-6 rounded-xl font-semibold font-poppins transition-all ${
                  modal.type === 'success' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' :
                  modal.type === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Generator

