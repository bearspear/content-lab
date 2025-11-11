#!/bin/bash

# Build with specific configuration
# Usage: ./scripts/build-with-config.sh <config-name>
# Example: ./scripts/build-with-config.sh lightweight

CONFIG_NAME=$1

if [ -z "$CONFIG_NAME" ]; then
  echo "Error: Configuration name required"
  echo "Usage: ./scripts/build-with-config.sh <config-name>"
  echo "Available configs: full, lightweight, developer, writer"
  exit 1
fi

# Map config names to files
case "$CONFIG_NAME" in
  "full")
    CONFIG_FILE="feature.config.ts"
    ;;
  "lightweight")
    CONFIG_FILE="configs/lightweight.config.ts"
    ;;
  "developer")
    CONFIG_FILE="configs/developer.config.ts"
    ;;
  "writer")
    CONFIG_FILE="configs/writer.config.ts"
    ;;
  *)
    echo "Error: Unknown configuration '$CONFIG_NAME'"
    echo "Available configs: full, lightweight, developer, writer"
    exit 1
    ;;
esac

echo "📦 Building Content Lab with '$CONFIG_NAME' configuration..."
echo "   Config file: apps/content-lab/src/$CONFIG_FILE"

# Define paths
SOURCE_CONFIG="apps/content-lab/src/$CONFIG_FILE"
TARGET_CONFIG="apps/content-lab/src/feature.config.ts"
BACKUP_CONFIG="apps/content-lab/src/feature.config.backup.ts"
ROUTES_FILE="apps/content-lab/src/app/app.routes.ts"
BACKUP_ROUTES="apps/content-lab/src/app/app.routes.backup.ts"
LOADER_FILE="apps/content-lab/src/app/core/plugin-system/feature-loader.service.ts"
BACKUP_LOADER="apps/content-lab/src/app/core/plugin-system/feature-loader.service.backup.ts"

# Backup current feature.config.ts if it exists
if [ -f "$TARGET_CONFIG" ]; then
  cp "$TARGET_CONFIG" "$BACKUP_CONFIG"
  echo "   ✓ Backed up current feature.config.ts"
fi

# Backup current app.routes.ts
if [ -f "$ROUTES_FILE" ]; then
  cp "$ROUTES_FILE" "$BACKUP_ROUTES"
  echo "   ✓ Backed up current app.routes.ts"
fi

# Backup current feature-loader.service.ts
if [ -f "$LOADER_FILE" ]; then
  cp "$LOADER_FILE" "$BACKUP_LOADER"
  echo "   ✓ Backed up current feature-loader.service.ts"
fi

# Copy the selected config to feature.config.ts
if [ "$CONFIG_NAME" != "full" ]; then
  if [ -f "$SOURCE_CONFIG" ]; then
    # Copy and fix the import path (from ../app to ./app)
    sed "s|from '../app/|from './app/|g" "$SOURCE_CONFIG" > "$TARGET_CONFIG"
    echo "   ✓ Copied $CONFIG_FILE to feature.config.ts (fixed import path)"
  else
    echo "   ❌ Config file not found: $SOURCE_CONFIG"
    exit 1
  fi
fi

# Generate routes based on feature configuration
echo "   Generating routes from feature configuration..."
node scripts/generate-routes.js "$TARGET_CONFIG" "apps/content-lab/src/app/app.routes.ts"

# Build the application (specify project name)
echo "   Building..."
ng build content-lab --configuration production

BUILD_STATUS=$?

# Restore the backups
if [ -f "$BACKUP_CONFIG" ]; then
  mv "$BACKUP_CONFIG" "$TARGET_CONFIG"
  echo "   ✓ Restored original feature.config.ts"
fi

if [ -f "$BACKUP_ROUTES" ]; then
  mv "$BACKUP_ROUTES" "$ROUTES_FILE"
  echo "   ✓ Restored original app.routes.ts"
fi

if [ -f "$BACKUP_LOADER" ]; then
  mv "$BACKUP_LOADER" "$LOADER_FILE"
  echo "   ✓ Restored original feature-loader.service.ts"
fi

if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo ""
  echo "📊 Bundle size:"
  du -sh dist/apps/content-lab/browser
  echo ""
  echo "📁 Output directory: dist/apps/content-lab/browser"
else
  echo "❌ Build failed"
  exit 1
fi
