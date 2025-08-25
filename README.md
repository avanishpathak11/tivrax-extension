# TivraX - Payload Injection Tool

A powerful browser extension for real-time payload injection during security testing and penetration testing activities.

## Features

### Core Functionality
- **Real-time Payload Injection**: Automatically inject custom payloads into HTTP requests
- **Multiple Injection Points**: Headers, query parameters, POST bodies, and cookies
- **Custom Headers**: Add and manage custom HTTP headers for injection
- **Domain Scoping**: Target specific domains or use regex patterns
- **Exclusion Patterns**: Exclude specific URLs or patterns from injection
- **Append/Replace Modes**: Choose between appending to existing values or replacing them

### Advanced Features
- **Dynamic Tokens**: Use `{{RANDOM}}`, `{{TIMESTAMP}}`, and `{{DATE}}` in payloads
- **Payload Profiles**: Save and switch between different payload configurations
- **Request Logging**: Track all injection attempts with detailed logs
- **Test Mode**: Visual highlighting when injection occurs
- **Throttle Control**: Prevent request flooding with configurable delays
- **Export/Import**: Backup and restore configurations

### Security Testing Payloads
Pre-configured profiles for common security tests:
- XSS (Cross-Site Scripting)
- SQL Injection
- SSRF (Server-Side Request Forgery)
- Open Redirect
- Template Injection

## Installation

### Chrome/Chromium
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `tivrax-extension` folder
5. The TivraX icon should appear in your browser toolbar

### Firefox
1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on" and select the `manifest.json` file
5. The extension will be loaded temporarily (reload after browser restart)

## Usage

### Basic Setup
1. Click the TivraX icon in your browser toolbar
2. Enter your payload in the "Injection Payload" field
3. Select which injection points to enable (headers, params, body, cookies)
4. Toggle the main switch to "Active"
5. Browse normally - payloads will be automatically injected

### Custom Headers
1. In the "Custom Headers" section, enter a header name (e.g., `X-Forwarded-For`)
2. Click "Add" to add it to your list
3. Enable/disable individual headers as needed
4. Headers will be injected with your payload

### Domain Scoping
1. Add domains or regex patterns in the "Domain Scope" section
2. Leave empty to inject everywhere
3. Examples:
   - `example.com` - exact domain match
   - `.*\.example\.com` - all subdomains
   - `test.*` - domains starting with "test"

### Advanced Configuration
1. Click "Settings" in the popup footer
2. Configure injection mode (append/replace)
3. Set throttle settings to avoid flooding
4. Add exclusion patterns for URLs to ignore
5. Manage payload profiles
6. View request logs and statistics

## Configuration Options

### Injection Points
- **Headers**: Inject into HTTP request headers
- **Parameters**: Add payload to URL query parameters
- **Body**: Inject into POST request bodies (form data and JSON)
- **Cookies**: Inject into request cookies

### Dynamic Tokens
- `{{RANDOM}}`: Generates a random string
- `{{TIMESTAMP}}`: Current Unix timestamp
- `{{DATE}}`: Current ISO date string

### Throttle Settings
- Set minimum time between injections (in milliseconds)
- Prevents overwhelming target applications
- 0 = no throttle (inject on every request)

### Test Mode
- Visual highlighting when injection occurs
- Floating indicator showing injection count
- Console logging for debugging

## Payload Profiles

### Default Profiles
The extension includes pre-configured profiles for common security tests:

1. **XSS Test**: `<script>alert("XSS")</script>`
2. **SQL Injection**: `' OR 1=1--`
3. **SSRF Test**: `http://{{RANDOM}}.attacker.com`
4. **Open Redirect**: `https://evil.com/redirect`
5. **Template Injection**: `{{7*7}}`

### Creating Custom Profiles
1. Go to Settings → Payload Profiles
2. Click "Add Profile"
3. Enter name, description, and payload
4. Save and use as needed

## Request Logging

### Viewing Logs
1. Open Settings → Request Logs
2. View statistics and recent injections
3. Export logs as CSV for analysis
4. Clear logs when needed

### Log Information
Each log entry includes:
- Timestamp
- Target URL
- Injection type (headers/params/body)
- Payload used
- User agent

## Security Considerations

### Legal Use
- Only use on systems you own or have explicit permission to test
- Respect rate limits and terms of service
- Do not use for malicious purposes

### Best Practices
- Use domain scoping to limit injection scope
- Enable throttling to avoid overwhelming targets
- Use exclusion patterns for sensitive endpoints
- Monitor logs for unexpected behavior

## Troubleshooting

### Extension Not Working
1. Check if the extension is enabled
2. Verify permissions are granted
3. Check browser console for errors
4. Ensure target domains are in scope

### No Injections Detected
1. Verify the main toggle is "Active"
2. Check injection point settings
3. Ensure payload is not empty
4. Verify domain scoping settings

### Performance Issues
1. Increase throttle settings
2. Reduce domain scope
3. Add exclusion patterns
4. Disable unnecessary injection points

## Development

### File Structure
```
tivrax-extension/
├── manifest.json          # Extension manifest
├── background/
│   └── background.js      # Service worker
├── popup/
│   ├── popup.html        # Popup UI
│   └── popup.js          # Popup logic
├── content/
│   └── content.js        # Content script
├── settings/
│   ├── settings.html     # Settings page
│   └── settings.js       # Settings logic
├── assets/
│   ├── icon16.png        # Extension icons
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Building
1. Make changes to source files
2. Reload the extension in browser
3. Test functionality
4. Update version in `manifest.json` if needed

## License

This project is for educational and authorized security testing purposes only. Users are responsible for ensuring they have proper authorization before using this tool.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify configuration settings
4. Create an issue with detailed information

---

**Disclaimer**: This tool is designed for security testing and penetration testing. Users must ensure they have proper authorization before testing any systems. The developers are not responsible for any misuse of this tool. 