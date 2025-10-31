import { useState } from 'react'
import { Link } from 'react-router-dom'

function Admin() {
  const [stats] = useState({
    totalUsers: 1250,
    totalPDFs: 3420,
    totalWords: 125000,
    todayUsers: 45
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-poppins mb-2">Admin Paneli</h1>
            <p className="text-gray-600 font-poppins">Sistem istatistikleri ve yönetim</p>
          </div>
          <Link
            to="/generator"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-poppins"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-poppins text-sm">Toplam Kullanıcı</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-poppins">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-gray-500 font-poppins mt-2">+12 bu ay</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-poppins text-sm">Oluşturulan PDF</h3>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-poppins">{stats.totalPDFs.toLocaleString()}</div>
            <div className="text-sm text-gray-500 font-poppins mt-2">+234 bu hafta</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-poppins text-sm">Toplam Kelime</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-poppins">{stats.totalWords.toLocaleString()}</div>
            <div className="text-sm text-gray-500 font-poppins mt-2">+1.2K bu hafta</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 font-poppins text-sm">Bugünkü Kullanıcı</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-poppins">{stats.todayUsers}</div>
            <div className="text-sm text-gray-500 font-poppins mt-2">Aktif kullanıcı</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 font-poppins mb-4">Son Aktiviteler</h2>
            <div className="space-y-4">
              {[
                { user: 'Ahmet Y.', action: '96 kelime ile PDF oluşturdu', time: '5 dakika önce' },
                { user: 'Ayşe K.', action: '48 kelime ile PDF oluşturdu', time: '12 dakika önce' },
                { user: 'Mehmet D.', action: 'Word dosyası yükledi', time: '23 dakika önce' },
                { user: 'Zeynep A.', action: '144 kelime ile PDF oluşturdu', time: '35 dakika önce' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold font-poppins">
                    {activity.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-poppins font-medium">{activity.user}</p>
                    <p className="text-gray-600 font-poppins text-sm">{activity.action}</p>
                    <p className="text-gray-400 font-poppins text-xs mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 font-poppins mb-4">Sistem Durumu</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-poppins">Sunucu Durumu</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-poppins font-medium">Çalışıyor</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-poppins">Veritabanı</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-poppins font-medium">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-poppins">PDF Generator</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-poppins font-medium">Operasyonel</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-poppins">Güvenlik</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-poppins font-medium">Aktif</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700 font-poppins">
                <strong>Sistem Sağlığı:</strong> Tüm servisler normal çalışıyor. Son kontrol: 2 dakika önce
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin

