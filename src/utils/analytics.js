// Analytics system with Firebase - Only statistics, not PDF files

import { db, collection, addDoc, getDocs, query, orderBy, doc, getDoc, setDoc, increment, onSnapshot, serverTimestamp } from './firebase'

// Initialize analytics data in Firebase if not exists
const initAnalytics = async () => {
  try {
    const statsRef = doc(db, 'analytics', 'stats')
    const statsSnap = await getDoc(statsRef)
    
    if (!statsSnap.exists()) {
      // Initialize default stats
      await setDoc(statsRef, {
      totalPDFs: 0,
      totalWords: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Analytics başlatılırken hata:', error)
  }
}

// Track PDF generation to Firebase
export const trackPDFGeneration = async (wordCount, printerType = 'color', sessionId = null) => {
  try {
    // Initialize stats if not exists
    await initAnalytics()
    
    const statsRef = doc(db, 'analytics', 'stats')
    
    // Update stats
    await setDoc(statsRef, {
      totalPDFs: increment(1),
      totalWords: increment(wordCount),
      updatedAt: serverTimestamp()
    }, { merge: true })
    
    // Add to history (sadece istatistikler, PDF dosyası değil)
    const historyItem = {
      timestamp: serverTimestamp(),
      words: wordCount,
      type: printerType, // 'color' or 'bw'
      sessionId: sessionId || sessionStorage.getItem('browserFingerprint') || 'unknown'
    }
    
    await addDoc(collection(db, 'pdfHistory'), historyItem)
    
    // Update session activity
    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId)
      await setDoc(sessionRef, {
        lastActivity: serverTimestamp(),
        timestamp: sessionId.includes('session_') ? new Date(sessionId.split('_')[1]).toISOString() : serverTimestamp()
      }, { merge: true })
    }
  } catch (error) {
    console.error('PDF oluşturma kaydedilirken hata:', error)
  }
}

// Generate unique browser fingerprint (simple version)
const getBrowserFingerprint = () => {
  let fingerprint = sessionStorage.getItem('browserFingerprint')
  if (!fingerprint) {
    fingerprint = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('browserFingerprint', fingerprint)
  }
  return fingerprint
}

// Track active session
export const trackActiveSession = () => {
  return getBrowserFingerprint()
}

// Update session activity
export const updateSessionActivity = async (sessionId) => {
  try {
    if (sessionId) {
      const sessionRef = doc(db, 'sessions', sessionId)
      await setDoc(sessionRef, {
        lastActivity: serverTimestamp()
      }, { merge: true })
    }
  } catch (error) {
    console.error('Session güncellenirken hata:', error)
  }
}

// Get active users count from Firebase
export const getActiveUsersCount = async () => {
  try {
    const q = query(collection(db, 'sessions'), orderBy('lastActivity', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    let activeCount = 0
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (data.lastActivity) {
        const lastActivity = data.lastActivity.toDate ? data.lastActivity.toDate() : new Date(data.lastActivity)
        if (lastActivity.getTime() > fiveMinutesAgo) {
          activeCount++
        }
      }
    })
    
    return activeCount
  } catch (error) {
    console.error('Aktif kullanıcı sayısı alınırken hata:', error)
    // Fallback
  const sessions = JSON.parse(localStorage.getItem('activeSessions') || '[]')
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    return sessions.filter(s => new Date(s.lastActivity).getTime() > fiveMinutesAgo).length
  }
}

// Get real statistics from Firebase
export const getRealAnalytics = async () => {
  try {
    // Get stats
    const statsRef = doc(db, 'analytics', 'stats')
    const statsSnap = await getDoc(statsRef)
    
    // Get history
    const q = query(collection(db, 'pdfHistory'), orderBy('timestamp', 'desc'))
    const historySnapshot = await getDocs(q)
    
    const history = []
    historySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      history.push({
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      })
    })
    
    const stats = statsSnap.exists() ? statsSnap.data() : { totalPDFs: 0, totalWords: 0 }
  
  const now = new Date()
    const today = now.toDateString()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  
  const todayPDFs = history.filter(item => {
      const itemDate = new Date(item.timestamp)
      return itemDate.toDateString() === today
  }).length
  
    const weeklyPDFs = history.filter(item => {
      const itemDate = new Date(item.timestamp)
      return itemDate > oneWeekAgo
    }).length
    
    const monthlyPDFs = history.filter(item => {
      const itemDate = new Date(item.timestamp)
      return itemDate > oneMonthAgo
    }).length
  
  const previousWeekPDFs = history.filter(item => {
    const itemDate = new Date(item.timestamp)
    return itemDate > twoWeeksAgo && itemDate < oneWeekAgo
  }).length
  
  const previousMonthPDFs = history.filter(item => {
    const itemDate = new Date(item.timestamp)
    return itemDate > twoMonthsAgo && itemDate < oneMonthAgo
  }).length
  
  const weeklyGrowth = previousWeekPDFs > 0 
    ? (((weeklyPDFs - previousWeekPDFs) / previousWeekPDFs) * 100).toFixed(1)
    : weeklyPDFs > 0 ? 100 : 0
  
  const monthlyGrowth = previousMonthPDFs > 0 
    ? (((monthlyPDFs - previousMonthPDFs) / previousMonthPDFs) * 100).toFixed(1)
    : monthlyPDFs > 0 ? 100 : 0
  
    const activeUsers = await getActiveUsersCount()
  const uniqueSessions = [...new Set(history.map(h => h.sessionId).filter(id => id))]
  const totalUniqueUsers = uniqueSessions.length
  
  return {
      totalPDFs: stats.totalPDFs || 0,
      totalWords: stats.totalWords || 0,
    todayPDFs: todayPDFs,
    weeklyPDFs: weeklyPDFs,
    monthlyPDFs: monthlyPDFs,
    weeklyGrowth: parseFloat(weeklyGrowth),
    monthlyGrowth: parseFloat(monthlyGrowth),
      avgWordsPerPDF: (stats.totalPDFs || 0) > 0 ? Math.floor((stats.totalWords || 0) / (stats.totalPDFs || 1)) : 0,
      activeUsers: activeUsers,
      estimatedUsers: totalUniqueUsers
    }
  } catch (error) {
    console.error('Analytics alınırken hata:', error)
    return {
      totalPDFs: 0,
      totalWords: 0,
      todayPDFs: 0,
      weeklyPDFs: 0,
      monthlyPDFs: 0,
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      avgWordsPerPDF: 0,
      activeUsers: 0,
      estimatedUsers: 0
    }
  }
}

