import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getRealAnalytics, getRecentPDFHistory, getPDFHistoryByUser } from './utils/analytics'
import { getSystemLogs, addSystemLog } from './utils/systemLogs'
import { getAllFeedbacks, getUnreadCount, markAsRead, deleteFeedback, getTimeAgo } from './utils/feedback'
import { getSiteContent, saveSiteContent, resetSiteContent } from './utils/siteContent'
import { getAdSenseSettings, saveAdSenseSettings, generateAdsTxt, resetAdSenseSettings } from './utils/adsense'
import { getAdminCredentials, saveAdminCredentials } from './utils/adminAuth'
import { getBrandingSettings, saveBrandingSettings, fileToBase64, resetBrandingSettings } from './utils/branding'
import { SECURE_LOGIN_URL } from './App'

function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalPDFs: 0,
    totalWords: 0,
    todayPDFs: 0,
    weeklyPDFs: 0,
    weeklyGrowth: 0,
    estimatedUsers: 0,
    avgWordsPerPDF: 0
  })

  const [pdfHistory, setPdfHistory] = useState([])
  const [recentPDFs, setRecentPDFs] = useState([])
  const [systemLogs, setSystemLogs] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [siteContent, setSiteContent] = useState(getSiteContent())
  const [isSaving, setIsSaving] = useState(false)
  const [expandedUsers, setExpandedUsers] = useState(new Set())
  const [adsenseSettings, setAdsenseSettings] = useState(getAdSenseSettings())
  const [isSavingAds, setIsSavingAds] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [brandingSettings, setBrandingSettings] = useState(getBrandingSettings())
  const [isSavingBranding, setIsSavingBranding] = useState(false)

  // Function to update stats
  const updateStats = () => {
    const realStats = getRealAnalytics()
    setStats(realStats)
    
    const groupedPDFs = getPDFHistoryByUser()
    setPdfHistory(groupedPDFs)
    
    const recent = getRecentPDFHistory(10)
    setRecentPDFs(recent)
    
    const logs = getSystemLogs(20)
    setSystemLogs(logs)
    
    const allFeedbacks = getAllFeedbacks()
    setFeedbacks(allFeedbacks)
    
    const unread = getUnreadCount()
    setUnreadCount(unread)
  }

  // Toggle user expansion
  const toggleUserExpansion = (userId) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  // Update AdSense field
  const updateAdsenseField = (field, value) => {
    setAdsenseSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update AdSense ad slot
  const updateAdSlot = (slot, value) => {
    setAdsenseSettings(prev => ({
      ...prev,
      adSlots: {
        ...prev.adSlots,
        [slot]: value
      }
    }))
  }

  // Save AdSense settings
  const handleSaveAdsense = () => {
    setIsSavingAds(true)
    saveAdSenseSettings(adsenseSettings)
    setTimeout(() => {
      setIsSavingAds(false)
      alert('✅ AdSense ayarları başarıyla kaydedildi!')
    }, 500)
  }

  // Download ads.txt
  const handleDownloadAdsTxt = () => {
    const content = generateAdsTxt(adsenseSettings.publisherId)
    if (!content) {
      alert('⚠️ Lütfen önce Publisher ID girin!')
      return
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ads.txt'
    link.click()
    URL.revokeObjectURL(url)
    
    alert('✅ ads.txt dosyası indirildi! Bunu sunucunuzun kök dizinine yükleyin.')
  }

  // Handle logo upload
  const handleLogoUpload = async (e, type) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Lütfen geçerli bir resim dosyası seçin!')
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('⚠️ Dosya boyutu çok büyük! Maksimum 2MB olmalıdır.')
      return
    }
    
    try {
      const base64 = await fileToBase64(file)
      setBrandingSettings(prev => ({
        ...prev,
        [type]: base64
      }))
      alert('✅ Logo yüklendi! Kaydetmeyi unutmayın.')
    } catch (error) {
      console.error('Logo yükleme hatası:', error)
      alert('❌ Logo yüklenirken bir hata oluştu!')
    }
  }

  // Update branding field
  const updateBrandingField = (field, value) => {
    setBrandingSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Save branding settings
  const handleSaveBranding = () => {
    setIsSavingBranding(true)
    saveBrandingSettings(brandingSettings)
    setTimeout(() => {
      setIsSavingBranding(false)
      alert('✅ Logo ve marka ayarları başarıyla kaydedildi! Sayfayı yenileyin.')
    }, 500)
  }

  // Change admin credentials
  const handleChangeCredentials = () => {
    // Validations
    if (!newUsername.trim()) {
      alert('⚠️ Lütfen yeni kullanıcı adını girin!')
      return
    }

    if (!currentPassword) {
      alert('⚠️ Lütfen mevcut şifrenizi girin!')
      return
    }

    // Verify current password
    const currentCreds = getAdminCredentials()
    if (currentPassword !== currentCreds.password) {
      alert('❌ Mevcut şifre hatalı!')
      return
    }

    if (!newPassword) {
      alert('⚠️ Lütfen yeni şifrenizi girin!')
      return
    }

    if (newPassword.length < 6) {
      alert('⚠️ Şifre en az 6 karakter olmalıdır!')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('❌ Yeni şifreler eşleşmiyor!')
      return
    }

    // Save new credentials
    saveAdminCredentials(newUsername, newPassword)
    
    // Clear form
    setNewUsername('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')

    addSystemLog('warning', `Admin hesap bilgileri değiştirildi (Kullanıcı: ${newUsername})`, 'Admin')
    
    alert('✅ Hesap bilgileriniz başarıyla güncellendi! Yeniden giriş yapmanız gerekecek.')
    
    // Logout and redirect to login
    setTimeout(() => {
      handleLogout()
    }, 1500)
  }

  // Handle mark as read
  const handleMarkAsRead = (id) => {
    markAsRead(id)
    updateStats()
  }

  // Handle delete feedback
  const handleDeleteFeedback = (id) => {
    if (window.confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      deleteFeedback(id)
      updateStats()
    }
  }

  // Handle save content
  const handleSaveContent = () => {
    setIsSaving(true)
    saveSiteContent(siteContent)
    addSystemLog('success', 'Site içeriği güncellendi', 'Admin')
    setTimeout(() => {
      setIsSaving(false)
      alert('✅ Site içeriği başarıyla kaydedildi!')
      updateStats() // Refresh logs
    }, 500)
  }

  // Handle reset content
  const handleResetContent = () => {
    if (window.confirm('Tüm içeriği varsayılan ayarlara geri yüklemek istediğinizden emin misiniz?')) {
      const defaultContent = resetSiteContent()
      setSiteContent(defaultContent)
      alert('✅ İçerik varsayılan ayarlara geri yüklendi!')
    }
  }

  // Update simple content field
  const updateContentField = (field, value) => {
    setSiteContent(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Update social media field
  const updateSocialMedia = (platform, value) => {
    setSiteContent(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  // Update footer link
  const updateFooterLink = (section, index, field, value) => {
    setSiteContent(prev => ({
      ...prev,
      footerLinks: {
        ...prev.footerLinks,
        [section]: prev.footerLinks[section].map((link, i) => 
          i === index ? { ...link, [field]: value } : link
        )
      }
    }))
  }

  // Update legal page
  const updateLegalPage = (page, field, value) => {
    setSiteContent(prev => ({
      ...prev,
      legalPages: {
        ...prev.legalPages,
        [page]: {
          ...prev.legalPages[page],
          [field]: value
        }
      }
    }))
  }

  // Load real analytics on mount and tab change
  useEffect(() => {
    updateStats()
    
    // Set current username as placeholder when settings tab is opened
    if (activeTab === 'settings' && !newUsername) {
      setNewUsername(getAdminCredentials().username)
    }
    
    // Log admin panel access (only once on mount)
    if (activeTab === 'dashboard') {
      const lastLogin = sessionStorage.getItem('adminLastLogin')
      if (!lastLogin) {
        addSystemLog('info', 'Admin paneline giriş yapıldı', 'Admin')
        sessionStorage.setItem('adminLastLogin', Date.now())
      }
    }
    
    // Auto-refresh every 2 minutes (only on dashboard) - gentle on server
    let interval = null
    if (activeTab === 'dashboard') {
      interval = setInterval(updateStats, 120000) // 2 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTab])

  // Mock users (will be removed when real user system is implemented)
  const users = []

  // Login kontrolü
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
    if (!isLoggedIn || isLoggedIn !== 'true') {
      navigate(SECURE_LOGIN_URL)
    }
  }, [navigate])

  // Logout fonksiyonu
  const handleLogout = () => {
    addSystemLog('info', 'Admin çıkış yaptı', 'Admin')
    localStorage.removeItem('isAdminLoggedIn')
    localStorage.removeItem('adminUsername')
    sessionStorage.removeItem('adminLastLogin')
    navigate(SECURE_LOGIN_URL)
  }

  const filteredUsers = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700 min-h-screen sticky top-0 flex flex-col shadow-2xl">
        {/* Logo & Title */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
          <div>
              <h1 className="text-lg font-bold text-white font-poppins">Admin Panel</h1>
              <p className="text-xs text-gray-400 font-poppins">Kelime Tombalası</p>
          </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">📊</span>
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base">💬</span>
                <span>Geri Bildirimler</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('pdfs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'pdfs'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">📄</span>
              <span>PDF Geçmişi</span>
            </button>
            
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'logs'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">📋</span>
              <span>Sistem Logları</span>
            </button>
            
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'content'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">🌐</span>
              <span>Site Bilgileri</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'branding'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">🎨</span>
              <span>Logo & Marka</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'ads'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">💰</span>
              <span>Reklamlar</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'security'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">🛡️</span>
              <span>Güvenlik Logları</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-poppins text-sm transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span className="text-base">⚙️</span>
              <span>Ayarlar</span>
            </button>
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-700 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-poppins font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ana Sayfa
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-poppins font-medium shadow-lg shadow-red-500/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-poppins mb-2">Dashboard</h2>
                <p className="text-gray-400 font-poppins">Sistem istatistiklerine genel bakış</p>
              </div>
              <button
                onClick={updateStats}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-poppins text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Yenile
              </button>
              </div>

            {/* Kullanım İstatistikleri Kartı */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-8 shadow-2xl border border-blue-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
            </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-poppins">Kullanım İstatistikleri</h3>
                  <p className="text-blue-100 text-sm font-poppins">Gerçek zamanlı veriler</p>
                </div>
          </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white font-poppins mb-1">{stats.todayPDFs}</div>
                  <div className="text-blue-100 text-xs font-poppins">Bugün</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white font-poppins mb-1">{stats.weeklyPDFs}</div>
                  <div className="text-blue-100 text-xs font-poppins">Bu Hafta</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white font-poppins mb-1">{stats.monthlyPDFs}</div>
                  <div className="text-blue-100 text-xs font-poppins">Bu Ay</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white font-poppins mb-1">{stats.totalPDFs}</div>
                  <div className="text-blue-100 text-xs font-poppins">Toplam</div>
                </div>
              </div>
            </div>

            {/* Active Users Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-8 shadow-2xl border border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <div className="relative">
                      <span className="text-2xl">👥</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white font-poppins">Aktif Kullanıcılar</h3>
                    <p className="text-green-100 text-sm font-poppins">Son 5 dakikada aktif</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white font-poppins">{stats.activeUsers}</div>
                  <div className="text-green-100 text-sm font-poppins mt-1">Şu an aktif</div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700 transform hover:scale-105 transition-all hover:border-indigo-500/50">
            <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-poppins text-sm font-semibold">Oluşturulan PDF</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
                <div className="text-4xl font-bold text-white font-poppins mb-2">{stats.totalPDFs.toLocaleString()}</div>
                <div className="text-sm text-gray-400 font-poppins">+{stats.weeklyPDFs} bu hafta</div>
          </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700 transform hover:scale-105 transition-all hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-poppins text-sm font-semibold">Toplam Kelime</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
                <div className="text-4xl font-bold text-white font-poppins mb-2">{stats.totalWords > 1000 ? (stats.totalWords / 1000).toFixed(1) + 'K' : stats.totalWords}</div>
                <div className="text-sm text-gray-400 font-poppins">Ort: {stats.avgWordsPerPDF} kelime/PDF</div>
          </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700 transform hover:scale-105 transition-all hover:border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 font-poppins text-sm font-semibold">Haftalık Büyüme</h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
                <div className="text-4xl font-bold text-white font-poppins mb-2">
                  {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth}%
                </div>
                <div className="text-sm text-gray-400 font-poppins">Geçen haftaya göre</div>
          </div>
        </div>

            {/* Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Son Aktiviteler */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white font-poppins mb-4 flex items-center gap-2">
                  <span>🕐</span> Son Aktiviteler
                </h2>
            <div className="space-y-4">
                  {recentPDFs.slice(0, 5).map((pdf) => (
                    <div key={pdf.id} className="flex items-start gap-3 pb-4 border-b border-slate-700 last:border-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold font-poppins text-sm shadow-lg">
                        #{pdf.user.replace('Kullanıcı #', '')}
                  </div>
                  <div className="flex-1">
                        <p className="text-white font-poppins font-semibold">{pdf.user}</p>
                        <p className="text-gray-400 font-poppins text-sm">{pdf.words} kelime • {pdf.type}</p>
                        <p className="text-gray-500 font-poppins text-xs mt-1">{pdf.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

              {/* Sistem Durumu */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white font-poppins mb-4 flex items-center gap-2">
                  <span>🖥️</span> Sistem Durumu
                </h2>
            <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-gray-300 font-poppins font-medium">Sunucu Durumu</span>
              </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-poppins font-semibold border border-green-500/30">Çalışıyor</span>
              </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-gray-300 font-poppins font-medium">Veritabanı</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-poppins font-semibold border border-green-500/30">Aktif</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-gray-300 font-poppins font-medium">PDF Generator</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-poppins font-semibold border border-green-500/30">Operasyonel</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-gray-300 font-poppins font-medium">Güvenlik</span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-poppins font-semibold border border-green-500/30">Aktif</span>
                  </div>
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-sm text-blue-400 font-poppins">
                      <strong>Sistem Sağlığı:</strong> Tüm servisler normal çalışıyor. Son kontrol: 2 dakika önce
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedbacks Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-poppins mb-2">Geri Bildirimler</h2>
                <p className="text-gray-400 font-poppins">Kullanıcılardan gelen mesajlar</p>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-poppins font-semibold">{unreadCount} Okunmamış</span>
                </div>
              )}
            </div>

            {feedbacks.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-12 text-center">
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white font-poppins mb-3">Henüz Mesaj Yok</h3>
                <p className="text-gray-400 font-poppins">
                  Kullanıcılardan gelen geri bildirimler burada görünecek.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border p-6 ${
                      feedback.status === 'unread'
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-lg flex-shrink-0">
                          {feedback.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-white font-poppins">{feedback.name}</h3>
                            {feedback.status === 'unread' && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-poppins font-semibold">
                                Yeni
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 font-poppins">{feedback.email}</p>
                          <p className="text-xs text-gray-500 font-poppins mt-1">{getTimeAgo(feedback.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {feedback.status === 'unread' && (
                          <button
                            onClick={() => handleMarkAsRead(feedback.id)}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all font-poppins text-sm font-semibold border border-blue-500/30"
                          >
                            Okundu İşaretle
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteFeedback(feedback.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <p className="text-gray-300 font-poppins text-sm leading-relaxed whitespace-pre-wrap">
                        {feedback.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDFs Tab */}
        {activeTab === 'pdfs' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white font-poppins mb-2">PDF Geçmişi</h2>
              <p className="text-gray-400 font-poppins">Kullanıcı bazlı PDF oluşturma geçmişi</p>
            </div>

            {pdfHistory.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-12 text-center">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-400 font-poppins text-lg">Henüz PDF oluşturulmamış</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pdfHistory.map((user) => (
                  <div key={user.userId} className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 overflow-hidden">
                    {/* User Header - Clickable */}
                    <div 
                      onClick={() => toggleUserExpansion(user.userId)}
                      className="p-6 cursor-pointer hover:bg-slate-700/30 transition-all"
                    >
              <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold font-poppins shadow-lg text-lg">
                            #{user.userId}
              </div>
                          <div>
                            <h3 className="text-xl font-bold text-white font-poppins">{user.userName}</h3>
                            <p className="text-sm text-gray-400 font-poppins">Son işlem: {user.lastActivity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white font-poppins">{user.totalPDFs}</div>
                            <div className="text-xs text-gray-400 font-poppins">PDF</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-400 font-poppins">{user.totalWords}</div>
                            <div className="text-xs text-gray-400 font-poppins">Kelime</div>
                          </div>
                          <div className="text-gray-400">
                            <svg 
                              className={`w-6 h-6 transition-transform ${expandedUsers.has(user.userId) ? 'rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User PDF Details - Expandable */}
                    {expandedUsers.has(user.userId) && (
                      <div className="border-t border-slate-700 bg-slate-900/30">
                        <div className="p-6">
                          <h4 className="text-sm font-semibold text-gray-400 font-poppins mb-4 uppercase">PDF İşlemleri:</h4>
                          <div className="space-y-3">
                            {user.pdfs.map((pdf) => (
                              <div key={pdf.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <span className="text-blue-400 font-bold font-poppins text-sm">#{pdf.id}</span>
                                  </div>
                                  <div>
                                    <div className="text-white font-poppins font-medium">{pdf.words} kelime</div>
                                    <div className="text-xs text-gray-400 font-poppins">{pdf.timeAgo}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold font-poppins ${
                                    pdf.type === 'Renkli' 
                                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                  }`}>
                                    {pdf.type}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white font-poppins mb-2">Sistem Logları</h2>
              <p className="text-gray-400 font-poppins">Sistem aktivitelerini ve olayları izleyin</p>
            </div>

            {systemLogs.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-400 font-poppins text-lg">Henüz sistem logu yok</p>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white font-poppins">
                    Önemli Sistem Olayları
                  </h3>
                  <p className="text-sm text-gray-400 font-poppins">
                    Sadece admin işlemleri ve önemli olaylar
                  </p>
                </div>
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                  <div key={log.id} className={`p-4 rounded-lg border-l-4 ${
                    log.type === 'success' ? 'bg-green-500/10 border-green-500' :
                    log.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500' :
                    log.type === 'error' ? 'bg-red-500/10 border-red-500' :
                    'bg-blue-500/10 border-blue-500'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {log.type === 'success' ? '✅' :
                             log.type === 'warning' ? '⚠️' :
                             log.type === 'error' ? '❌' : 'ℹ️'}
                          </span>
                          <span className="font-poppins font-semibold text-white">{log.message}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400 font-poppins ml-7">
                          <span>Kullanıcı: {log.user}</span>
                          <span>•</span>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-poppins mb-2">Site Bilgileri</h2>
                <p className="text-gray-400 font-poppins">Sitenizin temel bilgilerini düzenleyin</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleResetContent}
                  className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all font-poppins text-sm font-semibold border border-slate-600"
                >
                  Varsayılana Dön
                </button>
                <button
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-poppins text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSaving ? 'Kaydediliyor...' : '💾 Kaydet'}
                </button>
              </div>
            </div>

            {/* Temel Bilgiler */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-6 flex items-center gap-3">
                <span className="text-3xl">🌐</span> Temel Bilgiler
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Site Başlığı</label>
                  <input
                    type="text"
                    value={siteContent.siteTitle}
                    onChange={(e) => updateContentField('siteTitle', e.target.value)}
                    placeholder="Örn: Kelime Tombalası"
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Ana Başlık</label>
                  <input
                    type="text"
                    value={siteContent.mainHeading}
                    onChange={(e) => updateContentField('mainHeading', e.target.value)}
                    placeholder="Örn: Kelime Öğrenimini Daha Kolay Yapın"
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Site Açıklaması</label>
                  <textarea
                    value={siteContent.description}
                    onChange={(e) => updateContentField('description', e.target.value)}
                    rows={4}
                    placeholder="Sitenizin kısa açıklamasını girin..."
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* İletişim Bilgileri */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-6 flex items-center gap-3">
                <span className="text-3xl">📧</span> İletişim Bilgileri
              </h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">E-posta Adresi</label>
                    <input
                      type="email"
                      value={siteContent.contactEmail}
                      onChange={(e) => updateContentField('contactEmail', e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Telefon Numarası</label>
                    <input
                      type="tel"
                      value={siteContent.contactPhone}
                      onChange={(e) => updateContentField('contactPhone', e.target.value)}
                      placeholder="+90 555 123 45 67"
                      className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">🌟</span> Sosyal Medya
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Boş bırakılan alanlar gösterilmeyecektir</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Facebook</label>
                  <input
                    type="url"
                    value={siteContent.socialMedia.facebook}
                    onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Twitter</label>
                  <input
                    type="url"
                    value={siteContent.socialMedia.twitter}
                    onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Instagram</label>
                  <input
                    type="url"
                    value={siteContent.socialMedia.instagram}
                    onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">LinkedIn</label>
                  <input
                    type="url"
                    value={siteContent.socialMedia.linkedin}
                    onChange={(e) => updateSocialMedia('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/..."
                    className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer & Site Durumu */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Footer */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-white font-poppins mb-6 flex items-center gap-3">
                  <span className="text-3xl">📄</span> Footer Bilgileri
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Footer Açıklaması</label>
                    <textarea
                      value={siteContent.footerDescription}
                      onChange={(e) => updateContentField('footerDescription', e.target.value)}
                      rows={3}
                      placeholder="Footer'da gösterilecek kısa açıklama"
                      className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Telif Hakkı Metni</label>
                    <input
                      type="text"
                      value={siteContent.copyright}
                      onChange={(e) => updateContentField('copyright', e.target.value)}
                      placeholder="© 2024 Siteniz. Tüm hakları saklıdır."
                      className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Site Durumu */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
                <h3 className="text-2xl font-bold text-white font-poppins mb-6 flex items-center gap-3">
                  <span className="text-3xl">🔧</span> Site Durumu
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-4">Site Durumu</label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 bg-slate-900/30 rounded-lg border-2 border-green-500/30 hover:border-green-500/50 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="siteStatus"
                          value="active"
                          checked={siteContent.siteStatus === 'active'}
                          onChange={(e) => updateContentField('siteStatus', e.target.value)}
                          className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                        />
                        <div className="ml-3">
                          <span className="text-white font-poppins font-semibold">✅ Aktif</span>
                          <p className="text-gray-400 text-xs mt-1 font-poppins">Site normal şekilde çalışıyor</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 bg-slate-900/30 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500/50 cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="siteStatus"
                          value="maintenance"
                          checked={siteContent.siteStatus === 'maintenance'}
                          onChange={(e) => updateContentField('siteStatus', e.target.value)}
                          className="w-5 h-5 text-yellow-600 focus:ring-2 focus:ring-yellow-500"
                        />
                        <div className="ml-3">
                          <span className="text-white font-poppins font-semibold">🔧 Bakımda</span>
                          <p className="text-gray-400 text-xs mt-1 font-poppins">Kullanıcılar bakım mesajı görecek</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {siteContent.siteStatus === 'maintenance' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Bakım Mesajı</label>
                      <textarea
                        value={siteContent.maintenanceMessage}
                        onChange={(e) => updateContentField('maintenanceMessage', e.target.value)}
                        rows={3}
                        placeholder="Kullanıcılara gösterilecek bakım mesajı"
                        className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Linkleri */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">🔗</span> Footer Linkleri
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Footer'da gösterilecek linkleri düzenleyin</p>
              
              <div className="space-y-8">
                {/* Ürün Linkleri */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 font-poppins mb-4">Ürün</h4>
                  <div className="space-y-4">
                    {siteContent.footerLinks.product.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/30 rounded-lg border border-slate-600">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 font-poppins mb-2">Link Metni</label>
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) => updateFooterLink('product', index, 'text', e.target.value)}
                            placeholder="Örn: PDF Oluştur"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 font-poppins mb-2">URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateFooterLink('product', index, 'url', e.target.value)}
                            placeholder="Örn: /generator"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Destek Linkleri */}
                <div>
                  <h4 className="text-lg font-semibold text-green-400 font-poppins mb-4">Destek</h4>
                  <div className="space-y-4">
                    {siteContent.footerLinks.support.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/30 rounded-lg border border-slate-600">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 font-poppins mb-2">Link Metni</label>
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) => updateFooterLink('support', index, 'text', e.target.value)}
                            placeholder="Örn: Geri Bildirim"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 font-poppins mb-2">URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateFooterLink('support', index, 'url', e.target.value)}
                            placeholder="Örn: /feedback"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yasal Linkler */}
                <div>
                  <h4 className="text-lg font-semibold text-purple-400 font-poppins mb-4">Yasal</h4>
                  <div className="space-y-4">
                    {siteContent.footerLinks.legal.map((link, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/30 rounded-lg border border-slate-600">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 font-poppins mb-2">Link Metni</label>
                          <input
                            type="text"
                            value={link.text}
                            onChange={(e) => updateFooterLink('legal', index, 'text', e.target.value)}
                            placeholder="Örn: Gizlilik Politikası"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 font-poppins mb-2">URL</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateFooterLink('legal', index, 'url', e.target.value)}
                            placeholder="Örn: /privacy"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Yasal Sayfalar İçeriği */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">⚖️</span> Yasal Sayfalar İçeriği
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Gizlilik Politikası, Kullanım Koşulları ve SSS sayfalarının içeriğini düzenleyin</p>
              
              <div className="space-y-8">
                {/* Gizlilik Politikası */}
                <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔒</span>
                    <h4 className="text-xl font-semibold text-blue-400 font-poppins">Gizlilik Politikası</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Sayfa Başlığı</label>
                      <input
                        type="text"
                        value={siteContent.legalPages.privacy.title}
                        onChange={(e) => updateLegalPage('privacy', 'title', e.target.value)}
                        placeholder="Örn: Gizlilik Politikası"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">İçerik</label>
                      <textarea
                        value={siteContent.legalPages.privacy.content}
                        onChange={(e) => updateLegalPage('privacy', 'content', e.target.value)}
                        rows={10}
                        placeholder="Gizlilik politikanızın tüm detaylarını buraya yazın..."
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-poppins">💡 Bu sayfa /privacy URL'inde görüntülenecektir</p>
                    </div>
                  </div>
                </div>

                {/* Kullanım Koşulları */}
                <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📜</span>
                    <h4 className="text-xl font-semibold text-green-400 font-poppins">Kullanım Koşulları</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Sayfa Başlığı</label>
                      <input
                        type="text"
                        value={siteContent.legalPages.terms.title}
                        onChange={(e) => updateLegalPage('terms', 'title', e.target.value)}
                        placeholder="Örn: Kullanım Koşulları"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">İçerik</label>
                      <textarea
                        value={siteContent.legalPages.terms.content}
                        onChange={(e) => updateLegalPage('terms', 'content', e.target.value)}
                        rows={10}
                        placeholder="Kullanım koşullarınızın tüm detaylarını buraya yazın..."
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-poppins">💡 Bu sayfa /terms URL'inde görüntülenecektir</p>
                    </div>
                  </div>
                </div>

                {/* SSS */}
                <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">❓</span>
                    <h4 className="text-xl font-semibold text-purple-400 font-poppins">Sıkça Sorulan Sorular (SSS)</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Sayfa Başlığı</label>
                      <input
                        type="text"
                        value={siteContent.legalPages.faq.title}
                        onChange={(e) => updateLegalPage('faq', 'title', e.target.value)}
                        placeholder="Örn: Sıkça Sorulan Sorular"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">İçerik</label>
                      <textarea
                        value={siteContent.legalPages.faq.content}
                        onChange={(e) => updateLegalPage('faq', 'content', e.target.value)}
                        rows={10}
                        placeholder="Sık sorulan soruları ve cevaplarını buraya yazın..."
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-poppins">💡 Bu sayfa /faq URL'inde görüntülenecektir</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button at Bottom */}
            <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 to-transparent pt-6 pb-4 flex justify-center">
              <button
                onClick={handleSaveContent}
                disabled={isSaving}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-poppins font-bold text-xl shadow-2xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '⏳ Kaydediliyor...' : '💾 Tümünü Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-poppins mb-2">🎨 Logo & Marka</h2>
                <p className="text-gray-400 font-poppins">Site logonuzu ve marka görsellerinizi yönetin</p>
              </div>
              <button
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-poppins text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSavingBranding ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>

            {/* Quick Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400 font-poppins mb-3 flex items-center gap-2">
                <span>💡</span> Logo Kullanım Rehberi
              </h3>
              <div className="space-y-2 text-sm text-gray-300 font-poppins">
                <p>• <strong>Site Logosu:</strong> Navbar'da görünür (önerilen: 200x50px, PNG/SVG)</p>
                <p>• <strong>Favicon:</strong> Tarayıcı sekmesinde görünür (önerilen: 32x32px veya 64x64px)</p>
                <p>• <strong>Sosyal Medya:</strong> Facebook/Twitter paylaşımlarında görünür (önerilen: 1200x630px)</p>
                <p>• Maksimum dosya boyutu: 2MB</p>
              </div>
            </div>

            {/* Site Logo */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">🏷️</span> Site Logosu
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Ana sayfada ve navbar'da görünen logonuz</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Logo Tipi</label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 bg-slate-900/30 rounded-lg border-2 border-purple-500/30 hover:border-purple-500/50 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="logoType"
                        checked={brandingSettings.useEmojiAsLogo}
                        onChange={() => updateBrandingField('useEmojiAsLogo', true)}
                        className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <span className="text-white font-poppins font-semibold">📚 Emoji Kullan</span>
                        <p className="text-gray-400 text-xs mt-1 font-poppins">Hızlı ve basit</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 bg-slate-900/30 rounded-lg border-2 border-purple-500/30 hover:border-purple-500/50 cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="logoType"
                        checked={!brandingSettings.useEmojiAsLogo}
                        onChange={() => updateBrandingField('useEmojiAsLogo', false)}
                        className="w-5 h-5 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="ml-3">
                        <span className="text-white font-poppins font-semibold">🖼️ Resim Yükle</span>
                        <p className="text-gray-400 text-xs mt-1 font-poppins">Profesyonel logo</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  {brandingSettings.useEmojiAsLogo ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Emoji Seçin</label>
                      <input
                        type="text"
                        value={brandingSettings.logoEmoji}
                        onChange={(e) => updateBrandingField('logoEmoji', e.target.value)}
                        placeholder="📚"
                        maxLength={2}
                        className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins text-4xl text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-poppins text-center">
                        Windows: Win + . | Mac: Cmd + Ctrl + Space
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Logo Resmi Yükle</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'siteLogo')}
                          className="hidden"
                          id="siteLogoUpload"
                        />
                        <label
                          htmlFor="siteLogoUpload"
                          className="flex flex-col items-center justify-center w-full h-32 bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-500 cursor-pointer transition-all"
                        >
                          {brandingSettings.siteLogo ? (
                            <img src={brandingSettings.siteLogo} alt="Logo" className="max-h-24 max-w-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-gray-400 font-poppins text-sm">Resim yüklemek için tıklayın</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Logo Metni</label>
                <input
                  type="text"
                  value={brandingSettings.logoText}
                  onChange={(e) => updateBrandingField('logoText', e.target.value)}
                  placeholder="Kelime Tombalası"
                  className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 font-poppins">Logo yanında görünecek metin</p>
              </div>
            </div>

            {/* Favicon */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">⭐</span> Favicon (Sekme İkonu)
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Tarayıcı sekmesinde görünen küçük ikon (32x32 veya 64x64px)</p>
              
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e, 'favicon')}
                    className="hidden"
                    id="faviconUpload"
                  />
                  <label
                    htmlFor="faviconUpload"
                    className="flex flex-col items-center justify-center w-full h-40 bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-500 cursor-pointer transition-all"
                  >
                    {brandingSettings.favicon ? (
                      <img src={brandingSettings.favicon} alt="Favicon" className="max-h-32 max-w-32 object-contain" />
                    ) : (
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 font-poppins text-sm">Favicon yüklemek için tıklayın</p>
                        <p className="text-xs text-gray-500 font-poppins mt-1">.ico, .png veya .svg</p>
                      </div>
                    )}
                  </label>
                </div>
                
                {brandingSettings.favicon && (
                  <div className="flex-1">
                    <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-600">
                      <p className="text-sm text-gray-300 font-poppins mb-3">Önizleme:</p>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                        <img src={brandingSettings.favicon} alt="Favicon" className="w-4 h-4" />
                        <span className="text-gray-700 font-poppins text-sm">{brandingSettings.logoText}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media Logo */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">📱</span> Sosyal Medya Logosu (OG Image)
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Google, Facebook, Twitter paylaşımlarında görünen görsel (1200x630px)</p>
              
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'socialMediaLogo')}
                className="hidden"
                id="socialLogoUpload"
              />
              <label
                htmlFor="socialLogoUpload"
                className="flex flex-col items-center justify-center w-full h-64 bg-slate-900/50 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-500 cursor-pointer transition-all"
              >
                {brandingSettings.socialMediaLogo ? (
                  <img src={brandingSettings.socialMediaLogo} alt="Social Media Logo" className="max-h-56 max-w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 font-poppins text-lg font-semibold mb-1">OG Image Yükle</p>
                    <p className="text-gray-500 font-poppins text-sm">1200x630px önerilir</p>
                  </div>
                )}
              </label>
              
              {brandingSettings.socialMediaLogo && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 font-poppins text-sm">
                    ✅ Bu görsel Google aramalarında, Facebook ve Twitter paylaşımlarında görünecektir
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-6 flex items-center gap-3">
                <span className="text-3xl">👁️</span> Önizleme
              </h3>
              
              <div className="space-y-6">
                {/* Navbar Preview */}
                <div>
                  <p className="text-sm text-gray-400 font-poppins mb-3">Navbar Görünümü:</p>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      {brandingSettings.useEmojiAsLogo ? (
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{brandingSettings.logoEmoji}</span>
                        </div>
                      ) : brandingSettings.siteLogo ? (
                        <img src={brandingSettings.siteLogo} alt="Logo" className="h-10 object-contain" />
                      ) : (
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📚</span>
                        </div>
                      )}
                      <span className="text-white font-bold font-poppins text-xl">{brandingSettings.logoText}</span>
                    </div>
                  </div>
                </div>

                {/* Browser Tab Preview */}
                {brandingSettings.favicon && (
                  <div>
                    <p className="text-sm text-gray-400 font-poppins mb-3">Tarayıcı Sekmesi:</p>
                    <div className="bg-gray-200 rounded-lg p-3 inline-flex items-center gap-2">
                      <img src={brandingSettings.favicon} alt="Favicon" className="w-4 h-4" />
                      <span className="text-gray-700 font-poppins text-sm">{brandingSettings.logoText}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 to-transparent pt-6 pb-4 flex justify-center">
              <button
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-poppins font-bold text-xl shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingBranding ? '⏳ Kaydediliyor...' : '🎨 Logo Ayarlarını Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-poppins mb-2">💰 Reklam Yönetimi</h2>
                <p className="text-gray-400 font-poppins">Google AdSense ayarlarınızı yapılandırın</p>
              </div>
              <button
                onClick={handleSaveAdsense}
                disabled={isSavingAds}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-poppins text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSavingAds ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>

            {/* Status Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 shadow-2xl border border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white font-poppins mb-2">AdSense Durumu</h3>
                  <p className="text-green-100 text-sm font-poppins">
                    {adsenseSettings.enabled ? '✅ Aktif - Reklamlar gösteriliyor' : '⚠️ Pasif - Reklamlar gösterilmiyor'}
                  </p>
              </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={adsenseSettings.enabled}
                    onChange={(e) => updateAdsenseField('enabled', e.target.checked)}
                  />
                  <div className="w-14 h-7 bg-green-900/50 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-white/30"></div>
                </label>
            </div>
            </div>

            {/* Quick Setup Guide */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-400 font-poppins mb-4 flex items-center gap-2">
                <span>📘</span> Hızlı Kurulum Rehberi
              </h3>
              <div className="space-y-3 text-sm text-gray-300 font-poppins">
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">1.</span>
                  <div>
                    <p className="font-semibold text-white">Google AdSense'e kaydolun</p>
                    <p className="text-gray-400 text-xs">https://www.google.com/adsense</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">2.</span>
                  <p>Publisher ID'nizi (ca-pub-XXXXXXXX) aşağıya girin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">3.</span>
                  <p>Meta tag'i Google'dan alıp aşağıya yapıştırın</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">4.</span>
                  <p>ads.txt dosyasını indirip sunucunuza yükleyin</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-400 font-bold">5.</span>
                  <p>Reklam kodlarını Google'dan alıp ilgili alanlara yapıştırın</p>
                </div>
              </div>
            </div>

            {/* Google Publisher ID */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">🆔</span> Google Publisher ID
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">AdSense hesabınızdan alacağınız Publisher ID (ca-pub-XXXXXXXX)</p>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Publisher ID</label>
                <input
                  type="text"
                  value={adsenseSettings.publisherId}
                  onChange={(e) => updateAdsenseField('publisherId', e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                  className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
              
              {adsenseSettings.publisherId && (
                <div className="mt-4">
                  <button
                    onClick={handleDownloadAdsTxt}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-poppins text-sm font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    ads.txt İndir
                  </button>
                  <p className="text-xs text-gray-500 mt-2 font-poppins">
                    ℹ️ Bu dosyayı sunucunuzun kök dizinine (public/) yükleyin
              </p>
            </div>
              )}
          </div>

            {/* Meta Tag */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">📝</span> Meta Tag (Site Doğrulama)
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Google AdSense'den aldığınız meta tag'i buraya yapıştırın</p>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">Meta Tag Kodu</label>
                <textarea
                  value={adsenseSettings.metaTag}
                  onChange={(e) => updateAdsenseField('metaTag', e.target.value)}
                  rows={3}
                  placeholder='<meta name="google-adsense-account" content="ca-pub-1234567890123456">'
                  className="w-full px-5 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins font-mono text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 font-poppins">
                  ℹ️ Bu kod otomatik olarak sitenizin &lt;head&gt; bölümüne eklenecektir
                </p>
        </div>
      </div>

            {/* Ad Slots */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8">
              <h3 className="text-2xl font-bold text-white font-poppins mb-3 flex items-center gap-3">
                <span className="text-3xl">📺</span> Reklam Alanları
              </h3>
              <p className="text-gray-400 font-poppins mb-6 text-sm">Google AdSense'den aldığınız reklam kodlarını ilgili alanlara yapıştırın</p>
              
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔝</span>
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 font-poppins">Üst Banner (728x90)</h4>
                      <p className="text-xs text-gray-400 font-poppins">Ana sayfada üst kısımda gösterilir</p>
                    </div>
                  </div>
                  <textarea
                    value={adsenseSettings.adSlots.headerBanner}
                    onChange={(e) => updateAdSlot('headerBanner', e.target.value)}
                    rows={6}
                    placeholder="Google AdSense'den aldığınız reklam kodunu buraya yapıştırın..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Sidebar */}
                <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">◼️</span>
                    <div>
                      <h4 className="text-lg font-semibold text-purple-400 font-poppins">Yan Reklam (300x600)</h4>
                      <p className="text-xs text-gray-400 font-poppins">Sayfanın yan tarafında gösterilir</p>
                    </div>
                  </div>
                  <textarea
                    value={adsenseSettings.adSlots.sidebar}
                    onChange={(e) => updateAdSlot('sidebar', e.target.value)}
                    rows={6}
                    placeholder="Google AdSense'den aldığınız reklam kodunu buraya yapıştırın..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Footer Banner */}
                <div className="p-6 bg-slate-900/30 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔽</span>
                    <div>
                      <h4 className="text-lg font-semibold text-green-400 font-poppins">Alt Banner (970x90)</h4>
                      <p className="text-xs text-gray-400 font-poppins">Sayfanın alt kısmında gösterilir</p>
                    </div>
                  </div>
                  <textarea
                    value={adsenseSettings.adSlots.footerBanner}
                    onChange={(e) => updateAdSlot('footerBanner', e.target.value)}
                    rows={6}
                    placeholder="Google AdSense'den aldığınız reklam kodunu buraya yapıştırın..."
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white font-poppins font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Preview & Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-400 font-poppins mb-3 flex items-center gap-2">
                <span>⚠️</span> Önemli Notlar
              </h3>
              <div className="space-y-2 text-sm text-gray-300 font-poppins">
                <p>• Reklam kodları kaydedildikten sonra ana sayfada görünecektir</p>
                <p>• ads.txt dosyasını mutlaka sunucunuza yükleyin (yoksa reklamlar çıkmaz)</p>
                <p>• Meta tag otomatik olarak sitenize eklenecektir</p>
                <p>• Değişiklikler anında geçerli olur (sayfa yenilemesi yeterli)</p>
                <p>• AdSense onayı için Google'ın sitenizi incelemesi 1-2 hafta sürebilir</p>
              </div>
            </div>

            {/* Save Button at Bottom */}
            <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 to-transparent pt-6 pb-4 flex justify-center">
              <button
                onClick={handleSaveAdsense}
                disabled={isSavingAds}
                className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-poppins font-bold text-xl shadow-2xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingAds ? '⏳ Kaydediliyor...' : '💰 Reklam Ayarlarını Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Security Logs Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white font-poppins mb-2">🛡️ Güvenlik Logları</h2>
              <p className="text-gray-400 font-poppins">Yetkisiz erişim denemeleri ve güvenlik olayları</p>
            </div>

            {/* Security Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-xl p-6 shadow-2xl border border-red-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-100 font-poppins text-sm">Toplam Deneme</span>
                  <span className="text-3xl">⚠️</span>
                </div>
                <div className="text-4xl font-bold text-white font-poppins">
                  {JSON.parse(localStorage.getItem('securityLogs') || '[]').length}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-yellow-600 rounded-xl p-6 shadow-2xl border border-orange-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-100 font-poppins text-sm">Son 24 Saat</span>
                  <span className="text-3xl">📊</span>
                </div>
                <div className="text-4xl font-bold text-white font-poppins">
                  {JSON.parse(localStorage.getItem('securityLogs') || '[]').filter(log => {
                    const logDate = new Date(log.timestamp)
                    const now = new Date()
                    return (now - logDate) < 24 * 60 * 60 * 1000
                  }).length}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 shadow-2xl border border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-100 font-poppins text-sm">Son Deneme</span>
                  <span className="text-3xl">🕐</span>
                </div>
                <div className="text-lg font-bold text-white font-poppins">
                  {(() => {
                    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
                    if (logs.length === 0) return 'Henüz yok'
                    const lastLog = new Date(logs[0].timestamp)
                    const now = new Date()
                    const diff = Math.floor((now - lastLog) / 1000 / 60)
                    if (diff < 1) return 'Az önce'
                    if (diff < 60) return `${diff} dk önce`
                    if (diff < 1440) return `${Math.floor(diff / 60)} saat önce`
                    return `${Math.floor(diff / 1440)} gün önce`
                  })()}
                </div>
              </div>
            </div>

            {/* Security Logs Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <h3 className="text-xl font-bold text-white font-poppins">Erişim Denemeleri</h3>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Tüm güvenlik loglarını temizlemek istediğinize emin misiniz?')) {
                      localStorage.removeItem('securityLogs')
                      addSystemLog('warning', 'Güvenlik logları temizlendi', 'Admin')
                      updateStats()
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-poppins text-sm font-semibold"
                >
                  🗑️ Logları Temizle
                </button>
              </div>

              <div className="p-6 max-h-[600px] overflow-y-auto">
                {(() => {
                  const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
                  
                  if (securityLogs.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <p className="text-gray-400 font-poppins text-lg">Henüz yetkisiz erişim denemesi yok!</p>
                        <p className="text-gray-500 font-poppins text-sm mt-2">
                          /admin veya /login URL'lerine yapılan erişim denemeleri burada görünecek
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-3">
                      {securityLogs.map((log, index) => (
                        <div
                          key={log.id}
                          className="bg-slate-700/30 rounded-lg p-4 border border-slate-600 hover:border-red-500/50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">⚠️</span>
                              <div>
                                <p className="text-white font-bold font-poppins">
                                  Yetkisiz Erişim Denemesi #{securityLogs.length - index}
                                </p>
                                <p className="text-red-400 font-poppins text-sm">
                                  URL: <code className="bg-slate-900/50 px-2 py-1 rounded">{log.path}</code>
                                </p>
                              </div>
                            </div>
                            <span className="text-gray-400 text-xs font-poppins">
                              {log.timestamp}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-600">
                            <div>
                              <p className="text-gray-400 text-xs font-poppins mb-1">Tarayıcı:</p>
                              <p className="text-gray-300 text-sm font-poppins font-mono truncate">
                                {log.userAgent}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-poppins mb-1">Ekran Çözünürlüğü:</p>
                              <p className="text-gray-300 text-sm font-poppins">
                                {log.screen} | Dil: {log.language}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white font-poppins mb-2">Site Ayarları</h2>
              <p className="text-gray-400 font-poppins">Sistem ayarlarını yapılandırın</p>
            </div>

            {/* Admin Hesabı - Full Width */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-poppins">Admin Hesabı</h3>
                  <p className="text-sm text-gray-400 font-poppins">Kullanıcı adı ve şifrenizi değiştirin</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">
                      Yeni Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder={getAdminCredentials().username}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mevcut şifrenizi girin"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="En az 6 karakter"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 font-poppins mb-3">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-poppins transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                  <span className="text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-red-400 font-poppins font-semibold mb-1">Dikkat!</p>
                    <p className="text-xs text-gray-400 font-poppins">
                      Hesap bilgilerini değiştirdikten sonra otomatik olarak çıkış yapılacak ve yeni bilgilerle giriş yapmanız gerekecektir.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleChangeCredentials}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all font-poppins shadow-lg"
                >
                  🔐 Hesap Bilgilerini Güncelle
                </button>
              </div>
            </div>

            {/* Grid Layout for Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Genel Ayarlar Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-poppins">Genel Ayarlar</h3>
                    <p className="text-xs text-gray-400 font-poppins">Temel site yapılandırması</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex-1">
                      <p className="font-poppins font-medium text-white text-sm">Site Durumu</p>
                      <p className="text-xs text-gray-400 font-poppins mt-1">Siteyi aktif/pasif yap</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="font-poppins font-medium text-white text-sm">Bakım Modu</p>
                      <p className="text-xs text-gray-400 font-poppins mt-1">Geliştirme için kapat</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Limitleme Ayarları Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-poppins">Limitleme</h3>
                    <p className="text-xs text-gray-400 font-poppins">Kullanım sınırları</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-poppins">
                      Max. Kelime Sayısı
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={500}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-xs font-poppins">PDF başına</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-poppins">
                      Günlük PDF Limiti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={10}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-xs font-poppins">kullanıcı/gün</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 font-poppins">
                      Dosya Boyutu Limiti
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        defaultValue={5}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-poppins"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-xs font-poppins">MB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bildirim Ayarları Card */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔔</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-poppins">Bildirimler</h3>
                    <p className="text-xs text-gray-400 font-poppins">E-posta ve sistem bildirimleri</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex-1">
                      <p className="font-poppins font-medium text-white text-sm">Sistem Uyarıları</p>
                      <p className="text-xs text-gray-400 font-poppins mt-1">Hata ve uyarı mesajları</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <p className="font-poppins font-medium text-white text-sm">Haftalık Raporlar</p>
                      <p className="text-xs text-gray-400 font-poppins mt-1">İstatistik özeti gönder</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Save Button - Full Width */}
            <div className="flex items-center justify-between bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-xl border border-slate-700 p-6">
              <div>
                <p className="text-white font-poppins font-semibold">Değişiklikleri Kaydet</p>
                <p className="text-sm text-gray-400 font-poppins mt-1">Tüm ayarlar kaydedilecek</p>
              </div>
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all font-poppins flex items-center gap-2">
                <span>💾</span>
                <span>Kaydet</span>
              </button>
        </div>
      </div>
        )}
      </main>
    </div>
  )
}

export default Admin
