#!/bin/bash

# TivraX Extension Installation Script
# This script helps install the TivraX browser extension

echo "🔴 TivraX - Payload Injection Tool"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the tivrax-extension directory."
    exit 1
fi

echo "✅ Extension files found!"
echo ""

echo "📋 Installation Instructions:"
echo ""

echo "🌐 For Chrome/Chromium:"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this directory: $(pwd)"
echo "5. The TivraX icon should appear in your toolbar"
echo ""

echo "🦊 For Firefox:"
echo "1. Open Firefox and go to about:debugging"
echo "2. Click 'This Firefox' tab"
echo "3. Click 'Load Temporary Add-on'"
echo "4. Select the manifest.json file from this directory"
echo "5. Note: Extension will be temporary (reload after browser restart)"
echo ""

echo "🔧 After Installation:"
echo "1. Click the TivraX icon in your browser toolbar"
echo "2. Enter your payload and configure settings"
echo "3. Toggle the extension to 'Active'"
echo "4. Browse normally - payloads will be injected automatically"
echo ""

echo "📖 For detailed usage instructions, see README.md"
echo ""

echo "⚠️  IMPORTANT: Only use on systems you own or have permission to test!"
echo ""

read -p "Press Enter to continue..." 