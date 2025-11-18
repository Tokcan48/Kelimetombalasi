// System logs management with Firebase

import { db, collection, addDoc, getDocs, query, orderBy, onSnapshot, serverTimestamp } from './firebase'

// Add a system log to Firebase
export const addSystemLog = async (type, message, user = 'System') => {
  try {
    await addDoc(collection(db, 'systemLogs'), {
      type: type, // 'success', 'warning', 'error', 'info'
      message: message,
      user: user,
      timestamp: serverTimestamp()
    })
  } catch (error) {
    console.error('Sistem logu eklenirken hata:', error)
  }
}

// Get system logs from Firebase
export const getSystemLogs = async (limit = 10) => {
  try {
    const q = query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const logs = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      logs.push({
        id: doc.id,
        type: data.type,
        message: data.message,
        user: data.user,
        time: getTimeAgo(data.timestamp),
        timestamp: data.timestamp
      })
    })
    
    return logs.slice(0, limit)
  } catch (error) {
    console.error('Sistem logları alınırken hata:', error)
    return []
  }
}

// Real-time listener for system logs
export const subscribeToSystemLogs = (callback, limit = 10) => {
  try {
    const q = query(collection(db, 'systemLogs'), orderBy('timestamp', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const logs = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        logs.push({
          id: doc.id,
          type: data.type,
          message: data.message,
          user: data.user,
          time: getTimeAgo(data.timestamp),
          timestamp: data.timestamp
        })
      })
      callback(logs.slice(0, limit))
    }, (error) => {
      console.error('Sistem logları dinlenirken hata:', error)
      callback([])
    })
  } catch (error) {
    console.error('Sistem logları aboneliği başlatılırken hata:', error)
    callback([])
  }
}

// Helper: Time ago formatter
const getTimeAgo = (date) => {
  // Firebase timestamp'i Date'e çevir
  if (!date) return 'Bilinmiyor'
  const dateObj = date?.toDate ? date.toDate() : new Date(date)
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} saniye önce`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} gün önce`
  return dateObj.toLocaleDateString('tr-TR')
}

// Initialize with a welcome log if empty
export const initializeSystemLogs = async () => {
  try {
    const logs = await getSystemLogs(1)
    if (logs.length === 0) {
      await addSystemLog('info', 'Sistem başlatıldı ve çalışmaya hazır', 'System')
    }
  } catch (error) {
    console.error('Sistem logları başlatılırken hata:', error)
  }
}
