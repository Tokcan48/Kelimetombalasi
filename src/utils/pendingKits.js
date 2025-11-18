// Pending Kits (Admin Approval) Functions
import { db, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, where, getDoc } from './firebase'
import { addSystemLog } from './systemLogs'

// Submit kit for admin approval
export const submitKitForApproval = async (kitData) => {
  try {
    const pendingKit = {
      title: kitData.title || `Özel Set (${new Date().toLocaleDateString('tr-TR')})`,
      description: kitData.description || `${kitData.words.length} kelime çifti`,
      icon: kitData.icon || '📝',
      color: kitData.color || 'from-purple-500 to-pink-600',
      category: kitData.category || 'beginner',
      words: kitData.words,
      status: 'pending',
      submittedAt: serverTimestamp(),
      submittedBy: kitData.submittedBy || 'Kullanıcı',
      reviewedAt: null,
      reviewedBy: null
    }
    
    const docRef = await addDoc(collection(db, 'pendingKits'), pendingKit)
    
    // Add system log
    try {
      await addSystemLog('info', `Yeni kelime seti onay için gönderildi: ${pendingKit.title} (${kitData.words.length} kelime)`, 'Kullanıcı')
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return { id: docRef.id, ...pendingKit }
  } catch (error) {
    console.error('Kit gönderilirken hata:', error)
    throw error
  }
}

// Get all pending kits
export const getPendingKits = async () => {
  try {
    const q = query(collection(db, 'pendingKits'), orderBy('submittedAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const kits = []
    
    querySnapshot.forEach((doc) => {
      kits.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return kits
  } catch (error) {
    console.error('Bekleyen setler yüklenirken hata:', error)
    throw error
  }
}

// Get pending kits count
export const getPendingKitsCount = async () => {
  try {
    const q = query(collection(db, 'pendingKits'), where('status', '==', 'pending'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.size
  } catch (error) {
    console.error('Bekleyen set sayısı yüklenirken hata:', error)
    return 0
  }
}

// Approve kit (add to readyKits collection)
export const approveKit = async (kitId, adminName = 'Admin') => {
  try {
    const kitDoc = await getDoc(doc(db, 'pendingKits', kitId))
    if (!kitDoc.exists()) {
      throw new Error('Kit bulunamadı')
    }
    
    const kitData = kitDoc.data()
    
    // Add to readyKits collection
    const approvedKit = {
      title: kitData.title,
      description: kitData.description,
      icon: kitData.icon,
      color: kitData.color,
      category: kitData.category || 'beginner',
      words: kitData.words,
      approvedAt: serverTimestamp(),
      approvedBy: adminName,
      originalSubmissionId: kitId
    }
    
    await addDoc(collection(db, 'readyKits'), approvedKit)
    
    // Update pending kit status
    await updateDoc(doc(db, 'pendingKits', kitId), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminName
    })
    
    // Add system log
    try {
      await addSystemLog('success', `Kelime seti onaylandı: ${kitData.title}`, adminName)
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return { id: kitId, ...approvedKit }
  } catch (error) {
    console.error('Kit onaylanırken hata:', error)
    throw error
  }
}

// Reject kit
export const rejectKit = async (kitId, adminName = 'Admin') => {
  try {
    const kitDoc = await getDoc(doc(db, 'pendingKits', kitId))
    if (!kitDoc.exists()) {
      throw new Error('Kit bulunamadı')
    }
    
    const kitData = kitDoc.data()
    
    // Update pending kit status
    await updateDoc(doc(db, 'pendingKits', kitId), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: adminName
    })
    
    // Add system log
    try {
      await addSystemLog('warning', `Kelime seti reddedildi: ${kitData.title}`, adminName)
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return { id: kitId }
  } catch (error) {
    console.error('Kit reddedilirken hata:', error)
    throw error
  }
}

// Delete pending kit
export const deletePendingKit = async (kitId, adminName = 'Admin') => {
  try {
    await deleteDoc(doc(db, 'pendingKits', kitId))
    
    // Add system log
    try {
      await addSystemLog('info', `Bekleyen kelime seti silindi (ID: ${kitId})`, adminName)
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return true
  } catch (error) {
    console.error('Kit silinirken hata:', error)
    throw error
  }
}

// Subscribe to pending kits (real-time)
export const subscribeToPendingKits = (callback) => {
  const q = query(collection(db, 'pendingKits'), orderBy('submittedAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const kits = []
    snapshot.forEach((doc) => {
      kits.push({
        id: doc.id,
        ...doc.data()
      })
    })
    callback(kits)
  }, (error) => {
    console.error('Bekleyen setler dinlenirken hata:', error)
    callback([])
  })
}

// Subscribe to pending kits count (real-time)
export const subscribeToPendingKitsCount = (callback) => {
  const q = query(collection(db, 'pendingKits'), where('status', '==', 'pending'))
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size)
  }, (error) => {
    console.error('Bekleyen set sayısı dinlenirken hata:', error)
    callback(0)
  })
}

