#!/bin/bash

# LinkedIn Saved Posts Organizer - Package Script
# This script creates a clean ZIP file ready for Chrome Web Store submission

echo "📦 LinkedIn Saved Posts Organizer - Package Builder"
echo "=================================================="
echo ""

# Check if icons exist
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "❌ Error: Icon files not found!"
    echo ""
    echo "Please generate icons first:"
    echo "  1. Open create-icons.html in your browser"
    echo "  2. Download all three icon sizes"
    echo "  3. Save them in the icons/ folder"
    echo ""
    exit 1
fi

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
OUTPUT_FILE="linkedin-organizer-v${VERSION}.zip"

echo "📋 Version: $VERSION"
echo "📄 Output: $OUTPUT_FILE"
echo ""

# Remove old package if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "🗑️  Removing old package..."
    rm "$OUTPUT_FILE"
fi

echo "📁 Creating package..."
echo ""

# Create the ZIP file with only necessary files
zip -r "$OUTPUT_FILE" \
  manifest.json \
  content.js \
  icons/icon16.png \
  icons/icon48.png \
  icons/icon128.png \
  PRIVACY.md \
  -x "*.git*" \
  -x "*.DS_Store" \
  -x "node_modules/*" \
  -x "package.sh" \
  -x "create-icons.html" \
  -x "generate-icons.py" \
  -x "CHROME_STORE_SUBMISSION.md" \
  -x "*.zip"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Package created successfully!"
    echo ""
    echo "📦 File: $OUTPUT_FILE"
    echo "📊 Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
    echo ""
    echo "📋 Package contents:"
    unzip -l "$OUTPUT_FILE"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Test the extension one more time"
    echo "  2. Go to https://chrome.google.com/webstore/devconsole"
    echo "  3. Upload $OUTPUT_FILE"
    echo "  4. Fill in the listing information (see CHROME_STORE_SUBMISSION.md)"
    echo "  5. Submit for review"
    echo ""
    echo "📖 See CHROME_STORE_SUBMISSION.md for detailed instructions"
else
    echo ""
    echo "❌ Error creating package!"
    exit 1
fi
