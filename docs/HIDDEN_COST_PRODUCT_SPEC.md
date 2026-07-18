# Hidden Cost — Product Requirements & Technical Specification

> **Belge sürümü:** 1.0  
> **Tarih:** 18 Temmuz 2026  
> **Platform:** Android öncelikli, iOS uyumlu  
> **Teknoloji:** React Native + Expo CLI + TypeScript + Firebase  
> **Çalışma adı:** Hidden Cost  
> **Ana amaç:** Bir ürünün etiket fiyatı yerine, sahip olma süresi boyunca oluşacak gerçek toplam maliyetini anlaşılır ve şeffaf biçimde hesaplamak.

---

## 1. Ürün özeti

Hidden Cost, kullanıcının satın almayı düşündüğü veya hâlihazırda sahip olduğu bir ürünün yalnızca alış fiyatını değil; finansman, bakım, sigorta, vergi, depolama, enerji/yakıt, sarf malzemeleri ve değer kaybı gibi maliyetlerini de hesaba katarak **Toplam Sahip Olma Maliyeti (Total Cost of Ownership / TCO)** hesaplayan mobil karar destek uygulamasıdır.

Uygulama şu sorulara cevap vermelidir:

- Bu ürün bana gerçekte toplam ne kadara mal olacak?
- Aylık ortalama maliyeti nedir?
- Kullanım başına, kilometre başına veya saat başına maliyeti nedir?
- Etiket fiyatı toplam maliyetin yüzde kaçını oluşturuyor?
- En büyük maliyet kalemleri hangileri?
- Nakit ödeme ile finansman arasında ne kadar fark var?
- İki veya üç alternatiften hangisi uzun vadede daha avantajlı?
- Düşük, normal ve yüksek maliyet senaryolarında sonuç nasıl değişiyor?

Uygulama yatırım veya finansal danışmanlık sunmaz. Sonuçlar, kullanıcının girdiği varsayımlara dayanan tahminlerdir.

---

## 2. Ürün vizyonu

Kullanıcıların “satın alma fiyatı” ile “sahip olmanın gerçek maliyeti” arasındaki farkı görmesini sağlayan, kullanımı kolay fakat hesaplama modeli şeffaf bir mobil araç olmak.

### 2.1 Ürün ilkeleri

1. **Şeffaflık:** Her sonuç hangi girdiler ve formüllerle üretildiğini açıklamalıdır.
2. **Yerel öncelikli çalışma:** Hesaplamalar internet olmadan yapılabilmeli ve kaydedilebilmelidir.
3. **Hız:** Kullanıcı temel bir hesaplamayı iki dakikadan kısa sürede tamamlayabilmelidir.
4. **Profesyonel görünüm:** Finans uygulaması ciddiyetinde, anlaşılır ve güven veren bir arayüz.
5. **Reklam disiplini:** Reklamlar hesaplama adımlarını bölmemeli veya yanlış tıklamaya neden olmamalıdır.
6. **Gizlilik:** Kullanıcının maliyet verileri varsayılan olarak cihazda saklanmalı; bulut yedekleme açıkça anlatılmalıdır.
7. **Genişletilebilirlik:** Yeni kategori ve maliyet kalemleri uygulama güncellemesi gerektirmeden eklenebilmelidir.
8. **Erişilebilirlik:** Yazı ölçeklendirme, ekran okuyucu ve yeterli kontrast desteklenmelidir.

---

## 3. Hedef kullanıcılar

### 3.1 Birincil kullanıcılar

- Otomobil, motosiklet veya tekne satın almayı düşünenler
- Elektronik cihazların uzun vadeli maliyetini karşılaştırmak isteyenler
- Abonelik ve ekipman maliyetlerini analiz edenler
- Büyük alışverişler öncesinde gerçek bütçe hesabı yapmak isteyenler
- İkinci el ve sıfır ürün arasında karar vermek isteyenler

### 3.2 Örnek kullanıcı hikâyeleri

- “İki motosiklet arasında sadece satış fiyatına göre değil, yakıt, bakım ve ikinci el değerine göre karar vermek istiyorum.”
- “Teknenin marina, yakıt, bakım ve sigorta dahil yıllık maliyetini görmek istiyorum.”
- “Telefonu 24 ay kullanırsam aylık gerçek maliyetini öğrenmek istiyorum.”
- “Nakit almakla kredi kullanmak arasındaki toplam farkı karşılaştırmak istiyorum.”
- “Hazırladığım sonucu PDF veya görsel olarak paylaşmak istiyorum.”

---

## 4. MVP kapsamı

MVP, her kategoriyi kapsayan dev bir finans platformu olmamalıdır. İlk sürüm aşağıdaki hazır şablonları içermelidir:

1. Otomobil
2. Motosiklet
3. Tekne
4. Elektronik cihaz
5. Abonelik
6. Özel hesaplama

### 4.1 MVP’de bulunacak temel özellikler

- Onboarding
- Türkçe ve İngilizce
- Açık/koyu tema
- Hazır kategori şablonları
- Adım adım hesaplama sihirbazı
- Bir defalık maliyetler
- Periyodik sabit maliyetler
- Kullanıma bağlı maliyetler
- Finansman hesabı
- Tahmini satış/devir değeri
- Toplam, aylık ve kullanım birimi başına maliyet
- Maliyet dağılımı
- En büyük maliyet sürücüleri
- Düşük / temel / yüksek senaryolar
- İki veya üç projeyi karşılaştırma
- Hesaplamayı cihazda kaydetme
- Offline-first çalışma
- İsteğe bağlı Firebase bulut yedekleme
- Anonim oturum ve sonradan hesap bağlama
- PDF dışa aktarma
- Sonuç görseli paylaşma
- AdMob native/rewarded/interstitial altyapısı
- Kullanıcı rızası yönetimi
- Analytics ve Crashlytics
- Firebase Remote Config ile reklam ve özellik anahtarları
- Hesap ve veri silme
- Gizlilik politikası ve yasal bilgilendirme ekranları

### 4.2 MVP dışında bırakılacaklar

Aşağıdakiler ilk sürüme dahil edilmemelidir:

- Banka hesabı bağlantısı
- Otomatik web scraping
- Canlı mağaza fiyatları
- Gerçek zamanlı döviz dönüşümü
- Yatırım tavsiyesi
- Vergi danışmanlığı
- Yapay zekâ sohbet ekranı
- Sosyal ağ, yorum veya mesajlaşma
- Marketplace
- Karmaşık ekip/kurumsal hesaplar
- Her ülkenin otomatik vergi mevzuatı
- Kullanıcı adına ödeme veya satın alma işlemi
- Arka planda sürekli konum takibi

---

## 5. Başarı ölçütleri

### 5.1 Ürün metrikleri

- Onboarding tamamlanma oranı
- İlk hesaplama tamamlama oranı
- Hesaplama sihirbazında terk edilen adım
- Kaydedilen proje sayısı
- Karşılaştırma özelliği kullanım oranı
- PDF/görsel paylaşım oranı
- 1, 7 ve 30 günlük geri dönüş
- Reklam gösterim ve ödüllü reklam tamamlama oranı
- Crash-free user oranı
- Bulut yedeklemeyi açan kullanıcı oranı

