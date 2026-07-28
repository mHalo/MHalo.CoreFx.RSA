#!/bin/bash
# Re-sign Tauri .app with proper ad-hoc signature that seals resources/Info.plist.
# Tauri's Rust linker only signs the binary, leaving the bundle incomplete —
# Gatekeeper rejects it ("code has no resources but signature indicates they must be present").
# This script replaces the partial linker-signed signature with a proper ad-hoc one,
# then replaces the DMG with the re-signed app.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_DIR/src-tauri/target/release/bundle/macos"
DMG_DIR="$PROJECT_DIR/src-tauri/target/release/bundle/dmg"

echo "=== macos-resign.sh ==="
echo "APP_DIR: $APP_DIR"
echo "DMG_DIR: $DMG_DIR"

# Find the .app
APP=$(find "$APP_DIR" -maxdepth 1 -name "*.app" -type d | head -1)
if [ -z "$APP" ]; then
  echo "ERROR: No .app found in $APP_DIR"
  ls -la "$APP_DIR" || true
  exit 1
fi
echo "Found app: $APP"

# Remove quarantine attribute
echo "Removing quarantine attribute..."
xattr -cr "$APP" 2>/dev/null || true

# Re-sign with proper ad-hoc signature
echo "Re-signing with ad-hoc signature..."
codesign --force --deep --sign - "$APP"
echo "  Done re-signing."

# Verify the new signature
echo "Verifying new signature..."
codesign -dvvv "$APP" 2>&1 | grep -E "Signature|Resources|linker" || true

# Locate the original DMG
DMG_ORIG=$(find "$DMG_DIR" -maxdepth 1 -name "*.dmg" -type f | grep -v "_unsigned" | head -1)
if [ -z "$DMG_ORIG" ]; then
  echo "ERROR: No DMG found in $DMG_DIR"
  ls -la "$DMG_DIR" || true
  exit 1
fi

APP_NAME=$(basename "$APP" .app)
echo "Original DMG:  $DMG_ORIG"
echo "App name:      $APP_NAME"

# Back up the original DMG
DMG_BACKUP="${DMG_ORIG%.dmg}_unsigned.dmg"
echo "Backing up:    $DMG_ORIG → $DMG_BACKUP"
mv "$DMG_ORIG" "$DMG_BACKUP"

# Re-create DMG with the re-signed .app
# Use -fs HFS+ to avoid APFS which can cause issues on older macOS
echo "Creating DMG with re-signed app..."
hdiutil create \
  -srcfolder "$APP" \
  -volname "$APP_NAME" \
  -format "UDZO" \
  -fs "HFS+" \
  -ov \
  "$DMG_ORIG"

echo "=== Done: $DMG_ORIG is now re-signed ==="
ls -lh "$DMG_ORIG"
