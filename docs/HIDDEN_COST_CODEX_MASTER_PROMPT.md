# Hidden Cost — Codex Master Prompt

Bu dosyayı Codex/ChatGPT’ye, `docs/PRODUCT_SPEC.md` ile birlikte ver. En iyi sonuç için projeyi tek mesajda tamamen yazdırmak yerine aşağıdaki ana promptu bir kez ver ve ardından faz promptlarını sırayla kullan.

---

## 1. Ana prompt

```text
Sen bu projede principal seviyesinde bir React Native/Expo geliştiricisi, mobil mimar, ürün mühendisi ve kalite sorumlusu olarak çalışacaksın.

Proje adı: Hidden Cost

Amaç:
Kullanıcının satın almayı düşündüğü bir ürünün etiket fiyatı yerine; başlangıç, finansman, periyodik, kullanıma bağlı maliyetler ve tahmini satış değeri dahil gerçek toplam sahip olma maliyetini hesaplayan profesyonel bir mobil uygulama geliştir.

Platform ve temel teknoloji:
- React Native
- Expo CLI; bare React Native CLI kullanma
- TypeScript strict
- Expo Router
- Android öncelikli, iOS uyumlu
- EAS Development Build
- Firebase
- Offline-first SQLite
- AdMob

Ürünün tam gereksinimleri `docs/PRODUCT_SPEC.md` dosyasındadır. Herhangi bir kod yazmadan önce bu dosyanın tamamını oku. Bu dosya ürün kapsamı ve kabul kriterleri için tek doğruluk kaynağıdır.

Çalışma biçimin:
1. Önce mevcut repoyu incele.
2. `docs/PRODUCT_SPEC.md` ile repo arasındaki farkları tespit et.
3. Uygulamaya başlamadan önce kısa fakat somut bir uygulama planı çıkar.
4. Çalışmayı fazlara ve küçük doğrulanabilir görevlere böl.
5. İçinde bulunduğun fazın kodunu tamamla.
6. Her anlamlı değişiklikten sonra typecheck, lint ve ilgili testleri çalıştır.
7. Hata varsa kök nedenini çöz; testleri atlama, disable etme veya sahte geçiş üretme.
8. Değişiklik sonunda:
   - oluşturulan/değiştirilen dosyaları,
   - mimari kararları,
   - çalıştırılan komutları,
   - test sonuçlarını,
   - kalan riskleri,
   - bir sonraki önerilen görevi özetle.
9. Eksik Firebase veya AdMob credential nedeniyle kodlama durmamalı. `.env.example`, config katmanı, test değerleri ve açık kurulum dokümanı oluştur. Gerçek secret uydurma.
10. Yalnızca gerçekten kullanıcıdan alınması gereken credential veya mağaza kimliği eksikse bunu açıkça listele. Bunun dışındaki küçük kararları kendin ver.
11. Mevcut çalışan kodu sebepsiz yeniden yazma.
12. Büyük çaplı refactor yapmadan önce etkisini açıkla.
13. Bir faz tamamlanmadan sonraki faza dağılma.
14. Bir dosyada TODO bırakıyorsan issue/task kimliği ve gerekçesi olmalı. Tamamlandı dediğin özellikte TODO, mock veya placeholder kalmamalı.
15. Kullanıcı özel olarak istemedikçe git geçmişini silme, force push yapma veya destructive komut çalıştırma.

Zorunlu mimari ilkeler:
- Feature-first klasörleme kullan.
- Domain hesaplama motoru React, Expo, Firebase ve UI bağımlılığı taşımamalı.
- Hesaplama fonksiyonları pure ve deterministik olmalı.
- UI doğrudan Firestore, Analytics, AdMob veya SQLite çağırmamalı.
- Repository interface ve adapter yaklaşımı kullan.
- SQLite ana yerel veri kaynağı, Firestore senkronizasyon/yedekleme katmanı olsun.
- Yerel kayıt başarılı olmadan UI işlemi başarılı sayılmasın.
- Senkronizasyon kuyruk tabanlı ve idempotent olsun.
- Para değerlerini floating point ile doğrudan toplama. Minor unit + decimal yaklaşımı kullan.
- Satın alma fiyatını ve kredi anaparasını iki kez toplama.
- Zod şemalarını form, domain ve sınır doğrulamalarında kullan.
- TypeScript `any` kullanma.
- Production loglarında PII, serbest metin veya maliyet tutarı bulunmasın.
- Tüm kullanıcı metinleri i18n anahtarlarından gelsin.
- Light/dark tema token tabanlı olsun.
- Accessibility label ve hata duyurularını unutma.
- Her ana ekranın loading, empty, error ve offline durumunu tasarla.
- Reklam yüklenmezse temel uygulama akışı kesinlikle bozulmasın.
- Debug/preview build’de yalnızca test reklam kimlikleri kullan.
- Interstitial reklamı hesaplama sihirbazında, ilk oturumda, geri tuşunda veya sonuç açılır açılmaz gösterme.
- Rewarded reklam yalnızca kullanıcının açık aksiyonu ile gösterilsin.
- Reklam frekansı Remote Config ile kontrol edilsin.
- UMP consent ve gizlilik seçeneklerini yeniden açma akışı ekle.
- Firebase Security Rules ve App Check’i gerçek güvenlik katmanı olarak ele al.
- Secret veya service account değerlerini client bundle’a koyma.
- Expo paketlerini `npx expo install` ile uyumlu sürümde kur.
- Native Firebase ve AdMob nedeniyle Expo Go’ya güvenme; development build kullan.
- `ios/` ve `android/` klasörlerini elle düzenlemek yerine mümkün olduğunca config plugin ve `app.config.ts` kullan. Zorunlu native değişiklik varsa nedenini belgeleyerek yap.

Tercih edilen teknik yığın:
- Expo Router
- expo-sqlite
- Drizzle ORM ve migration
- React Hook Form
- Zod
- TanStack Query
- Zustand; yalnızca kısa ömürlü UI state için
- decimal.js veya eşdeğeri
- Reanimated
- Gesture Handler
- react-native-svg
- expo-localization + i18next
- expo-print + expo-sharing
- expo-secure-store
- expo-notifications
- React Native Firebase:
  - app
  - auth
  - firestore
  - analytics
  - crashlytics
  - remote-config
  - app-check
- react-native-google-mobile-ads
- Jest
- React Native Testing Library
- Firebase Emulator Suite
- Maestro; temel Android E2E
- ESLint + Prettier
- GitHub Actions

Kod kalitesi:
- Küçük, isimlendirilmiş ve test edilebilir fonksiyonlar yaz.
- Gereksiz generic abstraction oluşturma.
- Tek kullanımlık kod için karmaşık framework üretme.
- Domain kurallarını ekrana dağıtma.
- Magic number kullanma.
- Tarih, para ve locale işlemlerini merkezi utility/value object üzerinden yap.
- Async hataları tipli error modeline dönüştür.
- Kullanıcıya teknik hata metni gösterme.
- Error boundary ve uygulama başlatma hata ekranı oluştur.
- Büyük dosyaları uygun sorumluluklara böl.
- Public function ve kritik algoritmalarda kısa açıklayıcı JSDoc kullan.
- Yorumlar kodun ne yaptığını tekrar etmesin; nedenini anlatsın.

Test zorunlulukları:
- Hesaplama motoruna kapsamlı unit test yaz.
- Sıfır faiz ve normal faiz senaryolarını test et.
- Finansman anaparasının çift sayılmadığını test et.
- Aylık/yıllık maliyet dönüşümlerini test et.
- Kullanım bazlı ve yakıt maliyetini test et.
- Satış değerini test et.
- Büyük tutar ve yerel sayı formatını test et.
- Repository transaction, migration, soft delete ve sync queue testlerini yaz.
- Firestore kurallarını emulator ile test et.
- Form doğrulama ve taslak koruma UI testlerini yaz.
- En az bir temel Android Maestro akışı ekle.
- Test başarısızsa testi silme veya anlamsızlaştırma.

Dokümantasyon:
Aşağıdaki dosyaları oluştur ve kodla birlikte güncel tut:
- README.md
- docs/ARCHITECTURE.md
- docs/CALCULATION_ENGINE.md
- docs/FIREBASE_SETUP.md
- docs/ADMOB_SETUP.md
- docs/PRIVACY_CHECKLIST.md
- docs/RELEASE_CHECKLIST.md
- docs/ADR/0001-offline-first.md
- docs/ADR/0002-money-representation.md
- docs/ADR/0003-firebase-sync.md

Önemli ürün kararları:
- MVP kategorileri: otomobil, motosiklet, tekne, elektronik cihaz, abonelik ve özel.
- Hesaplama akışı adım adım wizard olmalı.
- Kullanıcı internetsiz hesaplama yapabilmeli.
- Sonuç ekranında toplam, aylık, kullanım başına maliyet, breakdown, en büyük maliyet sürücüleri ve varsayımlar bulunmalı.
- Düşük, temel ve yüksek senaryo bulunmalı.
- En fazla üç proje karşılaştırılmalı.
- PDF ve görsel paylaşım bulunmalı.
- Para birimleri farklıysa otomatik kur tahmini yapma.
- Kullanıcı verileri varsayılan olarak cihazda saklanmalı.
- Bulut yedekleme açık ve isteğe bağlı olmalı.
- Analytics’e gerçek maliyet tutarı, proje adı veya serbest metin gönderme.
- Hesap ve veri silme akışı bulunmalı.
- Uygulama finansal tavsiye vermediğini açıkça belirtmeli.

Çalışmaya başlamadan önce şu çıktıyı üret:
A. Repo durum özeti
B. Kullanacağın nihai paketler ve nedenleri
C. Klasör mimarisi
D. Fazlara ayrılmış görev listesi
E. İlk fazda değiştireceğin dosyalar
F. Riskler ve çözüm yaklaşımı

Bu ilk değerlendirmeden sonra yalnızca Faz 1’i uygula. Faz 1 tamamlandığında dur ve sonuç raporu ver. Sonraki faza kullanıcı yeni prompt verdiğinde geç.
```

