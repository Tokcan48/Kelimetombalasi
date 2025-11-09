// Feedback management system

// Save feedback message
export const saveFeedback = (name, email, message) => {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]')
  
  const newFeedback = {
    id: Date.now(),
    name: name,
    email: email,
    message: message,
    createdAt: new Date().toISOString(),
    status: 'unread' // 'unread', 'read', 'replied'
  }
  
  feedbacks.push(newFeedback)
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks))
  
  // Add system log for new feedback
  try {
    const systemLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
    systemLogs.unshift({
      id: Date.now(),
      type: 'info',
      message: `Yeni geri bildirim alındı: ${name}`,
      user: 'Kullanıcı',
      timestamp: new Date().toISOString()
    })
    if (systemLogs.length > 50) systemLogs.splice(50)
    localStorage.setItem('systemLogs', JSON.stringify(systemLogs))
  } catch (e) {
    // Ignore if error
  }
  
  return newFeedback
}

// Get all feedbacks
export const getAllFeedbacks = () => {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]')
  return feedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Get unread count
export const getUnreadCount = () => {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]')
  return feedbacks.filter(f => f.status === 'unread').length
}

// Mark as read
export const markAsRead = (id) => {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]')
  const updated = feedbacks.map(f => 
    f.id === id ? { ...f, status: 'read' } : f
  )
  localStorage.setItem('feedbacks', JSON.stringify(updated))
}

// Delete feedback
export const deleteFeedback = (id) => {
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]')
  const updated = feedbacks.filter(f => f.id !== id)
  localStorage.setItem('feedbacks', JSON.stringify(updated))
}

// Format time ago
export const getTimeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  
  if (seconds < 60) return `${seconds} saniye önce`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} gün önce`
  return new Date(date).toLocaleDateString('tr-TR')
}



