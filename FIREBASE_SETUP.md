# 🔥 Firebase Kurulum Rehberi

## Adım 1: Firebase Projesi Oluşturma

1. **Firebase Console'a gidin:**
   - https://console.firebase.google.com/ adresine gidin
   - Google hesabınızla giriş yapın

2. **Yeni proje oluşturun:**
   - "Add project" veya "Proje ekle" butonuna tıklayın
   - Proje adını girin: `kelime-tombalasi` (veya istediğiniz isim)
   - Google Analytics'i isteğe bağlı olarak etkinleştirin (önerilmez, gerekli değil)
   - "Create project" / "Proje oluştur" butonuna tıklayın

## Adım 2: Firestore Database Oluşturma

1. **Firestore Database'i etkinleştirin:**
   - Sol menüden "Firestore Database" seçin
   - "Create database" / "Veritabanı oluştur" butonuna tıklayın

2. **Güvenlik kurallarını ayarlayın:**
   - "Start in test mode" / "Test modunda başlat" seçeneğini seçin
   - (Önemli: Production'da güvenlik kurallarını güncellemeniz gerekecek)
   - "Enable" / "Etkinleştir" butonuna tıklayın

3. **Veritabanı konumunu seçin:**
   - En yakın bölgeyi seçin: `europe-west` (Avrupa) önerilir
   - "Done" / "Tamam" butonuna tıklayın

## Adım 3: Web App Config Bilgilerini Alma

1. **Web uygulaması oluşturun:**
   - Firebase Console'da sol menüden ⚙️ (Settings) > "Project settings" seçin
   - "Your apps" / "Uygulamalarınız" sekmesine gidin
   - "</>" (Web) ikonuna tıklayın

2. **App nickname girin:**
   - App nickname: `Kelime Tombalasi Web`
   - Firebase Hosting'i şimdilik etkinleştirmeyin (isteğe bağlı)
   - "Register app" / "Uygulamayı kaydet" butonuna tıklayın

3. **Config bilgilerini kopyalayın:**
   - Açılan ekranda size `firebaseConfig` objesi gösterilecek
   - Bu bilgileri kopyalayın

## Adım 4: Config Bilgilerini Projeye Ekleme

1. **src/utils/firebase.js dosyasını açın**

2. **Config bilgilerini yapıştırın:**
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",           // Buraya API Key'iniz
     authDomain: "YOUR_AUTH_DOMAIN",   // Buraya Auth Domain'iniz
     projectId: "YOUR_PROJECT_ID",     // Buraya Project ID'niz
     storageBucket: "YOUR_STORAGE_BUCKET", // Buraya Storage Bucket'iniz
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Buraya Messaging Sender ID'niz
     appId: "YOUR_APP_ID"              // Buraya App ID'niz
   }
   ```

## Adım 5: Firestore Index'leri Oluşturma

Firestore'da sorgular için index gerekir. Firebase Console'da index'leri oluşturun:

### Index 1: feedbacks koleksiyonu için
1. Firestore Database → Indexes sekmesine gidin
2. "Create Index" / "İndeks Oluştur" butonuna tıklayın
3. Collection ID: `feedbacks`
4. Fields to index:
   - Field: `createdAt`, Order: `Descending`
5. "Create" / "Oluştur" butonuna tıklayın

### Index 2: systemLogs koleksiyonu için
1. "Create Index" / "İndeks Oluştur" butonuna tıklayın
2. Collection ID: `systemLogs`
3. Fields to index:
   - Field: `timestamp`, Order: `Descending`
4. "Create" / "Oluştur" butonuna tıklayın

## Adım 6: Güvenlik Kuralları (Production için)

⚠️ **Önemli:** Production'da güvenlik kurallarını güncellemeniz gerekir!

Firestore Database → Rules sekmesine gidin ve şu kuralları ekleyin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Feedbacks - Herkes okuyabilir ve yazabilir (form gönderimi için)
    match /feedbacks/{document=**} {
      allow read: if true;
      allow create: if true;
      allow update: if request.auth != null; // Sadece giriş yapmış kullanıcılar güncelleyebilir
      allow delete: if request.auth != null; // Sadece giriş yapmış kullanıcılar silebilir
    }
    
    // System Logs - Sadece okuma ve yazma (güvenlik için)
    match /systemLogs/{document=**} {
      allow read: if request.auth != null; // Sadece giriş yapmış kullanıcılar okuyabilir
      allow write: if true; // Sistem loglarını yazabilir
    }
  }
}
```

**Not:** Şimdilik test modunda bırakabilirsiniz, ama production'da mutlaka güncelleyin!

## Adım 7: Test Etme

1. **Projeyi çalıştırın:**
   ```bash
   npm run dev
   ```

2. **Geri bildirim gönderin:**
   - /feedback sayfasına gidin
   - Formu doldurup gönderin

3. **Admin panelinde kontrol edin:**
   - /login-secure ile giriş yapın
   - "Geri Bildirimler" sekmesine gidin
   - Gönderdiğiniz mesajı görmelisiniz

4. **Firebase Console'da kontrol edin:**
   - Firebase Console → Firestore Database
   - `feedbacks` koleksiyonunu açın
   - Gönderdiğiniz mesajı görmelisiniz

## ✅ Tamamlandı!

Artık sisteminiz Firebase ile çalışıyor:
- ✅ Geri bildirimler Firebase'de saklanıyor
- ✅ Sistem logları Firebase'de saklanıyor
- ✅ Gerçek zamanlı güncellemeler çalışıyor
- ✅ Tüm cihazlardan erişilebilir

## Sorun Giderme

### Hata: "Missing or insufficient permissions"
- Firestore güvenlik kurallarını kontrol edin
- Test modunda olduğundan emin olun

### Hata: "The query requires an index"
- Firebase Console'da index'leri oluşturun (Adım 5)

### Veriler görünmüyor
- Firebase Console'da Firestore Database'i kontrol edin
- Browser console'da hataları kontrol edin (F12)

## Sonraki Adımlar

1. ✅ Firebase projesi oluşturuldu
2. ✅ Config bilgileri eklendi
3. ✅ Index'ler oluşturuldu
4. ✅ Test edildi
5. ⚠️ Production'da güvenlik kurallarını güncelleyin

Başarılar! 🚀