### 5.2 Teknik kalite hedefleri

- TypeScript strict modunda derleme hatası olmamalı
- ESLint hatası olmamalı
- Hesaplama motorunda yüksek test kapsamı
- Kritik hesaplama fonksiyonları için birim testleri
- Temel kullanıcı yolculuğu için E2E testi
- Boş, yükleniyor, hata ve offline durumları bulunmalı
- Hesaplamalar cihazda deterministik olmalı
- Para hesaplarında kayan nokta hataları önlenmeli
- Android release build başarıyla alınmalı
- Uygulama test reklam kimlikleriyle güvenli şekilde çalışmalı

---

## 6. Marka ve tasarım yönü

### 6.1 Marka hissi

- Profesyonel
- Güvenilir
- Modern
- Sade
- Veriye dayalı
- Korkutmayan finans dili

### 6.2 Görsel fikir

Logo fikri: Üstte görünen küçük bir fiyat etiketi ve altında buzdağının görünmeyen büyük kısmı. Alternatif olarak, fiyat etiketi içinde katmanlı maliyet çizgileri.

### 6.3 Tasarım sistemi

Renkleri doğrudan bileşenlere yazma. Semantik token kullan:

- `background`
- `surface`
- `surfaceElevated`
- `textPrimary`
- `textSecondary`
- `border`
- `accent`
- `success`
- `warning`
- `danger`
- `chartPurchase`
- `chartRecurring`
- `chartUsage`
- `chartFinancing`
- `chartResidual`

Tipografi:

- Başlık
- Alt başlık
- Gövde
- Yardımcı metin
- Sayısal vurgu
- Etiket

Tüm para değerlerinde tabular/monospaced sayı görünümü tercih edilebilir.

### 6.4 UX kuralları

- Bir ekranda tek ana aksiyon
- Form alanlarının neden istendiğini açıklayan kısa yardımcı metin
- Zorunlu alanları minimumda tut
- Varsayılan değerleri kategori şablonundan getir
- Kullanıcı bilinmeyen maliyet kalemini atlayabilsin
- Sonuç ekranı, eksik veri varsa güven seviyesini düşürsün
- Form verisini ekranlar arasında kaybetme
- Geri çıkışta kaydedilmemiş değişiklik uyarısı
- Büyük tutarlarda okunabilir kısaltma yerine tam değer erişilebilir olmalı
- Reklam hiçbir zaman form alanına veya ana CTA’ya yakın olmamalı

---

## 7. Bilgi mimarisi ve navigasyon

Alt sekmeler:

1. **Ana Sayfa**
2. **Hesaplamalar**
3. **Karşılaştır**
4. **Ayarlar**

### 7.1 Ekran listesi

#### Başlangıç

- Splash / app initialization
- Onboarding
- Dil seçimi
- Gizlilik ve veri özeti
- İsteğe bağlı oturum açma

#### Ana sayfa

- Karşılama
- Yeni hesaplama CTA
- Son projeler
- Hazır kategori kartları
- Kısa içgörü
- Native reklam alanı; yalnızca içerik bulunan ekranda

#### Şablon kütüphanesi

- Otomobil
- Motosiklet
- Tekne
- Elektronik
- Abonelik
- Özel
- Arama ve filtre
- Şablon detay önizlemesi

#### Hesaplama sihirbazı

1. Temel bilgiler
2. Satın alma ve başlangıç maliyetleri
3. Finansman
4. Periyodik maliyetler
5. Kullanıma bağlı maliyetler
6. Tahmini satış değeri
7. Senaryo varsayımları
8. Önizleme ve hesapla

#### Sonuç

- Toplam sahip olma maliyeti
- Aylık maliyet
- Kullanım birimi başına maliyet
- Etiket fiyatının toplam içindeki oranı
- Maliyet dağılımı
- En büyük üç maliyet kalemi
- Düşük / temel / yüksek senaryo
- Varsayımlar ve formüller
- Düzenle
- Kaydet
- Karşılaştırmaya ekle
- PDF oluştur
- Görsel paylaş

#### Hesaplamalar

- Kayıtlı projeler
- Taslaklar
- Arama
- Kategori filtresi
- Sıralama
- Arşivleme
- Silme
- Kopyalama

#### Karşılaştırma

- En fazla üç proje seçimi
- Eşit sahiplik süresine normalize etme seçeneği
- Toplam maliyet karşılaştırması
- Aylık maliyet karşılaştırması
- Kullanım başına maliyet karşılaştırması
- En ucuz seçenek
- Hangi varsayımın sonucu değiştirdiği
- Paylaşılabilir karşılaştırma raporu

#### Ayarlar

- Dil
- Tema
- Varsayılan para birimi
- Varsayılan süre birimi
- Yedekleme ve senkronizasyon
- Hesap
- Reklam tercihleri / gizlilik seçenekleri
- Veriyi dışa aktar
- Tüm yerel veriyi sil
- Hesabı ve bulut verisini sil
- Gizlilik politikası
- Kullanım koşulları
- Sürüm bilgisi
- Teşekkürler ve açık kaynak lisansları

---

## 8. Kategori şablonları

Şablonlar kod içinde sabit bir enum olarak tasarlanmamalı. Versiyonlanmış veri olarak tanımlanmalı ve hem uygulama içi seed verisinden hem Remote Config/Firestore üzerinden okunabilmelidir.

### 8.1 Ortak şablon alanları

- Şablon kimliği
- Şablon sürümü
- Başlık
- Açıklama
- İkon
- Kategori
- Varsayılan para birimi
- Varsayılan sahiplik süresi
- Kullanım birimi
- Önerilen maliyet kalemleri
- Alan doğrulama kuralları
- Yardım metinleri
- Sıralama
- Aktif/pasif durumu

### 8.2 Otomobil

Önerilen alanlar:

- Satın alma fiyatı
- Noter/tescil/teslim masrafları
- Aksesuarlar
- Kasko
- Trafik sigortası
- Motorlu taşıtlar vergisi
- Periyodik bakım
- Lastik
- Otopark
- Muayene
- Yıllık kilometre
- Ortalama tüketim
- Yakıt/enerji birim fiyatı
- Finansman
- Tahmini satış değeri

Kullanım birimi: kilometre

### 8.3 Motosiklet

- Satın alma fiyatı
- Tescil ve ekipman
- Kasko/sigorta
- Vergi
- Bakım
- Lastik
- Zincir ve sarf malzemeleri
- Koruyucu ekipman
- Park/garaj
- Yıllık kilometre
- Yakıt tüketimi
- Yakıt fiyatı
- Finansman
- Tahmini satış değeri

Kullanım birimi: kilometre

### 8.4 Tekne

- Satın alma fiyatı
- Devir/tescil
- Motor ve aksesuar
- Marina veya karaya çekme
- Sigorta
- Yıllık bakım
- Antifouling
- Motor bakımı
- Kışlama
- Yakıt
- Yıllık kullanım saati
- Nakliye
- Finansman
- Tahmini satış değeri

Kullanım birimi: motor/kullanım saati

