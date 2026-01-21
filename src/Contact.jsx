import { Link } from 'react-router-dom'
import { getSiteContent } from './utils/siteContent'
import { getBrandingSettings } from './utils/branding'
import { SECURE_LOGIN_URL } from './App'

function Contact() {
  const content = getSiteContent()
  const branding = getBrandingSettings()

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
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              {content.contactPage?.title || "İletişim"}
            </h2>
            <p className="text-xl text-gray-600 font-poppins">
              {content.contactPage?.subtitle || "Bizimle iletişime geçin, her zaman size yardımcı olmaktan mutluluk duyarız!"}
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Email Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">{content.contactPage?.emailTitle || "E-posta"}</h3>
              <p className="text-gray-600 font-poppins mb-4">
                {content.contactPage?.emailDescription || "Size en kısa sürede geri dönüş yapacağız."}
              </p>
              <a 
                href={`mailto:${content.contactEmail}`}
                className="text-blue-600 hover:text-blue-700 font-semibold font-poppins text-lg break-all"
              >
                {content.contactEmail}
              </a>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200 hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">{content.contactPage?.phoneTitle || "Telefon"}</h3>
              <p className="text-gray-600 font-poppins mb-4">
                {content.contactPage?.phoneDescription || "Bizi arayarak hızlıca ulaşabilirsiniz."}
              </p>
              <a 
                href={`tel:${content.contactPhone.replace(/\s/g, '')}`}
                className="text-purple-600 hover:text-purple-700 font-semibold font-poppins text-lg"
              >
                {content.contactPhone}
              </a>
            </div>
          </div>

          {/* Social Media */}
          {(content.socialMedia.facebook || content.socialMedia.twitter || content.socialMedia.instagram || content.socialMedia.linkedin) && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 font-poppins text-center">
                {content.contactPage?.socialTitle || "Sosyal Medyada Bizi Takip Edin"}
              </h3>
              <div className="flex justify-center gap-4 flex-wrap">
                {content.socialMedia.facebook && (
                  <a
                    href={content.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl">f</span>
                  </a>
                )}
                {content.socialMedia.twitter && (
                  <a
                    href={content.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-sky-500 hover:bg-sky-600 rounded-lg flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl">𝕏</span>
                  </a>
                )}
                {content.socialMedia.instagram && (
                  <a
                    href={content.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl">📷</span>
                  </a>
                )}
                {content.socialMedia.linkedin && (
                  <a
                    href={content.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-700 hover:bg-blue-800 rounded-lg flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl">in</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Feedback Link */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 font-poppins mb-4">
              {content.contactPage?.feedbackText || "Veya geri bildirim formunu kullanarak bize mesaj gönderin:"}
            </p>
            <Link
              to="/feedback"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-poppins shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {content.contactPage?.feedbackButton || "Geri Bildirim Gönder"}
            </Link>
          </div>

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all font-poppins"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {content.contactPage?.backButton || "Ana Sayfaya Dön"}
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

export default Contact

