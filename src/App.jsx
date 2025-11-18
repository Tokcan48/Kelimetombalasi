import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Generator from './Generator'
import Admin from './Admin'
import Feedback from './Feedback'
import Login from './Login'
import LegalPage from './LegalPage'
import Contact from './Contact'
import ReadyKits from './ReadyKits'
import NotFound from './NotFound'

// 🔐 GÜVENLI ADMIN URL - Değiştirmek için sadece burayı düzenleyin
const SECURE_ADMIN_URL = '/dashboard-secure'
const SECURE_LOGIN_URL = '/login-secure'

function App() {
  return (
    <BrowserRouter>
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
        <Route path="/faq" element={<LegalPage />} />
        
        {/* 404 for everything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

// Export secure URLs so other components can use them
export { SECURE_ADMIN_URL, SECURE_LOGIN_URL }
export default App