### 8.5 Elektronik cihaz

- Satın alma fiyatı
- Aksesuar
- Garanti paketi
- Sigorta
- Abonelik/yazılım
- Elektrik tüketimi
- Tamir/bakım tahmini
- Kullanım süresi
- Tahmini ikinci el değeri

Kullanım birimi: ay veya kullanım

### 8.6 Abonelik

- Kurulum/başlangıç ücreti
- Aylık ücret
- Yıllık fiyat artışı varsayımı
- Ek kullanıcı
- Ek paketler
- İptal ücreti
- Kullanım sıklığı
- İncelenen dönem

Kullanım birimi: kullanım veya ay

### 8.7 Özel hesaplama

Kullanıcı kendi maliyet kalemlerini ekler:

- Bir defalık
- Aylık
- Üç aylık
- Altı aylık
- Yıllık
- Kullanım başına
- Kilometre başına
- Saat başına
- Yüzdesel
- Finansman
- Değer düşüşü / satış değeri

---

## 9. Hesaplama modeli

### 9.1 Para veri tipi

- Para değerlerini doğrudan JavaScript `number` ile toplama.
- Veritabanında mümkün olduğunca ISO 4217 para kodu ve minor unit tam sayı kullan.
- Hassas hesaplamalarda `decimal.js`, `big.js` veya eşdeğer bir decimal kütüphanesi kullan.
- Gösterimde `Intl.NumberFormat` kullan.
- Kullanıcının yazdığı yerel ondalık ayıracı doğru parse edilmelidir.
- Negatif maliyetler yalnızca gelir/indirim/satış değeri olarak açık biçimde modellenmelidir.

### 9.2 Temel değişkenler

- `purchasePrice`
- `ownershipMonths`
- `initialCosts[]`
- `recurringCosts[]`
- `usageCosts[]`
- `financing`
- `residualValue`
- `currency`
- `usagePerMonth`
- `usageUnit`

### 9.3 Bir defalık maliyet

```text
initialTotal = sum(initialCost.amount)
```

### 9.4 Periyodik maliyet

Her periyodik maliyet aylık eşdeğere çevrilir:

```text
monthlyEquivalent =
  monthlyAmount
  or quarterlyAmount / 3
  or semiAnnualAmount / 6
  or annualAmount / 12

recurringTotal = sum(monthlyEquivalent * ownershipMonths)
```

Maliyet yalnızca belirli bir ayda başlayacak veya bitecekse aktif ay aralığı kullanılmalıdır.

### 9.5 Kullanıma bağlı maliyet

Genel form:

```text
totalUsage = usagePerMonth * ownershipMonths
usageCostTotal = costPerUsageUnit * totalUsage
```

Yakıt/enerji için:

```text
fuelUnits = totalDistance * consumptionPer100Units / 100
fuelCost = fuelUnits * unitPrice
```

Örnek:

```text
totalDistance = monthlyKm * ownershipMonths
liters = totalDistance * litersPer100Km / 100
fuelCost = liters * pricePerLiter
```

### 9.6 Finansman

Satın alma fiyatı zaten toplam sahip olma maliyetine dahil olduğu için kredi anaparası ikinci kez maliyet olarak eklenmemelidir.

```text
principal = financedAmount
monthlyRate = annualInterestRate / 12 / 100
n = termMonths

if monthlyRate == 0:
  monthlyPayment = principal / n
else:
  monthlyPayment =
    principal * monthlyRate * (1 + monthlyRate)^n
    / ((1 + monthlyRate)^n - 1)

totalLoanPayments = monthlyPayment * n
interestCost = totalLoanPayments - principal
financingCost = interestCost + loanFees
```

Toplam sahip olma maliyetine `interestCost + loanFees` eklenir. Peşinat, satın alma fiyatının içinde olduğu için ayrıca eklenmez; yalnızca nakit akışı özetinde gösterilir.

### 9.7 Satış/devir değeri

```text
netResidualValue = max(residualValue - sellingCosts, 0)
```

Toplam maliyetten düşülür.

### 9.8 Toplam sahip olma maliyeti

```text
TCO =
  purchasePrice
  + initialTotal
  + recurringTotal
  + usageCostTotal
  + financingCost
  - netResidualValue
```

### 9.9 Türetilen metrikler

```text
monthlyCost = TCO / ownershipMonths
totalUsage = usagePerMonth * ownershipMonths
costPerUsage = totalUsage > 0 ? TCO / totalUsage : null
purchaseShare = purchasePrice / grossCostsBeforeResidual
hiddenCost = TCO - purchasePrice
hiddenCostRatio = hiddenCost / purchasePrice
```

`grossCostsBeforeResidual`, satış değeri düşülmeden önceki toplamdır. Sonuç metinlerinde hangi bazın kullanıldığı açıkça belirtilmelidir.

### 9.10 Güven seviyesi

Sonuçlar için basit bir veri tamlık puanı hesapla:

- Satın alma fiyatı: zorunlu
- Sahiplik süresi: zorunlu
- Satış değeri: yüksek ağırlık
- En az bir periyodik maliyet: orta ağırlık
- Kullanım tahmini: kategoriye göre yüksek ağırlık
- Finansman bilgisi: finansman seçildiyse zorunlu
- Varsayılan değer kullanımı: güveni bir miktar düşürür

Gösterim:

- Yüksek veri tamlığı
- Orta veri tamlığı
- Düşük veri tamlığı

Bu ifade “sonucun kesinliği” değil, yalnızca girilen verilerin tamlığıdır.

---

## 10. Senaryo motoru

Her proje üç senaryoya sahip olabilir:

- Düşük maliyet
- Temel
- Yüksek maliyet

Senaryolar tam veri kopyaları yerine temel proje üzerindeki override değerlerini saklamalıdır.

Örnek override alanları:

- Yakıt fiyatı
- Yıllık kullanım
- Bakım maliyeti
- Sigorta
- Satış değeri
- Faiz
- Yıllık fiyat artışı

Sonuç ekranında:

- Düşük / temel / yüksek toplam
- Aradaki fark
- Sonucu en fazla etkileyen varsayım
- Hassasiyet özeti

MVP’de karmaşık Monte Carlo simülasyonu yapılmamalıdır.

---

## 11. Karşılaştırma kuralları

- En fazla üç proje
- Para birimleri farklıysa otomatik güncel kur dönüşümü yapılmaz
- Farklı para birimi karşılaştırmasında kullanıcı uyarılır
- Sahiplik süreleri farklıysa:
  - Ham toplamları göster
  - Aylık maliyeti karşılaştır
  - Kullanıcı isterse ortak bir süreye normalize et
- Kullanım birimleri farklıysa “kullanım başına” metriği doğrudan karşılaştırma
- Kazanan yalnızca tek bir metrik üzerinden ilan edilmemeli
- “En düşük toplam maliyet”, “en düşük aylık maliyet” ve “en düşük kullanım maliyeti” ayrı gösterilmeli
- Sonuçta varsayım farkları görünür olmalı

---

## 12. Veri modeli

