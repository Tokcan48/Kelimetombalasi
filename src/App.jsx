import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './Home'
import Generator from './Generator'
import Admin from './Admin'
import Feedback from './Feedback'
import Login from './Login'
import LegalPage from './LegalPage'
import Contact from './Contact'
import ReadyKits from './ReadyKits'
import FAQ from './FAQ'
import NotFound from './NotFound'

// 🔐 GÜVENLI ADMIN URL - Değiştirmek için sadece burayı düzenleyin
const SECURE_ADMIN_URL = '/dashboard-secure'
const SECURE_LOGIN_URL = '/login-secure'

// Component to track page views for Google Analytics
function PageViewTracker() {
  const location = useLocation()

  useEffect(() => {
    // Track page view when route changes
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-KYHT1BK7T6', {
        page_path: location.pathname + location.search
      })
    }
  }, [location])

  return null
}

function App() {
  return (
    <BrowserRouter>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generator" element={<Generator />} />
        
        {/* 🔐 Secure Admin Routes */}
        <Route path={SECURE_LOGIN_URL} element={<Login />} />
        <Route path={SECURE_ADMIN_URL} element={<Admin />} />
        
        {/* 🚫 Fake routes - Log unauthorized attempts */}
        <Route path="/login" element={<NotFound />} />
        <Route path="/admin" element={<NotFound />} />
        
        {/* Public Routes */}
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ready-kits" element={<ReadyKits />} />
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />
        <Route path="/faq" element={<FAQ />} />
        
        {/* 404 for everything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export { SECURE_ADMIN_URL, SECURE_LOGIN_URL }
export default App

