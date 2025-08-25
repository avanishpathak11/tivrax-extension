// TivraX Popup Controller
// Handles UI interactions and configuration management

class TivraXPopup {
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
      mode: 'append',
      throttle: 0,
      testMode: false
    };
    
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadConfig() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
      if (response) {
        this.config = { ...this.config, ...response };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  async saveConfig() {
    try {
      await chrome.runtime.sendMessage({
        action: 'updateConfig',
        config: this.config
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  setupEventListeners() {
    // Main toggle
    document.getElementById('mainToggle').addEventListener('click', () => {
      this.config.enabled = !this.config.enabled;
      this.updateUI();
      this.saveConfig();
    });

    // Payload input
    document.getElementById('payloadInput').addEventListener('input', (e) => {
      this.config.payload = e.target.value;
      this.saveConfig();
    });

    // Injection points toggles
    document.getElementById('headersToggle').addEventListener('change', (e) => {
      this.config.injectionPoints.headers = e.target.checked;
      this.saveConfig();
    });

    document.getElementById('paramsToggle').addEventListener('change', (e) => {
      this.config.injectionPoints.params = e.target.checked;
      this.saveConfig();
    });

    document.getElementById('bodyToggle').addEventListener('change', (e) => {
      this.config.injectionPoints.body = e.target.checked;
      this.saveConfig();
    });

    document.getElementById('cookiesToggle').addEventListener('change', (e) => {
      this.config.injectionPoints.cookies = e.target.checked;
      this.saveConfig();
    });

    // Add header
    document.getElementById('addHeaderBtn').addEventListener('click', () => {
      this.addCustomHeader();
    });

    document.getElementById('headerNameInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addCustomHeader();
      }
    });

    // Add domain
    document.getElementById('addDomainBtn').addEventListener('click', () => {
      this.addDomain();
    });

    document.getElementById('domainInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addDomain();
      }
    });

    // Quick actions
    document.getElementById('testModeBtn').addEventListener('click', () => {
      this.toggleTestMode();
    });

    document.getElementById('clearLogBtn').addEventListener('click', () => {
      this.clearLog();
    });

    document.getElementById('exportLogBtn').addEventListener('click', () => {
      this.exportLog();
    });

    // Settings link
    document.getElementById('settingsLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.openSettings();
    });
  }

  updateUI() {
    // Update status
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const mainToggle = document.getElementById('mainToggle');

    if (this.config.enabled) {
      statusDot.classList.add('active');
      statusText.textContent = 'Active';
      mainToggle.classList.add('active');
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'Disabled';
      mainToggle.classList.remove('active');
    }

    // Update payload
    document.getElementById('payloadInput').value = this.config.payload;

    // Update injection points
    document.getElementById('headersToggle').checked = this.config.injectionPoints.headers;
    document.getElementById('paramsToggle').checked = this.config.injectionPoints.params;
    document.getElementById('bodyToggle').checked = this.config.injectionPoints.body;
    document.getElementById('cookiesToggle').checked = this.config.injectionPoints.cookies;

    // Update custom headers
    this.updateHeadersList();

    // Update domains
    this.updateDomainsList();

    // Update test mode button
    const testModeBtn = document.getElementById('testModeBtn');
    if (this.config.testMode) {
      testModeBtn.textContent = 'Test Mode: ON';
      testModeBtn.classList.add('btn-primary');
      testModeBtn.classList.remove('btn-secondary');
    } else {
      testModeBtn.textContent = 'Test Mode';
      testModeBtn.classList.remove('btn-primary');
      testModeBtn.classList.add('btn-secondary');
    }
  }

  addCustomHeader() {
    const input = document.getElementById('headerNameInput');
    const headerName = input.value.trim();
    
    if (headerName) {
      // Check if header already exists
      const exists = this.config.customHeaders.some(h => 
        h.name.toLowerCase() === headerName.toLowerCase()
      );
      
      if (!exists) {
        this.config.customHeaders.push({
          name: headerName,
          enabled: true
        });
        
        this.updateHeadersList();
        this.saveConfig();
        input.value = '';
      } else {
        this.showNotification('Header already exists', 'warning');
      }
    }
  }

  updateHeadersList() {
    const container = document.getElementById('headersList');
    container.innerHTML = '';

    if (this.config.customHeaders.length === 0) {
      container.innerHTML = '<div style="color: #718096; font-size: 12px; text-align: center; padding: 8px;">No custom headers added</div>';
      return;
    }

    this.config.customHeaders.forEach((header, index) => {
      const item = document.createElement('div');
      item.className = 'header-item';
      
      item.innerHTML = `
        <input type="checkbox" class="checkbox" ${header.enabled ? 'checked' : ''}>
        <span style="flex: 1; font-size: 13px;">${header.name}</span>
        <button class="btn btn-danger btn-sm" data-index="${index}">Remove</button>
      `;

      // Add event listeners
      const checkbox = item.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', (e) => {
        this.config.customHeaders[index].enabled = e.target.checked;
        this.saveConfig();
      });

      const removeBtn = item.querySelector('button');
      removeBtn.addEventListener('click', () => {
        this.config.customHeaders.splice(index, 1);
        this.updateHeadersList();
        this.saveConfig();
      });

      container.appendChild(item);
    });
  }

  addDomain() {
    const input = document.getElementById('domainInput');
    const domain = input.value.trim();
    
    if (domain) {
      // Check if domain already exists
      const exists = this.config.domains.includes(domain);
      
      if (!exists) {
        this.config.domains.push(domain);
        this.updateDomainsList();
        this.saveConfig();
        input.value = '';
      } else {
        this.showNotification('Domain already exists', 'warning');
      }
    }
  }

  updateDomainsList() {
    const container = document.getElementById('domainsList');
    container.innerHTML = '';

    if (this.config.domains.length === 0) {
      container.innerHTML = '<div style="color: #718096; font-size: 12px; text-align: center; padding: 8px;">No domains specified (injects everywhere)</div>';
      return;
    }

    this.config.domains.forEach((domain, index) => {
      const item = document.createElement('div');
      item.className = 'domain-item';
      
      item.innerHTML = `
        <span style="font-size: 13px;">${domain}</span>
        <button class="btn btn-danger btn-sm" data-index="${index}">Remove</button>
      `;

      const removeBtn = item.querySelector('button');
      removeBtn.addEventListener('click', () => {
        this.config.domains.splice(index, 1);
        this.updateDomainsList();
        this.saveConfig();
      });

      container.appendChild(item);
    });
  }

  async toggleTestMode() {
    this.config.testMode = !this.config.testMode;
    
    try {
      await chrome.runtime.sendMessage({
        action: 'testMode',
        enabled: this.config.testMode
      });
      
      this.updateUI();
      this.saveConfig();
      
      const message = this.config.testMode ? 
        'Test mode enabled - pages will be highlighted when injection occurs' : 
        'Test mode disabled';
      this.showNotification(message, 'success');
    } catch (error) {
      console.error('Failed to toggle test mode:', error);
      this.showNotification('Failed to toggle test mode', 'danger');
    }
  }

  async clearLog() {
    if (confirm('Are you sure you want to clear the request log?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearLog' });
        this.showNotification('Request log cleared', 'success');
      } catch (error) {
        console.error('Failed to clear log:', error);
        this.showNotification('Failed to clear log', 'danger');
      }
    }
  }

  async exportLog() {
    try {
      await chrome.runtime.sendMessage({ action: 'exportLog' });
      this.showNotification('Log exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export log:', error);
      this.showNotification('Failed to export log', 'danger');
    }
  }

  openSettings() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('settings/settings.html')
    });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease;
    `;

    // Set background color based on type
    switch (type) {
      case 'success':
        notification.style.background = '#38a169';
        break;
      case 'warning':
        notification.style.background = '#d69e2e';
        break;
      case 'danger':
        notification.style.background = '#e53e3e';
        break;
      default:
        notification.style.background = '#4299e1';
    }

    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new TivraXPopup();
}); 