Aşağıdaki model kavramsaldır. Uygulamada Zod şemaları, TypeScript tipleri ve veritabanı şeması aynı domain kurallarını paylaşmalıdır.

### 12.1 UserProfile

```ts
type UserProfile = {
  id: string;
  authType: 'anonymous' | 'email' | 'google';
  displayName?: string;
  email?: string;
  locale: 'tr' | 'en';
  defaultCurrency: string;
  theme: 'system' | 'light' | 'dark';
  cloudBackupEnabled: boolean;
  analyticsConsent: boolean;
  adsConsentStatus: 'unknown' | 'required' | 'obtained' | 'not_required';
  createdAt: string;
  updatedAt: string;
};
```

### 12.2 CostProject

```ts
type CostProject = {
  id: string;
  ownerId?: string;
  localOwnerId: string;
  title: string;
  category:
    | 'car'
    | 'motorcycle'
    | 'boat'
    | 'electronics'
    | 'subscription'
    | 'custom';
  templateId: string;
  templateVersion: number;
  currency: string;
  purchasePriceMinor: string;
  ownershipMonths: number;
  usagePerMonth?: number;
  usageUnit?: 'km' | 'hour' | 'use' | 'month';
  status: 'draft' | 'complete' | 'archived';
  financing?: FinancingPlan;
  residualValue?: ResidualValue;
  assumptions: AssumptionSet;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus: 'local_only' | 'pending' | 'synced' | 'conflict' | 'failed';
  schemaVersion: number;
};
```

Minor unit değerleri büyük sayılarda güvenli taşınması için string tutulabilir ve decimal katmanında işlenebilir.

### 12.3 CostItem

```ts
type CostItem = {
  id: string;
  projectId: string;
  type: 'initial' | 'recurring' | 'usage';
  key?: string;
  label: string;
  amountMinor?: string;
  frequency?: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  costPerUnitMinor?: string;
  unit?: 'km' | 'hour' | 'use' | 'liter' | 'kwh';
  consumptionPer100Units?: number;
  unitPriceMinor?: string;
  startsAtMonth?: number;
  endsAtMonth?: number;
  isTemplateDefault: boolean;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};
```

### 12.4 FinancingPlan

```ts
type FinancingPlan = {
  enabled: boolean;
  downPaymentMinor: string;
  financedAmountMinor: string;
  annualInterestRate: number;
  termMonths: number;
  loanFeesMinor: string;
};
```

### 12.5 ResidualValue

```ts
type ResidualValue = {
  mode: 'fixed' | 'percentage';
  fixedAmountMinor?: string;
  retainedValuePercent?: number;
  sellingCostsMinor: string;
};
```

### 12.6 AssumptionSet

```ts
type AssumptionSet = {
  base: Record<string, string | number | boolean>;
  lowOverrides: Record<string, string | number | boolean>;
  highOverrides: Record<string, string | number | boolean>;
};
```

### 12.7 CalculationResult

Bu model veritabanında kalıcı saklanmak zorunda değildir. Girdilerden deterministik olarak tekrar üretilebilir.

```ts
type CalculationResult = {
  totalCostMinor: string;
  grossCostMinor: string;
  hiddenCostMinor: string;
  monthlyCostMinor: string;
  costPerUsageMinor?: string;
  purchaseSharePercent: number;
  completenessScore: number;
  breakdown: Array<{
    key: string;
    label: string;
    valueMinor: string;
    percent: number;
  }>;
  topDrivers: Array<{
    key: string;
    label: string;
    valueMinor: string;
    percent: number;
  }>;
  warnings: string[];
};
```

### 12.8 SyncQueueItem

```ts
type SyncQueueItem = {
  id: string;
  entityType: 'project' | 'cost_item' | 'profile';
  entityId: string;
  operation: 'upsert' | 'delete';
  payloadJson: string;
  attemptCount: number;
  nextAttemptAt?: string;
  createdAt: string;
  lastError?: string;
};
```

---

## 13. Yerel veritabanı

### 13.1 Teknoloji

- `expo-sqlite`
- Tercihen Drizzle ORM ve versiyonlanmış migration
- Veritabanı uygulamanın ana veri kaynağıdır
- Firestore bir bulut yedekleme/senkronizasyon katmanıdır
- UI doğrudan Firestore’a bağlı olmamalıdır

### 13.2 Tablolar

- `user_profile`
- `projects`
- `cost_items`
- `scenario_overrides`
- `template_cache`
- `sync_queue`
- `app_settings`
- `analytics_outbox` gerekirse
- `schema_migrations`

### 13.3 Migration kuralları

- Her şema değişikliği migration ile yapılmalı
- Uygulama başlatılırken migration çalışmalı
- Migration başarısız olursa veri silinmemeli
- Kritik migration için yedekleme veya rollback stratejisi bulunmalı
- Seed şablonlar idempotent eklenmeli
- `schemaVersion` alanı domain modellerinde bulunmalı

---

## 14. Offline-first ve senkronizasyon

### 14.1 Temel yaklaşım

1. Kullanıcı bir değişiklik yapar.
2. Değişiklik transaction içinde SQLite’a yazılır.
3. Aynı transaction veya hemen sonrasında sync queue kaydı eklenir.
4. UI yerel veriden anında güncellenir.
5. Ağ bağlantısı ve oturum uygunsa kuyruk Firestore’a gönderilir.
6. Başarılı işlemde queue kaydı silinir ve entity `synced` yapılır.
7. Başarısız işlem exponential backoff ile yeniden denenir.

### 14.2 Çakışma stratejisi

MVP için:

- Son yazan kazanır yaklaşımı
- `updatedAt`, `deviceId` ve `revision` kullan
- Aynı entity iki cihazda değişmişse otomatik seçimden önce mümkünse conflict durumuna al
- Kullanıcıya “Bu kayıt başka cihazda da değiştirildi” ekranı göster
- İki sürümün başlık, tarih ve toplam maliyet farkını göster
- Kullanıcı yerel, bulut veya kopya olarak ikisini saklama seçeneği alabilsin

MVP çok sıkı zamanlıysa ilk sürümde `updatedAt` tabanlı last-write-wins uygulanabilir; fakat mimari ileride conflict UI eklenebilecek biçimde kurulmalıdır.

### 14.3 Soft delete

- Silinen kayıt hemen fiziksel olarak kaldırılmamalı
- `deletedAt` işaretlenmeli
- Silme işlemi buluta senkronize edilmeli
- Belirli süre sonra fiziksel temizleme yapılabilir
- Hesap silmede tüm kullanıcı verisi kalıcı silinmelidir

---

## 15. Firebase mimarisi

### 15.1 Kullanılacak servisler

- Firebase Authentication
- Cloud Firestore
- Firebase Remote Config
- Firebase Analytics
- Firebase Crashlytics
- Firebase App Check
- Cloud Functions; yalnızca gerekli sunucu işlemleri için
- Cloud Storage; MVP’de zorunlu değil
- Firebase Emulator Suite; geliştirme ve güvenlik kuralı testleri için

### 15.2 Kimlik doğrulama

Önerilen akış:

