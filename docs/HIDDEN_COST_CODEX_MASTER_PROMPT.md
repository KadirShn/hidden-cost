# Hidden Cost â€” Codex Master Prompt

Bu dosyayÄ± Codex/ChatGPTâ€™ye, `docs/HIDDEN_COST_PRODUCT_SPEC.md` ile birlikte ver. En iyi sonuÃ§ iÃ§in projeyi tek mesajda tamamen yazdÄ±rmak yerine aÅŸaÄŸÄ±daki ana promptu bir kez ver ve ardÄ±ndan faz promptlarÄ±nÄ± sÄ±rayla kullan.

---

## 1. Ana prompt

```text
Sen bu projede principal seviyesinde bir React Native/Expo geliÅŸtiricisi, mobil mimar, Ã¼rÃ¼n mÃ¼hendisi ve kalite sorumlusu olarak Ã§alÄ±ÅŸacaksÄ±n.

Proje adÄ±: Hidden Cost

AmaÃ§:
KullanÄ±cÄ±nÄ±n satÄ±n almayÄ± dÃ¼ÅŸÃ¼ndÃ¼ÄŸÃ¼ bir Ã¼rÃ¼nÃ¼n etiket fiyatÄ± yerine; baÅŸlangÄ±Ã§, finansman, periyodik, kullanÄ±ma baÄŸlÄ± maliyetler ve tahmini satÄ±ÅŸ deÄŸeri dahil gerÃ§ek toplam sahip olma maliyetini hesaplayan profesyonel bir mobil uygulama geliÅŸtir.

Platform ve temel teknoloji:
- React Native
- Expo CLI; bare React Native CLI kullanma
- TypeScript strict
- Expo Router
- Android Ã¶ncelikli, iOS uyumlu
- EAS Development Build
- Firebase
- Offline-first SQLite
- AdMob

ÃœrÃ¼nÃ¼n tam gereksinimleri `docs/HIDDEN_COST_PRODUCT_SPEC.md` dosyasÄ±ndadÄ±r. Herhangi bir kod yazmadan Ã¶nce bu dosyanÄ±n tamamÄ±nÄ± oku. Bu dosya Ã¼rÃ¼n kapsamÄ± ve kabul kriterleri iÃ§in tek doÄŸruluk kaynaÄŸÄ±dÄ±r.

Ã‡alÄ±ÅŸma biÃ§imin:
1. Ã–nce mevcut repoyu incele.
2. `docs/HIDDEN_COST_PRODUCT_SPEC.md` ile repo arasÄ±ndaki farklarÄ± tespit et.
3. Uygulamaya baÅŸlamadan Ã¶nce kÄ±sa fakat somut bir uygulama planÄ± Ã§Ä±kar.
4. Ã‡alÄ±ÅŸmayÄ± fazlara ve kÃ¼Ã§Ã¼k doÄŸrulanabilir gÃ¶revlere bÃ¶l.
5. Ä°Ã§inde bulunduÄŸun fazÄ±n kodunu tamamla.
6. Her anlamlÄ± deÄŸiÅŸiklikten sonra typecheck, lint ve ilgili testleri Ã§alÄ±ÅŸtÄ±r.
7. Hata varsa kÃ¶k nedenini Ã§Ã¶z; testleri atlama, disable etme veya sahte geÃ§iÅŸ Ã¼retme.
8. DeÄŸiÅŸiklik sonunda:
   - oluÅŸturulan/deÄŸiÅŸtirilen dosyalarÄ±,
   - mimari kararlarÄ±,
   - Ã§alÄ±ÅŸtÄ±rÄ±lan komutlarÄ±,
   - test sonuÃ§larÄ±nÄ±,
   - kalan riskleri,
   - bir sonraki Ã¶nerilen gÃ¶revi Ã¶zetle.
9. Eksik Firebase veya AdMob credential nedeniyle kodlama durmamalÄ±. `.env.example`, config katmanÄ±, test deÄŸerleri ve aÃ§Ä±k kurulum dokÃ¼manÄ± oluÅŸtur. GerÃ§ek secret uydurma.
10. YalnÄ±zca gerÃ§ekten kullanÄ±cÄ±dan alÄ±nmasÄ± gereken credential veya maÄŸaza kimliÄŸi eksikse bunu aÃ§Ä±kÃ§a listele. Bunun dÄ±ÅŸÄ±ndaki kÃ¼Ã§Ã¼k kararlarÄ± kendin ver.
11. Mevcut Ã§alÄ±ÅŸan kodu sebepsiz yeniden yazma.
12. BÃ¼yÃ¼k Ã§aplÄ± refactor yapmadan Ã¶nce etkisini aÃ§Ä±kla.
13. Bir faz tamamlanmadan sonraki faza daÄŸÄ±lma.
14. Bir dosyada TODO bÄ±rakÄ±yorsan issue/task kimliÄŸi ve gerekÃ§esi olmalÄ±. TamamlandÄ± dediÄŸin Ã¶zellikte TODO, mock veya placeholder kalmamalÄ±.
15. KullanÄ±cÄ± Ã¶zel olarak istemedikÃ§e git geÃ§miÅŸini silme, force push yapma veya destructive komut Ã§alÄ±ÅŸtÄ±rma.

Zorunlu mimari ilkeler:
- Feature-first klasÃ¶rleme kullan.
- Domain hesaplama motoru React, Expo, Firebase ve UI baÄŸÄ±mlÄ±lÄ±ÄŸÄ± taÅŸÄ±mamalÄ±.
- Hesaplama fonksiyonlarÄ± pure ve deterministik olmalÄ±.
- UI doÄŸrudan Firestore, Analytics, AdMob veya SQLite Ã§aÄŸÄ±rmamalÄ±.
- Repository interface ve adapter yaklaÅŸÄ±mÄ± kullan.
- SQLite ana yerel veri kaynaÄŸÄ±, Firestore senkronizasyon/yedekleme katmanÄ± olsun.
- Yerel kayÄ±t baÅŸarÄ±lÄ± olmadan UI iÅŸlemi baÅŸarÄ±lÄ± sayÄ±lmasÄ±n.
- Senkronizasyon kuyruk tabanlÄ± ve idempotent olsun.
- Para deÄŸerlerini floating point ile doÄŸrudan toplama. Minor unit + decimal yaklaÅŸÄ±mÄ± kullan.
- SatÄ±n alma fiyatÄ±nÄ± ve kredi anaparasÄ±nÄ± iki kez toplama.
- Zod ÅŸemalarÄ±nÄ± form, domain ve sÄ±nÄ±r doÄŸrulamalarÄ±nda kullan.
- TypeScript `any` kullanma.
- Production loglarÄ±nda PII, serbest metin veya maliyet tutarÄ± bulunmasÄ±n.
- TÃ¼m kullanÄ±cÄ± metinleri i18n anahtarlarÄ±ndan gelsin.
- Light/dark tema token tabanlÄ± olsun.
- Accessibility label ve hata duyurularÄ±nÄ± unutma.
- Her ana ekranÄ±n loading, empty, error ve offline durumunu tasarla.
- Reklam yÃ¼klenmezse temel uygulama akÄ±ÅŸÄ± kesinlikle bozulmasÄ±n.
- Debug/preview buildâ€™de yalnÄ±zca test reklam kimlikleri kullan.
- Interstitial reklamÄ± hesaplama sihirbazÄ±nda, ilk oturumda, geri tuÅŸunda veya sonuÃ§ aÃ§Ä±lÄ±r aÃ§Ä±lmaz gÃ¶sterme.
- Rewarded reklam yalnÄ±zca kullanÄ±cÄ±nÄ±n aÃ§Ä±k aksiyonu ile gÃ¶sterilsin.
- Reklam frekansÄ± Remote Config ile kontrol edilsin.
- UMP consent ve gizlilik seÃ§eneklerini yeniden aÃ§ma akÄ±ÅŸÄ± ekle.
- Firebase Security Rules ve App Checkâ€™i gerÃ§ek gÃ¼venlik katmanÄ± olarak ele al.
- Secret veya service account deÄŸerlerini client bundleâ€™a koyma.
- Expo paketlerini `npx expo install` ile uyumlu sÃ¼rÃ¼mde kur.
- Native Firebase ve AdMob nedeniyle Expo Goâ€™ya gÃ¼venme; development build kullan.
- `ios/` ve `android/` klasÃ¶rlerini elle dÃ¼zenlemek yerine mÃ¼mkÃ¼n olduÄŸunca config plugin ve `app.config.ts` kullan. Zorunlu native deÄŸiÅŸiklik varsa nedenini belgeleyerek yap.

Tercih edilen teknik yÄ±ÄŸÄ±n:
- Expo Router
- expo-sqlite
- Drizzle ORM ve migration
- React Hook Form
- Zod
- TanStack Query
- Zustand; yalnÄ±zca kÄ±sa Ã¶mÃ¼rlÃ¼ UI state iÃ§in
- decimal.js veya eÅŸdeÄŸeri
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
- KÃ¼Ã§Ã¼k, isimlendirilmiÅŸ ve test edilebilir fonksiyonlar yaz.
- Gereksiz generic abstraction oluÅŸturma.
- Tek kullanÄ±mlÄ±k kod iÃ§in karmaÅŸÄ±k framework Ã¼retme.
- Domain kurallarÄ±nÄ± ekrana daÄŸÄ±tma.
- Magic number kullanma.
- Tarih, para ve locale iÅŸlemlerini merkezi utility/value object Ã¼zerinden yap.
- Async hatalarÄ± tipli error modeline dÃ¶nÃ¼ÅŸtÃ¼r.
- KullanÄ±cÄ±ya teknik hata metni gÃ¶sterme.
- Error boundary ve uygulama baÅŸlatma hata ekranÄ± oluÅŸtur.
- BÃ¼yÃ¼k dosyalarÄ± uygun sorumluluklara bÃ¶l.
- Public function ve kritik algoritmalarda kÄ±sa aÃ§Ä±klayÄ±cÄ± JSDoc kullan.
- Yorumlar kodun ne yaptÄ±ÄŸÄ±nÄ± tekrar etmesin; nedenini anlatsÄ±n.

Test zorunluluklarÄ±:
- Hesaplama motoruna kapsamlÄ± unit test yaz.
- SÄ±fÄ±r faiz ve normal faiz senaryolarÄ±nÄ± test et.
- Finansman anaparasÄ±nÄ±n Ã§ift sayÄ±lmadÄ±ÄŸÄ±nÄ± test et.
- AylÄ±k/yÄ±llÄ±k maliyet dÃ¶nÃ¼ÅŸÃ¼mlerini test et.
- KullanÄ±m bazlÄ± ve yakÄ±t maliyetini test et.
- SatÄ±ÅŸ deÄŸerini test et.
- BÃ¼yÃ¼k tutar ve yerel sayÄ± formatÄ±nÄ± test et.
- Repository transaction, migration, soft delete ve sync queue testlerini yaz.
- Firestore kurallarÄ±nÄ± emulator ile test et.
- Form doÄŸrulama ve taslak koruma UI testlerini yaz.
- En az bir temel Android Maestro akÄ±ÅŸÄ± ekle.
- Test baÅŸarÄ±sÄ±zsa testi silme veya anlamsÄ±zlaÅŸtÄ±rma.

DokÃ¼mantasyon:
AÅŸaÄŸÄ±daki dosyalarÄ± oluÅŸtur ve kodla birlikte gÃ¼ncel tut:
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

Ã–nemli Ã¼rÃ¼n kararlarÄ±:
- MVP kategorileri: otomobil, motosiklet, tekne, elektronik cihaz, abonelik ve Ã¶zel.
- Hesaplama akÄ±ÅŸÄ± adÄ±m adÄ±m wizard olmalÄ±.
- KullanÄ±cÄ± internetsiz hesaplama yapabilmeli.
- SonuÃ§ ekranÄ±nda toplam, aylÄ±k, kullanÄ±m baÅŸÄ±na maliyet, breakdown, en bÃ¼yÃ¼k maliyet sÃ¼rÃ¼cÃ¼leri ve varsayÄ±mlar bulunmalÄ±.
- DÃ¼ÅŸÃ¼k, temel ve yÃ¼ksek senaryo bulunmalÄ±.
- En fazla Ã¼Ã§ proje karÅŸÄ±laÅŸtÄ±rÄ±lmalÄ±.
- PDF ve gÃ¶rsel paylaÅŸÄ±m bulunmalÄ±.
- Para birimleri farklÄ±ysa otomatik kur tahmini yapma.
- KullanÄ±cÄ± verileri varsayÄ±lan olarak cihazda saklanmalÄ±.
- Bulut yedekleme aÃ§Ä±k ve isteÄŸe baÄŸlÄ± olmalÄ±.
- Analyticsâ€™e gerÃ§ek maliyet tutarÄ±, proje adÄ± veya serbest metin gÃ¶nderme.
- Hesap ve veri silme akÄ±ÅŸÄ± bulunmalÄ±.
- Uygulama finansal tavsiye vermediÄŸini aÃ§Ä±kÃ§a belirtmeli.

Ã‡alÄ±ÅŸmaya baÅŸlamadan Ã¶nce ÅŸu Ã§Ä±ktÄ±yÄ± Ã¼ret:
A. Repo durum Ã¶zeti
B. KullanacaÄŸÄ±n nihai paketler ve nedenleri
C. KlasÃ¶r mimarisi
D. Fazlara ayrÄ±lmÄ±ÅŸ gÃ¶rev listesi
E. Ä°lk fazda deÄŸiÅŸtireceÄŸin dosyalar
F. Riskler ve Ã§Ã¶zÃ¼m yaklaÅŸÄ±mÄ±

Bu ilk deÄŸerlendirmeden sonra yalnÄ±zca Faz 1â€™i uygula. Faz 1 tamamlandÄ±ÄŸÄ±nda dur ve sonuÃ§ raporu ver. Sonraki faza kullanÄ±cÄ± yeni prompt verdiÄŸinde geÃ§.
```

