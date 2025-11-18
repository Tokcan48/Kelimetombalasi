// Hazır Kelime Setleri

export const categories = [
  { id: 'beginner', name: 'Başlangıç', icon: '🌱', description: 'Günlük hayatta kullanılan temel kelimeler' },
  { id: 'intermediate', name: 'Orta', icon: '📚', description: 'Daha ileri seviye kelimeler' },
  { id: 'professional', name: 'Mesleki', icon: '💼', description: 'İş ve meslek ile ilgili kelimeler' },
  { id: 'school', name: 'Okul', icon: '🎓', description: 'Okul ve eğitim kelimeleri' },
  { id: 'travel', name: 'Seyahat', icon: '✈️', description: 'Seyahat ve turizm kelimeleri' },
  { id: 'food', name: 'Yemek', icon: '🍽️', description: 'Yiyecek ve içecek kelimeleri' },
  { id: 'health', name: 'Sağlık', icon: '🏥', description: 'Sağlık ve tıp kelimeleri' }
]

export const readyKits = [
  {
    id: 'days',
    title: 'Haftanın Günleri',
    description: '7 günün İngilizce-Türkçe karşılıkları',
    icon: '📅',
    color: 'from-blue-500 to-indigo-600',
    category: 'beginner',
    words: [
      { english: 'Monday', turkish: 'Pazartesi' },
      { english: 'Tuesday', turkish: 'Salı' },
      { english: 'Wednesday', turkish: 'Çarşamba' },
      { english: 'Thursday', turkish: 'Perşembe' },
      { english: 'Friday', turkish: 'Cuma' },
      { english: 'Saturday', turkish: 'Cumartesi' },
      { english: 'Sunday', turkish: 'Pazar' }
    ]
  },
  {
    id: 'months',
    title: 'Aylar',
    description: '12 ayın İngilizce-Türkçe karşılıkları',
    icon: '🗓️',
    color: 'from-purple-500 to-pink-600',
    category: 'beginner',
    words: [
      { english: 'January', turkish: 'Ocak' },
      { english: 'February', turkish: 'Şubat' },
      { english: 'March', turkish: 'Mart' },
      { english: 'April', turkish: 'Nisan' },
      { english: 'May', turkish: 'Mayıs' },
      { english: 'June', turkish: 'Haziran' },
      { english: 'July', turkish: 'Temmuz' },
      { english: 'August', turkish: 'Ağustos' },
      { english: 'September', turkish: 'Eylül' },
      { english: 'October', turkish: 'Ekim' },
      { english: 'November', turkish: 'Kasım' },
      { english: 'December', turkish: 'Aralık' }
    ]
  },
  {
    id: 'numbers',
    title: 'Sayılar (1-20)',
    description: 'Temel sayıların İngilizce-Türkçe karşılıkları',
    icon: '🔢',
    color: 'from-green-500 to-teal-600',
    category: 'beginner',
    words: [
      { english: 'One', turkish: 'Bir' },
      { english: 'Two', turkish: 'İki' },
      { english: 'Three', turkish: 'Üç' },
      { english: 'Four', turkish: 'Dört' },
      { english: 'Five', turkish: 'Beş' },
      { english: 'Six', turkish: 'Altı' },
      { english: 'Seven', turkish: 'Yedi' },
      { english: 'Eight', turkish: 'Sekiz' },
      { english: 'Nine', turkish: 'Dokuz' },
      { english: 'Ten', turkish: 'On' },
      { english: 'Eleven', turkish: 'On Bir' },
      { english: 'Twelve', turkish: 'On İki' },
      { english: 'Thirteen', turkish: 'On Üç' },
      { english: 'Fourteen', turkish: 'On Dört' },
      { english: 'Fifteen', turkish: 'On Beş' },
      { english: 'Sixteen', turkish: 'On Altı' },
      { english: 'Seventeen', turkish: 'On Yedi' },
      { english: 'Eighteen', turkish: 'On Sekiz' },
      { english: 'Nineteen', turkish: 'On Dokuz' },
      { english: 'Twenty', turkish: 'Yirmi' }
    ]
  },
  {
    id: 'colors',
    title: 'Renkler',
    description: 'Temel renklerin İngilizce-Türkçe karşılıkları',
    icon: '🎨',
    color: 'from-pink-500 to-rose-600',
    category: 'beginner',
    words: [
      { english: 'Red', turkish: 'Kırmızı' },
      { english: 'Blue', turkish: 'Mavi' },
      { english: 'Yellow', turkish: 'Sarı' },
      { english: 'Green', turkish: 'Yeşil' },
      { english: 'Orange', turkish: 'Turuncu' },
      { english: 'Purple', turkish: 'Mor' },
      { english: 'Pink', turkish: 'Pembe' },
      { english: 'Brown', turkish: 'Kahverengi' },
      { english: 'Black', turkish: 'Siyah' },
      { english: 'White', turkish: 'Beyaz' },
      { english: 'Gray', turkish: 'Gri' },
      { english: 'Gold', turkish: 'Altın' },
      { english: 'Silver', turkish: 'Gümüş' }
    ]
  },
  {
    id: 'family',
    title: 'Aile Bireyleri',
    description: 'Aile fertlerinin İngilizce-Türkçe karşılıkları',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-orange-500 to-amber-600',
    category: 'beginner',
    words: [
      { english: 'Mother', turkish: 'Anne' },
      { english: 'Father', turkish: 'Baba' },
      { english: 'Sister', turkish: 'Kız Kardeş' },
      { english: 'Brother', turkish: 'Erkek Kardeş' },
      { english: 'Grandmother', turkish: 'Büyükanne' },
      { english: 'Grandfather', turkish: 'Büyükbaba' },
      { english: 'Aunt', turkish: 'Teyze/Hala' },
      { english: 'Uncle', turkish: 'Amca/Dayı' },
      { english: 'Cousin', turkish: 'Kuzen' },
      { english: 'Daughter', turkish: 'Kız Çocuk' },
      { english: 'Son', turkish: 'Erkek Çocuk' },
      { english: 'Wife', turkish: 'Eş (Kadın)' },
      { english: 'Husband', turkish: 'Eş (Erkek)' }
    ]
  },
  {
    id: 'animals',
    title: 'Hayvanlar',
    description: 'Yaygın hayvan isimlerinin İngilizce-Türkçe karşılıkları',
    icon: '🐾',
    color: 'from-cyan-500 to-blue-600',
    category: 'beginner',
    words: [
      { english: 'Dog', turkish: 'Köpek' },
      { english: 'Cat', turkish: 'Kedi' },
      { english: 'Bird', turkish: 'Kuş' },
      { english: 'Fish', turkish: 'Balık' },
      { english: 'Horse', turkish: 'At' },
      { english: 'Cow', turkish: 'İnek' },
      { english: 'Sheep', turkish: 'Koyun' },
      { english: 'Chicken', turkish: 'Tavuk' },
      { english: 'Lion', turkish: 'Aslan' },
      { english: 'Tiger', turkish: 'Kaplan' },
      { english: 'Elephant', turkish: 'Fil' },
      { english: 'Monkey', turkish: 'Maymun' },
      { english: 'Bear', turkish: 'Ayı' },
      { english: 'Rabbit', turkish: 'Tavşan' }
    ]
  },
  // Orta Seviye Setler
  {
    id: 'emotions',
    title: 'Duygular',
    description: 'Temel duygu ifadelerinin İngilizce-Türkçe karşılıkları',
    icon: '😊',
    color: 'from-indigo-500 to-purple-600',
    category: 'intermediate',
    words: [
      { english: 'Happy', turkish: 'Mutlu' },
      { english: 'Sad', turkish: 'Üzgün' },
      { english: 'Angry', turkish: 'Kızgın' },
      { english: 'Excited', turkish: 'Heyecanlı' },
      { english: 'Worried', turkish: 'Endişeli' },
      { english: 'Surprised', turkish: 'Şaşırmış' },
      { english: 'Tired', turkish: 'Yorgun' },
      { english: 'Proud', turkish: 'Gururlu' },
      { english: 'Afraid', turkish: 'Korkmuş' },
      { english: 'Calm', turkish: 'Sakin' },
      { english: 'Confused', turkish: 'Karışık' },
      { english: 'Relaxed', turkish: 'Rahatlamış' }
    ]
  },
  {
    id: 'weather',
    title: 'Hava Durumu',
    description: 'Hava durumu terimlerinin İngilizce-Türkçe karşılıkları',
    icon: '☀️',
    color: 'from-yellow-500 to-orange-600',
    category: 'intermediate',
    words: [
      { english: 'Sunny', turkish: 'Güneşli' },
      { english: 'Rainy', turkish: 'Yağmurlu' },
      { english: 'Cloudy', turkish: 'Bulutlu' },
      { english: 'Windy', turkish: 'Rüzgarlı' },
      { english: 'Snowy', turkish: 'Karlı' },
      { english: 'Foggy', turkish: 'Sisli' },
      { english: 'Stormy', turkish: 'Fırtınalı' },
      { english: 'Hot', turkish: 'Sıcak' },
      { english: 'Cold', turkish: 'Soğuk' },
      { english: 'Warm', turkish: 'Ilık' },
      { english: 'Cool', turkish: 'Serin' },
      { english: 'Humid', turkish: 'Nemli' }
    ]
  },
  {
    id: 'time-expressions',
    title: 'Zaman İfadeleri',
    description: 'Günlük zaman ifadelerinin İngilizce-Türkçe karşılıkları',
    icon: '⏰',
    color: 'from-teal-500 to-cyan-600',
    category: 'intermediate',
    words: [
      { english: 'Morning', turkish: 'Sabah' },
      { english: 'Afternoon', turkish: 'Öğleden Sonra' },
      { english: 'Evening', turkish: 'Akşam' },
      { english: 'Night', turkish: 'Gece' },
      { english: 'Today', turkish: 'Bugün' },
      { english: 'Tomorrow', turkish: 'Yarın' },
      { english: 'Yesterday', turkish: 'Dün' },
      { english: 'Now', turkish: 'Şimdi' },
      { english: 'Later', turkish: 'Sonra' },
      { english: 'Before', turkish: 'Önce' },
      { english: 'After', turkish: 'Sonra' },
      { english: 'Always', turkish: 'Her Zaman' },
      { english: 'Never', turkish: 'Asla' },
      { english: 'Sometimes', turkish: 'Bazen' },
      { english: 'Often', turkish: 'Sık Sık' }
    ]
  },
  // Mesleki - Havacılık Setleri
  {
    id: 'aviation-basics',
    title: 'Havacılık - Temel Terimler',
    description: 'Havacılık sektöründe kullanılan temel terimler',
    icon: '✈️',
    color: 'from-blue-600 to-sky-600',
    category: 'professional',
    words: [
      { english: 'Aircraft', turkish: 'Hava Aracı' },
      { english: 'Airplane', turkish: 'Uçak' },
      { english: 'Helicopter', turkish: 'Helikopter' },
      { english: 'Pilot', turkish: 'Pilot' },
      { english: 'Flight Attendant', turkish: 'Kabin Memuru' },
      { english: 'Cockpit', turkish: 'Kokpit' },
      { english: 'Runway', turkish: 'Pist' },
      { english: 'Terminal', turkish: 'Terminal' },
      { english: 'Gate', turkish: 'Kapı' },
      { english: 'Boarding', turkish: 'Biniş' },
      { english: 'Departure', turkish: 'Kalkış' },
      { english: 'Arrival', turkish: 'Varış' }
    ]
  },
  {
    id: 'aviation-parts',
    title: 'Havacılık - Uçak Parçaları',
    description: 'Uçağın temel parçalarının İngilizce-Türkçe karşılıkları',
    icon: '🛫',
    color: 'from-sky-600 to-blue-700',
    category: 'professional',
    words: [
      { english: 'Wing', turkish: 'Kanat' },
      { english: 'Engine', turkish: 'Motor' },
      { english: 'Propeller', turkish: 'Pervane' },
      { english: 'Cabin', turkish: 'Kabin' },
      { english: 'Cargo Hold', turkish: 'Kargo Bölümü' },
      { english: 'Landing Gear', turkish: 'İniş Takımı' },
      { english: 'Rudder', turkish: 'Dümen' },
      { english: 'Elevator', turkish: 'Yükseklik Dümeni' },
      { english: 'Aileron', turkish: 'Kanatçık' },
      { english: 'Flap', turkish: 'Flap' },
      { english: 'Fuselage', turkish: 'Gövde' },
      { english: 'Tail', turkish: 'Kuyruk' }
    ]
  },
  {
    id: 'aviation-airport',
    title: 'Havacılık - Havaalanı',
    description: 'Havaalanında kullanılan terimler',
    icon: '🛬',
    color: 'from-blue-700 to-indigo-700',
    category: 'professional',
    words: [
      { english: 'Airport', turkish: 'Havaalanı' },
      { english: 'Air Traffic Control', turkish: 'Hava Trafik Kontrol' },
      { english: 'Baggage Claim', turkish: 'Bagaj Alma' },
      { english: 'Check-in', turkish: 'Check-in' },
      { english: 'Security Check', turkish: 'Güvenlik Kontrolü' },
      { english: 'Passport Control', turkish: 'Pasaport Kontrolü' },
      { english: 'Customs', turkish: 'Gümrük' },
      { english: 'Delay', turkish: 'Gecikme' },
      { english: 'Cancellation', turkish: 'İptal' },
      { english: 'Turbulence', turkish: 'Türbülans' },
      { english: 'Altitude', turkish: 'İrtifa' },
      { english: 'Takeoff', turkish: 'Kalkış' },
      { english: 'Landing', turkish: 'İniş' },
      { english: 'Tower', turkish: 'Kule' },
      { english: 'Hangar', turkish: 'Hangar' }
    ]
  }
]