1. İlk açılışta uygulama hesapsız ve local-first çalışır.
2. Bulut yedekleme açıldığında anonim Firebase oturumu oluşturulur.
3. Kullanıcı daha sonra Google veya e-posta ile hesabını bağlayabilir.
4. Hesap bağlama sırasında anonim kullanıcının verileri korunmalıdır.
5. Çıkış yapıldığında yerel verinin ne olacağı açıkça sorulmalıdır.
6. Hesap silme uygulama içinden yapılabilmelidir.

### 15.3 Firestore yapısı

```text
users/{uid}
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/costItems/{costItemId}
users/{uid}/settings/profile
publicTemplates/{templateId}
publicTemplateVersions/{versionId}
```

Alternatif olarak maliyet kalemleri proje dokümanı içinde gömülebilir. Firestore doküman boyutu ve güncelleme sıklığı değerlendirilerek karar verilmelidir. MVP için ayrı alt koleksiyonlar daha esnek olabilir.

### 15.4 Güvenlik kuralları

- Kullanıcı yalnızca kendi `uid` alanına ait verileri okuyup yazabilmeli
- Public templates yalnızca okunabilir olmalı
- İzin verilen alanlar doğrulanmalı
- Sahiplik alanı istemciden değiştirilememeli
- Silinmiş veriye yazma sınırları bulunmalı
- Maksimum alan uzunlukları ve sayı aralıkları kontrol edilmeli
- Kurallar Emulator Suite ile test edilmeli
- Production’da açık test kuralları kullanılmamalı

### 15.5 App Check

- Android için Play Integrity
- Geliştirmede debug provider
- Önce metrikleri izle
- Geçerli kullanıcıların engellenmediği doğrulandıktan sonra enforcement aç
- Cloud Firestore ve callable Cloud Functions korunmalı

### 15.6 Remote Config anahtarları

Örnek:

```text
ads_enabled
native_ads_enabled
interstitial_ads_enabled
rewarded_export_enabled
interstitial_min_completed_calculations
interstitial_cooldown_minutes
max_compare_items
cloud_backup_enabled
template_catalog_version
maintenance_mode
minimum_supported_version
force_update_enabled
```

Kod içinde güvenli varsayılan değerler bulunmalıdır.

### 15.7 Cloud Functions

MVP’de yalnızca gerçekten sunucu gerektiren işlemler:

- Kullanıcı hesabı ve ilişkili verileri silme
- Public template doğrulama/yayınlama
- Gerekirse paylaşım linki üretme
- Gerekirse güvenli entitlement doğrulama
- İleride planlı maliyet şablonu güncelleme

Basit hesaplamalar Cloud Function’a taşınmamalıdır. Hesaplama motoru cihazda çalışmalı ve test edilebilir olmalıdır.

---

## 16. Reklam ve gelir modeli

### 16.1 Kullanılacak formatlar

- Native reklam
- Rewarded reklam
- Çok sınırlı interstitial
- Banner reklam kullanılmaması tercih edilir
- App-open reklam MVP’de kullanılmamalıdır

### 16.2 Yerleşimler

#### Native reklam

- Ana sayfada, gerçek uygulama içeriğinden sonra
- Şablon kütüphanesinde belirgin “Reklam” etiketiyle
- Boş durumda reklam gösterme
- Ayarlar, onboarding, gizlilik veya hesap silme ekranında gösterme

#### Rewarded reklam

Kullanıcı açıkça seçerse:

- Bir adet gelişmiş PDF raporu oluşturma
- Bir karşılaştırma raporunu dışa aktarma
- Premium senaryo görünümünü tek kullanım için açma

Ödül yalnızca uygulama içindeki özellik olmalıdır. Kullanıcı reklam izlemeyi reddederse temel hesaplamaya erişimini kaybetmemelidir.

#### Interstitial

- İlk oturumda gösterme
- Kullanıcı form doldururken gösterme
- Sonuç açılır açılmaz gösterme
- Geri tuşu veya uygulama kapanışında gösterme
- En az birkaç tamamlanmış hesaplamadan sonra
- Doğal geçişte ve sıkı cooldown ile
- Remote Config kill switch ile tamamen kapatılabilir
- Kullanıcıya yanlış tıklama riski yaratmayacak şekilde

Önerilen başlangıç:

```text
interstitial_min_completed_calculations = 4
interstitial_cooldown_minutes = 1440
```

Bu değerler Remote Config üzerinden değiştirilebilir.

### 16.3 Geliştirme güvenliği

- Debug ve preview build’lerde yalnızca test reklam kimlikleri
- Production reklam kimlikleri environment/config üzerinden
- Reklam yüklenmezse uygulama akışı bozulmamalı
- Reklam gösterimi hiçbir zaman hesaplama kaydını engellememeli
- Consent durumu belirlenmeden kişiselleştirilmiş reklam talebi gönderilmemeli
- Avrupa Ekonomik Alanı, Birleşik Krallık ve İsviçre için UMP akışı desteklenmeli
- Kullanıcının gizlilik seçeneklerini yeniden açabileceği ayar bulunmalı

### 16.4 Gelecek premium modeli

MVP sonrası:

- Reklamsız kullanım
- Sınırsız PDF
- Gelişmiş karşılaştırma
- Özel şablonlar
- Sınırsız bulut geçmişi
- Gelişmiş hassasiyet analizi
- Tema ve rapor özelleştirme

Premium entegrasyonu yapılırsa Google Play Billing veya güvenilir entitlement katmanı kullanılmalıdır. Sahte premium kontrolü yalnızca client state ile yapılmamalıdır.

---

## 17. Analytics olayları

Kişisel maliyet tutarlarını analytics’e gönderme. Yalnızca kategorik ve toplulaştırılabilir olaylar kullan.

### 17.1 Temel olaylar

```text
app_opened
onboarding_started
onboarding_completed
template_viewed
calculation_started
calculation_step_viewed
calculation_step_completed
calculation_abandoned
calculation_completed
project_saved
project_duplicated
project_deleted
comparison_started
comparison_completed
pdf_export_started
pdf_export_completed
share_completed
cloud_backup_enabled
sign_in_started
sign_in_completed
sync_failed
ad_native_impression
ad_interstitial_shown
ad_rewarded_started
ad_rewarded_completed
consent_status_updated
account_deletion_started
account_deletion_completed
```

Örnek güvenli parametreler:

- category
- template_id
- step_name
- project_count_bucket
- ownership_month_bucket
- locale
- is_offline
- source_screen

Gönderilmemesi gerekenler:

- Satın alma fiyatı
- Kredi tutarı
- E-posta
- Proje başlığı
- Notlar
- Serbest metin
- Ürün modeli
- Kullanıcı tarafından girilen hassas maliyetler

---

## 18. Hata izleme

- Crashlytics release build’lerde etkin
- Geliştirmede kontrollü
- Kullanıcı kimliği yerine tercihen anonim internal ID
- PII veya maliyet değeri loglama
- Beklenmeyen hesaplama hatalarında:
  - girdilerin kendisini değil şema sürümünü
  - kategori
  - hata kodu
  - uygulama sürümü
  - hesaplama motoru sürümünü logla
- Sync hatalarında doküman içeriğini loglama
- Network ve validation hatalarını ayır