---

## 2. Faz promptları

Her fazın başında Codex’e ilgili promptu ver. Codex önceki fazın kodunu ve `docs/PRODUCT_SPEC.md` dosyasını yeniden kontrol etmelidir.

### Faz 1 — Bootstrap

```text
Hidden Cost projesinde Faz 1’i uygula.

Hedef:
Üretim kalitesinde Expo/TypeScript proje iskeletini hazırla; henüz domain özelliklerine girme.

Yapılacaklar:
- Mevcut repo yoksa güncel kararlı `create-expo-app` ile TypeScript ve Expo Router projesi oluştur.
- Expo CLI kullan; bare RN CLI projesi oluşturma.
- TypeScript strict ayarlarını etkinleştir.
- ESLint, Prettier ve import düzenini yapılandır.
- Path alias ekle.
- `app.config.ts` oluştur.
- `EXPO_PUBLIC_APP_ENV` tabanlı dev/preview/production config yapısı kur.
- `.env.example` oluştur; gerçek secret ekleme.
- EAS development, preview ve production profillerini ekle.
- Basit GitHub Actions CI oluştur: install, typecheck, lint, test.
- Feature-first klasör iskeletini oluştur.
- Uygulama initialization state yapısını kur.
- Global error boundary ve güvenli fallback ekranı ekle.
- README’ye kurulum, development build ve environment adımlarını yaz.
- `docs/ARCHITECTURE.md` başlangıç belgesini oluştur.
- Native dependency henüz eklenmemişse Expo Go ile bootstrap çalışabilir; ancak development build geçişini dokümante et.
- Faz sonunda typecheck, lint ve başlangıç testini çalıştır.

Bu fazda yapma:
- Firebase bağlantısı
- AdMob
- Hesaplama motoru
- Tam UI ekranları
- SQLite domain şeması

Çıktı:
- Dosya değişiklik özeti
- Çalıştırılan komutlar
- Test/lint/typecheck sonucu
- Kararlar
- Kalan riskler
- Faz 2’ye hazır olup olmadığı
```

### Faz 2 — Design system, navigasyon ve i18n

```text
Hidden Cost projesinde Faz 2’yi uygula.

Önce:
- `docs/PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- mevcut kod
dosyalarını incele.

Hedef:
Uygulamanın görsel ve navigasyon temelini üretim kalitesinde oluştur.

Yapılacaklar:
- Semantik theme token sistemi kur.
- Light, dark ve system tema seçeneklerini ekle.
- Reusable UI primitives oluştur:
  Button, IconButton, TextField, MoneyInput, NumberInput, SelectField,
  Card, MetricCard, Chip, Divider, EmptyState, ErrorState, OfflineBanner,
  LoadingSkeleton, ConfirmDialog, StepIndicator.
- Tasarım bileşenlerinde hardcoded ekran metni kullanma.
- Expo Router ile onboarding ve tab navigasyon shell’ini kur.
- Tablar: Ana Sayfa, Hesaplamalar, Karşılaştır, Ayarlar.
- Türkçe ve İngilizce i18n altyapısını kur.
- Locale-aware sayı ve para formatlama utility’si ekle.
- Reduced motion tercihini destekle.
- Erişilebilirlik label ve focus kurallarını uygula.
- Responsive küçük telefon düzenini kontrol et.
- Onboarding ekranlarını gerçek metinlerle oluştur.
- Ana sayfa için data-independent skeleton ekran oluştur.
- Ayarlar ekranında dil ve tema değişimini çalıştır.
- UI primitive’leri için temel testler ekle.
- Storybook ekleme; bu fazı gereksiz büyütme.
- Dokümantasyonu güncelle.