// Get PDF history grouped by user from Firebase
export const getPDFHistoryByUser = async () => {
  try {
    const q = query(collection(db, 'pdfHistory'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const history = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      history.push({
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      })
    })
    
  const uniqueSessions = [...new Set(history.map(h => h.sessionId || 'unknown'))]
  const sessionToUserNumber = {}
  uniqueSessions.forEach((sessionId, index) => {
    sessionToUserNumber[sessionId] = index + 1
  })
  
  const groupedBySession = {}
  history.forEach(item => {
    const sessionId = item.sessionId || 'unknown'
    if (!groupedBySession[sessionId]) {
      groupedBySession[sessionId] = []
    }
    groupedBySession[sessionId].push(item)
  })
  
  return Object.entries(groupedBySession)
    .map(([sessionId, items]) => {
      const userNumber = sessionToUserNumber[sessionId]
      const totalPDFs = items.length
        const totalWords = items.reduce((sum, item) => sum + (item.words || 0), 0)
        const sortedItems = items.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
        )
        const lastActivity = sortedItems[0].timestamp
      
        const pdfs = sortedItems.map((item, index) => ({
          id: index + 1,
          words: item.words || 0,
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
  } catch (error) {
    console.error('PDF geçmişi alınırken hata:', error)
    return []
  }
}

// Get recent PDF history from Firebase
export const getRecentPDFHistory = async (limit = 10) => {
  try {
    const q = query(collection(db, 'pdfHistory'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const history = []
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data()
      history.push({
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString()
      })
    })
    
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
          words: item.words || 0,
        type: item.type === 'color' ? 'Renkli' : 'Siyah-Beyaz',
        createdAt: timeAgo,
          fileSize: ((item.words || 0) * 0.05).toFixed(1) + ' MB'
      }
    })
  } catch (error) {
    console.error('Son PDF geçmişi alınırken hata:', error)
    return []
  }
}

// Get total PDF count (for homepage display)
export const getTotalPDFCount = async () => {
  try {
    const statsRef = doc(db, 'analytics', 'stats')
    const statsSnap = await getDoc(statsRef)
    
    if (statsSnap.exists()) {
      const stats = statsSnap.data()
      return stats.totalPDFs || 0
    }
    return 0
  } catch (error) {
    console.error('Toplam PDF sayısı alınırken hata:', error)
    return 0
  }
}

// Real-time listener for total PDF count (for homepage)
export const subscribeToTotalPDFCount = (callback) => {
  try {
    const statsRef = doc(db, 'analytics', 'stats')
    
    return onSnapshot(statsRef, (snapshot) => {
      if (snapshot.exists()) {
        const stats = snapshot.data()
        callback(stats.totalPDFs || 0)
      } else {
        callback(0)
      }
    }, (error) => {
      console.error('Toplam PDF sayısı dinlenirken hata:', error)
      callback(0)
    })
  } catch (error) {
    console.error('Toplam PDF sayısı aboneliği başlatılırken hata:', error)
    callback(0)
  }
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
