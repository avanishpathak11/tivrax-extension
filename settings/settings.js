// TivraX Settings Controller
// Handles advanced configuration and monitoring

class TivraXSettings {
  constructor() {
    this.config = {};
    this.logs = [];
    this.profiles = [];
    this.init();
  }

  async init() {
    await this.loadConfig();
    this.setupTabs();
    this.setupEventListeners();
    this.updateUI();
    this.loadLogs();
    this.loadProfiles();
  }

  async loadConfig() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getConfig' });
      if (response) {
        this.config = response;
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

  setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        contents.forEach(content => {
          content.classList.remove('active');
          if (content.id === targetTab) {
            content.classList.add('active');
          }
        });
      });
    });
  }

  setupEventListeners() {
    // Back link
    document.getElementById('backLink').addEventListener('click', (e) => {
      e.preventDefault();
      window.close();
    });

    // General settings
    document.getElementById('injectionMode').addEventListener('change', (e) => {
      this.config.mode = e.target.value;
      this.saveConfig();
    });

    document.getElementById('throttleInput').addEventListener('input', (e) => {
      this.config.throttle = parseInt(e.target.value) || 0;
      this.saveConfig();
    });

    document.getElementById('exclusionsInput').addEventListener('input', (e) => {
      this.config.exclusions = e.target.value.split('\n').filter(line => line.trim());
      this.saveConfig();
    });

    // Advanced settings
    document.getElementById('enableLogging').addEventListener('change', (e) => {
      this.config.enableLogging = e.target.checked;
      this.saveConfig();
    });

    document.getElementById('enableTestMode').addEventListener('change', (e) => {
      this.config.testMode = e.target.checked;
      this.saveConfig();
    });

    // Profile management
    document.getElementById('addProfileBtn').addEventListener('click', () => {
      this.showProfileDialog();
    });

    document.getElementById('loadDefaultProfilesBtn').addEventListener('click', () => {
      this.loadDefaultProfiles();
    });

    // Log management
    document.getElementById('refreshLogsBtn').addEventListener('click', () => {
      this.loadLogs();
    });

    document.getElementById('exportLogsBtn').addEventListener('click', () => {
      this.exportLogs();
    });

    document.getElementById('clearLogsBtn').addEventListener('click', () => {
      this.clearLogs();
    });

    // Config management
    document.getElementById('exportConfigBtn').addEventListener('click', () => {
      this.exportConfig();
    });

    document.getElementById('importConfigBtn').addEventListener('click', () => {
      this.importConfig();
    });

    document.getElementById('resetConfigBtn').addEventListener('click', () => {
      this.resetConfig();
    });
  }

  updateUI() {
    // Update form values
    document.getElementById('injectionMode').value = this.config.mode || 'append';
    document.getElementById('throttleInput').value = this.config.throttle || 0;
    document.getElementById('exclusionsInput').value = (this.config.exclusions || []).join('\n');
    document.getElementById('enableLogging').checked = this.config.enableLogging || false;
    document.getElementById('enableTestMode').checked = this.config.testMode || false;
  }

  async loadLogs() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getLog' });
      this.logs = response || [];
      this.updateLogsUI();
      this.updateStats();
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  }

  updateLogsUI() {
    const container = document.getElementById('logsList');
    container.innerHTML = '';

    if (this.logs.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #718096; padding: 40px;">No injection logs found</div>';
      return;
    }

    // Show recent logs (last 50)
    const recentLogs = this.logs.slice(-50).reverse();
    
    recentLogs.forEach(log => {
      const entry = document.createElement('div');
      entry.className = 'log-entry';
      
      const timestamp = new Date(log.timestamp).toLocaleString();
      
      entry.innerHTML = `
        <div class="log-info">
          <div class="log-url">${log.url}</div>
          <div class="log-details">
            <span class="log-type ${log.type}">${log.type}</span>
            <span>${timestamp}</span>
            <span>•</span>
            <span>Payload: ${log.payload}</span>
          </div>
        </div>
      `;
      
      container.appendChild(entry);
    });
  }

  updateStats() {
    const container = document.getElementById('statsGrid');
    container.innerHTML = '';

    const stats = {
      total: this.logs.length,
      headers: this.logs.filter(log => log.type.includes('headers')).length,
      params: this.logs.filter(log => log.type.includes('params')).length,
      body: this.logs.filter(log => log.type.includes('body')).length,
      today: this.logs.filter(log => {
        const logDate = new Date(log.timestamp).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
      }).length
    };

    const statItems = [
      { number: stats.total, label: 'Total Injections' },
      { number: stats.today, label: 'Today' },
      { number: stats.headers, label: 'Headers' },
      { number: stats.params, label: 'Parameters' },
      { number: stats.body, label: 'Body' }
    ];

    statItems.forEach(stat => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div class="stat-number">${stat.number}</div>
        <div class="stat-label">${stat.label}</div>
      `;
      container.appendChild(card);
    });
  }

  async loadProfiles() {
    try {
      const stored = await chrome.storage.local.get(['tivraxProfiles']);
      this.profiles = stored.tivraxProfiles || [];
      this.updateProfilesUI();
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  }

  updateProfilesUI() {
    const container = document.getElementById('profilesList');
    container.innerHTML = '';

    if (this.profiles.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #718096; padding: 40px;">No payload profiles saved</div>';
      return;
    }

    this.profiles.forEach((profile, index) => {
      const item = document.createElement('div');
      item.className = 'profile-item';
      
      item.innerHTML = `
        <div class="profile-info">
          <div class="profile-name">${profile.name}</div>
          <div class="profile-description">${profile.description}</div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary btn-sm" data-action="load" data-index="${index}">Load</button>
          <button class="btn btn-secondary btn-sm" data-action="edit" data-index="${index}">Edit</button>
          <button class="btn btn-danger btn-sm" data-action="delete" data-index="${index}">Delete</button>
        </div>
      `;

      // Add event listeners
      const loadBtn = item.querySelector('[data-action="load"]');
      loadBtn.addEventListener('click', () => this.loadProfile(index));

      const editBtn = item.querySelector('[data-action="edit"]');
      editBtn.addEventListener('click', () => this.editProfile(index));

      const deleteBtn = item.querySelector('[data-action="delete"]');
      deleteBtn.addEventListener('click', () => this.deleteProfile(index));

      container.appendChild(item);
    });
  }

  showProfileDialog(profile = null, index = null) {
    const name = prompt('Profile name:', profile?.name || '');
    if (!name) return;

    const description = prompt('Profile description:', profile?.description || '');
    const payload = prompt('Payload:', profile?.payload || '');

    if (payload) {
      if (index !== null) {
        // Edit existing profile
        this.profiles[index] = { name, description, payload };
      } else {
        // Add new profile
        this.profiles.push({ name, description, payload });
      }
      
      this.saveProfiles();
      this.updateProfilesUI();
    }
  }

  loadProfile(index) {
    const profile = this.profiles[index];
    if (profile) {
      this.config.payload = profile.payload;
      this.saveConfig();
      this.showNotification(`Loaded profile: ${profile.name}`, 'success');
    }
  }

  editProfile(index) {
    const profile = this.profiles[index];
    if (profile) {
      this.showProfileDialog(profile, index);
    }
  }

  deleteProfile(index) {
    if (confirm('Are you sure you want to delete this profile?')) {
      this.profiles.splice(index, 1);
      this.saveProfiles();
      this.updateProfilesUI();
    }
  }

  async saveProfiles() {
    try {
      await chrome.storage.local.set({ tivraxProfiles: this.profiles });
    } catch (error) {
      console.error('Failed to save profiles:', error);
    }
  }

  loadDefaultProfiles() {
    const defaultProfiles = [
      {
        name: 'XSS Test',
        description: 'Basic XSS payload for testing',
        payload: '<script>alert("XSS")</script>'
      },
      {
        name: 'SQL Injection',
        description: 'Basic SQL injection test',
        payload: "' OR 1=1--"
      },
      {
        name: 'SSRF Test',
        description: 'Server-side request forgery test',
        payload: 'http://{{RANDOM}}.attacker.com'
      },
      {
        name: 'Open Redirect',
        description: 'Open redirect vulnerability test',
        payload: 'https://evil.com/redirect'
      },
      {
        name: 'Template Injection',
        description: 'Server-side template injection',
        payload: '{{7*7}}'
      }
    ];

    this.profiles = defaultProfiles;
    this.saveProfiles();
    this.updateProfilesUI();
    this.showNotification('Default profiles loaded', 'success');
  }

  async exportLogs() {
    try {
      await chrome.runtime.sendMessage({ action: 'exportLog' });
      this.showNotification('Logs exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export logs:', error);
      this.showNotification('Failed to export logs', 'danger');
    }
  }

  async clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
      try {
        await chrome.runtime.sendMessage({ action: 'clearLog' });
        this.logs = [];
        this.updateLogsUI();
        this.updateStats();
        this.showNotification('Logs cleared', 'success');
      } catch (error) {
        console.error('Failed to clear logs:', error);
        this.showNotification('Failed to clear logs', 'danger');
      }
    }
  }

  exportConfig() {
    const configData = {
      config: this.config,
      profiles: this.profiles,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(configData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tivrax_config_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.showNotification('Configuration exported', 'success');
  }

  importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          if (data.config) {
            this.config = { ...this.config, ...data.config };
            await this.saveConfig();
          }
          
          if (data.profiles) {
            this.profiles = data.profiles;
            await this.saveProfiles();
            this.updateProfilesUI();
          }
          
          this.updateUI();
          this.showNotification('Configuration imported', 'success');
        } catch (error) {
          console.error('Failed to import config:', error);
          this.showNotification('Failed to import configuration', 'danger');
        }
      }
    };
    
    input.click();
  }

  async resetConfig() {
    if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
      try {
        await chrome.storage.local.clear();
        this.config = {};
        this.profiles = [];
        this.logs = [];
        
        this.updateUI();
        this.updateProfilesUI();
        this.updateLogsUI();
        this.updateStats();
        
        this.showNotification('All settings reset', 'success');
      } catch (error) {
        console.error('Failed to reset config:', error);
        this.showNotification('Failed to reset settings', 'danger');
      }
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 1000;
      max-width: 400px;
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

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
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

// Initialize settings
document.addEventListener('DOMContentLoaded', () => {
  new TivraXSettings();
}); 