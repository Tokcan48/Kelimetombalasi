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
  },
  
  // Ana Sayfa İçeriği
  homePage: {
    heroBadge: "✨ Ücretsiz & Kolay Kullanım",
    ctaButton1: "🚀 Hemen Başla",
    ctaButton2: "⚡ Hazır Setler",
    ctaButton3: "❓ Nasıl Çalışır?",
    featuresTitle: "Neden Bizi Seçmelisiniz?",
    featuresSubtitle: "Binlerce öğretmen ve öğrenci kelime öğrenmek için bizi tercih ediyor",
    feature1Title: "⚡ Hızlı ve Kolay",
    feature1Description: "Kelimelerinizi girin veya Word dosyası yükleyin. Saniyeler içinde profesyonel PDF'niz hazır!",
    feature2Title: "🎨 Özelleştirilebilir",
    feature2Description: "Renkli veya siyah-beyaz yazıcılar için optimize edilmiş PDF formatları arasından seçim yapın.",
    feature3Title: "🔒 Tamamen Güvenli",
    feature3Description: "Tüm işlemler tarayıcınızda gerçekleşir. Verileriniz hiçbir sunucuya gönderilmez.",
    howItWorksTitle: "Nasıl Çalışır?",
    howItWorksSubtitle: "Sadece 3 basit adımda kelime kartlarınızı oluşturun",
    step1Title: "📝 Kelimelerinizi Girin",
    step1Description: "Kelimeleri manuel olarak yazın veya mevcut Word dosyanızı (.docx) yükleyin.",
    step2Title: "🖨️ Yazıcı Tipini Seçin",
    step2Description: "Renkli veya siyah-beyaz yazıcınız için optimize edilmiş format seçin.",
    step3Title: "📥 PDF'i İndirin ve Yazdırın",
    step3Description: "PDF'iniz otomatik olarak indirilir. Yazdırın, kesin ve öğrenmeye başlayın!",
    testimonialsTitle: "Kullanıcılarımız Ne Diyor?",
    testimonialsSubtitle: "Binlerce mutlu kullanıcıdan bazıları",
    testimonial1Text: "\"Öğrencilerim için kelime kartları hazırlamak artık çok kolay. Harika bir araç!\"",
    testimonial1Name: "Ayşe Yılmaz",
    testimonial1Role: "İngilizce Öğretmeni",
    testimonial2Text: "\"Sınavlara hazırlanırken kelime kartları çok işime yaradı. Teşekkürler!\"",
    testimonial2Name: "Mehmet Kaya",
    testimonial2Role: "Lise Öğrencisi",
    testimonial3Text: "\"Çocuğum için kelime kartları hazırlamak hiç bu kadar kolay olmamıştı!\"",
    testimonial3Name: "Zeynep Demir",
    testimonial3Role: "Veli"
  },
  
  // Generator Sayfası İçeriği
  generatorPage: {
    title: "Kelime Kartı Oluşturucu",
    subtitle: "İngilizce-Türkçe kelime kartlarınızı kolayca PDF'e dönüştürün",
    educationTitle: "Kelime Kartları ile Etkili İngilizce Öğrenme Yöntemleri",
    educationContent: `Kelime kartları (flashcard), yüzyıllardır kullanılan ve bilimsel olarak kanıtlanmış en etkili dil öğrenme yöntemlerinden biridir. Özellikle İngilizce-Türkçe kelime öğreniminde, bu yöntem öğrencilere, öğretmenlere ve kendi kendine öğrenen bireylere büyük avantajlar sağlar. Bu sayfada, kelime kartlarının eğitimdeki rolünü, Türkçe-İngilizce kelime ezberleme tekniklerini ve yazdırılabilir kartların avantajlarını detaylı olarak ele alacağız.

Kelime Kartlarının Eğitimde Kullanımı
Kelime kartları, aktif hatırlama (active recall) ve aralıklı tekrar (spaced repetition) prensiplerine dayanan bir öğrenme sistemidir. Bu yöntem, beynin uzun süreli hafızaya bilgi kaydetme mekanizmasını en verimli şekilde kullanır. Geleneksel liste ezberleme yöntemlerinden farklı olarak, kelime kartları öğrenciyi pasif okuma yerine aktif hatırlama sürecine dahil eder. Kartın bir yüzüne baktığınızda, diğer yüzündeki bilgiyi hatırlamaya çalışmak, beynin nöral bağlantılarını güçlendirir ve öğrenilen bilginin kalıcılığını artırır.

Eğitim araştırmaları, kelime kartları kullanan öğrencilerin, geleneksel yöntemlerle çalışan öğrencilere göre %40-60 daha fazla kelimeyi uzun süreli hafızalarına kaydettiklerini göstermektedir. Bu başarının temel nedeni, kartların görsel, dokunsal ve zihinsel olarak çoklu duyusal deneyim sunmasıdır. Özellikle çocuklar ve genç öğrenciler için, renkli ve görsel olarak çekici kelime kartları, öğrenme sürecini eğlenceli bir aktiviteye dönüştürür.

Türkçe-İngilizce Kelime Ezberleme Yöntemleri
İngilizce öğrenen Türk öğrenciler için, kelime kartları özel bir öneme sahiptir. Türkçe ve İngilizce arasındaki yapısal farklılıklar, bazı kelimelerin doğrudan çevirisinin zor olması ve kültürel bağlam farklılıkları, geleneksel sözlük kullanımını yetersiz kılabilir. Kelime kartları, bu zorlukları aşmak için ideal bir araçtır. Kartın bir yüzünde İngilizce kelime, diğer yüzünde Türkçe anlamı ve mümkünse örnek cümle veya görsel bulunur. Bu çok katmanlı yaklaşım, öğrencinin kelimeyi sadece çeviri olarak değil, bağlam içinde öğrenmesini sağlar.

Etkili bir kelime kartı kullanım stratejisi şu adımları içerir: İlk olarak, kartları üç gruba ayırın - "Bildiğim", "Biraz Biliyorum" ve "Bilmiyorum". Her gün yeni kartlar ekleyin ve bildiğiniz kartları düzenli aralıklarla tekrar gözden geçirin. Leitner Sistemi gibi yapılandırılmış tekrar programları, öğrenme verimliliğini önemli ölçüde artırır. Ayrıca, kelimeleri tematik gruplara ayırmak (örneğin: yiyecekler, hayvanlar, renkler) ve görsel ipuçları eklemek, hafıza çağrışımlarını güçlendirir.

Modern araştırmalar, yazılı kelime kartlarının dijital uygulamalara göre bazı avantajları olduğunu göstermektedir. Fiziksel kartları tutmak, çevirmek ve gruplamak, motor hafıza (muscle memory) oluşturur ve öğrenme deneyimini zenginleştirir. Özellikle çocuklar ve kinestetik öğrenenler için, dokunsal deneyim öğrenme sürecini hızlandırır.

Yazdırılabilir Kelime Kartlarının Avantajları
Yazdırılabilir kelime kartları, öğrencilere ve öğretmenlere büyük esneklik ve kontrol sağlar. PDF formatında hazırlanmış kartlar, standart yazıcılarda kolayca basılabilir ve istenilen miktarda çoğaltılabilir. Bu özellik, özellikle sınıf ortamında öğretmenler için değerlidir. Öğretmenler, müfredata uygun kelime setleri oluşturabilir, öğrencilerine dağıtabilir ve her öğrencinin kendi hızında öğrenmesine olanak tanıyabilir.

Yazdırılabilir kartların bir diğer önemli avantajı, özelleştirme imkanıdır. Öğrenciler, kendi öğrenme ihtiyaçlarına göre kelime setleri oluşturabilir, zorlandıkları kelimelere odaklanabilir ve ilerlemelerini takip edebilirler. Renkli yazdırma seçeneği, görsel öğrenenler için özellikle faydalıdır. Her kelime farklı bir renkte basıldığında, görsel hafıza devreye girer ve kelime tanıma hızı artar.

Çift taraflı yazdırma desteği, kelime kartlarının kullanım verimliliğini maksimize eder. Kartın bir yüzünde İngilizce kelime, diğer yüzünde Türkçe anlamı bulunur. Bu düzen, öğrencinin hem İngilizce'den Türkçe'ye hem de Türkçe'den İngilizce'ye çeviri yapma becerisini geliştirir. Ayrıca, A4 formatında optimize edilmiş tasarım, standart yazıcılarda mükemmel sonuçlar verir ve kartların kesilmesi ve kullanıma hazır hale getirilmesi kolaydır.

Sonuç olarak, kelime kartları ile öğrenme, modern eğitim araştırmalarının desteklediği, bilimsel olarak kanıtlanmış bir yöntemdir. Yazdırılabilir PDF formatındaki kartlar, bu yöntemi herkes için erişilebilir ve uygulanabilir kılar. İster öğrenci, ister öğretmen, ister ebeveyn olun, kelime kartları İngilizce öğrenme yolculuğunuzda güçlü bir araç olacaktır.`,
    tipBoxTitle: "💡 İpucu: Word Dosyası Formatı",
    tipBoxContent: "Word dosyanızda her satıra bir kelime çifti yazın. Örnek: cat: kedi veya apple - elma. Sistem otomatik olarak doğru formatı algılayacaktır. Sınırsız sayıda kelime ekleyebilir, büyük kelime setleri oluşturabilirsiniz. PDF çıktısı A4 formatında, standart yazıcılarda mükemmel görünüm sağlayacak şekilde optimize edilmiştir.",
    step1Title: "Kelime Girişi",
    step1Description: "Kelimeleri manuel olarak yazın veya Word dosyasından yükleyin. Format: kelime: anlam",
    step2Title: "Format Seçimi",
    step2Description: "Renkli veya siyah-beyaz yazıcınız için optimize edilmiş format seçin. Her iki seçenek de çift taraflı yazdırma için hazırdır.",
    step3Title: "PDF İndirme",
    step3Description: "PDF'inizi indirin, yazdırın ve kartları kesin. Çift taraflı yazdırmada otomatik hizalama yapılır."
  },
  
  // İletişim Sayfası
  contactPage: {
    title: "İletişim",
    subtitle: "Bizimle iletişime geçin, her zaman size yardımcı olmaktan mutluluk duyarız!",
    emailTitle: "E-posta",
    emailDescription: "Size en kısa sürede geri dönüş yapacağız.",
    phoneTitle: "Telefon",
    phoneDescription: "Bizi arayarak hızlıca ulaşabilirsiniz.",
    socialTitle: "Sosyal Medyada Bizi Takip Edin",
    feedbackText: "Veya geri bildirim formunu kullanarak bize mesaj gönderin:",
    feedbackButton: "Geri Bildirim Gönder",
    backButton: "Ana Sayfaya Dön"
  },
  
  // Geri Bildirim Sayfası
  feedbackPage: {
    title: "Görüş ve Önerileriniz",
    subtitle: "Fikirleriniz bizim için değerli. Lütfen görüş ve önerilerinizi bizimle paylaşın.",
    backButton: "Geri Dön",
    nameLabel: "Adınız Soyadınız",
    namePlaceholder: "Ahmet Yılmaz",
    emailLabel: "E-posta Adresiniz",
    emailPlaceholder: "ornek@email.com",
    ratingLabel: "Değerlendirme",
    messageLabel: "Mesajınız",
    messagePlaceholder: "Görüş ve önerilerinizi buraya yazabilirsiniz...",
    submitButton: "Gönder",
    successTitle: "Teşekkürler!",
    successMessage: "Görüşleriniz başarıyla gönderildi. En kısa sürede değerlendireceğiz.",
    infoEmailTitle: "E-posta",
    infoEmail: "destek@kelimetombalasi.com",
    infoResponseTitle: "Yanıt Süresi",
    infoResponse: "24 saat içinde",
    infoSupportTitle: "Destek Hattı",
    infoSupport: "7/24 Aktif"
  },
  
  // Hazır Setler Sayfası
  readyKitsPage: {
    title: "Hazır Kelime Setleri",
    subtitle: "Tek tıkla PDF indir! Haftanın günleri, sayılar, renkler ve daha fazlası...",
    description: "Özenle seçilmiş ve kategorize edilmiş kelime setlerini tek tıkla indirebilirsiniz. Her set belirli bir konuya odaklanır (örneğin: haftanın günleri, renkler, hayvanlar) ve öğrenme sürecinizi kolaylaştırır.",
    allCategories: "Tüm Kategoriler",
    noKitsMessage: "Bu kategoride henüz set bulunmuyor.",
    downloadButton: "PDF İndir",
    downloadingButton: "İndiriliyor...",
    backButton: "Ana Sayfaya Dön"
  },
  
  // SSS Sayfası
  faqPage: {
    badge: "❓ Sık Sorulan Sorular",
    subtitle: "Aklınıza takılan soruların yanıtları burada",
    noQuestionsMessage: "Henüz soru eklenmemiş. Admin panelinden içerik ekleyebilirsiniz.",
    backButton: "Ana Sayfaya Dön"
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



