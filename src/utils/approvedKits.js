// Approved Ready Kits Functions (From Firebase)
import { db, collection, getDocs, query, orderBy, onSnapshot } from './firebase'

// Get all approved ready kits from Firebase
export const getApprovedReadyKits = async () => {
  try {
    // Try with orderBy first
    const q = query(collection(db, 'readyKits'), orderBy('approvedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const kits = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      kits.push({
        id: doc.id,
        ...data
      })
    })
    
    // Always sort manually as fallback
    kits.sort((a, b) => {
      const aDate = a.approvedAt?.toDate ? a.approvedAt.toDate() : new Date(a.approvedAt || 0)
      const bDate = b.approvedAt?.toDate ? b.approvedAt.toDate() : new Date(b.approvedAt || 0)
      return bDate - aDate // Descending order
    })
    
    return kits
  } catch (error) {
    if (error.code === 'failed-precondition' || error.code === 'unavailable') {
      try {
        const fallbackQuery = query(collection(db, 'readyKits'))
        const querySnapshot = await getDocs(fallbackQuery)
        const kits = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          kits.push({
            id: doc.id,
            ...data
          })
        })
        
        // Sort manually
        kits.sort((a, b) => {
          const aDate = a.approvedAt?.toDate ? a.approvedAt.toDate() : new Date(a.approvedAt || 0)
          const bDate = b.approvedAt?.toDate ? b.approvedAt.toDate() : new Date(b.approvedAt || 0)
          return bDate - aDate // Descending order
        })
        
        return kits
      } catch (fallbackError) {
        console.error('Fallback query de başarısız:', fallbackError)
        return []
      }
    }
    console.error('Onaylanmış setler yüklenirken hata:', error)
    return []
  }
}

// Subscribe to approved ready kits (real-time)
export const subscribeToApprovedReadyKits = (callback) => {
  // Try with orderBy first
  const q = query(collection(db, 'readyKits'), orderBy('approvedAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const kits = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      kits.push({
        id: doc.id,
        ...data
      })
    })
    
    // Always sort manually as fallback
    kits.sort((a, b) => {
      const aDate = a.approvedAt?.toDate ? a.approvedAt.toDate() : new Date(a.approvedAt || 0)
      const bDate = b.approvedAt?.toDate ? b.approvedAt.toDate() : new Date(b.approvedAt || 0)
      return bDate - aDate // Descending order
    })
    
    callback(kits)
  }, (error) => {
    console.error('Onaylanmış setler dinlenirken hata:', error)
    if (error.code === 'failed-precondition' || error.code === 'unavailable') {
      const fallbackQuery = query(collection(db, 'readyKits'))
      return onSnapshot(fallbackQuery, (snapshot) => {
        const kits = []
        snapshot.forEach((doc) => {
          kits.push({
            id: doc.id,
            ...doc.data()
          })
        })
        // Sort manually
        kits.sort((a, b) => {
          const aDate = a.approvedAt?.toDate ? a.approvedAt.toDate() : new Date(a.approvedAt || 0)
          const bDate = b.approvedAt?.toDate ? b.approvedAt.toDate() : new Date(b.approvedAt || 0)
          return bDate - aDate // Descending order
        })
        callback(kits)
      }, (fallbackError) => {
        console.error('Fallback query de başarısız:', fallbackError)
        callback([])
      })
    }
    callback([])
  })
}

