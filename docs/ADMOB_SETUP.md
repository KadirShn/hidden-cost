# AdMob Setup

Phase 8 adds a consent-first advertising boundary with `react-native-google-mobile-ads` 16.0.1.
Advertising is optional: Remote Config defaults disable every format, a failed SDK/consent/ad request
renders no ad, and calculation, persistence, results, and basic export keep working.

## Build configuration

The package contains native code and does not run in Expo Go. Use an Expo development build:

```bash
npm run android
npm run ios
# or an EAS development profile
eas build --profile development --platform android
```

`app.config.ts` registers the config plugin and delays app measurement until consent has been
resolved. Development and preview builds use Google's sample AdMob application IDs and SDK `TestIds`
only. They cannot request a live ad even if production unit-ID environment variables are present.

Production config requires these build-time values. They are identifiers, not secrets, but should be
managed by the build environment rather than committed:

```text
ADMOB_ANDROID_APP_ID
ADMOB_IOS_APP_ID
EXPO_PUBLIC_ADMOB_NATIVE_UNIT_ID
EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID
EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID
```

`EXPO_PUBLIC_APP_ENV=production` fails config evaluation when either production app ID is missing.
Missing production ad-unit IDs disable the affected request at runtime; the app never substitutes a
test unit in production. Rebuild the development client after changing the plugin or app IDs.

## AdMob and UMP console

1. Create separate Android and iOS apps in AdMob; copy their app IDs into the production build
   environment.
2. Create native, interstitial, and rewarded units. Do not create app-open placements for this scope.
3. In **Privacy & messaging**, publish the applicable EEA/UK, regulated-US, and iOS IDFA messages.
4. Verify the privacy-options entry point is required by the published message where applicable.
5. In Google Play Console, declare that the application contains ads before release.
6. Complete Data safety/App privacy disclosures from the actual enabled formats and analytics policy.

At startup `AdsConsent.gatherConsent()` refreshes UMP state. The Mobile Ads SDK is initialized only
when UMP reports `canRequestAds=true`. The UMP result is not persisted by application code. If the
global Remote Config switch is off, neither consent initialization nor an ad request is started.

Settings exposes UMP's privacy-options form when UMP says it is required. A separate, default-off
switch controls anonymous ad event analytics. UMP advertising consent is never treated as analytics
consent.

## Remote Config

All keys have local safe defaults. Publish and test changes in a non-production Firebase project
before enabling production ads.

| Key | Default | Meaning |
| --- | ---: | --- |
| `ads_enabled` | `false` | Global kill switch; false disables every format. |
| `native_ads_enabled` | `false` | Allows native inventory in approved content placements. |
| `interstitial_ads_enabled` | `false` | Allows policy-gated post-result interstitial checks. |
| `rewarded_export_enabled` | `false` | Enables explicit rewarded opt-in for PDF/advanced export. |
| `interstitial_min_completed_calculations` | `3` | Required saved calculations before eligibility. |
| `interstitial_cooldown_minutes` | `30` | Minimum elapsed time between shown interstitials. |

Roll out in this order: publish consent messages, validate test ads, enable `ads_enabled`, then enable
one format at a time. Turning `ads_enabled` off is the emergency rollback.

The repository contains `remoteconfig.production.template.json` as the reviewed production
template. Import it from **Firebase Console -> Remote Config -> Publish from a file** only after the
release candidate passes device smoke testing. It enables all three approved formats while retaining
the completed-calculation threshold and cooldown. The in-app defaults intentionally remain off so a
Remote Config outage fails closed.

The hosted seller declaration is `https://hiddencost-1dde2.web.app/app-ads.txt`. Set
`https://hiddencost-1dde2.web.app` as the app's developer website in Google Play, then ask AdMob to
check for updates. AdMob may take time to crawl and verify a new listing.

## Placement and fallback rules

- Native: dashboard and template library only, and only after meaningful local content exists.
- Rewarded: only after the user selects PDF/advanced export and explicitly accepts the prompt.
  Dismissal cancels that export without an error; load failure falls back to free export.
- Interstitial: never onboarding, first session, calculation wizard, autosave, result calculation, or
  before persistence. It is checked only after a completed result has been saved and the project
  detail screen is visible, then threshold and cooldown are applied.
- No format can gate creation, editing, calculation, saving, or viewing a result.

Ad analytics payloads contain only event name, format, placement, and a bounded SDK error code.
Project IDs, titles, input values, currencies, results, and cost data are prohibited.

## Verification

Use a development/preview build and inspect the ad label for **Test Ad**. Exercise UMP with an emulator
or an allow-listed test device; never click live inventory. Before release, complete
[`AD_POLICY_CHECKLIST.md`](AD_POLICY_CHECKLIST.md) and verify Remote Config rollback from a second
device/session.
