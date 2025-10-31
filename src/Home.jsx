import { Link } from 'react-router-dom'
import confetti from 'canvas-confetti'

function Home() {
  const handleButtonClick = () => {
    // Butona basıldığında küçük bir konfeti animasyonu
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981']
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Modern geometrik arka plan elementleri */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/40 to-pink-100/40 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center justify-center min-h-[85vh]">
          
          {/* Logo/Brand Area */}
          <div className="mb-12 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-4xl md:text-5xl">📚</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 font-poppins">
              Kelime Tombalası
            </h1>
            <p className="text-lg md:text-xl text-gray-600 font-poppins max-w-2xl mx-auto leading-relaxed">
              İngilizce-Türkçe kelime kartlarınızı profesyonel PDF formatında oluşturun. 
              <span className="block mt-2 text-gray-500">Hızlı, kolay ve tamamen ücretsiz.</span>
            </p>
          </div>

          {/* Özellikler - Modern Card Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl w-full">
            {/* Feature 1 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-poppins mb-3">Word Dosyası İçe Aktarma</h3>
              <p className="text-gray-600 font-poppins text-sm leading-relaxed">
                Mevcut Word (.docx) dosyalarınızı yükleyin, kelimeler otomatik olarak işlenir ve formatlanır.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-poppins mb-3">Manuel Kelime Girişi</h3>
              <p className="text-gray-600 font-poppins text-sm leading-relaxed">
                Kelimeleri doğrudan arayüze yazarak ekleyin. Basit "kelime: anlam" formatıyla kolayca giriş yapabilirsiniz.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 font-poppins mb-3">Profesyonel PDF Çıktı</h3>
              <p className="text-gray-600 font-poppins text-sm leading-relaxed">
                Renkli ve siyah-beyaz yazıcılar için optimize edilmiş, A4 formatında yüksek kaliteli PDF dosyaları oluşturun.
              </p>
            </div>
          </div>

          {/* Ana CTA Butonu */}
          <Link
            to="/generator"
            onClick={handleButtonClick}
            className="group relative inline-flex items-center justify-center px-10 py-5 md:px-14 md:py-6 text-lg md:text-xl font-semibold font-poppins text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10 flex items-center gap-3">
              <span>Başlamak için tıklayın</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>

          {/* Güven Veren Metin ve İstatistikler - Yatay Düzen */}
          <div className="max-w-6xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Güven Veren Metin */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-poppins">Güvenli ve Hızlı</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 font-poppins">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tüm işlemler tarayıcınızda gerçekleşir</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1.250+ kullanıcı güvenle kullanıyor</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Tamamen ücretsiz, kayıt gerektirmez</span>
                </li>
              </ul>
            </div>

            {/* Canlı İstatistikler */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 font-poppins mb-4">Canlı İstatistikler</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-poppins">Bugünkü Kullanıcı</span>
                  <span className="font-bold text-blue-600 font-poppins text-lg">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-poppins">Bu Hafta</span>
                  <span className="font-bold text-indigo-600 font-poppins text-lg">234 PDF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-poppins">Toplam Kelime</span>
                  <span className="font-bold text-purple-600 font-poppins text-lg">125K+</span>
                </div>
              </div>
            </div>

            {/* Reklam Alanı */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m-7 4h7M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 font-poppins mb-2">Reklam Alanı</h4>
                <p className="text-sm text-gray-600 font-poppins mb-4">
                  Reklam alanı burada görünecek
                </p>
                <div className="bg-white rounded-lg p-4 border border-gray-200 min-h-[100px] flex items-center justify-center">
                  <span className="text-gray-400 text-sm font-poppins">300x250</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alt Bilgi - Farklı Tasarım */}
          <div className="mt-16 max-w-5xl w-full">
            <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl p-8 md:p-12 border border-blue-200/50 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins mb-3">
                  Neden Kelime Tombalası?
                </h2>
                <p className="text-gray-600 font-poppins max-w-2xl mx-auto">
                  Binlerce öğretmen ve öğrenci kelime kartlarını kolayca oluşturmak için bizi tercih ediyor
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-white/60 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-poppins mb-2">
                    1.2K+
                  </div>
                  <div className="text-sm font-semibold text-gray-700 font-poppins mb-1">Aktif Kullanıcı</div>
                  <div className="text-xs text-gray-500 font-poppins">Her gün artıyor</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-poppins mb-2">
                    3.4K+
                  </div>
                  <div className="text-sm font-semibold text-gray-700 font-poppins mb-1">PDF Oluşturuldu</div>
                  <div className="text-xs text-gray-500 font-poppins">Başarıyla tamamlandı</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-poppins mb-2">
                    125K+
                  </div>
                  <div className="text-sm font-semibold text-gray-700 font-poppins mb-1">Kelime İşlendi</div>
                  <div className="text-xs text-gray-500 font-poppins">Toplam kelime sayısı</div>
                </div>
                <div className="text-center p-4 bg-white/60 rounded-xl">
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent font-poppins mb-2">
                    100%
                  </div>
                  <div className="text-sm font-semibold text-gray-700 font-poppins mb-1">Ücretsiz</div>
                  <div className="text-xs text-gray-500 font-poppins">Her zaman ücretsiz</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 font-poppins">
          <p className="text-sm">Çocuklar için eğlenceli kelime öğrenme aracı 🎓</p>
          <div className="flex items-center gap-6">
            <Link
              to="/feedback"
              className="text-sm hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Görüş ve Öneriler
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

