// Branding & Logo Management

const BRANDING_KEY = 'brandingSettings'

// Default branding
const defaultBranding = {
  siteLogo: '', // Base64 or URL
  favicon: '', // Base64 or URL
  socialMediaLogo: '', // For Open Graph / Twitter Cards
  logoText: 'Kelime Tombalası',
  useEmojiAsLogo: true,
  logoEmoji: '📚',
  lastUpdated: null
}

// Get branding settings
export const getBrandingSettings = () => {
  const stored = localStorage.getItem(BRANDING_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      return defaultBranding
    }
  }
  return defaultBranding
}

// Save branding settings
export const saveBrandingSettings = (settings) => {
  const toSave = {
    ...settings,
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(BRANDING_KEY, JSON.stringify(toSave))
  
  // Update favicon if provided
  if (settings.favicon) {
    updateFavicon(settings.favicon)
  }
  
  // Add system log
  const systemLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
  systemLogs.unshift({
    id: Date.now(),
    type: 'success',
    message: 'Site logosu ve marka ayarları güncellendi',
    user: 'Admin',
    timestamp: new Date().toISOString()
  })
  if (systemLogs.length > 50) systemLogs.splice(50)
  localStorage.setItem('systemLogs', JSON.stringify(systemLogs))
}

// Update favicon dynamically
export const updateFavicon = (faviconData) => {
  // Remove existing favicon
  const existingFavicon = document.querySelector("link[rel='icon']")
  if (existingFavicon) {
    existingFavicon.remove()
  }
  
  // Add new favicon
  const link = document.createElement('link')
  link.rel = 'icon'
  link.href = faviconData
  document.head.appendChild(link)
}

// Convert image file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

// Reset to defaults
export const resetBrandingSettings = () => {
  localStorage.setItem(BRANDING_KEY, JSON.stringify(defaultBranding))
  return defaultBranding
}