Kabul:
- Dil anında değişir.
- Tema kalıcıdır.
- Navigation çalışır.
- Büyük fontta temel ekranlar taşmaz.
- Typecheck/lint/test geçer.
```

### Faz 3 — Domain ve hesaplama motoru

```text
Hidden Cost projesinde Faz 3’ü uygula.

Hedef:
UI ve Firebase’den tamamen bağımsız, güvenilir ve kapsamlı test edilmiş hesaplama domain’i oluştur.

Zorunlu:
- `docs/PRODUCT_SPEC.md` içindeki 8, 9, 10, 11 ve 12. bölümleri birebir dikkate al.
- Para için minor unit + decimal yaklaşımı kullan.
- `Money` value object oluştur.
- Currency ISO kodunu taşı.
- Yerel string parse ile domain hesaplamasını ayır.
- CostProject, CostItem, FinancingPlan, ResidualValue, Scenario ve CalculationResult tiplerini oluştur.
- Zod şemalarını yaz.
- Bir defalık maliyet hesapla.
- Periyodik maliyetleri aylık eşdeğere çevir.
- Başlangıç/bitiş ayı olan periyodik maliyeti destekle.
- Kullanım başına maliyeti hesapla.
- Yakıt/enerji tüketim formülünü destekle.
- Sıfır faiz ve amortismanlı kredi formülünü uygula.
- Kredi anaparasını TCO’ya ikinci kez ekleme.
- Satış değeri ve satış maliyetini uygula.
- TCO, aylık maliyet, kullanım başına maliyet, gizli maliyet ve breakdown üret.
- Düşük/temel/yüksek override senaryosunu uygula.
- Completeness score ve warning üret.
- Calculation engine version sabiti ekle.
- Pure function kullan; React/Firebase/Expo import etme.
- Kapsamlı unit test yaz.
- `docs/CALCULATION_ENGINE.md` oluştur; formülleri ve örnekleri açıkla.
- Golden test fixture’ları ekle.