---

## 19. Teknik yığın

### 19.1 Temel

- React Native
- Expo SDK 57 veya proje oluşturulurken desteklenen güncel kararlı Expo SDK
- Expo CLI / `create-expo-app`
- TypeScript strict
- Expo Router
- EAS Development Build
- EAS Build
- EAS Update

Expo Go yalnızca ilk saf bootstrap için kullanılabilir. Native Firebase ve AdMob eklendikten sonra development build kullanılmalıdır.

### 19.2 Önerilen kütüphaneler

- `expo-router`
- `expo-sqlite`
- `drizzle-orm`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `@tanstack/react-query`
- `zustand`
- `decimal.js` veya `big.js`
- `react-native-reanimated`
- `react-native-gesture-handler`
- `react-native-svg`
- `expo-localization`
- `i18next`
- `react-i18next`
- `expo-print`
- `expo-sharing`
- `expo-secure-store`
- `expo-notifications`
- `expo-network`
- `expo-application`
- `expo-device`
- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/firestore`
- `@react-native-firebase/analytics`
- `@react-native-firebase/crashlytics`
- `@react-native-firebase/remote-config`
- `@react-native-firebase/app-check`
- `react-native-google-mobile-ads`

Her paketin sürümünü rastgele sabitleme. Expo paketlerini `npx expo install` ile uyumlu sürümde kur. Diğer paketlerde güncel kararlı sürümü ve peer dependency uyumunu doğrula.

### 19.3 Test ve kalite

- Jest
- React Native Testing Library
- Firebase Emulator Suite
- Firestore rules tests
- Maestro veya Detox; tercihen Maestro ile temel Android E2E
- ESLint
- Prettier
- TypeScript
- GitHub Actions

---

## 20. Mimari

Feature-first ve katmanlı mimari:

```text
app/
  _layout.tsx
  (onboarding)/
  (tabs)/
    _layout.tsx
    index.tsx
    calculations.tsx
    compare.tsx
    settings.tsx
  calculation/
    new.tsx
    [projectId]/
      edit.tsx
      result.tsx
  project/
    [projectId].tsx
  legal/
  auth/

src/
  components/
    ui/
    feedback/
    charts/
  features/
    onboarding/
    templates/
    projects/
    calculator/
    scenarios/
    comparison/
    export/
    auth/
    sync/
    ads/
    analytics/
    settings/
  domain/
    entities/
    value-objects/
    calculations/
    validation/
  data/
    db/
      schema/
      migrations/
      seed/
    repositories/
    firebase/
    sync/
  services/
    analytics/
    ads/
    crash/
    notifications/
    export/
  store/
  hooks/
  i18n/
  theme/
  config/
  utils/
  test/
