// TivraX Content Script
// Handles test mode highlighting and visual feedback

class TivraXContent {
  constructor() {
    this.injectionCount = 0;
    this.highlightElements = [];
    this.init();
  }

  init() {
    this.setupMessageListener();
    this.createInjectionIndicator();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'highlightInjection') {
        this.highlightInjection(message.data);
      }
    });
  }

  createInjectionIndicator() {
    // Create floating indicator
    const indicator = document.createElement('div');
    indicator.id = 'tivrax-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      display: none;
      animation: tivraxPulse 2s infinite;
    `;
    
    indicator.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 8px; height: 8px; background: #38a169; border-radius: 50%;"></div>
        <span>TivraX: Injection Detected</span>
      </div>
      <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">
        Count: <span id="tivrax-count">0</span>
      </div>
    `;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes tivraxPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .tivrax-highlight {
        outline: 3px solid #667eea !important;
        outline-offset: 2px !important;
        animation: tivraxHighlight 3s ease-in-out !important;
      }
      
      @keyframes tivraxHighlight {
        0% { outline-color: #667eea; }
        50% { outline-color: #f56565; }
        100% { outline-color: #667eea; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);
  }

  highlightInjection(data) {
    this.injectionCount++;
    
    // Update indicator
    const indicator = document.getElementById('tivrax-indicator');
    const countElement = document.getElementById('tivrax-count');
    
    if (indicator && countElement) {
      countElement.textContent = this.injectionCount;
      indicator.style.display = 'block';
      
      // Hide after 5 seconds
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 5000);
    }

    // Highlight the page
    this.highlightPage(data);
    
    // Log to console
    console.log('🔴 TivraX Injection Detected:', {
      url: data.url,
      type: data.type,
      payload: data.payload,
      timestamp: data.timestamp
    });
  }

  highlightPage(data) {
    // Remove previous highlights
    this.clearHighlights();
    
    // Add highlight to body
    document.body.classList.add('tivrax-highlight');
    this.highlightElements.push(document.body);
    
    // Highlight forms if it's a form submission
    if (data.type.includes('body')) {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.classList.add('tivrax-highlight');
        this.highlightElements.push(form);
      });
    }
    
    // Highlight input fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.classList.add('tivrax-highlight');
      this.highlightElements.push(input);
    });
    
    // Remove highlights after 3 seconds
    setTimeout(() => {
      this.clearHighlights();
    }, 3000);
  }

  clearHighlights() {
    this.highlightElements.forEach(element => {
      element.classList.remove('tivrax-highlight');
    });
    this.highlightElements = [];
  }
}

// Initialize content script
new TivraXContent(); 