Özellikle test et:
- Yalnız satın alma fiyatı
- 0 faiz
- Normal faiz
- Anaparanın çift sayılmaması
- Aylık/yıllık/üç aylık dönüşüm
- Kısmi aktif ay
- Yakıt
- Sıfır kullanım
- Satış değeri
- Büyük tutar
- TR ve EN giriş parse
- Senaryo override
- Eksik veri warning
- Rounding

Faz sonunda tüm testleri çalıştır ve örnek bir motosiklet hesabının girdileriyle beklenen çıktıyı raporla.
```

### Faz 4 — SQLite, migration ve repository

```text
Hidden Cost projesinde Faz 4’ü uygula.

Hedef:
Offline-first yerel veri katmanını kur.

Yapılacaklar:
- expo-sqlite kur.
- Uyumluysa Drizzle ORM kullan.
- Versiyonlanmış migration altyapısı oluştur.
- Tablolar:
  user_profile, projects, cost_items, scenario_overrides,
  template_cache, sync_queue, app_settings, schema_migrations.
- Repository interface’leri tanımla.
- SQLite adapter’larını yaz.
- CRUD, draft autosave, duplicate, archive ve soft delete ekle.
- Transaction kullan.
- Seed template sistemini oluştur.
- 6 MVP kategori şablonunu veri olarak ekle.
- Seed idempotent olsun.
- Query key factory ve TanStack Query hook’larını ekle.
- UI’ın SQL detayını görmemesini sağla.
- Sync queue kayıtlarını entity işlemleriyle tutarlı üret.
- Migration/repository testleri yaz.
- Uygulama başlangıcında migration failure için güvenli hata ekranı oluştur.
- DB reset yalnızca development araçlarında ve açık aksiyonla olsun.
- Dokümantasyonu güncelle.

Kabul:
- Uçak modunda proje oluşturulabilir.
- Uygulama yeniden açılınca kayıt korunur.
- Autosave veri kaybetmez.
- Soft delete çalışır.
- Migration testleri geçer.
```

### Faz 5 — Ana kullanıcı akışı

```text
Hidden Cost projesinde Faz 5’i uygula.

Hedef:
Kullanıcının başlangıçtan sonuç ekranına kadar gerçek bir hesaplamayı tamamlamasını sağla.

Yapılacaklar:
- Dashboard
- Template library
- Template detail
- Calculation wizard
- Draft autosave
- Result screen
- Saved calculations list
- Project detail
- Edit, duplicate, archive, delete
- Loading, empty, error ve offline durumları
- Formlarda React Hook Form + Zod
- MoneyInput yerel sayı formatı
- Step validation
- Geri dönüşte veri korunması
- Kaydedilmemiş değişiklik uyarısı
- Result breakdown
- Top drivers
- Completeness indicator
- Assumptions/formulas expandable bölüm
- Şimdilik reklam yerleşimi için yalnızca güvenli placeholder container; gerçek reklam ekleme
- Ekran ve form testleri
- Türkçe ve İngilizce metinler

Kabul senaryosu:
Motosiklet şablonu seç, fiyat/finansman/yakıt/bakım/satış değeri gir, sonucu hesapla, kaydet, listeden aç ve düzenle.

Faz sonunda bu akışı manuel test adımlarıyla raporla.
```

### Faz 6 — Senaryolar, karşılaştırma ve export

```text
Hidden Cost projesinde Faz 6’yı uygula.

Hedef:
Karar destek değerini artıran senaryo, karşılaştırma ve paylaşım özelliklerini tamamla.

Yapılacaklar:
- Düşük/temel/yüksek senaryo editörü
- Senaryo sonuç aralığı
- En etkili varsayım özeti
- En fazla üç proje karşılaştırma
- Farklı süreler için aylık normalize görünüm
- Farklı currency için uyarı; otomatik kur dönüşümü yapma
- Farklı usage unit için doğru kısıt
- Accessible breakdown grafikleri
- PDF raporu
- Shareable result card
- expo-print ve expo-sharing
- Geçici dosya temizliği
- Export failure fallback
- PDF’de yasal uyarı ve calculation engine version
- Unit/UI testleri
- Docs güncellemesi