```

### 20.1 Katman kuralları

- UI, Firebase API’lerini doğrudan çağırmamalı
- UI, SQL sorgusu yazmamalı
- Domain hesaplama motoru React bağımlılığı taşımamalı
- Domain katmanı Firebase veya Expo import etmemeli
- Repository interface’leri domain/application katmanında
- SQLite ve Firestore uygulamaları data katmanında
- Form şemaları domain validasyonuyla uyumlu
- Analytics çağrıları merkezi servis üzerinden
- Reklam görünürlüğü merkezi policy servisi üzerinden
- Environment değişkenleri merkezi config modülünden
- `any` kullanılmamalı
- Dairesel bağımlılık olmamalı
- Barrel export’lar yalnızca sınırları netleştiriyorsa kullanılmalı

---

## 21. Durum yönetimi

- Server/cloud state için TanStack Query
- Yerel kalıcı domain verisi için repository + SQLite
- Kısa ömürlü UI state için Zustand veya component state
- Form state için React Hook Form
- Tema/dil gibi ayarlar için küçük bir settings store
- Aynı veriyi birden fazla state katmanında çoğaltmama
- Query key factory kullan
- Mutasyonlarda optimistic UI yalnızca geri alma davranışı güvenliyse kullan

---

## 22. Form ve doğrulama

### 22.1 Genel kurallar

- Her adım Zod şemasıyla doğrulanmalı
- Kullanıcı adımlar arasında ileri/geri gidebilmeli
- Taslak otomatik kaydedilmeli
- Yerel para girişi normalize edilmeli
- Yüzdeler makul aralıkta sınırlandırılmalı
- Sahiplik süresi 1’den büyük olmalı
- Finansman süresi ve sahiplik süresi farklı olabilir; kullanıcıya açıklanmalı
- Satış değeri negatif olamaz
- Tüketim ve kullanım değerleri negatif olamaz
- Faiz oranı için üst sınır teknik olarak esnek fakat uyarılı olmalı
- Sıfır faiz özel durumda doğru hesaplanmalı
- Kullanıcı yanlışlıkla aynı maliyeti iki kez ekleyebileceği için benzer alan uyarısı gösterilebilir

### 22.2 Autosave

- Debounce ile taslak kaydı
- App background olduğunda flush
- Navigasyon öncesi kritik değişiklikleri kaydet
- Başarısız kayıtta görünür hata
- Kullanıcı girdisi sessizce kaybolmamalı

---

## 23. Sonuç görselleştirmeleri

MVP için:

- Büyük toplam kartı
- Aylık ve kullanım başına metrik kartları
- Yatay breakdown bar
- Donut veya stacked bar
- En büyük maliyet sürücüleri listesi
- Senaryo aralığı
- Basit “etiket fiyatı / gizli maliyet” karşılaştırması

Grafik gereksinimleri:

- Ekran okuyucu için metin alternatifi
- Yalnızca renkle ayrım yapma
- Yüzde ve tutar etiketi
- Çok küçük dilimleri “Diğer” altında grupla
- Para formatı locale-aware
- Animasyon azaltma ayarına saygı göster
- Grafikler hesaplama sonucunun önüne geçmemeli

---

## 24. PDF ve paylaşım

### 24.1 PDF içeriği

- Hidden Cost başlığı
- Proje adı
- Oluşturma tarihi
- Kategori
- Para birimi
- Sahiplik süresi
- Toplam maliyet
- Aylık maliyet
- Kullanım başına maliyet
- Breakdown tablosu
- Varsayımlar
- Finansman özeti
- Senaryo özeti
- Yasal uyarı
- Uygulama sürümü ve calculation engine sürümü

### 24.2 Güvenlik

- PDF’ye kullanıcı e-postasını varsayılan olarak yazma
- Serbest notları kullanıcı seçmedikçe ekleme
- Geçici dosyaları uygun zamanda temizle
- Paylaşım başarısız olursa uygulama çökmemeli
- Ödüllü reklamla PDF açıldıysa entitlement o işlem boyunca korunmalı

---

## 25. Bildirimler

MVP’de bildirimler sınırlı tutulmalı:

- Taslak hesaplamayı tamamlama hatırlatması; opt-in
- Kayıtlı hesabı 3 veya 6 ay sonra güncelleme hatırlatması
- Bulut senkronizasyonu uzun süre başarısızsa uygulama içi uyarı; push şart değil

Kurallar:

- İzin onboarding’in ilk ekranında istenmemeli
- Kullanıcı değer önerisini gördükten sonra izin istenmeli
- Bildirim izni reddedilirse uygulama tam çalışmalı
- Pazarlama push’u MVP’de kullanılmamalı

---

## 26. Güvenlik ve gizlilik

- Firebase config değerleri sır değildir fakat kod yapısı environment bazlı olmalı
- Service account veya server secret hiçbir zaman mobil uygulamaya eklenmemeli
- SecureStore yalnızca token/cihaz kimliği gibi küçük hassas değerler için
- Büyük domain verisi SecureStore’da tutulmamalı
- Firestore rules sahiplik doğrulaması yapmalı
- App Check kullanılmalı
- Debug App Check token production’a taşınmamalı
- Loglarda maliyet tutarı, not veya kullanıcı metni bulunmamalı
- Hesap silme ve veri dışa aktarma bulunmalı
- Gizlilik rızaları versiyonlanmalı
- Analytics ve reklam tercihleri ayarlardan değiştirilebilmeli
- Yasal metinlerin placeholder olduğu açıkça işaretlenmeli ve yayın öncesi gerçek metinle değiştirilmelidir

---

## 27. Erişilebilirlik

- Tüm buton ve inputlarda erişilebilir isim
- Dokunma alanı en az yaklaşık 44x44
- Metin ölçeklendirmede kırılmayan düzen
- Grafikler için metin özeti
- Form hataları ekran okuyucuya duyurulmalı
- Focus sırası mantıklı
- Sadece renk ile durum anlatılmamalı
- Reduced motion desteği
- Koyu temada yeterli kontrast
- Para alanlarında ekran okuyucu için anlaşılır etiket

---

## 28. Performans

- İlk açılışta tüm Firebase servislerini bloklayıcı biçimde başlatma
- Yerel DB migration ve kritik config tamamlandıktan sonra uygulamayı aç
- Remote Config başarısızsa güvenli default’larla devam et
- Büyük listelerde stabil key ve memoization
- Hesaplama motoru pure ve hızlı
- Gereksiz render’ları profille
- PDF üretimini UI thread’i mümkün olduğunca kilitlemeden yap
- Resim kullanılacaksa optimize et
- Firestore senkronizasyonunu batch ve limitlerle yönet
- Reklam yükleme hataları performansı bozmamalı

---

## 29. Hata ve boş durumları

Her ana ekran için:

- Loading
- Empty
- Offline
- Recoverable error
- Fatal initialization error
- Permission denied
- Sync conflict

Örnek boş durumlar:

- “Henüz hesaplama yok”
- “Karşılaştırmak için en az iki proje seç”
- “Bu kategoride şablon bulunamadı”
- “İnternet yok; hesaplamaya devam edebilirsin”
- “Bulut yedekleme bekliyor”

Hata mesajları teknik stack trace içermemeli. Kullanıcı aksiyonu sunmalı.

---

## 30. Test stratejisi

### 30.1 Birim testleri

Hesaplama motoru:

- Sadece satın alma fiyatı
- Bir defalık maliyetler
- Aylık/yıllık dönüşüm
- Kısmi aktif dönem
- Kullanım bazlı maliyet
- Yakıt formülü
- Sıfır faiz
- Normal faiz
- Finansman anaparasının çift sayılmaması
- Satış değerinin düşülmesi
- Satış maliyeti
- Sıfır kullanım
- Çok büyük tutar
- Yerel ondalık parse
- Düşük/temel/yüksek senaryo
- Farklı sahiplik süreleri
- Eksik alan warning’leri
- Completeness score

### 30.2 Repository testleri

- Proje oluşturma
- Güncelleme
- Soft delete
- Taslak kaydetme
- Migration
- Transaction rollback
- Sync queue ekleme
- Tekrarlanan sync işleminin idempotent olması

### 30.3 Firebase kural testleri

- Kullanıcı kendi projesini okuyabilir
- Başka kullanıcı okuyamaz
- Public template okunabilir
- Public template yazılamaz
- Sahiplik alanı değiştirilemez
- Beklenmeyen alan reddedilir
- Geçersiz sayı aralığı reddedilir

### 30.4 UI testleri

- Form validasyon mesajı
- Adım geçişi
- Taslağın korunması
- Sonucun render edilmesi
- Offline etiketi
- Reklam yüklenmese de ekranın çalışması
- Dil değiştirme
- Tema değiştirme

### 30.5 E2E

Temel Android akışı:

1. Uygulamayı aç
2. Onboarding’i tamamla
3. Motosiklet şablonunu seç
4. Temel alanları doldur
5. Hesaplamayı tamamla
6. Sonucu kaydet
7. Hesaplamalar listesinden aç
8. PDF export aksiyonunu başlat
9. Ayarlardan dili değiştir
10. Veriyi silme onay ekranını doğrula

---

## 31. CI/CD

GitHub Actions:

- Install
- Typecheck
- Lint
- Unit tests
- Firestore rules tests; emulator ortamı mümkünse
- Build config validation

Branch kuralları:

- `main`: production
- `develop`: entegrasyon; isteğe bağlı
- feature branch’ler

EAS profilleri:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

Gerçek değerler proje ihtiyaçlarına göre düzenlenmelidir.

---

## 32. Environment ve yapılandırma

Beklenen dosyalar:

```text
.env.example
app.config.ts
eas.json
firebase.json
firestore.rules
firestore.indexes.json
.github/workflows/ci.yml
```

Örnek environment anahtarları:

```text
EXPO_PUBLIC_APP_ENV
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID
EXPO_PUBLIC_ADMOB_IOS_APP_ID
EXPO_PUBLIC_ADMOB_NATIVE_ANDROID_ID
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID_ID
EXPO_PUBLIC_ADMOB_REWARDED_ANDROID_ID
```

Not:

- Debug ortamında production ad unit kullanılmamalı
- `.env` commit edilmemeli
- `.env.example` yalnızca açıklayıcı placeholder içermeli
- Native config gerektiren değerler `app.config.ts` üzerinden config plugin’lere aktarılmalı
- Production secrets EAS environment/secrets üzerinden yönetilmeli

---

## 33. Kod standartları

- TypeScript strict
- `any` yasak; zorunlu durumda açıklama ve daraltma
- Fonksiyonlar küçük ve tek sorumluluklu
- Domain hesaplamaları pure
- Magic number yerine isimlendirilmiş sabit
- Error kodları tipli
- Public API’ler belgelenmiş
- Kullanıcı metinleri doğrudan JSX’e yazılmamalı; i18n key kullan
- Para/locale formatlama merkezi utility
- Date formatlama merkezi utility
- Firebase çağrısı component içinde olmamalı
- SQL sorgusu component içinde olmamalı
- `console.log` production’da kalmamalı
- TODO yalnızca issue numarasıyla
- Dead code ve yorum satırına alınmış kod bırakılmamalı
- Kritik kararlar ADR dosyasında belgelenmeli

---

## 34. Dokumentasyon

Repo içinde şu dosyalar bulunmalı:

```text
README.md
docs/PRODUCT_SPEC.md
docs/ARCHITECTURE.md
docs/CALCULATION_ENGINE.md
docs/FIREBASE_SETUP.md
docs/ADMOB_SETUP.md
docs/PRIVACY_CHECKLIST.md
docs/RELEASE_CHECKLIST.md
docs/ADR/0001-offline-first.md
docs/ADR/0002-money-representation.md
docs/ADR/0003-firebase-sync.md
```

README şunları içermeli:

- Ürün özeti
- Ekran görüntüleri için alan
- Mimari
- Teknoloji listesi
- Kurulum
- Environment
- Firebase emulator
- Development build
- Testler
- Release build
- Bilinen sınırlamalar
- Gizlilik
- Lisans

---

## 35. Aşamalı geliştirme planı

### Faz 0 — Proje planı

- Repo oluştur
- Spec’i oku
- Riskleri çıkar
- Mimari kararları yaz
- Görevleri issue boyutunda böl

### Faz 1 — Bootstrap

- Expo TypeScript projesi
- Expo Router
- ESLint/Prettier
- Strict TypeScript
- Path alias
- Environment config
- EAS development/preview/production profilleri
- CI skeleton

### Faz 2 — Design system ve navigasyon

- Theme tokens
- Light/dark
- UI primitives
- Tab navigation
- Onboarding shell
- i18n
- Loading/empty/error components

### Faz 3 — Domain ve hesaplama motoru

- Zod şemaları
- Money value object
- Cost item model
- Finance formula
- TCO
- Senaryolar
- Completeness score
- Unit tests
- Calculation engine docs

### Faz 4 — SQLite ve repository

- Schema
- Migrations
- Seed templates
- Repository interfaces
- CRUD
- Autosave
- Soft delete
- Tests

### Faz 5 — Ana kullanıcı akışı

- Dashboard
- Template library
- Wizard
- Result screen
- Saved calculations
- Edit/duplicate/delete
- Offline states

### Faz 6 — Comparison ve export

- 2–3 proje karşılaştırma
- Grafikler
- PDF
- Share card
- Export tests

### Faz 7 — Firebase

- Development build config
- Auth
- Firestore
- Local-to-cloud sync
- Remote Config
- Emulator
- Security rules tests
- Account deletion

### Faz 8 — Ads ve consent

- Test ads
- UMP consent
- Native ad
- Rewarded export
- Frequency-capped interstitial
- Remote Config kill switch
- Ads failure fallbacks

### Faz 9 — Observability ve security

- Analytics
- Crashlytics
- App Check
- Privacy settings
- Data export/delete
- Logging redaction

### Faz 10 — Quality

- Accessibility
- Performance
- E2E
- Edge cases
- Localization review
- Release checklist

### Faz 11 — Google Play release

- Production app ID
- Signing
- Data Safety
- Privacy policy URL
- Store listing
- Screenshots
- Internal test
- Closed/open test gereksinimleri
- Production release

---

## 36. Definition of Done

Bir özellik tamamlandı sayılmaz, eğer:

- Yalnızca mutlu senaryo çalışıyorsa
- Loading/empty/error/offline durumu yoksa
- TypeScript veya lint hatası varsa
- Kullanıcı metni çevrilebilir değilse
- Testi yoksa veya test edilebilir değilse
- Analytics olayı gerekiyorsa fakat eklenmemişse
- Erişilebilirlik etiketi gerekiyorsa fakat yoksa
- Hata PII veya maliyet değeri logluyorsa
- Reklam başarısız olduğunda akış bozuluyorsa
- Firebase kuralı test edilmemişse
- README veya ilgili doküman güncellenmemişse

---

## 37. MVP kabul kriterleri

1. Kullanıcı internetsizken motosiklet şablonuyla hesaplama oluşturabilir.
2. Uygulama kapanıp açıldığında taslak ve kayıtlar korunur.
3. TCO, aylık maliyet ve kilometre başına maliyet doğru hesaplanır.
4. Finansman anaparası iki kez sayılmaz.
5. Sonuç breakdown ve varsayımlar kullanıcıya gösterilir.
6. Kullanıcı iki projeyi karşılaştırabilir.
7. Kullanıcı sonucu PDF olarak üretebilir ve paylaşabilir.
8. Kullanıcı bulut yedeklemeyi açabilir.
9. Firestore kuralları başka kullanıcının verisini engeller.
10. Ağ kesildiğinde hesaplama devam eder ve sync bekler.
11. Reklam yüklenmese dahi temel özellikler eksiksiz çalışır.
12. Rewarded reklam yalnızca kullanıcı isteğiyle açılır.
13. Interstitial hesaplama sırasında gösterilmez.
14. Kullanıcı gizlilik seçeneklerini yeniden açabilir.
15. Kullanıcı hesabını ve bulut verisini silebilir.
16. Türkçe ve İngilizce metinler bulunur.
17. Light/dark tema çalışır.
18. Android production build alınabilir.
19. Unit, repository ve temel E2E testleri geçer.
20. Crashlytics ve Analytics hassas maliyet verisi toplamaz.

---

## 38. Sürüm yol haritası

### v1.0

- MVP özellikleri
- 6 şablon
- Offline-first
- Firebase backup
- Ads
- PDF ve compare

### v1.1

- Gerçekleşen maliyet takibi
- Hesaplanan ve gerçek maliyet karşılaştırması
- Widget
- Daha fazla şablon
- Gelişmiş export

### v1.2

- Premium
- Custom template builder
- Gelişmiş hassasiyet analizi
- Çoklu cihaz conflict UI

### v2.0

- Topluluk tarafından paylaşılan anonim maliyet aralıkları
- Ülke bazlı doğrulanmış public template verileri
- İşletme/uzman şablonları
- Web companion

---

## 39. Yasal uyarı metni taslağı

> Hidden Cost tarafından sunulan sonuçlar, kullanıcı tarafından girilen bilgiler ve varsayımlar üzerinden oluşturulan tahminlerdir. Finansal, hukuki, vergisel veya yatırım tavsiyesi değildir. Gerçek maliyetler piyasa koşullarına, kullanım biçimine, ülkeye ve kişisel koşullara göre değişebilir. Önemli satın alma kararlarında güncel fiyatları ve profesyonel kaynakları ayrıca doğrulayın.

Bu metin yayın öncesinde hukuki incelemeden geçirilmelidir.

---

## 40. Teknik referanslar

- Expo Documentation: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo Development Builds: https://docs.expo.dev/develop/development-builds/introduction/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- Expo Print: https://docs.expo.dev/versions/latest/sdk/print/
- Expo Sharing: https://docs.expo.dev/versions/latest/sdk/sharing/
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Authentication: https://firebase.google.com/docs/auth
- Firestore Security: https://firebase.google.com/docs/firestore/security/overview
- Firebase App Check: https://firebase.google.com/docs/app-check
- React Native Firebase: https://rnfirebase.io/
- React Native Google Mobile Ads: https://docs.page/invertase/react-native-google-mobile-ads
- Google AdMob Interstitial Guidance: https://support.google.com/admob/answer/6066980
- Google AdMob Privacy & Messaging: https://support.google.com/admob/answer/10107561