---

## 2. Faz promptlarÄ±

Her fazÄ±n baÅŸÄ±nda Codexâ€™e ilgili promptu ver. Codex Ã¶nceki fazÄ±n kodunu ve `docs/HIDDEN_COST_PRODUCT_SPEC.md` dosyasÄ±nÄ± yeniden kontrol etmelidir.

### Faz 1 â€” Bootstrap

```text
Hidden Cost projesinde Faz 1â€™i uygula.

Hedef:
Ãœretim kalitesinde Expo/TypeScript proje iskeletini hazÄ±rla; henÃ¼z domain Ã¶zelliklerine girme.

YapÄ±lacaklar:
- Mevcut repo yoksa gÃ¼ncel kararlÄ± `create-expo-app` ile TypeScript ve Expo Router projesi oluÅŸtur.
- Expo CLI kullan; bare RN CLI projesi oluÅŸturma.
- TypeScript strict ayarlarÄ±nÄ± etkinleÅŸtir.
- ESLint, Prettier ve import dÃ¼zenini yapÄ±landÄ±r.
- Path alias ekle.
- `app.config.ts` oluÅŸtur.
- `EXPO_PUBLIC_APP_ENV` tabanlÄ± dev/preview/production config yapÄ±sÄ± kur.
- `.env.example` oluÅŸtur; gerÃ§ek secret ekleme.
- EAS development, preview ve production profillerini ekle.
- Basit GitHub Actions CI oluÅŸtur: install, typecheck, lint, test.
- Feature-first klasÃ¶r iskeletini oluÅŸtur.
- Uygulama initialization state yapÄ±sÄ±nÄ± kur.
- Global error boundary ve gÃ¼venli fallback ekranÄ± ekle.
- READMEâ€™ye kurulum, development build ve environment adÄ±mlarÄ±nÄ± yaz.
- `docs/ARCHITECTURE.md` baÅŸlangÄ±Ã§ belgesini oluÅŸtur.
- Native dependency henÃ¼z eklenmemiÅŸse Expo Go ile bootstrap Ã§alÄ±ÅŸabilir; ancak development build geÃ§iÅŸini dokÃ¼mante et.
- Faz sonunda typecheck, lint ve baÅŸlangÄ±Ã§ testini Ã§alÄ±ÅŸtÄ±r.

Bu fazda yapma:
- Firebase baÄŸlantÄ±sÄ±
- AdMob
- Hesaplama motoru
- Tam UI ekranlarÄ±
- SQLite domain ÅŸemasÄ±

Ã‡Ä±ktÄ±:
- Dosya deÄŸiÅŸiklik Ã¶zeti
- Ã‡alÄ±ÅŸtÄ±rÄ±lan komutlar
- Test/lint/typecheck sonucu
- Kararlar
- Kalan riskler
- Faz 2â€™ye hazÄ±r olup olmadÄ±ÄŸÄ±
```

