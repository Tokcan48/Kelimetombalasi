import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSiteContent } from './utils/siteContent'
import { getBrandingSettings } from './utils/branding'
import { useAdSense } from './hooks/useAdSense'

function FAQ() {
  // Load AdSense only on content pages
  useAdSense()

  const [content, setContent] = useState(getSiteContent())
  const branding = getBrandingSettings()

  // Reload content from localStorage in case it was updated
  useEffect(() => {
    setContent(getSiteContent())
  }, [])

  // Parse FAQ content - Format: Soru (satır sonunda ?), alt satırlarda cevap, sorular arasında boş satır
  const parseFAQContent = (faqContent) => {
    if (!faqContent || !faqContent.trim()) {
      return []
    }

    const lines = faqContent.split('\n')
    const faqItems = []
    
    let currentQuestion = null
    let currentAnswer = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()
      
      // Empty line - end current Q&A and start new one if we have a question
      if (!trimmedLine) {
        if (currentQuestion && currentAnswer.length > 0) {
          faqItems.push({
            question: currentQuestion,
            answer: currentAnswer.join('\n').trim()
          })
          currentQuestion = null
          currentAnswer = []
        }
        continue
      }
      
      // Check if this line looks like a question (ends with ? or is short and looks like a question)
      if (trimmedLine.endsWith('?') || 
          (trimmedLine.length < 100 && (i === 0 || !lines[i-1]?.trim()))) {
        // Save previous Q&A if exists
        if (currentQuestion && currentAnswer.length > 0) {
          faqItems.push({
            question: currentQuestion,
            answer: currentAnswer.join('\n').trim()
          })
        }
        // Start new question
        currentQuestion = trimmedLine.replace(/^(Soru|Q|❓|Q:)\s*/i, '').trim()
        currentAnswer = []
      } else if (currentQuestion) {
        // This is part of the answer
        currentAnswer.push(trimmedLine)
      } else if (faqItems.length === 0) {
        // First line but doesn't look like a question - treat as question
        currentQuestion = trimmedLine
      }
    }
    
    // Don't forget the last Q&A
    if (currentQuestion) {
      faqItems.push({
        question: currentQuestion,
        answer: currentAnswer.join('\n').trim() || "Cevap henüz eklenmemiş."
      })
    }
    
    return faqItems
  }

  const faqData = content.legalPages?.faq || { title: "Sıkça Sorulan Sorular", content: "" }
  const faqItems = parseFAQContent(faqData.content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {branding.useEmojiAsLogo ? (
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{branding.logoEmoji}</span>
                </div>
              ) : branding.siteLogo ? (
                <img src={branding.siteLogo} alt={branding.logoText} className="h-10 object-contain" />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
              )}
              <h1 className="text-2xl md:text-3xl font-bold font-poppins">{branding.logoText || content.siteTitle}</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 shadow-lg">
              <span className="text-indigo-600 font-poppins text-sm font-semibold">{content.faqPage?.badge || "❓ Sık Sorulan Sorular"}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              {faqData.title || "Sıkça Sorulan Sorular"}
            </h1>
            <p className="text-xl text-gray-600 font-poppins">
              {content.faqPage?.subtitle || "Aklınıza takılan soruların yanıtları burada"}
            </p>
          </div>

          {/* FAQ Items */}
          {faqItems.length > 0 ? (
            <div className="space-y-6 mb-12">
              {faqItems.map((item, index) => {
                const colors = [
                  'from-blue-50 to-indigo-50 border-blue-100',
                  'from-purple-50 to-pink-50 border-purple-100',
                  'from-green-50 to-emerald-50 border-green-100',
                  'from-orange-50 to-red-50 border-orange-100',
                  'from-indigo-50 to-blue-50 border-indigo-100',
                  'from-pink-50 to-purple-50 border-pink-100'
                ]
                const colorClass = colors[index % colors.length]
                
                return (
                  <div key={index} className={`bg-gradient-to-br ${colorClass} rounded-xl p-6 border-2 shadow-lg`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 font-poppins flex items-start gap-3">
                      <span className="text-2xl">❓</span>
                      <span>{item.question}</span>
                    </h3>
                    <p className="text-gray-700 font-poppins leading-relaxed pl-11 whitespace-pre-wrap">
                      {item.answer}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center mb-12">
              <p className="text-gray-600 font-poppins">
                {content.faqPage?.noQuestionsMessage || "Henüz soru eklenmemiş. Admin panelinden içerik ekleyebilirsiniz."}
              </p>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {content.faqPage?.backButton || "Ana Sayfaya Dön"}
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

export default FAQ

