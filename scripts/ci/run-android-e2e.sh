#!/usr/bin/env bash
# Installs the release APK on the running emulator and runs the Maestro flows.
# On failure it keeps logcat, a screenshot and a UI hierarchy dump in
# e2e-artifacts/ so CI can upload them next to Maestro's own debug output.
set -uo pipefail

APK=android/app/build/outputs/apk/release/app-release.apk
APP_ID=com.kadirshn.hiddencost
OUT=e2e-artifacts
mkdir -p "$OUT/maestro"

adb logcat -c || true
adb install -r "$APK" || exit 1

status=0
"$HOME/.maestro/bin/maestro" test \
  --debug-output "$OUT/maestro" \
  --format junit --output "$OUT/maestro-report.xml" \
  .maestro || status=$?

if [ "$status" -ne 0 ]; then
  echo "Maestro failed with exit code $status; collecting diagnostics into $OUT/"
  adb exec-out screencap -p > "$OUT/final-screen.png" || true
  adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 &&
    adb pull /sdcard/window.xml "$OUT/final-window.xml" >/dev/null 2>&1 || true
  adb shell dumpsys activity activities > "$OUT/dumpsys-activities.txt" 2>&1 || true
  adb shell pidof "$APP_ID" > "$OUT/app-pid.txt" 2>&1 || echo "app not running" > "$OUT/app-pid.txt"
fi

adb logcat -d -v threadtime > "$OUT/logcat.txt" 2>&1 || true
adb logcat -d -b crash -v threadtime > "$OUT/logcat-crash.txt" 2>&1 || true

exit "$status"
