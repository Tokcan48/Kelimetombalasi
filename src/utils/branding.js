const BRANDING_KEY = 'brandingSettings'

const defaultBranding = {
  siteLogo: '',
  favicon: '',
  socialMediaLogo: '',
  logoText: 'Kelime Tombalası',
  useEmojiAsLogo: true,
  logoEmoji: '📚',
  lastUpdated: null
}
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

export const saveBrandingSettings = (settings) => {
  const toSave = {
    ...settings,
    lastUpdated: new Date().toISOString()
  }
  localStorage.setItem(BRANDING_KEY, JSON.stringify(toSave))
  
  if (settings.favicon) {
    updateFavicon(settings.favicon)
  }
}

export const updateFavicon = (faviconData) => {
  const existingFavicon = document.querySelector("link[rel='icon']")
  if (existingFavicon) {
    existingFavicon.remove()
  }
  
  const link = document.createElement('link')
  link.rel = 'icon'
  link.href = faviconData
  document.head.appendChild(link)
}

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

export const resetBrandingSettings = () => {
  localStorage.setItem(BRANDING_KEY, JSON.stringify(defaultBranding))
  return defaultBranding
}

