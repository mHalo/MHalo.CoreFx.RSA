#!/bin/bash
# Re-sign Tauri .app with proper ad-hoc signature that seals resources/Info.plist.
# Tauri's Rust linker only signs the binary, leaving the bundle incomplete —
# Gatekeeper rejects it ("code has no resources but signature indicates they must be present").
# This script replaces the partial linker-signed signature with a proper ad-hoc one.
set -euo pipefail

APP_DIR="src-tauri/target/release/bundle/macos"
DMG_DIR="src-tauri/target/release/bundle/dmg"

APP=$(find "$APP_DIR" -maxdepth 1 -name "*.app" -type d | head -1)

if [ -z "$APP" ]; then
  echo "No .app found in $APP_DIR — skipping re-sign."
  exit 0
fi

echo "Re-signing: $APP"
codesign --force --deep --sign - "$APP"

# Re-create DMG with the re-signed app
DMG_SRC=$(find "$DMG_DIR" -maxdepth 1 -name "*.dmg" -type f -not -name "*_unsigned*" | head -1)
if [ -n "$DMG_SRC" ]; then
  APP_NAME=$(basename "$APP" .app)
  DMG_NEW="$DMG_DIR/${APP_NAME}_unsigned.dmg"
  echo "Backing up original DMG: $DMG_SRC → $DMG_NEW"
  mv "$DMG_SRC" "$DMG_NEW"
  echo "Creating DMG with re-signed $APP"
  hdiutil create -srcfolder "$APP" -volname "$APP_NAME" -format "UDZO" -ov "$DMG_SRC"
  echo "Done: $DMG_SRC is now re-signed."
else
  echo "No DMG found to re-create — app re-signed in place."
fi