### Faz 2 â€” Design system, navigasyon ve i18n

```text
Hidden Cost projesinde Faz 2â€™yi uygula.

Ã–nce:
- `docs/HIDDEN_COST_PRODUCT_SPEC.md`
- `docs/ARCHITECTURE.md`
- mevcut kod
dosyalarÄ±nÄ± incele.

Hedef:
UygulamanÄ±n gÃ¶rsel ve navigasyon temelini Ã¼retim kalitesinde oluÅŸtur.

YapÄ±lacaklar:
- Semantik theme token sistemi kur.
- Light, dark ve system tema seÃ§eneklerini ekle.
- Reusable UI primitives oluÅŸtur:
  Button, IconButton, TextField, MoneyInput, NumberInput, SelectField,
  Card, MetricCard, Chip, Divider, EmptyState, ErrorState, OfflineBanner,
  LoadingSkeleton, ConfirmDialog, StepIndicator.
- TasarÄ±m bileÅŸenlerinde hardcoded ekran metni kullanma.
- Expo Router ile onboarding ve tab navigasyon shellâ€™ini kur.
- Tablar: Ana Sayfa, Hesaplamalar, KarÅŸÄ±laÅŸtÄ±r, Ayarlar.
- TÃ¼rkÃ§e ve Ä°ngilizce i18n altyapÄ±sÄ±nÄ± kur.
- Locale-aware sayÄ± ve para formatlama utilityâ€™si ekle.
- Reduced motion tercihini destekle.
- EriÅŸilebilirlik label ve focus kurallarÄ±nÄ± uygula.
- Responsive kÃ¼Ã§Ã¼k telefon dÃ¼zenini kontrol et.
- Onboarding ekranlarÄ±nÄ± gerÃ§ek metinlerle oluÅŸtur.
- Ana sayfa iÃ§in data-independent skeleton ekran oluÅŸtur.
- Ayarlar ekranÄ±nda dil ve tema deÄŸiÅŸimini Ã§alÄ±ÅŸtÄ±r.
- UI primitiveâ€™leri iÃ§in temel testler ekle.
- Storybook ekleme; bu fazÄ± gereksiz bÃ¼yÃ¼tme.
- DokÃ¼mantasyonu gÃ¼ncelle.

Kabul:
- Dil anÄ±nda deÄŸiÅŸir.
- Tema kalÄ±cÄ±dÄ±r.
- Navigation Ã§alÄ±ÅŸÄ±r.
- BÃ¼yÃ¼k fontta temel ekranlar taÅŸmaz.
- Typecheck/lint/test geÃ§er.
```

