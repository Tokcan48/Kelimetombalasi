const ADSENSE_KEY = 'adsenseSettings'

const defaultSettings = {
  publisherId: '',
  metaTag: '',
  adSlots: {
    headerBanner: '',
    footerBanner: ''
  },
  enabled: false,
  lastUpdated: null
}

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

export const saveAdSenseSettings = (settings) => {
  const toSave = {
    ...settings,
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(ADSENSE_KEY, JSON.stringify(toSave))
}

export const generateAdsTxt = (publisherId) => {
  if (!publisherId) return ''
  const cleanId = publisherId.trim()
  return `google.com, ${cleanId}, DIRECT, f08c47fec0942fa0`
}

export const resetAdSenseSettings = () => {
  localStorage.setItem(ADSENSE_KEY, JSON.stringify(defaultSettings))
  return defaultSettings
}

