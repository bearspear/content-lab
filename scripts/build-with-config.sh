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
echo "   Config file: src/$CONFIG_FILE"

# Backup current feature.config.ts
cp src/feature.config.ts src/feature.config.backup.ts

# Copy the selected config to feature.config.ts
if [ "$CONFIG_NAME" != "full" ]; then
  cp "src/$CONFIG_FILE" src/feature.config.ts
  echo "   ✓ Copied $CONFIG_FILE to feature.config.ts"
fi

# Build the application
echo "   Building..."
ng build --configuration production

BUILD_STATUS=$?

# Restore the backup
if [ -f src/feature.config.backup.ts ]; then
  mv src/feature.config.backup.ts src/feature.config.ts
  echo "   ✓ Restored original feature.config.ts"
fi

if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ Build completed successfully!"
  echo ""
  echo "📊 Bundle size:"
  du -sh dist/content-lab/browser
  echo ""
  echo "📁 Output directory: dist/content-lab/browser"
else
  echo "❌ Build failed"
  exit 1
fi
