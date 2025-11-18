// Feedback management system with Firebase

import { db, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp } from './firebase'
  
// Save feedback message to Firebase
export const saveFeedback = async (name, email, message, rating = 0) => {
  try {
  const newFeedback = {
    name: name,
    email: email,
    message: message,
      rating: rating,
      status: 'unread', // 'unread', 'read', 'replied'
      createdAt: serverTimestamp()
  }
  
    const docRef = await addDoc(collection(db, 'feedbacks'), newFeedback)
  
  // Add system log for new feedback
  try {
      await addDoc(collection(db, 'systemLogs'), {
      type: 'info',
        message: `Yeni geri bildirim alındı: ${name} (${rating > 0 ? rating + ' ⭐' : 'Değerlendirme yok'})`,
      user: 'Kullanıcı',
        timestamp: serverTimestamp()
    })
  } catch (e) {
      console.error('System log eklenirken hata:', e)
  }
  
    return { id: docRef.id, ...newFeedback }
  } catch (error) {
    console.error('Geri bildirim kaydedilirken hata:', error)
    throw error
  }
}

// Get all feedbacks from Firebase
export const getAllFeedbacks = async () => {
  try {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const feedbacks = []
    querySnapshot.forEach((doc) => {
      feedbacks.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return feedbacks
  } catch (error) {
    console.error('Geri bildirimler alınırken hata:', error)
    // Fallback to empty array if error
    return []
  }
}

// Get unread count from Firebase
export const getUnreadCount = async () => {
  try {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    let count = 0
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.status === 'unread') {
        count++
      }
    })
    
    return count
  } catch (error) {
    console.error('Okunmamış mesaj sayısı alınırken hata:', error)
    return 0
  }
}

// Mark feedback as read in Firebase
export const markAsRead = async (id) => {
  try {
    const feedbackRef = doc(db, 'feedbacks', id)
    await updateDoc(feedbackRef, {
      status: 'read'
    })
  } catch (error) {
    console.error('Geri bildirim okundu işaretlenirken hata:', error)
    throw error
  }
}

// Delete feedback from Firebase
export const deleteFeedback = async (id) => {
  try {
    await deleteDoc(doc(db, 'feedbacks', id))
  } catch (error) {
    console.error('Geri bildirim silinirken hata:', error)
    throw error
  }
}

// Real-time listener for feedbacks
export const subscribeToFeedbacks = (callback) => {
  try {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const feedbacks = []
      snapshot.forEach((doc) => {
        feedbacks.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(feedbacks)
    }, (error) => {
      console.error('Geri bildirimler dinlenirken hata:', error)
      callback([])
    })
  } catch (error) {
    console.error('Geri bildirim aboneliği başlatılırken hata:', error)
    callback([])
  }
}

// Real-time listener for unread count
export const subscribeToUnreadCount = (callback) => {
  try {
    const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      let count = 0
      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.status === 'unread') {
          count++
        }
      })
      callback(count)
    }, (error) => {
      console.error('Okunmamış sayı dinlenirken hata:', error)
      callback(0)
    })
  } catch (error) {
    console.error('Okunmamış sayı aboneliği başlatılırken hata:', error)
    callback(0)
  }
}

// Format time ago
export const getTimeAgo = (date) => {
  // Firebase timestamp'i Date'e çevir
  const dateObj = date?.toDate ? date.toDate() : new Date(date)
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} saniye önce`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} gün önce`
  return dateObj.toLocaleDateString('tr-TR')
}