### Faz 3 â€” Domain ve hesaplama motoru

```text
Hidden Cost projesinde Faz 3â€™Ã¼ uygula.

Hedef:
UI ve Firebaseâ€™den tamamen baÄŸÄ±msÄ±z, gÃ¼venilir ve kapsamlÄ± test edilmiÅŸ hesaplama domainâ€™i oluÅŸtur.

Zorunlu:
- `docs/HIDDEN_COST_PRODUCT_SPEC.md` iÃ§indeki 8, 9, 10, 11 ve 12. bÃ¶lÃ¼mleri birebir dikkate al.
- Para iÃ§in minor unit + decimal yaklaÅŸÄ±mÄ± kullan.
- `Money` value object oluÅŸtur.
- Currency ISO kodunu taÅŸÄ±.
- Yerel string parse ile domain hesaplamasÄ±nÄ± ayÄ±r.
- CostProject, CostItem, FinancingPlan, ResidualValue, Scenario ve CalculationResult tiplerini oluÅŸtur.
- Zod ÅŸemalarÄ±nÄ± yaz.
- Bir defalÄ±k maliyet hesapla.
- Periyodik maliyetleri aylÄ±k eÅŸdeÄŸere Ã§evir.
- BaÅŸlangÄ±Ã§/bitiÅŸ ayÄ± olan periyodik maliyeti destekle.
- KullanÄ±m baÅŸÄ±na maliyeti hesapla.
- YakÄ±t/enerji tÃ¼ketim formÃ¼lÃ¼nÃ¼ destekle.
- SÄ±fÄ±r faiz ve amortismanlÄ± kredi formÃ¼lÃ¼nÃ¼ uygula.
- Kredi anaparasÄ±nÄ± TCOâ€™ya ikinci kez ekleme.
- SatÄ±ÅŸ deÄŸeri ve satÄ±ÅŸ maliyetini uygula.
- TCO, aylÄ±k maliyet, kullanÄ±m baÅŸÄ±na maliyet, gizli maliyet ve breakdown Ã¼ret.
- DÃ¼ÅŸÃ¼k/temel/yÃ¼ksek override senaryosunu uygula.
- Completeness score ve warning Ã¼ret.
- Calculation engine version sabiti ekle.
- Pure function kullan; React/Firebase/Expo import etme.
- KapsamlÄ± unit test yaz.
- `docs/CALCULATION_ENGINE.md` oluÅŸtur; formÃ¼lleri ve Ã¶rnekleri aÃ§Ä±kla.
- Golden test fixtureâ€™larÄ± ekle.

Ã–zellikle test et:
- YalnÄ±z satÄ±n alma fiyatÄ±
- 0 faiz
- Normal faiz
- AnaparanÄ±n Ã§ift sayÄ±lmamasÄ±
- AylÄ±k/yÄ±llÄ±k/Ã¼Ã§ aylÄ±k dÃ¶nÃ¼ÅŸÃ¼m
- KÄ±smi aktif ay
- YakÄ±t
- SÄ±fÄ±r kullanÄ±m
- SatÄ±ÅŸ deÄŸeri
- BÃ¼yÃ¼k tutar
- TR ve EN giriÅŸ parse
- Senaryo override
- Eksik veri warning
- Rounding

Faz sonunda tÃ¼m testleri Ã§alÄ±ÅŸtÄ±r ve Ã¶rnek bir motosiklet hesabÄ±nÄ±n girdileriyle beklenen Ã§Ä±ktÄ±yÄ± raporla.
```

