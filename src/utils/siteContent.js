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
      content: `Kelime kartlarını nasıl kullanmalıyım?
PDF'inizi indirip yazdırdıktan sonra kartları kesin. İngilizce tarafına bakarak Türkçe anlamını hatırlamaya çalışın, sonra kartı çevirip kontrol edin. Bildiğiniz kartları bir kenara ayırın ve bilmediklerinize odaklanın. Günde 15-20 dakika çalışma ile hızlı ilerleme kaydedebilirsiniz.

Word dosyası formatı nasıl olmalı?
Word dosyanızda her satıra bir kelime çifti yazın. Format şu şekilde olmalıdır: "İngilizce kelime = Türkçe anlam" veya "İngilizce kelime - Türkçe anlam". Örnek: "apple = elma" veya "apple - elma". Her satırda sadece bir kelime çifti bulunmalıdır.

Ücretsiz mi? Gizli ücret var mı?
Evet, tamamen ücretsizdir! Sınırsız sayıda PDF oluşturabilir, istediğiniz kadar kelime kartı hazırlayabilirsiniz. Kayıt veya üyelik gerektirmez. Tüm özellikler herkes için tamamen açıktır ve gizli bir ücret yoktur.

Verilerim güvende mi?
Evet, kesinlikle güvende! Tüm işlemler tarayıcınızda (bilgisayarınızda) gerçekleşir. Kelimeleriniz hiçbir sunucuya gönderilmez veya kaydedilmez. PDF oluşturma işlemi tamamen yerel olarak yapılır. Gizliliğiniz bizim için önceliklidir.

Renkli ve siyah-beyaz yazıcı arasındaki fark nedir?
Renkli yazıcı seçeneğinde, her kelime farklı renkli bir karta basılır. Bu, görsel olarak daha çekici ve hatırlamayı kolaylaştırır. Siyah-beyaz yazıcı seçeneği ise standart beyaz kartlar üzerine siyah yazı ile basılır ve herhangi bir yazıcıda kullanılabilir. Her iki format da öğrenme açısından etkilidir.

Hazır setler nereden geliyor?
Hazır setler, diğer kullanıcılarımız tarafından oluşturulup onay sürecinden geçen kelime setleridir. Belirli konulara göre kategorize edilmiş, kalite kontrolünden geçmiş ve herkes tarafından kullanılabilir durumda olan setlerdir. Siz de kendi setlerinizi oluşturup toplulukla paylaşabilirsiniz.`
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



