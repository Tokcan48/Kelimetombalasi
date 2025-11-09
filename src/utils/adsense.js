// AdSense Management System

const ADSENSE_KEY = 'adsenseSettings'

// Default settings
const defaultSettings = {
  // Google Publisher ID
  publisherId: '', // ca-pub-XXXXXXXX
  
  // Meta tag for verification
  metaTag: '', // Full meta tag from Google
  
  // Ad slots
  adSlots: {
    headerBanner: '', // 728x90
    sidebar: '', // 300x600
    footerBanner: '' // 970x90
  },
  
  // Status
  enabled: false,
  lastUpdated: null
}

// Get AdSense settings
export const getAdSenseSettings = () => {
  const stored = localStorage.getItem(ADSENSE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      return defaultSettings
    }
  }
  return defaultSettings
}

// Save AdSense settings
export const saveAdSenseSettings = (settings) => {
  const toSave = {
    ...settings,
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(ADSENSE_KEY, JSON.stringify(toSave))
  
  // Add system log
  const systemLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]')
  systemLogs.unshift({
    id: Date.now(),
    type: 'success',
    message: 'AdSense ayarları güncellendi',
    user: 'Admin',
    timestamp: new Date().toISOString()
  })
  if (systemLogs.length > 50) systemLogs.splice(50)
  localStorage.setItem('systemLogs', JSON.stringify(systemLogs))
}

// Generate ads.txt content
export const generateAdsTxt = (publisherId) => {
  if (!publisherId) return ''
  
  return `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0`
}

// Reset to defaults
export const resetAdSenseSettings = () => {
  localStorage.setItem(ADSENSE_KEY, JSON.stringify(defaultSettings))
  return defaultSettings
}

