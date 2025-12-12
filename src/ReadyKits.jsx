import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { readyKits, categories as defaultCategories } from './utils/readyKits'
import { subscribeToCategories } from './utils/categories'
import { PDFDocument, rgb } from 'pdf-lib'
import { getApprovedReadyKits, subscribeToApprovedReadyKits } from './utils/approvedKits'
import { useAdSense } from './hooks/useAdSense'

function ReadyKits() {
  // Load AdSense only on content pages
  useAdSense()

  const [downloading, setDownloading] = useState(null)
  const [approvedKits, setApprovedKits] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState(defaultCategories)

  // Load approved kits from Firebase
  useEffect(() => {
    const loadApprovedKits = async () => {
      try {
        const kits = await getApprovedReadyKits()
        setApprovedKits(kits)
      } catch (error) {
        console.error('Onaylanmış setler yüklenirken hata:', error)
      }
    }

    loadApprovedKits()

    // Real-time listener for approved kits
    const unsubscribeKits = subscribeToApprovedReadyKits((kits) => {
      setApprovedKits(kits)
    })

    // Real-time listener for categories
    const unsubscribeCategories = subscribeToCategories((cats) => {
      setCategories(cats.length > 0 ? cats : defaultCategories)
    })

    return () => {
      if (unsubscribeKits) unsubscribeKits()
      if (unsubscribeCategories) unsubscribeCategories()
    }
  }, [])

  // Convert Turkish characters to ASCII for PDF
  const turkishToAscii = (text) => {
    const map = {
      'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G',
      'ü': 'u', 'Ü': 'U', 'ş': 's', 'Ş': 'S',
      'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
    }
    return text.replace(/[ıİğĞüÜşŞöÖçÇ]/g, (char) => map[char] || char)
  }

  const generateReadyKitPDF = async (kit, printerType = 'color') => {
    setDownloading(kit.id)
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
            let actualFontSize = 16
            const maxWidth = cardWidth * 0.9
            let textWidth = font.widthOfTextAtSize(text, actualFontSize)
            
            if (textWidth > maxWidth) {
              actualFontSize = (maxWidth / textWidth) * actualFontSize
              textWidth = font.widthOfTextAtSize(text, actualFontSize)
            }
            
            const textX = x + (cardWidth - textWidth) / 2
            const textY = y + (cardHeight / 2) - (actualFontSize * 0.35)
            
            page.drawText(text, {
              x: textX,
              y: textY,
              size: actualFontSize,
              font: font,
              color: rgb(0, 0, 0)
            })
            
            wordIndex++
          }
        }
      }

      // Türkçe sayfa çizimi (sütunları ters)
      const drawTurkishPage = (page, startIndex, wordsToDraw) => {
        const wordsOnThisPage = Math.min(wordsToDraw, wordsPerPage)
        const actualRows = Math.ceil(wordsOnThisPage / wordsPerRow)
        
        let wordIndex = startIndex
        
        for (let row = 0; row < actualRows && wordIndex < startIndex + wordsOnThisPage; row++) {
          const wordsInRow = Math.min(wordsPerRow, (startIndex + wordsOnThisPage) - wordIndex)
          if (wordsInRow === 0) break
          
          // Bu satırın kelimelerini al
          const rowWords = []
          const rowStartIndex = wordIndex
          for (let i = 0; i < wordsInRow; i++) {
            rowWords.push(convertedWords[rowStartIndex + i])
          }
          
          const rowWidth = (cardWidth * wordsInRow) + (gap * (wordsInRow - 1))
          const startX = wordsInRow === wordsPerRow 
            ? marginLeft + (usableWidth - rowWidth) / 2
            : marginLeft
          const y = pageHeight - marginTop - (row * (cardHeight + gap)) - cardHeight
          
          // Sütunları ters çevir (sağdan sola)
          for (let col = 0; col < wordsInRow; col++) {
            const word = rowWords[wordsInRow - 1 - col] // Sütunları ters çevir
            const text = word.turkish
            const x = startX + col * (cardWidth + gap)
            const originalWordIndex = rowStartIndex + (wordsInRow - 1 - col)
            
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
              const colorIndex = originalWordIndex % colorPalette.length
              
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
            let actualFontSize = 16
            const maxWidth = cardWidth * 0.9
            let textWidth = font.widthOfTextAtSize(text, actualFontSize)
            
            if (textWidth > maxWidth) {
              actualFontSize = (maxWidth / textWidth) * actualFontSize
              textWidth = font.widthOfTextAtSize(text, actualFontSize)
            }
            
            const textX = x + (cardWidth - textWidth) / 2
            const textY = y + (cardHeight / 2) - (actualFontSize * 0.35)
            
            page.drawText(text, {
              x: textX,
              y: textY,
              size: actualFontSize,
              font: font,
              color: rgb(0, 0, 0)
            })
          }
          
          wordIndex += wordsInRow
        }
      }

      // İngilizce ve Türkçe sayfaları çift taraflı yazdırma için yan yana oluştur
      for (let startIndex = 0; startIndex < totalWords; startIndex += wordsPerPage) {
        const wordsInThisBatch = Math.min(wordsPerPage, totalWords - startIndex)
        
        // İngilizce sayfa (ön yüz)
        const englishPage = pdfDoc.addPage([pageWidth, pageHeight])
        drawPage(englishPage, (pair) => pair.english, startIndex, wordsInThisBatch)
        
        // Türkçe sayfa (arka yüz) - hemen ardından, sütunlar ters
        const turkishPage = pdfDoc.addPage([pageWidth, pageHeight])
        drawTurkishPage(turkishPage, startIndex, wordsInThisBatch)
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${kit.title.replace(/\s+/g, '_')}_${printerType === 'color' ? 'renkli' : 'siyah_beyaz'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })

      setDownloading(null)
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      alert('PDF oluştururken bir hata oluştu: ' + error.message)
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-8 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-2xl font-bold font-poppins">Kelime Tombalası</span>
            </Link>
            <Link
              to="/"
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all font-poppins font-semibold"
            >
              ← Ana Sayfa
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 shadow-lg">
              <span className="text-indigo-600 font-poppins text-sm font-semibold">⚡ Hazır Setler</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 font-poppins">
              Hazır Kelime Setleri
            </h1>
            <p className="text-xl text-gray-600 font-poppins max-w-2xl mx-auto">
              Tek tıkla PDF indir! Haftanın günleri, sayılar, renkler ve daha fazlası...
            </p>
          </div>

          {/* Açıklayıcı İçerik */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-8 border-2 border-indigo-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📚</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 font-poppins">Hazır Kelime Setleri</h3>
                  </div>
                  <p className="text-gray-700 font-poppins leading-relaxed">
                    Özenle seçilmiş ve kategorize edilmiş kelime setlerini tek tıkla indirebilirsiniz. Her set belirli bir konuya odaklanır (örneğin: haftanın günleri, renkler, hayvanlar) ve öğrenme sürecinizi kolaylaştırır. Setler, öğretmenler ve öğrenciler tarafından onaylanmış ve test edilmiştir.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 font-poppins">Nasıl Kullanılır?</h3>
                  </div>
                  <p className="text-gray-700 font-poppins leading-relaxed">
                    İstediğiniz seti seçin, renkli veya siyah-beyaz format seçeneğini belirleyin ve PDF'inizi indirin. PDF'i yazdırdıktan sonra kartları kesin ve öğrenmeye başlayın. Çift taraflı yazdırma seçeneği ile kartların arka yüzü otomatik olarak hizalanır.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-indigo-200">
                <h4 className="font-bold text-gray-900 font-poppins mb-2 flex items-center gap-2">
                  <span>💡</span>
                  <span>İpucu: Kendi Setinizi Oluşturun</span>
                </h4>
                <p className="text-sm text-gray-700 font-poppins leading-relaxed">
                  Kendi kelime setlerinizi oluşturmak isterseniz, ana sayfadaki "Kelime Kartı Oluşturucu" bölümünü kullanabilirsiniz. Word dosyanızdan veya manuel olarak kelime girişi yaparak sınırsız sayıda özel set oluşturabilirsiniz. Oluşturduğunuz setleri toplulukla paylaşmak için admin onayına gönderebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          {/* Category Filter & Content */}
          <div className="flex flex-col lg:flex-row gap-8 mb-16">
            {/* Category Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 border-2 border-indigo-200 shadow-lg sticky top-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-poppins flex items-center gap-2">
                  <span>📂</span> Kategoriler
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg font-poppins text-sm font-semibold transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🌟</span>
                      <span>Tümü</span>
                      <span className="ml-auto text-xs opacity-75">
                        ({readyKits.length + approvedKits.length})
                      </span>
                    </span>
                  </button>
                  
                  {categories.map((category) => {
                    const kitCount = readyKits.filter(k => k.category === category.id).length
                    const approvedCount = approvedKits.filter(k => k.category === category.id).length
                    const totalCount = kitCount + approvedCount
                    
                    if (totalCount === 0) return null
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg font-poppins text-sm font-semibold transition-all ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                          <span className="ml-auto text-xs opacity-75">({totalCount})</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            {/* Kits Grid */}
            <div className="flex-1">
              {/* Default Ready Kits */}
              {(selectedCategory === 'all' || readyKits.some(k => k.category === selectedCategory)) && (
                <div className="mb-12">
                  {selectedCategory !== 'all' && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins flex items-center gap-3">
                      <span>{categories.find(c => c.id === selectedCategory)?.icon || '📚'}</span>
                      <span>{categories.find(c => c.id === selectedCategory)?.name || 'Kategori'} Setler</span>
                    </h2>
                  )}
                  {selectedCategory === 'all' && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins text-center">🎯 Hazır Setler</h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {readyKits
                      .filter(kit => selectedCategory === 'all' || kit.category === selectedCategory)
                      .map((kit) => (
                <div 
                  key={kit.id}
                  className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-indigo-400 hover:shadow-2xl transition-all duration-300"
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
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => generateReadyKitPDF(kit, 'color')}
                        disabled={downloading === kit.id}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === kit.id ? (
                          <span className="text-sm">⏳</span>
                        ) : (
                          <span>🎨</span>
                        )}
                        <span>{downloading === kit.id ? 'İndiriliyor...' : 'Renkli'}</span>
                      </button>
                      <button
                        onClick={() => generateReadyKitPDF(kit, 'bw')}
                        disabled={downloading === kit.id}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all font-poppins text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === kit.id ? (
                          <span className="text-sm">⏳</span>
                        ) : (
                          <span>⚫</span>
                        )}
                        <span>{downloading === kit.id ? 'İndiriliyor...' : 'S/B'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                      ))}
                  </div>
                </div>
              )}

              {/* User Approved Kits */}
              {approvedKits.length > 0 && (selectedCategory === 'all' || approvedKits.some(k => k.category === selectedCategory)) && (
                <div className="mb-12">
                  {selectedCategory === 'all' && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins text-center">⭐ Kullanıcıların Oluşturduğu Setler</h2>
                  )}
                  {selectedCategory !== 'all' && approvedKits.some(k => k.category === selectedCategory) && !readyKits.some(k => k.category === selectedCategory) && (
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins flex items-center gap-3">
                      <span>{categories.find(c => c.id === selectedCategory)?.icon || '📚'}</span>
                      <span>{categories.find(c => c.id === selectedCategory)?.name || 'Kategori'} Setler</span>
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {approvedKits
                      .filter(kit => selectedCategory === 'all' || kit.category === selectedCategory)
                      .map((kit) => (
                  <div 
                    key={kit.id}
                    className="group bg-white rounded-2xl p-6 border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300"
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
                        <span className="text-xs text-purple-600 font-poppins font-semibold bg-purple-50 px-2 py-1 rounded">
                          ⭐ Kullanıcı
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => generateReadyKitPDF(kit, 'color')}
                          disabled={downloading === kit.id}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloading === kit.id ? (
                            <span className="text-sm">⏳</span>
                          ) : (
                            <span>🎨</span>
                          )}
                          <span>{downloading === kit.id ? 'İndiriliyor...' : 'Renkli'}</span>
                        </button>
                        <button
                          onClick={() => generateReadyKitPDF(kit, 'bw')}
                          disabled={downloading === kit.id}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all font-poppins text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloading === kit.id ? (
                            <span className="text-sm">⏳</span>
                          ) : (
                            <span>⚫</span>
                          )}
                          <span>{downloading === kit.id ? 'İndiriliyor...' : 'S/B'}</span>
                        </button>
                      </div>
                    </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedCategory !== 'all' && 
               readyKits.filter(k => k.category === selectedCategory).length === 0 && 
               approvedKits.filter(k => k.category === selectedCategory).length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
                  <div className="text-6xl mb-4">
                    {categories.find(c => c.id === selectedCategory)?.icon || '📚'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">
                    Bu kategoride henüz set yok
                  </h3>
                  <p className="text-gray-600 font-poppins mb-6">
                    {categories.find(c => c.id === selectedCategory)?.description || ''}
                  </p>
                  <Link
                    to="/generator"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins"
                  >
                    <span>+</span>
                    <span>İlk Seti Oluştur</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Custom Set CTA */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl p-8 border-2 border-indigo-200 shadow-xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">
                Kendi Kelime Setinizi Oluşturun
              </h3>
              <p className="text-gray-600 font-poppins mb-6">
                Hazır setler size uymuyor mu? Kendi kelime kartlarınızı özelleştirerek oluşturun!
              </p>
              <Link
                to="/generator"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Özel Set Oluştur</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReadyKits

