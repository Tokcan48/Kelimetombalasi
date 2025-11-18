import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, serverTimestamp, query, orderBy, getDoc } from './firebase'
import { addSystemLog } from './systemLogs'

// Default categories (fallback)
export const defaultCategories = [
  { id: 'beginner', name: 'Başlangıç', icon: '🌱', description: 'Günlük hayatta kullanılan temel kelimeler' },
  { id: 'intermediate', name: 'Orta', icon: '📚', description: 'Daha ileri seviye kelimeler' },
  { id: 'professional', name: 'Mesleki', icon: '💼', description: 'İş ve meslek ile ilgili kelimeler' },
  { id: 'school', name: 'Okul', icon: '🎓', description: 'Okul ve eğitim kelimeleri' },
  { id: 'travel', name: 'Seyahat', icon: '✈️', description: 'Seyahat ve turizm kelimeleri' },
  { id: 'food', name: 'Yemek', icon: '🍽️', description: 'Yiyecek ve içecek kelimeleri' },
  { id: 'health', name: 'Sağlık', icon: '🏥', description: 'Sağlık ve tıp kelimeleri' }
]

// Initialize default categories in Firebase (run once)
export const initializeCategories = async () => {
  try {
    const existingCategories = await getCategories()
    if (existingCategories.length === 0) {
      // Add all default categories
      for (const category of defaultCategories) {
        await addDoc(collection(db, 'categories'), {
          ...category,
          createdAt: serverTimestamp(),
          order: defaultCategories.indexOf(category)
        })
      }
    }
  } catch (error) {
    console.error('Kategoriler başlatılırken hata:', error)
  }
}

// Get all categories from Firebase
export const getCategories = async () => {
  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    const categories = []
    
    querySnapshot.forEach((docSnap) => {
      categories.push({
        id: docSnap.id,
        ...docSnap.data()
      })
    })
    
    // If no categories in Firebase, return default
    if (categories.length === 0) {
      return defaultCategories.map((cat, index) => ({
        id: cat.id,
        ...cat,
        order: index
      }))
    }
    
    return categories
  } catch (error) {
    console.error('Kategoriler alınırken hata:', error)
    // Return default categories as fallback
    return defaultCategories.map((cat, index) => ({
      id: cat.id,
      ...cat,
      order: index
    }))
  }
}

// Add new category
export const addCategory = async (categoryData, adminName) => {
  try {
    const existingCategories = await getCategories()
    const newCategory = {
      name: categoryData.name,
      icon: categoryData.icon || '📂',
      description: categoryData.description || '',
      order: existingCategories.length,
      createdAt: serverTimestamp(),
      createdBy: adminName
    }
    
    const docRef = await addDoc(collection(db, 'categories'), newCategory)
    
    // Add system log
    try {
      await addSystemLog('success', `Yeni kategori eklendi: ${newCategory.name}`, adminName)
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return { id: docRef.id, ...newCategory }
  } catch (error) {
    console.error('Kategori eklenirken hata:', error)
    throw error
  }
}

// Update category
export const updateCategory = async (categoryId, categoryData, adminName) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId)
    const updateData = {
      name: categoryData.name,
      icon: categoryData.icon,
      description: categoryData.description,
      updatedAt: serverTimestamp(),
      updatedBy: adminName
    }
    
    // If order is provided, update it
    if (categoryData.order !== undefined) {
      updateData.order = categoryData.order
    }
    
    await updateDoc(categoryRef, updateData)
    
    // Add system log
    try {
      await addSystemLog('info', `Kategori güncellendi: ${categoryData.name}`, adminName)
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return true
  } catch (error) {
    console.error('Kategori güncellenirken hata:', error)
    throw error
  }
}

// Delete category
export const deleteCategory = async (categoryId, adminName) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId)
    
    // Get category data before deletion for log
    const categorySnap = await getDoc(categoryRef)
    const categoryName = categorySnap.exists() ? categorySnap.data().name : 'Bilinmeyen'
    
    await deleteDoc(categoryRef)
    
    // Add system log
    try {
      await addSystemLog('warning', `Kategori silindi: ${categoryName}`, adminName)
    } catch (e) {
      console.error('System log eklenirken hata:', e)
    }
    
    return true
  } catch (error) {
    console.error('Kategori silinirken hata:', error)
    throw error
  }
}

// Subscribe to categories (real-time)
export const subscribeToCategories = (callback) => {
  try {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'))
    
    return onSnapshot(q, (snapshot) => {
      const categories = []
      snapshot.forEach((docSnap) => {
        categories.push({
          id: docSnap.id,
          ...docSnap.data()
        })
      })
      
      // If no categories, return default
      if (categories.length === 0) {
        callback(defaultCategories.map((cat, index) => ({
          id: cat.id,
          ...cat,
          order: index
        })))
      } else {
        callback(categories)
      }
    }, (error) => {
      console.error('Kategoriler dinlenirken hata:', error)
      // Return default on error
      callback(defaultCategories.map((cat, index) => ({
        id: cat.id,
        ...cat,
        order: index
      })))
    })
  } catch (error) {
    console.error('Kategoriler aboneliği başlatılırken hata:', error)
    callback(defaultCategories.map((cat, index) => ({
      id: cat.id,
      ...cat,
      order: index
    })))
    return () => {}
  }
}