### Faz 4 â€” SQLite, migration ve repository

```text
Hidden Cost projesinde Faz 4â€™Ã¼ uygula.

Hedef:
Offline-first yerel veri katmanÄ±nÄ± kur.

YapÄ±lacaklar:
- expo-sqlite kur.
- Uyumluysa Drizzle ORM kullan.
- VersiyonlanmÄ±ÅŸ migration altyapÄ±sÄ± oluÅŸtur.
- Tablolar:
  user_profile, projects, cost_items, scenario_overrides,
  template_cache, sync_queue, app_settings, schema_migrations.
- Repository interfaceâ€™leri tanÄ±mla.
- SQLite adapterâ€™larÄ±nÄ± yaz.
- CRUD, draft autosave, duplicate, archive ve soft delete ekle.
- Transaction kullan.
- Seed template sistemini oluÅŸtur.
- 6 MVP kategori ÅŸablonunu veri olarak ekle.
- Seed idempotent olsun.
- Query key factory ve TanStack Query hookâ€™larÄ±nÄ± ekle.
- UIâ€™Ä±n SQL detayÄ±nÄ± gÃ¶rmemesini saÄŸla.
- Sync queue kayÄ±tlarÄ±nÄ± entity iÅŸlemleriyle tutarlÄ± Ã¼ret.
- Migration/repository testleri yaz.
- Uygulama baÅŸlangÄ±cÄ±nda migration failure iÃ§in gÃ¼venli hata ekranÄ± oluÅŸtur.
- DB reset yalnÄ±zca development araÃ§larÄ±nda ve aÃ§Ä±k aksiyonla olsun.
- DokÃ¼mantasyonu gÃ¼ncelle.

Kabul:
- UÃ§ak modunda proje oluÅŸturulabilir.
- Uygulama yeniden aÃ§Ä±lÄ±nca kayÄ±t korunur.
- Autosave veri kaybetmez.
- Soft delete Ã§alÄ±ÅŸÄ±r.
- Migration testleri geÃ§er.
```

### Faz 5 â€” Ana kullanÄ±cÄ± akÄ±ÅŸÄ±

```text
Hidden Cost projesinde Faz 5â€™i uygula.

Hedef:
KullanÄ±cÄ±nÄ±n baÅŸlangÄ±Ã§tan sonuÃ§ ekranÄ±na kadar gerÃ§ek bir hesaplamayÄ± tamamlamasÄ±nÄ± saÄŸla.

YapÄ±lacaklar:
- Dashboard
- Template library
- Template detail
- Calculation wizard
- Draft autosave
- Result screen
- Saved calculations list
- Project detail
- Edit, duplicate, archive, delete
- Loading, empty, error ve offline durumlarÄ±
- Formlarda React Hook Form + Zod
- MoneyInput yerel sayÄ± formatÄ±
- Step validation
- Geri dÃ¶nÃ¼ÅŸte veri korunmasÄ±
- KaydedilmemiÅŸ deÄŸiÅŸiklik uyarÄ±sÄ±
- Result breakdown
- Top drivers
- Completeness indicator
- Assumptions/formulas expandable bÃ¶lÃ¼m
- Åimdilik reklam yerleÅŸimi iÃ§in yalnÄ±zca gÃ¼venli placeholder container; gerÃ§ek reklam ekleme
- Ekran ve form testleri
- TÃ¼rkÃ§e ve Ä°ngilizce metinler

Kabul senaryosu:
Motosiklet ÅŸablonu seÃ§, fiyat/finansman/yakÄ±t/bakÄ±m/satÄ±ÅŸ deÄŸeri gir, sonucu hesapla, kaydet, listeden aÃ§ ve dÃ¼zenle.

Faz sonunda bu akÄ±ÅŸÄ± manuel test adÄ±mlarÄ±yla raporla.
```

### Faz 6 â€” Senaryolar, karÅŸÄ±laÅŸtÄ±rma ve export

