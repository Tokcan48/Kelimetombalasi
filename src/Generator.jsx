import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import mammoth from 'mammoth'
import { PDFDocument, rgb } from 'pdf-lib'
import confetti from 'canvas-confetti'

function Generator() {
  const [wordInput, setWordInput] = useState('')
  const [isLoadingWord, setIsLoadingWord] = useState(false)
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [printerType, setPrinterType] = useState('color') // 'color' veya 'bw'
  const [modal, setModal] = useState({ show: false, message: '', type: 'info' }) // 'info', 'success', 'error'
  const fileInputRef = useRef(null)

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

  const handleGeneratePDF = async () => {
    if (!wordInput.trim()) {
      showModal('Lütfen önce kelimeleri girin!', 'error')
      return
    }

    setIsLoadingPDF(true)
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
            if (printerType === 'color') {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-yellow to-pastel-green relative overflow-hidden">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-pastel-blue rounded-full opacity-20 blur-2xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-pastel-yellow rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-pastel-green rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Başlık */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <div className="inline-block transform hover:scale-110 transition-transform duration-300">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-gray-800 bg-clip-text text-transparent font-comic mb-3 drop-shadow-lg">
              Kelime Tombalası <span className="inline-block animate-bounce">🎲</span>
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-700 font-poppins font-medium">
            İngilizce-Türkçe kelime kartlarınızı oluşturun! ✨
          </p>
        </div>

        {/* Ana Kart */}
        <div className="max-w-5xl mx-auto transform transition-all duration-300 hover:scale-[1.01]">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10 border-2 border-white/50 backdrop-blur-sm hover:shadow-3xl transition-shadow duration-300">
            {/* Word Dosyası ve Metin Girişi - Yan Yana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Sol: Word Dosyası Yükleme */}
              <div className="flex flex-col">
                <label 
                  htmlFor="word-file" 
                  className="block text-lg font-semibold text-gray-700 mb-3 font-poppins"
                >
                  📎 Word Dosyası Yükle
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
                  className="flex-1 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-pastel-blue to-blue-200 text-gray-800 font-semibold py-6 px-4 rounded-2xl cursor-pointer hover:from-blue-300 hover:to-pastel-blue shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-poppins min-h-[200px]"
                >
                  {isLoadingWord ? (
                    <>
                      <svg className="animate-spin h-8 w-8 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-5xl">📄</span>
                      <span className="text-center">Word Dosyası Seç (.docx)</span>
                      <span className="text-xs text-gray-600 text-center mt-2">Her satırda: cat: kedi</span>
                    </>
                  )}
                </label>
              </div>

              {/* Sağ: Doğrudan Giriş */}
              <div className="flex flex-col">
                <label 
                  htmlFor="word-input" 
                  className="block text-lg font-semibold text-gray-700 mb-3 font-poppins"
                >
                  ✏️ Doğrudan Giriş
                </label>
                <div className="flex-1 flex flex-col">
                  {!showManualInput ? (
                    <button
                      onClick={() => setShowManualInput(true)}
                      className="flex-1 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-pastel-green to-green-200 text-gray-800 font-semibold py-6 px-4 rounded-2xl hover:from-green-300 hover:to-pastel-green shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-poppins min-h-[200px]"
                    >
                      <span className="text-5xl">⌨️</span>
                      <span className="text-center">Kelimeleri Buraya Yaz</span>
                      <span className="text-xs text-gray-600 text-center mt-2">cat: kedi formatında</span>
                    </button>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 font-poppins">
                          Format: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">cat: kedi</span>
                        </span>
                        <button
                          onClick={() => setShowManualInput(false)}
                          className="text-gray-500 hover:text-red-500 hover:bg-red-50 font-poppins text-sm px-3 py-1 rounded-lg transition-all duration-200"
                        >
                          ✕ Kapat
                        </button>
                      </div>
                      <textarea
                        id="word-input"
                        value={wordInput}
                        onChange={handleInputChange}
                        placeholder="cat: kedi&#10;dog: köpek&#10;bird: kuş&#10;fish: balık"
                        className="flex-1 w-full min-h-[200px] p-4 border-2 border-pastel-green rounded-2xl focus:outline-none focus:ring-4 focus:ring-pastel-green/50 focus:border-pastel-green resize-none font-poppins text-base bg-gradient-to-br from-white to-pastel-green/5 transition-all duration-300"
                      />
                      <p className="text-xs text-gray-400 mt-2 font-poppins">
                        {wordInput.split('\n').filter(line => line.trim()).length} kelime çifti girildi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Yazıcı Tipi Seçimi ve PDF Oluştur Butonları */}
            <div className="mt-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3 font-poppins">
                Yazıcı Tipi:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Renkli Yazıcı Butonu */}
                <button
                  onClick={() => {
                    setPrinterType('color')
                    handleGeneratePDF()
                  }}
                  disabled={!wordInput.trim() || isLoadingPDF}
                  className="bg-gradient-to-r from-pastel-blue to-blue-300 text-gray-800 font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-poppins text-lg relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-300 to-pastel-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoadingPDF && printerType === 'color' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🎨</span>
                        <span>Renkli Yazıcı için PDF</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Siyah-Beyaz Yazıcı Butonu */}
                <button
                  onClick={() => {
                    setPrinterType('bw')
                    handleGeneratePDF()
                  }}
                  disabled={!wordInput.trim() || isLoadingPDF}
                  className="bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-poppins text-lg relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoadingPDF && printerType === 'bw' ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Oluşturuluyor...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">⚫</span>
                        <span>Siyah-Beyaz Yazıcı için PDF</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Bilgi Notu */}
            <div className="mt-6 p-4 bg-gradient-to-r from-pastel-yellow via-yellow-100 to-pastel-yellow rounded-2xl border-2 border-yellow-200/50 shadow-md">
              <p className="text-sm text-gray-700 font-poppins flex items-start gap-2">
                <span className="text-xl">💡</span>
                <span>
                  <strong className="text-gray-800">İpucu:</strong> Word dosyasında veya manuel girişte her satırda bir kelime çifti olmalı. Format: <span className="font-mono bg-white px-2 py-1 rounded shadow-sm">cat: kedi</span> veya <span className="font-mono bg-white px-2 py-1 rounded shadow-sm">cat kedi</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 font-poppins text-sm">
          <p>Çocuklar için eğlenceli kelime öğrenme aracı 🎓</p>
        </div>
      </div>

      {/* Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 border-2 border-white/50">
            <div className="flex flex-col items-center text-center">
              {/* İkon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                modal.type === 'success' ? 'bg-pastel-green' :
                modal.type === 'error' ? 'bg-red-200' :
                'bg-pastel-blue'
              }`}>
                <span className="text-3xl">
                  {modal.type === 'success' ? '✅' :
                   modal.type === 'error' ? '❌' :
                   'ℹ️'}
                </span>
              </div>
              
              {/* Mesaj */}
              <p className={`text-lg font-poppins font-semibold mb-6 ${
                modal.type === 'success' ? 'text-gray-800' :
                modal.type === 'error' ? 'text-red-700' :
                'text-gray-700'
              }`}>
                {modal.message}
              </p>
              
              {/* Kapat Butonu */}
              <button
                onClick={hideModal}
                className={`w-full py-3 px-6 rounded-2xl font-bold font-poppins transition-all duration-300 transform hover:scale-105 ${
                  modal.type === 'success' 
                    ? 'bg-gradient-to-r from-pastel-green to-green-300 text-gray-800 hover:shadow-lg' :
                  modal.type === 'error'
                    ? 'bg-gradient-to-r from-red-400 to-red-500 text-white hover:shadow-lg' :
                    'bg-gradient-to-r from-pastel-blue to-blue-300 text-gray-800 hover:shadow-lg'
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

