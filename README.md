# Kelime Tombalası 🎲

Çocuklar için İngilizce-Türkçe kelime kartları PDF oluşturucu.

## ⚠️ ÖNEMLİ: Font Kurulumu (Türkçe Karakterler İçin)

PDF'te Türkçe karakterlerin (ş, ğ, ü, ı, ö, ç, İ, Ş, Ğ, Ü, Ç, Ö) doğru görünmesi için **fontları kurmanız gerekiyor**:

1. **DejaVu Sans** fontlarını indirin:
   - https://dejavu-fonts.github.io/ adresine gidin
   - Veya direkt indirme: https://github.com/dejavu-fonts/dejavu-fonts/releases
   
2. İndirdiğiniz font dosyalarını projeye ekleyin:
   ```
   public/
     fonts/
       DejaVuSans-Bold.ttf
       DejaVuSans.ttf
   ```

3. `public/fonts/` klasörünü oluşturun (yoksa):
   ```bash
   mkdir -p public/fonts
   ```

4. İndirdiğiniz TTF dosyalarını `public/fonts/` klasörüne kopyalayın

5. Sayfayı yenileyin ve tekrar deneyin

## Kurulum

```bash
npm install
```

## Geliştirme

```bash
npm run dev
```

## Yapı

- **React** + **Vite** - Modern React framework
- **TailwindCSS** - Utility-first CSS framework
- **pdf-lib** - PDF oluşturma
- **mammoth** - Word dosyası okuma
- Çocuk dostu pastel renkler ve yuvarlak tasarım
- Responsive (mobil uyumlu) arayüz

## Kullanım

1. Word dosyası yükleyin (.docx) veya manuel olarak kelimeleri girin
2. Format: Her satırda `cat: kedi` veya `cat kedi`
3. "PDF Oluştur" butonuna tıklayın
4. PDF dosyasını indirin

## Özellikler

- ✅ Manuel kelime girişi
- ✅ Word dosyası yükleme (.docx)
- ✅ PDF oluşturma (İngilizce + Türkçe sayfalar)
- ✅ A4 formatı, kenar boşlukları: 20mm (yanlar), 15mm (üst/alt)
- ✅ Her satırda maksimum 5 sütun
- ✅ Her sütunda maksimum 10 kelime
- ✅ Türkçe karakter desteği (font kurulumu gerekli)

