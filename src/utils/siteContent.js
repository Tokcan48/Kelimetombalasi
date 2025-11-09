// Site content management - Simplified

// Default content
const defaultContent = {
  // Temel Bilgiler
  siteTitle: "Kelime Tombalası",
  mainHeading: "Kelime Öğrenimini Daha Kolay Yapın",
  description: "İngilizce-Türkçe kelime kartlarınızı profesyonel PDF formatında oluşturun, yazdırın ve öğrenmeye başlayın.",
  
  // İletişim
  contactEmail: "info@kelimetombalasi.com",
  contactPhone: "+90 555 123 45 67",
  
  // Sosyal Medya
  socialMedia: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: ""
  },
  
  // Footer
  copyright: "© 2024 Kelime Tombalası. Tüm hakları saklıdır.",
  footerDescription: "İngilizce kelime öğrenimi için en kolay ve hızlı araç.",
  
  // Footer Links
  footerLinks: {
    product: [
      { text: "PDF Oluştur", url: "/generator" },
      { text: "Özellikler", url: "#" }
    ],
    support: [
      { text: "Geri Bildirim", url: "/feedback" },
      { text: "SSS", url: "/faq" },
      { text: "İletişim", url: "/contact" }
    ],
    legal: [
      { text: "Gizlilik Politikası", url: "/privacy" },
      { text: "Kullanım Koşulları", url: "/terms" }
    ]
  },
  
  // Site Durumu
  siteStatus: "active", // "active" veya "maintenance"
  maintenanceMessage: "Site bakımda. Kısa süre içinde tekrar hizmetinizdeyiz!",
  
  // Yasal Sayfalar İçeriği
  legalPages: {
    privacy: {
      title: "Gizlilik Politikası",
      content: "Bu sayfa yapım aşamasındadır. Gizlilik politikamız hakkında bilgi almak için lütfen bizimle iletişime geçin."
    },
    terms: {
      title: "Kullanım Koşulları",
      content: "Bu sayfa yapım aşamasındadır. Kullanım koşullarımız hakkında bilgi almak için lütfen bizimle iletişime geçin."
    },
    faq: {
      title: "Sıkça Sorulan Sorular",
      content: "Bu sayfa yapım aşamasındadır. Sorularınız için lütfen geri bildirim sayfamızı kullanın."
    }
  }
}

// Get site content
export const getSiteContent = () => {
  const stored = localStorage.getItem('siteContent')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      
      // Check if it's the old structure and migrate to new structure
      if (parsed.hero || parsed.features || parsed.testimonials) {
        // Old structure detected, migrate to new
        localStorage.setItem('siteContent', JSON.stringify(defaultContent))
        return defaultContent
      }
      
      // Validate new structure has required fields
      if (!parsed.siteTitle || !parsed.mainHeading) {
        localStorage.setItem('siteContent', JSON.stringify(defaultContent))
        return defaultContent
      }
      
      return parsed
    } catch (e) {
      console.error('Error parsing site content:', e)
      return defaultContent
    }
  }
  return defaultContent
}

// Save site content
export const saveSiteContent = (content) => {
  localStorage.setItem('siteContent', JSON.stringify(content))
  // Log will be added from Admin.jsx
}

// Reset to defaults
export const resetSiteContent = () => {
  localStorage.setItem('siteContent', JSON.stringify(defaultContent))
  return defaultContent
}



