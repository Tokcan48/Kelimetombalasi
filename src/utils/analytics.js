// Simple analytics system without user accounts

// Initialize analytics data if not exists
const initAnalytics = () => {
  if (!localStorage.getItem('analytics')) {
    const initialData = {
      totalPDFs: 0,
      totalWords: 0,
      history: [] // Array of {timestamp, words, type: 'color' or 'bw'}
    }
    localStorage.setItem('analytics', JSON.stringify(initialData))
  }
}

// Track PDF generation
export const trackPDFGeneration = (wordCount, printerType = 'color', sessionId = null) => {
  initAnalytics()
  
  const analytics = JSON.parse(localStorage.getItem('analytics'))
  
  analytics.totalPDFs++
  analytics.totalWords += wordCount
  analytics.history.push({
    timestamp: new Date().toISOString(),
    words: wordCount,
    type: printerType,
    sessionId: sessionId || sessionStorage.getItem('browserFingerprint') || 'unknown'
  })
  
  localStorage.setItem('analytics', JSON.stringify(analytics))
}

// Generate unique browser fingerprint (simple version)
const getBrowserFingerprint = () => {
  // Check if fingerprint exists in sessionStorage (unique per tab/window)
  let fingerprint = sessionStorage.getItem('browserFingerprint')
  if (!fingerprint) {
    // Create unique ID for this browser tab
    fingerprint = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('browserFingerprint', fingerprint)
  }
  return fingerprint
}

// Track active session
export const trackActiveSession = () => {
  const sessionId = getBrowserFingerprint()
  const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]')
  
  // Check if this session already exists
  const existingSessionIndex = sessions.findIndex(s => s.id === sessionId)
  
  const sessionData = {
    id: sessionId,
    timestamp: existingSessionIndex >= 0 ? sessions[existingSessionIndex].timestamp : new Date().toISOString(),
    lastActivity: new Date().toISOString()
  }
  
  // Clean old sessions (older than 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  let activeSessions = sessions.filter(s => 
    new Date(s.lastActivity).getTime() > fiveMinutesAgo
  )
  
  // Update or add session
  if (existingSessionIndex >= 0) {
    activeSessions = activeSessions.map(s => 
      s.id === sessionId ? sessionData : s
    )
  } else {
    activeSessions.push(sessionData)
  }
  
  localStorage.setItem('activeSessions', JSON.stringify(activeSessions))
  
  return sessionId
}

// Update session activity
export const updateSessionActivity = (sessionId) => {
  const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]')
  const updatedSessions = sessions.map(s => {
    if (s.id === sessionId) {
      return { ...s, lastActivity: new Date().toISOString() }
    }
    return s
  })
  localStorage.setItem('activeSessions', JSON.stringify(updatedSessions))
}

// Get active users count
export const getActiveUsersCount = () => {
  const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]')
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
  
  const activeSessions = sessions.filter(s => 
    new Date(s.lastActivity).getTime() > fiveMinutesAgo
  )
  
  // Clean up old sessions
  localStorage.setItem('activeSessions', JSON.stringify(activeSessions))
  
  return activeSessions.length
}