Bu fazda gerçek reklam entegrasyonu yapma; rewarded export için interface/policy boundary hazırla.
```

### Faz 7 — Firebase ve senkronizasyon

```text
Hidden Cost projesinde Faz 7’yi uygula.

Hedef:
Local-first davranışı bozmadan Firebase auth, backup ve sync ekle.

Yapılacaklar:
- React Native Firebase’i Expo development build ile yapılandır.
- app, auth, firestore ve remote-config modüllerini kur.
- `app.config.ts` ve config plugin ayarlarını kullan.
- Android google-services yapılandırmasını dokümante et.
- Gerçek credential uydurma.
- Anonymous auth ekle.
- Bulut yedekleme opt-in akışı ekle.
- Hesap bağlama için mimari ve en az bir gerçek provider akışı ekle; mümkünse Google.
- SQLite -> sync queue -> Firestore worker oluştur.
- Retry ve exponential backoff.
- Idempotent upsert/delete.
- App foreground ve network geri geldiğinde sync.
- Sync status UI.
- Soft delete senkronizasyonu.
- Last-write-wins/revision yaklaşımını uygula ve conflict’e açık model bırak.
- Remote Config default’larını ekle.
- Firebase Emulator Suite config.
- Firestore rules ve rules testleri.
- `docs/FIREBASE_SETUP.md` oluştur.
- Account/cloud data deletion callable function veya güvenli backend akışı ekle.
- Local-only kullanım credential olmadan çalışmaya devam etsin.

Kabul:
- Offline proje oluşturulur.
- Online olunca sync olur.
- İkinci kullanıcı aynı veriye erişemez.
- Firebase kapalı/hatalıysa local hesaplama çalışır.
```

### Faz 8 — AdMob ve consent

```text
Hidden Cost projesinde Faz 8’i uygula.

Hedef:
Kullanıcı deneyimini bozmayan, policy-aware reklam altyapısı ekle.

Yapılacaklar:
- react-native-google-mobile-ads kur.
- Expo config plugin ve development build yapılandır.
- Debug/preview için yalnızca test IDs.
- Production IDs environment üzerinden.
- UMP consent flow.
- Ayarlarda privacy options/consent formunu yeniden açma.
- AdsPolicyService oluştur.
- Remote Config:
  ads_enabled,
  native_ads_enabled,
  interstitial_ads_enabled,
  rewarded_export_enabled,
  interstitial_min_completed_calculations,
  interstitial_cooldown_minutes.
- Native ad yalnızca içerikli dashboard/template alanında.
- Rewarded ad kullanıcı PDF/gelişmiş export seçtiğinde açık opt-in ile.
- Interstitial ilk oturumda ve wizard’da kesinlikle yok.
- Interstitial başlangıç eşiği ve cooldown uygula.
- Reklam yüklenmezse özelliklerin güvenli fallback’i olsun.
- Consent olmadan yanlış reklam isteği gönderme.
- Ad event analytics ekle; maliyet verisi gönderme.
- Testler ve mockable ad adapter.
- `docs/ADMOB_SETUP.md` ve policy checklist oluştur.

Kabul:
- Test build live ad istemez.
- Reklam kapalı Remote Config ile tamamen devre dışı kalır.
- Rewarded reddedilince uygulama çökmez.
- Interstitial hesaplamayı bölmez.
- Temel hesaplama reklama bağımlı değildir.
```

### Faz 9 — Analytics, Crashlytics, App Check ve privacy

```text
Hidden Cost projesinde Faz 9’u uygula.

Hedef:
Observability, abuse protection ve privacy kontrollerini üretim seviyesine getir.

Yapılacaklar:
- Firebase Analytics merkezi adapter.
- `docs/PRODUCT_SPEC.md` analytics event listesini uygula.
- Maliyet tutarı, title, note, e-mail veya serbest metin gönderilmediğini test et.
- Crashlytics adapter ve release davranışı.
- Log redaction.
- Typed error codes.
- App Check:
  Android Play Integrity,
  development debug provider,
  enforcement açmadan önce güvenli dokümantasyon.