```text
Hidden Cost projesinde Faz 6â€™yÄ± uygula.

Hedef:
Karar destek deÄŸerini artÄ±ran senaryo, karÅŸÄ±laÅŸtÄ±rma ve paylaÅŸÄ±m Ã¶zelliklerini tamamla.

YapÄ±lacaklar:
- DÃ¼ÅŸÃ¼k/temel/yÃ¼ksek senaryo editÃ¶rÃ¼
- Senaryo sonuÃ§ aralÄ±ÄŸÄ±
- En etkili varsayÄ±m Ã¶zeti
- En fazla Ã¼Ã§ proje karÅŸÄ±laÅŸtÄ±rma
- FarklÄ± sÃ¼reler iÃ§in aylÄ±k normalize gÃ¶rÃ¼nÃ¼m
- FarklÄ± currency iÃ§in uyarÄ±; otomatik kur dÃ¶nÃ¼ÅŸÃ¼mÃ¼ yapma
- FarklÄ± usage unit iÃ§in doÄŸru kÄ±sÄ±t
- Accessible breakdown grafikleri
- PDF raporu
- Shareable result card
- expo-print ve expo-sharing
- GeÃ§ici dosya temizliÄŸi
- Export failure fallback
- PDFâ€™de yasal uyarÄ± ve calculation engine version
- Unit/UI testleri
- Docs gÃ¼ncellemesi

Bu fazda gerÃ§ek reklam entegrasyonu yapma; rewarded export iÃ§in interface/policy boundary hazÄ±rla.
```

### Faz 7 â€” Firebase ve senkronizasyon

```text
Hidden Cost projesinde Faz 7â€™yi uygula.

Hedef:
Local-first davranÄ±ÅŸÄ± bozmadan Firebase auth, backup ve sync ekle.

YapÄ±lacaklar:
- React Native Firebaseâ€™i Expo development build ile yapÄ±landÄ±r.
- app, auth, firestore ve remote-config modÃ¼llerini kur.
- `app.config.ts` ve config plugin ayarlarÄ±nÄ± kullan.
- Android google-services yapÄ±landÄ±rmasÄ±nÄ± dokÃ¼mante et.
- GerÃ§ek credential uydurma.
- Anonymous auth ekle.
- Bulut yedekleme opt-in akÄ±ÅŸÄ± ekle.
- Hesap baÄŸlama iÃ§in mimari ve en az bir gerÃ§ek provider akÄ±ÅŸÄ± ekle; mÃ¼mkÃ¼nse Google.
- SQLite -> sync queue -> Firestore worker oluÅŸtur.
- Retry ve exponential backoff.
- Idempotent upsert/delete.
- App foreground ve network geri geldiÄŸinde sync.
- Sync status UI.
- Soft delete senkronizasyonu.
- Last-write-wins/revision yaklaÅŸÄ±mÄ±nÄ± uygula ve conflictâ€™e aÃ§Ä±k model bÄ±rak.
- Remote Config defaultâ€™larÄ±nÄ± ekle.
- Firebase Emulator Suite config.
- Firestore rules ve rules testleri.
- `docs/FIREBASE_SETUP.md` oluÅŸtur.
- Account/cloud data deletion callable function veya gÃ¼venli backend akÄ±ÅŸÄ± ekle.
- Local-only kullanÄ±m credential olmadan Ã§alÄ±ÅŸmaya devam etsin.

Kabul:
- Offline proje oluÅŸturulur.
- Online olunca sync olur.
- Ä°kinci kullanÄ±cÄ± aynÄ± veriye eriÅŸemez.
- Firebase kapalÄ±/hatalÄ±ysa local hesaplama Ã§alÄ±ÅŸÄ±r.
```

### Faz 8 â€” AdMob ve consent

```text
Hidden Cost projesinde Faz 8â€™i uygula.

Hedef:
KullanÄ±cÄ± deneyimini bozmayan, policy-aware reklam altyapÄ±sÄ± ekle.

YapÄ±lacaklar:
- react-native-google-mobile-ads kur.
- Expo config plugin ve development build yapÄ±landÄ±r.
- Debug/preview iÃ§in yalnÄ±zca test IDs.
- Production IDs environment Ã¼zerinden.
- UMP consent flow.
- Ayarlarda privacy options/consent formunu yeniden aÃ§ma.
- AdsPolicyService oluÅŸtur.
- Remote Config:
  ads_enabled,
  native_ads_enabled,
  interstitial_ads_enabled,
  rewarded_export_enabled,
  interstitial_min_completed_calculations,
  interstitial_cooldown_minutes.
- Native ad yalnÄ±zca iÃ§erikli dashboard/template alanÄ±nda.
- Rewarded ad kullanÄ±cÄ± PDF/geliÅŸmiÅŸ export seÃ§tiÄŸinde aÃ§Ä±k opt-in ile.
- Interstitial ilk oturumda ve wizardâ€™da kesinlikle yok.
- Interstitial baÅŸlangÄ±Ã§ eÅŸiÄŸi ve cooldown uygula.
- Reklam yÃ¼klenmezse Ã¶zelliklerin gÃ¼venli fallbackâ€™i olsun.
- Consent olmadan yanlÄ±ÅŸ reklam isteÄŸi gÃ¶nderme.
- Ad event analytics ekle; maliyet verisi gÃ¶nderme.
- Testler ve mockable ad adapter.
- `docs/ADMOB_SETUP.md` ve policy checklist oluÅŸtur.

Kabul:
- Test build live ad istemez.
- Reklam kapalÄ± Remote Config ile tamamen devre dÄ±ÅŸÄ± kalÄ±r.
- Rewarded reddedilince uygulama Ã§Ã¶kmez.
- Interstitial hesaplamayÄ± bÃ¶lmez.
- Temel hesaplama reklama baÄŸÄ±mlÄ± deÄŸildir.
```

### Faz 9 â€” Analytics, Crashlytics, App Check ve privacy

