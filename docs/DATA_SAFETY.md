# Google Play Data Safety inventory

This is an engineering inventory, not a legal filing. The owner and privacy counsel must compare it
with the final production Firebase, Analytics, Crashlytics, AdMob, UMP, retention, and deletion
configuration before answering Play Console.

## Data paths

| Data                                                  | Default/local-only behavior                | Optional production behavior                           | Shared                            |
| ----------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ | --------------------------------- |
| Project title, notes, cost inputs, scenarios, results | SQLite on device                           | Firestore backup after explicit cloud opt-in           | No                                |
| Firebase UID                                          | Not created                                | Anonymous Auth/cloud account identifier                | No                                |
| Google profile/email                                  | Not collected                              | Firebase Auth when user explicitly links Google        | No                                |
| Language/theme/consents                               | On device                                  | Consent/category state may influence SDK collection    | No                                |
| Product usage events                                  | Off                                        | Allowlisted categorical Analytics events after opt-in  | Firebase processor                |
| Crash diagnostics                                     | Off outside configured production          | Typed/redacted Crashlytics errors                      | Firebase processor                |
| Ad/consent/device signals                             | Ads disabled by safe defaults              | Google Mobile Ads/UMP when enabled and consent permits | Google advertising services       |
| App integrity signals                                 | None in local-only mode                    | Play Integrity/App Check tokens                        | Google/Firebase security services |
| Local export files                                    | Temporary device file, cleaned after share | Sent only to the destination chosen by the user        | User-selected destination         |

The telemetry contract prohibits monetary amounts, project titles, notes, email addresses, and free
text. Advertising analytics permits format, placement, event, and bounded SDK error only.

## Candidate Play categories

- **Personal info / User IDs:** Firebase UID when cloud backup is enabled.
- **Personal info / Email address:** only after optional Google account linking.
- **Financial info / Other financial info:** user-entered ownership-cost data only when optional
  cloud backup is enabled; local-only data does not leave the device.
- **App activity / App interactions:** optional consented Analytics events.
- **App info and performance / Crash logs and diagnostics:** configured production Crashlytics.
- **Device or other identifiers:** Analytics/AdMob identifiers subject to consent and platform
  controls.
- **Security practices / App integrity:** Play Integrity/App Check tokens for abuse prevention.

For each category, Play Console answers must distinguish **collected** (transmitted off device) from
local processing and must identify whether collection is optional. Firebase/Google processor use
and AdMob advertising use must be evaluated separately under the final contracts and consent mode.

## Purpose mapping

- App functionality: optional backup/sync, account linking, deletion, and user-requested export.
- Analytics: optional allowlisted product usage measurement.
- Fraud prevention/security/compliance: App Check and authentication.
- Advertising/marketing: AdMob only when Remote Config, UMP, policy, and placement gates permit.
- Developer communications: not implemented; the app sends no marketing email.

## Retention and deletion

- Local calculations remain until the user soft-deletes/clears local data or uninstalls the app.
- Account deletion derives all paths from the current Auth UID, deletes the caller's known Firestore
  tree through owner-only rules, then deletes the Auth user. Local data is a separate explicit action.
- The public deletion page must describe request verification, data deleted, any legally retained
  data and period, and expected completion time.
- Analytics, Crashlytics, Auth, Firestore, Functions logs, and AdMob retention must be set/reviewed in
  their consoles and stated in the final policy.
- Temporary PDF/share artifacts are cleaned by the export adapter; the chosen receiving app controls
  its own copy.

## Security and review checklist

- [ ] Data encrypted in transit by platform/Firebase/Google SDKs; verify Firestore at-rest claims in
      the applicable production terms.
- [ ] Firestore rules and rules tests enforce per-UID ownership.
- [ ] App Check rollout does not replace authentication/authorization.
- [ ] Account deletion URL is public, functional without installing the app, and matches the in-app
      flow.
- [ ] Privacy policy names the controller/contact, subprocessors, regions, retention, user rights,
      children/age position, ads, and consent controls.
- [ ] Play “Data deletion” and “Ads” declarations match the shipped binary and Remote Config plan.
- [ ] Re-run this inventory whenever a new SDK, event, cloud field, ad format, or export destination
      is introduced.
