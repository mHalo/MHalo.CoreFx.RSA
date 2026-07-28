#!/bin/bash
# Re-sign Tauri .app with proper ad-hoc signature that seals resources/Info.plist.
# Tauri's Rust linker only signs the binary (linker-signed), leaving the bundle incomplete —
# Gatekeeper rejects it ("code has no resources but signature indicates they must be present").
# This script extracts the .app from the built DMG, re-signs it, and re-creates the DMG.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle"
DMG_DIR="$BUNDLE_DIR/dmg"
WORK_DIR="$PROJECT_DIR/src-tauri/target/release/bundle/_resign_work"

echo "=== macos-resign.sh ==="

# Find the .app — check macos/ first, then inside DMG
APP=""
if [ -d "$BUNDLE_DIR/macos" ]; then
  APP=$(find "$BUNDLE_DIR/macos" -maxdepth 1 -name "*.app" -type d | head -1)
fi

if [ -z "$APP" ]; then
  echo "No .app in bundle/macos, extracting from DMG..."
  DMG_SRC=$(find "$DMG_DIR" -maxdepth 1 -name "*.dmg" -type f | head -1)
  if [ -z "$DMG_SRC" ]; then
    echo "ERROR: No DMG found in $DMG_DIR"
    ls -la "$DMG_DIR" || true
    exit 1
  fi

  rm -rf "$WORK_DIR"
  mkdir -p "$WORK_DIR"
  echo "Mounting $DMG_SRC"
  hdiutil attach "$DMG_SRC" -mountpoint "$WORK_DIR/mount" -nobrowse -quiet

  APP=$(find "$WORK_DIR/mount" -maxdepth 1 -name "*.app" -type d | head -1)
  if [ -z "$APP" ]; then
    echo "ERROR: No .app found inside DMG"
    ls -la "$WORK_DIR/mount" || true
    hdiutil detach "$WORK_DIR/mount" -quiet 2>/dev/null || true
    exit 1
  fi

  echo "Found in DMG: $(basename "$APP")"
  cp -R "$APP" "$WORK_DIR/app"
  hdiutil detach "$WORK_DIR/mount" -quiet
  APP="$WORK_DIR/app"
else
  echo "Found in macos/: $(basename "$APP")"
fi

# Remove quarantine before re-sign
echo "Removing quarantine attributes..."
xattr -cr "$APP" 2>/dev/null || true

# Re-sign with proper ad-hoc signature (seals Resources/Info.plist)
echo "Re-signing with ad-hoc signature..."
codesign --force --deep --sign - "$APP"
echo "Done."

# Verify signature quality
echo "Verifying signature..."
codesign -dvvv "$APP" 2>&1 | grep -E "Signature|linker|Resources" | head -3

# Locate original DMG and re-create it
DMG_ORIG=$(find "$DMG_DIR" -maxdepth 1 -name "*.dmg" -type f | head -1)
if [ -z "$DMG_ORIG" ]; then
  echo "ERROR: No DMG found to re-create"
  ls -la "$DMG_DIR" || true
  exit 1
fi

APP_NAME=$(basename "$APP" .app)
DMG_BACKUP="${DMG_ORIG%.dmg}_unsigned.dmg"

echo "Backing up: $(basename "$DMG_ORIG") → $(basename "$DMG_BACKUP")"
mv "$DMG_ORIG" "$DMG_BACKUP"

echo "Creating DMG with re-signed app..."
hdiutil create \
  -srcfolder "$APP" \
  -volname "$APP_NAME" \
  -format "UDZO" \
  -fs "HFS+" \
  -ov \
  "$DMG_ORIG" > /dev/null

# Cleanup
rm -rf "$WORK_DIR"

echo "=== Done: $(basename "$DMG_ORIG") re-signed and ready ==="
ls -lh "$DMG_ORIG"
