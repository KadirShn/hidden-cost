# Advertising Policy Checklist

Complete this checklist for every Android/iOS release that can enable advertising.

## Build and inventory

- [ ] Development and preview artifacts use only Google sample app IDs and `TestIds`.
- [ ] Production app IDs and all three unit IDs come from the build environment.
- [ ] No credential, service-account key, or production ID is committed.
- [ ] App-open ads and wizard/result-screen placements are absent.
- [ ] Native units appear only on a populated dashboard or template library.

## Consent and privacy

- [ ] Current AdMob UMP messages are published for every applicable region.
- [ ] No Mobile Ads SDK initialization or ad request occurs while `canRequestAds` is false.
- [ ] Settings can reopen UMP privacy options when UMP requires the entry point.
- [ ] Anonymous ad analytics remains off until its separate user opt-in.
- [ ] Analytics events contain no calculation, cost, project, or free-form user data.
- [ ] Store privacy/Data safety disclosures match the shipped SDK behavior.

## Experience safeguards

- [ ] `ads_enabled=false` disables native, rewarded, and interstitial behavior.
- [ ] Rewarded export is preceded by an explicit choice; dismissal does not crash or mutate data.
- [ ] Rewarded load/show failure permits the export without payment or repeated prompts.
- [ ] Interstitial is impossible in onboarding, first session, and the wizard.
- [ ] Interstitial eligibility requires the configured completion threshold and cooldown.
- [ ] Saving and calculation finish before any post-result interstitial check.
- [ ] Ad failure never blocks create, edit, calculate, save, view, or basic sharing.

## Release validation

- [ ] UMP acceptance, rejection, privacy-options reopen, and offline startup are tested.
- [ ] No-fill, timeout, SDK error, and Remote Config failure paths are tested.
- [ ] TalkBack/VoiceOver identifies native ad attribution and actionable ad assets.
- [ ] Large text does not obscure the sponsored label or app navigation.
- [ ] Remote Config emergency disable is tested on a release candidate.
- [ ] Google Play "contains ads" declaration and iOS review notes are current.
