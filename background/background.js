// TivraX Background Service Worker
// Handles HTTP request interception and payload injection

class TivraXInjector {
  constructor() {
    this.config = {
      enabled: false,
      payload: '',
      injectionPoints: {
        headers: true,
        params: true,
        body: true,
        cookies: false
      },
      customHeaders: [],
      domains: [],
      exclusions: [],
      mode: 'append', // 'append' or 'replace'
      throttle: 0,
      testMode: false
    };
    this.requestLog = [];
    this.lastInjectionTime = 0;
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.setupListeners();
    this.setupMessageHandlers();
  }

  async loadConfig() {
    try {
      const stored = await chrome.storage.local.get(['tivraxConfig', 'tivraxLog']);
      if (stored.tivraxConfig) {
        this.config = { ...this.config, ...stored.tivraxConfig };
      }
      if (stored.tivraxLog) {
        this.requestLog = stored.tivraxLog;
      }
    } catch (error) {
      console.error('TivraX: Failed to load config:', error);
    }
  }

  async saveConfig() {
    try {
      await chrome.storage.local.set({
        tivraxConfig: this.config,
        tivraxLog: this.requestLog.slice(-1000) // Keep last 1000 entries
      });
    } catch (error) {
      console.error('TivraX: Failed to save config:', error);
    }
  }

  setupListeners() {
    // Intercept headers
    chrome.webRequest.onBeforeSendHeaders.addListener(
      this.handleHeaders.bind(this),
      { urls: ['<all_urls>'] },
      ['blocking', 'requestHeaders']
    );

    // Intercept request body and parameters
    chrome.webRequest.onBeforeRequest.addListener(
      this.handleRequest.bind(this),
      { urls: ['<all_urls>'] },
      ['blocking', 'requestBody']
    );
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'getConfig':
          sendResponse(this.config);
          break;
        case 'updateConfig':
          this.config = { ...this.config, ...message.config };
          this.saveConfig();
          sendResponse({ success: true });
          break;
        case 'getLog':
          sendResponse(this.requestLog);
          break;
        case 'clearLog':
          this.requestLog = [];
          this.saveConfig();
          sendResponse({ success: true });
          break;
        case 'exportLog':
          this.exportLog();
          break;
        case 'testMode':
          this.config.testMode = message.enabled;
          this.saveConfig();
          sendResponse({ success: true });
          break;
      }
      return true;
    });
  }

  shouldInject(url) {
    if (!this.config.enabled) return false;
    
    // Check throttle
    if (this.config.throttle > 0) {
      const now = Date.now();
      if (now - this.lastInjectionTime < this.config.throttle) {
        return false;
      }
      this.lastInjectionTime = now;
    }

    // Check domain scope
    if (this.config.domains.length > 0) {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const matches = this.config.domains.some(pattern => {
        try {
          return new RegExp(pattern).test(domain);
        } catch {
          return domain.includes(pattern);
        }
      });
      if (!matches) return false;
    }

    // Check exclusions
    if (this.config.exclusions.length > 0) {
      const matches = this.config.exclusions.some(pattern => {
        try {
          return new RegExp(pattern).test(url);
        } catch {
          return url.includes(pattern);
        }
      });
      if (matches) return false;
    }

    return true;
  }

  processPayload(payload, context = '') {
    if (!payload) return payload;
    
    let processed = payload;
    
    // Replace dynamic tokens
    processed = processed.replace(/\{\{RANDOM\}\}/g, Math.random().toString(36).substring(2, 15));
    processed = processed.replace(/\{\{TIMESTAMP\}\}/g, Date.now().toString());
    processed = processed.replace(/\{\{DATE\}\}/g, new Date().toISOString());
    
    // URL encode for parameters
    if (context === 'params') {
      processed = encodeURIComponent(processed);
    }
    
    // JSON escape for JSON bodies
    if (context === 'json') {
      processed = JSON.stringify(processed).slice(1, -1);
    }
    
    return processed;
  }

  handleHeaders(details) {
    if (!this.shouldInject(details.url) || !this.config.injectionPoints.headers) {
      return { requestHeaders: details.requestHeaders };
    }

    const processedPayload = this.processPayload(this.config.payload);
    const modifiedHeaders = [...details.requestHeaders];

    // Inject into custom headers
    for (const header of this.config.customHeaders) {
      if (header.enabled && header.name) {
        const existingIndex = modifiedHeaders.findIndex(h => 
          h.name.toLowerCase() === header.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          if (this.config.mode === 'append') {
            modifiedHeaders[existingIndex].value += processedPayload;
          } else {
            modifiedHeaders[existingIndex].value = processedPayload;
          }
        } else {
          modifiedHeaders.push({
            name: header.name,
            value: processedPayload
          });
        }
      }
    }

    this.logRequest(details.url, 'headers', processedPayload);
    return { requestHeaders: modifiedHeaders };
  }

  handleRequest(details) {
    if (!this.shouldInject(details.url)) {
      return { requestBody: details.requestBody };
    }

    let modifiedBody = details.requestBody;
    const processedPayload = this.processPayload(this.config.payload);

    // Handle URL parameters
    if (this.config.injectionPoints.params && details.method === 'GET') {
      const url = new URL(details.url);
      const params = url.searchParams;
      
      // Add payload to existing parameters or create new one
      if (this.config.mode === 'append') {
        params.append('tivrax_payload', processedPayload);
      } else {
        params.set('tivrax_payload', processedPayload);
      }
      
      url.search = params.toString();
      this.logRequest(url.toString(), 'params', processedPayload);
      return { redirectUrl: url.toString() };
    }

    // Handle POST body
    if (this.config.injectionPoints.body && details.requestBody) {
      const body = details.requestBody;
      
      if (body.raw) {
        const decoder = new TextDecoder('utf-8');
        let bodyText = decoder.decode(body.raw[0].bytes);
        
        // Check if it's JSON
        try {
          const jsonData = JSON.parse(bodyText);
          if (this.config.mode === 'append') {
            jsonData.tivrax_payload = processedPayload;
          } else {
            jsonData = { tivrax_payload: processedPayload };
          }
          bodyText = JSON.stringify(jsonData);
          this.logRequest(details.url, 'body_json', processedPayload);
        } catch {
          // URL-encoded form data
          if (this.config.mode === 'append') {
            bodyText += `&tivrax_payload=${encodeURIComponent(processedPayload)}`;
          } else {
            bodyText = `tivrax_payload=${encodeURIComponent(processedPayload)}`;
          }
          this.logRequest(details.url, 'body_form', processedPayload);
        }
        
        const encoder = new TextEncoder();
        body.raw[0].bytes = encoder.encode(bodyText);
      }
    }

    return { requestBody: modifiedBody };
  }

  logRequest(url, type, payload) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      url: url,
      type: type,
      payload: payload,
      userAgent: navigator.userAgent
    };
    
    this.requestLog.push(logEntry);
    this.saveConfig();
    
    // Notify content script for test mode highlighting
    if (this.config.testMode) {
      chrome.tabs.query({ url: url }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'highlightInjection',
            data: logEntry
          }).catch(() => {}); // Ignore errors for inactive tabs
        });
      });
    }
  }

  async exportLog() {
    const csv = this.requestLog.map(entry => 
      `${entry.timestamp},${entry.url},${entry.type},${entry.payload}`
    ).join('\n');
    
    const blob = new Blob([`timestamp,url,type,payload\n${csv}`], { 
      type: 'text/csv' 
    });
    
    const url = URL.createObjectURL(blob);
    await chrome.downloads.download({
      url: url,
      filename: `tivrax_log_${new Date().toISOString().split('T')[0]}.csv`
    });
  }
}

// Initialize the injector
const tivrax = new TivraXInjector(); 