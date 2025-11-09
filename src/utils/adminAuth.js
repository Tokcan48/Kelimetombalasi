// Admin authentication management

const ADMIN_CREDENTIALS_KEY = 'adminCredentials'

// Default credentials
const defaultCredentials = {
  username: 'admin',
  password: 'admin123'
}

// Get admin credentials
export const getAdminCredentials = () => {
  const stored = localStorage.getItem(ADMIN_CREDENTIALS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      return defaultCredentials
    }
  }
  return defaultCredentials
}

// Save admin credentials
export const saveAdminCredentials = (username, password) => {
  const credentials = {
    username: username,
    password: password
  }
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(credentials))
  
  // Add system log
  const systemLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
  systemLogs.unshift({
    id: Date.now(),
    type: 'warning',
    message: 'Admin hesap bilgileri güncellendi',
    user: 'Admin',
    timestamp: new Date().toISOString()
  })
  if (systemLogs.length > 50) systemLogs.splice(50)
  localStorage.setItem('systemLogs', JSON.stringify(systemLogs))
}

// Validate credentials
export const validateCredentials = (username, password) => {
  const credentials = getAdminCredentials()
  return username === credentials.username && password === credentials.password
}

// Reset to defaults
export const resetAdminCredentials = () => {
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(defaultCredentials))
  return defaultCredentials
}