```text
Hidden Cost projesinde Faz 9â€™u uygula.

Hedef:
Observability, abuse protection ve privacy kontrollerini Ã¼retim seviyesine getir.

YapÄ±lacaklar:
- Firebase Analytics merkezi adapter.
- `docs/HIDDEN_COST_PRODUCT_SPEC.md` analytics event listesini uygula.
- Maliyet tutarÄ±, title, note, e-mail veya serbest metin gÃ¶nderilmediÄŸini test et.
- Crashlytics adapter ve release davranÄ±ÅŸÄ±.
- Log redaction.
- Typed error codes.
- App Check:
  Android Play Integrity,
  development debug provider,
  enforcement aÃ§madan Ã¶nce gÃ¼venli dokÃ¼mantasyon.
- Analytics consent ayarÄ±.
- Ads privacy options.
- Local data export.
- Local data delete.
- Account + cloud data delete.
- Legal screens.
- Privacy checklist.
- Crash/test eventlerini yalnÄ±z development menÃ¼sÃ¼nde tut.
- `docs/PRIVACY_CHECKLIST.md` gÃ¼ncelle.

Kabul:
- KullanÄ±cÄ± analytics tercihini deÄŸiÅŸtirebilir.
- Hesap silme Ã§alÄ±ÅŸÄ±r.
- Hassas deÄŸer telemetryâ€™ye gitmez.
- App Check development ve production configâ€™i ayrÄ±dÄ±r.
```

### Faz 10 â€” Quality pass

```text
Hidden Cost projesinde Faz 10â€™u uygula.

Hedef:
Release Ã¶ncesi eriÅŸilebilirlik, performans ve test kalitesini tamamla.

YapÄ±lacaklar:
- TÃ¼m ekranlarÄ± bÃ¼yÃ¼k font ile kontrol et.
- Screen reader labelâ€™larÄ±.
- Focus ve form error announcements.
- Reduced motion.
- Color-independent chart labels.
- Render profiling.
- Liste performansÄ±.
- App startup profiling.
- Sync ve ad failure chaos testleri.
- Unit/integration/UI testlerini tamamla.
- Android Maestro temel E2E.
- Firebase rules testleri.
- CIâ€™Ä± tamamen yeÅŸil yap.
- Dead code, TODO, console ve unused dependency temizliÄŸi.
- README ve architecture docs gÃ¼ncelle.
- Bilinen sÄ±nÄ±rlamalarÄ± dÃ¼rÃ¼stÃ§e yaz.

Kabul:
- Typecheck, lint ve tÃ¼m otomatik testler geÃ§er.
- Release build aÃ§Ä±lÄ±r.
- Offline ana akÄ±ÅŸ Ã§alÄ±ÅŸÄ±r.
- E2E temel yolculuk geÃ§er.
```

### Faz 11 â€” Google Play release hazÄ±rlÄ±ÄŸÄ±

```text
Hidden Cost projesinde Faz 11â€™i uygula.

Hedef:
Android internal testing iÃ§in release hazÄ±rlÄ±ÄŸÄ±nÄ± tamamla.

YapÄ±lacaklar:
- app identifier ve versioning kontrolÃ¼
- EAS production profile
- Android App Bundle
- Signing ve credential dokÃ¼mantasyonu
- Production Firebase project kontrol listesi
- Production AdMob app/ad unit kontrol listesi
- Test device ayarlarÄ±nÄ±n temizlenmesi
- App Check rollout planÄ±
- Remote Config gÃ¼venli defaultâ€™larÄ±
- Privacy policy URL placeholder kontrolÃ¼
- Account deletion URL/flow
- Data Safety iÃ§in veri envanteri
- Store listing taslaÄŸÄ±:
  short description,
  full description,
  feature bullets,
  screenshot plan,
  release notes
- Internal testing smoke test listesi
- Crashlytics/Analytics doÄŸrulama
- `docs/RELEASE_CHECKLIST.md`
- Production build komutlarÄ±
- Rollback planÄ±
- EAS Update uygunluk notu

GerÃ§ek maÄŸaza yayÄ±nÄ± veya credential deÄŸiÅŸikliÄŸi kullanÄ±cÄ± onayÄ± olmadan yapma. HazÄ±rlÄ±k ve doÄŸrulamayÄ± tamamla, eksik kullanÄ±cÄ± girdilerini aÃ§Ä±k bir checklist olarak ver.
```

---

## 3. Hata dÃ¼zeltme promptu

Codex bir faz sonunda sorun bÄ±raktÄ±ÄŸÄ±nda:

```text
Hidden Cost reposunda yeni Ã¶zellik ekleme. Ã–nce mevcut baÅŸarÄ±sÄ±zlÄ±klarÄ± dÃ¼zelt.

ÅunlarÄ± Ã§alÄ±ÅŸtÄ±r ve sonuÃ§larÄ±nÄ± incele:
- typecheck
- lint
- unit tests
- ilgili integration/rules tests
- mÃ¼mkÃ¼nse Android development/release build doÄŸrulamasÄ±

Kurallar:
- Testi silme, skip etme veya assertionâ€™Ä± anlamsÄ±zlaÅŸtÄ±rma.
- Type safetyâ€™yi `any`, `as unknown as` veya geniÅŸ ts-ignore ile aÅŸma.
- Ã‡alÄ±ÅŸan Ã¶zelliÄŸi mock ile deÄŸiÅŸtirme.
- Firebase/AdMob credential eksikse test adapter/config fallback oluÅŸtur; gerÃ§ek secret uydurma.
- KÃ¶k nedeni bul.
- Minimum ve temiz dÃ¼zeltmeyi yap.
- Regression testi ekle.
- Sonunda neden bozulduÄŸunu, nasÄ±l dÃ¼zeldiÄŸini ve hangi komutlarÄ±n geÃ§tiÄŸini raporla.
```