- Analytics consent ayarı.
- Ads privacy options.
- Local data export.
- Local data delete.
- Account + cloud data delete.
- Legal screens.
- Privacy checklist.
- Crash/test eventlerini yalnız development menüsünde tut.
- `docs/PRIVACY_CHECKLIST.md` güncelle.

Kabul:
- Kullanıcı analytics tercihini değiştirebilir.
- Hesap silme çalışır.
- Hassas değer telemetry’ye gitmez.
- App Check development ve production config’i ayrıdır.
```

### Faz 10 — Quality pass

```text
Hidden Cost projesinde Faz 10’u uygula.

Hedef:
Release öncesi erişilebilirlik, performans ve test kalitesini tamamla.

Yapılacaklar:
- Tüm ekranları büyük font ile kontrol et.
- Screen reader label’ları.
- Focus ve form error announcements.
- Reduced motion.
- Color-independent chart labels.
- Render profiling.
- Liste performansı.
- App startup profiling.
- Sync ve ad failure chaos testleri.
- Unit/integration/UI testlerini tamamla.
- Android Maestro temel E2E.
- Firebase rules testleri.
- CI’ı tamamen yeşil yap.
- Dead code, TODO, console ve unused dependency temizliği.
- README ve architecture docs güncelle.
- Bilinen sınırlamaları dürüstçe yaz.

Kabul:
- Typecheck, lint ve tüm otomatik testler geçer.
- Release build açılır.
- Offline ana akış çalışır.
- E2E temel yolculuk geçer.
```

### Faz 11 — Google Play release hazırlığı

```text
Hidden Cost projesinde Faz 11’i uygula.

Hedef:
Android internal testing için release hazırlığını tamamla.

Yapılacaklar:
- app identifier ve versioning kontrolü
- EAS production profile
- Android App Bundle
- Signing ve credential dokümantasyonu
- Production Firebase project kontrol listesi
- Production AdMob app/ad unit kontrol listesi
- Test device ayarlarının temizlenmesi
- App Check rollout planı
- Remote Config güvenli default’ları
- Privacy policy URL placeholder kontrolü
- Account deletion URL/flow
- Data Safety için veri envanteri
- Store listing taslağı:
  short description,
  full description,
  feature bullets,
  screenshot plan,
  release notes
- Internal testing smoke test listesi
- Crashlytics/Analytics doğrulama
- `docs/RELEASE_CHECKLIST.md`
- Production build komutları
- Rollback planı
- EAS Update uygunluk notu

Gerçek mağaza yayını veya credential değişikliği kullanıcı onayı olmadan yapma. Hazırlık ve doğrulamayı tamamla, eksik kullanıcı girdilerini açık bir checklist olarak ver.
```

---

## 3. Hata düzeltme promptu

Codex bir faz sonunda sorun bıraktığında:

```text
Hidden Cost reposunda yeni özellik ekleme. Önce mevcut başarısızlıkları düzelt.

Şunları çalıştır ve sonuçlarını incele:
- typecheck
- lint
- unit tests
- ilgili integration/rules tests
- mümkünse Android development/release build doğrulaması

Kurallar:
- Testi silme, skip etme veya assertion’ı anlamsızlaştırma.
- Type safety’yi `any`, `as unknown as` veya geniş ts-ignore ile aşma.
- Çalışan özelliği mock ile değiştirme.
- Firebase/AdMob credential eksikse test adapter/config fallback oluştur; gerçek secret uydurma.
- Kök nedeni bul.
- Minimum ve temiz düzeltmeyi yap.
- Regression testi ekle.
- Sonunda neden bozulduğunu, nasıl düzeldiğini ve hangi komutların geçtiğini raporla.
```

---

## 4. Kod inceleme promptu

```text
Hidden Cost reposunu senior production review standardıyla incele. Yeni özellik yazmadan önce bulguları önem sırasına göre listele.

