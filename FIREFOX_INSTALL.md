# Firefox Installation Guide

Firefox requires a different manifest version than Chrome. Use the following steps:

## Quick Installation

1. **Download the extension files** from this repository
2. **Rename the manifest file** for Firefox:
   ```bash
   cd tivrax-extension
   cp manifest-firefox.json manifest.json
   ```
3. **Load in Firefox**:
   - Open Firefox
   - Go to `about:debugging`
   - Click "This Firefox" tab
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the tivrax-extension folder

## Alternative: Use the Firefox-specific files

If you want to keep both Chrome and Firefox versions:

1. **For Firefox**: Use `manifest-firefox.json` and `background-firefox.js`
2. **For Chrome**: Use the original `manifest.json` and `background.js`

## Note

- Firefox extensions loaded this way are temporary and will be removed when you restart Firefox
- For permanent installation, you would need to package the extension and submit it to Firefox Add-ons
- The functionality is identical between Chrome and Firefox versions

## Troubleshooting

If you get errors:
1. Make sure you're using `manifest-firefox.json` (not the Chrome version)
2. Ensure all files are in the same directory
3. Check Firefox console for any error messages
4. Try reloading the extension if it stops working 