---

## 4. Kod inceleme promptu

```text
Hidden Cost reposunu senior production review standardÄ±yla incele. Yeni Ã¶zellik yazmadan Ã¶nce bulgularÄ± Ã¶nem sÄ±rasÄ±na gÃ¶re listele.

Ã–zellikle ara:
- YanlÄ±ÅŸ TCO veya finansman formÃ¼lÃ¼
- Floating point para hatalarÄ±
- Kredi anaparasÄ±nÄ±n Ã§ift sayÄ±lmasÄ±
- UI iÃ§inde domain logic
- UI iÃ§inde doÄŸrudan Firebase/SQLite/AdMob Ã§aÄŸrÄ±sÄ±
- Offline veri kaybÄ±
- Sync race condition
- Idempotency problemi
- Firestore rules aÃ§Ä±ÄŸÄ±
- PII veya maliyet tutarÄ±nÄ±n Analytics/Crashlyticsâ€™e gitmesi
- Live ad IDâ€™nin debug buildâ€™de kullanÄ±lmasÄ±
- Consent ve privacy options eksikliÄŸi
- Interstitialâ€™Ä±n uygunsuz yerde gÃ¶sterilmesi
- Account deletion eksikliÄŸi
- Migration riski
- Accessibility eksikliÄŸi
- Memory leak ve gereksiz render
- Eksik error/loading/empty/offline state
- Testlerde sahte gÃ¼ven

Her bulguda:
- Ã¶nem derecesi,
- dosya ve satÄ±r,
- neden problem olduÄŸu,
- kullanÄ±cÄ± etkisi,
- Ã¶nerilen Ã§Ã¶zÃ¼m,
- gerekli regression testi
bulunsun.

Ä°nceleme bittikten sonra yalnÄ±zca kritik ve yÃ¼ksek bulgularÄ± dÃ¼zelt. Sonra typecheck, lint ve testleri Ã§alÄ±ÅŸtÄ±r.
```

---

## 5. UI iyileÅŸtirme promptu

```text
Hidden Cost uygulamasÄ±nÄ±n UI/UX kalitesini artÄ±r; Ã¼rÃ¼n kapsamÄ±nÄ± bÃ¼yÃ¼tme.

Hedef:
Profesyonel, gÃ¼ven veren ve veriyi kolay okutan bir finans/karar destek deneyimi.

Kurallar:
- Mevcut theme token sistemini kullan.
- Hardcoded renk ve metin ekleme.
- Hesaplama wizardâ€™Ä±nÄ± sadeleÅŸtir.
- Bir ekranda tek ana CTA.
- Form yardÄ±m metinlerini kÄ±sa tut.
- Para alanlarÄ±nÄ± locale-aware yap.
- KullanÄ±cÄ±nÄ±n veri kaybetmesini engelle.
- SonuÃ§ ekranÄ±nda Ã¶nce Ã¼Ã§ temel metrik, sonra breakdown, sonra varsayÄ±mlar.
- Grafikleri dekorasyon iÃ§in deÄŸil karar desteÄŸi iÃ§in kullan.
- BÃ¼yÃ¼k font, screen reader ve reduced motion desteÄŸini koru.
- Reklam alanÄ±nÄ± ana aksiyonlardan uzak tut.
- Empty/loading/error/offline durumlarÄ±nÄ± tasarla.
- Yeni aÄŸÄ±r UI kÃ¼tÃ¼phanesi ekleme.
- AnimasyonlarÄ± kÄ±sa, iÅŸlevsel ve iptal edilebilir tut.

Ã–nce mevcut ekranlarÄ± UX sorunlarÄ±yla listele. Sonra en yÃ¼ksek etkili dÃ¼zeltmeleri uygula ve screenshot/test planÄ± sun.
```

---

## 6. Codexâ€™e verilmemesi gereken belirsiz prompt Ã¶rnekleri

BunlarÄ± kullanma:

```text
Bu uygulamanÄ±n tamamÄ±nÄ± yap.
Firebase ekle.
Daha gÃ¼zel yap.
Reklam koy.
Profesyonel mimari kur.
TÃ¼m buglarÄ± dÃ¼zelt.
```

Bunun yerine faz promptlarÄ±nÄ± kullan. Her fazÄ±n net kapsamÄ±, kabul kriteri ve test zorunluluÄŸu bulunmalÄ±dÄ±r.

---

## 7. KullanÄ±cÄ±dan sonradan gerekecek gerÃ§ek deÄŸerler

Codex bu deÄŸerleri uydurmamalÄ±dÄ±r:

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
- Google Play signing/keystore iÅŸlemleri
- Privacy policy URL
- Support e-mail
- App icon, splash ve store graphics
- GerÃ§ek premium product IDs
- Production App Check rollout kararÄ±

Bu deÄŸerler eksikken proje test config ve aÃ§Ä±k dokÃ¼mantasyonla geliÅŸtirilmeye devam etmelidir.

---

## 8. Her faz sonunda beklenen rapor formatÄ±

```text
## Tamamlananlar
- ...

## DeÄŸiÅŸtirilen dosyalar
- path: aÃ§Ä±klama

## Mimari kararlar
- ...

## Ã‡alÄ±ÅŸtÄ±rÄ±lan komutlar
- ...

## DoÄŸrulama
- Typecheck:
- Lint:
- Unit tests:
- Integration tests:
- Build:

## Kalan riskler
- ...

## KullanÄ±cÄ±dan gereken deÄŸerler
- ...

## Sonraki Ã¶nerilen faz
- ...
```