// Get real statistics
export const getRealAnalytics = () => {
  initAnalytics()
  
  const analytics = JSON.parse(localStorage.getItem('analytics'))
  const history = analytics.history || []
  
  const now = new Date()
  
  // Today's PDFs
  const today = now.toDateString()
  const todayPDFs = history.filter(item => {
    return new Date(item.timestamp).toDateString() === today
  }).length
  
  // This week's PDFs
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const weeklyPDFs = history.filter(item => 
    new Date(item.timestamp) > oneWeekAgo
  ).length
  
  // This month's PDFs
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const monthlyPDFs = history.filter(item => 
    new Date(item.timestamp) > oneMonthAgo
  ).length
  
  // Previous week's PDFs (for growth calculation)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
  const previousWeekPDFs = history.filter(item => {
    const itemDate = new Date(item.timestamp)
    return itemDate > twoWeeksAgo && itemDate < oneWeekAgo
  }).length
  
  // Previous month's PDFs (for growth calculation)
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  const previousMonthPDFs = history.filter(item => {
    const itemDate = new Date(item.timestamp)
    return itemDate > twoMonthsAgo && itemDate < oneMonthAgo
  }).length
  
  // Calculate weekly growth
  const weeklyGrowth = previousWeekPDFs > 0 
    ? (((weeklyPDFs - previousWeekPDFs) / previousWeekPDFs) * 100).toFixed(1)
    : weeklyPDFs > 0 ? 100 : 0
  
  // Calculate monthly growth
  const monthlyGrowth = previousMonthPDFs > 0 
    ? (((monthlyPDFs - previousMonthPDFs) / previousMonthPDFs) * 100).toFixed(1)
    : monthlyPDFs > 0 ? 100 : 0
  
  // Get active users
  const activeUsers = getActiveUsersCount()
  
  // Get unique users count
  const uniqueSessions = [...new Set(history.map(h => h.sessionId).filter(id => id))]
  const totalUniqueUsers = uniqueSessions.length
  
  return {
    totalPDFs: analytics.totalPDFs,
    totalWords: analytics.totalWords,
    todayPDFs: todayPDFs,
    weeklyPDFs: weeklyPDFs,
    monthlyPDFs: monthlyPDFs,
    weeklyGrowth: parseFloat(weeklyGrowth),
    monthlyGrowth: parseFloat(monthlyGrowth),
    avgWordsPerPDF: analytics.totalPDFs > 0 ? Math.floor(analytics.totalWords / analytics.totalPDFs) : 0,
    activeUsers: activeUsers,
    estimatedUsers: totalUniqueUsers // Now it's actual unique users, not estimated
  }
}

// Get PDF history grouped by user
export const getPDFHistoryByUser = () => {
  initAnalytics()
  
  const analytics = JSON.parse(localStorage.getItem('analytics'))
  const history = analytics.history || []
  
  // Create a map of unique sessions to user numbers
  const uniqueSessions = [...new Set(history.map(h => h.sessionId || 'unknown'))]
  const sessionToUserNumber = {}
  uniqueSessions.forEach((sessionId, index) => {
    sessionToUserNumber[sessionId] = index + 1
  })
  
  // Group by sessionId
  const groupedBySession = {}
  history.forEach(item => {
    const sessionId = item.sessionId || 'unknown'
    if (!groupedBySession[sessionId]) {
      groupedBySession[sessionId] = []
    }
    groupedBySession[sessionId].push(item)
  })
  
  // Convert to array and format
  return Object.entries(groupedBySession)
    .map(([sessionId, items]) => {
      const userNumber = sessionToUserNumber[sessionId]
      const totalPDFs = items.length
      const totalWords = items.reduce((sum, item) => sum + item.words, 0)
      const lastActivity = items.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )[0].timestamp
      
      const pdfs = items
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map((item, index) => ({
          id: index + 1,
          words: item.words,
          type: item.type === 'color' ? 'Renkli' : 'Siyah-Beyaz',
          timestamp: item.timestamp,
          timeAgo: getTimeAgo(new Date(item.timestamp))
        }))
      
      return {
        userId: userNumber,
        userName: 'Kullanıcı #' + userNumber,
        sessionId: sessionId,
        totalPDFs: totalPDFs,
        totalWords: totalWords,
        lastActivity: getTimeAgo(new Date(lastActivity)),
        pdfs: pdfs
      }
    })
    .sort((a, b) => a.userId - b.userId)
}

// Get recent PDF history (last N items) - Kept for backwards compatibility
export const getRecentPDFHistory = (limit = 10) => {
  initAnalytics()
  
  const analytics = JSON.parse(localStorage.getItem('analytics'))
  const history = analytics.history || []
  
  // Create a map of unique sessions to user numbers
  const uniqueSessions = [...new Set(history.map(h => h.sessionId || 'unknown'))]
  const sessionToUserNumber = {}
  uniqueSessions.forEach((sessionId, index) => {
    sessionToUserNumber[sessionId] = index + 1
  })
  
  return history
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit)
    .map((item, index) => {
      const timeAgo = getTimeAgo(new Date(item.timestamp))
      const sessionId = item.sessionId || 'unknown'
      const userNumber = sessionToUserNumber[sessionId]
      
      return {
        id: index + 1,
        user: 'Kullanıcı #' + userNumber,
        sessionId: sessionId,
        words: item.words,
        type: item.type === 'color' ? 'Renkli' : 'Siyah-Beyaz',
        createdAt: timeAgo,
        fileSize: ((item.words * 0.05).toFixed(1)) + ' MB'
      }
    })
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