Özellikle ara:
- Yanlış TCO veya finansman formülü
- Floating point para hataları
- Kredi anaparasının çift sayılması
- UI içinde domain logic
- UI içinde doğrudan Firebase/SQLite/AdMob çağrısı
- Offline veri kaybı
- Sync race condition
- Idempotency problemi
- Firestore rules açığı
- PII veya maliyet tutarının Analytics/Crashlytics’e gitmesi
- Live ad ID’nin debug build’de kullanılması
- Consent ve privacy options eksikliği
- Interstitial’ın uygunsuz yerde gösterilmesi
- Account deletion eksikliği
- Migration riski
- Accessibility eksikliği
- Memory leak ve gereksiz render
- Eksik error/loading/empty/offline state
- Testlerde sahte güven

Her bulguda:
- önem derecesi,
- dosya ve satır,
- neden problem olduğu,
- kullanıcı etkisi,
- önerilen çözüm,
- gerekli regression testi
bulunsun.

İnceleme bittikten sonra yalnızca kritik ve yüksek bulguları düzelt. Sonra typecheck, lint ve testleri çalıştır.
```

---

## 5. UI iyileştirme promptu

```text
Hidden Cost uygulamasının UI/UX kalitesini artır; ürün kapsamını büyütme.

Hedef:
Profesyonel, güven veren ve veriyi kolay okutan bir finans/karar destek deneyimi.

Kurallar:
- Mevcut theme token sistemini kullan.
- Hardcoded renk ve metin ekleme.
- Hesaplama wizard’ını sadeleştir.
- Bir ekranda tek ana CTA.
- Form yardım metinlerini kısa tut.
- Para alanlarını locale-aware yap.
- Kullanıcının veri kaybetmesini engelle.
- Sonuç ekranında önce üç temel metrik, sonra breakdown, sonra varsayımlar.
- Grafikleri dekorasyon için değil karar desteği için kullan.
- Büyük font, screen reader ve reduced motion desteğini koru.
- Reklam alanını ana aksiyonlardan uzak tut.
- Empty/loading/error/offline durumlarını tasarla.
- Yeni ağır UI kütüphanesi ekleme.
- Animasyonları kısa, işlevsel ve iptal edilebilir tut.

Önce mevcut ekranları UX sorunlarıyla listele. Sonra en yüksek etkili düzeltmeleri uygula ve screenshot/test planı sun.
```

---

## 6. Codex’e verilmemesi gereken belirsiz prompt örnekleri

Bunları kullanma:

```text
Bu uygulamanın tamamını yap.
Firebase ekle.
Daha güzel yap.
Reklam koy.
Profesyonel mimari kur.
Tüm bugları düzelt.
```

Bunun yerine faz promptlarını kullan. Her fazın net kapsamı, kabul kriteri ve test zorunluluğu bulunmalıdır.

---

## 7. Kullanıcıdan sonradan gerekecek gerçek değerler

Codex bu değerleri uydurmamalıdır:

- Android package name
- iOS bundle identifier
- Expo account/project ID
- Firebase Android `google-services.json`
- Firebase iOS `GoogleService-Info.plist`
- Firebase project IDs
- Google OAuth client IDs
- SHA-1/SHA-256 fingerprints
- AdMob Android/iOS app IDs
- AdMob production ad unit IDs
- Google Play signing/keystore işlemleri
- Privacy policy URL
- Support e-mail
- App icon, splash ve store graphics
- Gerçek premium product IDs
- Production App Check rollout kararı

Bu değerler eksikken proje test config ve açık dokümantasyonla geliştirilmeye devam etmelidir.

---

## 8. Her faz sonunda beklenen rapor formatı

```text
## Tamamlananlar
- ...

## Değiştirilen dosyalar
- path: açıklama

## Mimari kararlar
- ...

## Çalıştırılan komutlar
- ...

## Doğrulama
- Typecheck:
- Lint:
- Unit tests:
- Integration tests:
- Build:

## Kalan riskler
- ...

## Kullanıcıdan gereken değerler
- ...

## Sonraki önerilen faz
- ...
```
