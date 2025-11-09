// System logs management - Only important events

const LOGS_KEY = 'systemLogs'

// Initialize logs
const initLogs = () => {
  if (!localStorage.getItem(LOGS_KEY)) {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]))
  }
}

// Add a system log
export const addSystemLog = (type, message, user = 'System') => {
  initLogs()
  
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY))
  
  const newLog = {
    id: Date.now(),
    type: type, // 'success', 'warning', 'error', 'info'
    message: message,
    user: user,
    timestamp: new Date().toISOString()
  }
  
  logs.unshift(newLog) // Add to the beginning
  
  // Keep only last 50 logs
  if (logs.length > 50) {
    logs.splice(50)
  }
  
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

// Get system logs
export const getSystemLogs = (limit = 10) => {
  initLogs()
  
  const logs = JSON.parse(localStorage.getItem(LOGS_KEY))
  
  return logs
    .slice(0, limit)
    .map(log => ({
      id: log.id,
      type: log.type,
      message: log.message,
      user: log.user,
      time: getTimeAgo(new Date(log.timestamp))
    }))
}

// Clear all logs
export const clearSystemLogs = () => {
  localStorage.setItem(LOGS_KEY, JSON.stringify([]))
}

// Helper: Time ago formatter
const getTimeAgo = (date) => {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} saniye önce`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} gün önce`
  return date.toLocaleDateString('tr-TR')
}

// Initialize with a welcome log if empty
initLogs()
const logs = JSON.parse(localStorage.getItem(LOGS_KEY))
if (logs.length === 0) {
  addSystemLog('info', 'Sistem başlatıldı ve çalışmaya hazır', 'System')
}

