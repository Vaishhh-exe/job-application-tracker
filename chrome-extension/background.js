/**
 * Meridian Job Saver - Background Service Worker
 * Handles extension lifecycle, messaging, and background tasks
 */

class MeridianBackground {
  constructor() {
    this.init();
  }

  init() {
    // Listen for extension installation/startup
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Listen for action button clicks (when popup can't open)
    chrome.action.onClicked.addListener((tab) => {
      this.handleActionClick(tab);
    });

    // Listen for tab updates to inject content script if needed
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });
  }

  handleInstallation(details) {
    console.log('Meridian Job Saver installed/updated:', details.reason);
    
    if (details.reason === 'install') {
      // First time installation
      this.showWelcomeNotification();
    } else if (details.reason === 'update') {
      // Extension updated
      console.log('Extension updated to version:', chrome.runtime.getManifest().version);
    }
  }

  handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case 'openPopup':
        this.openPopup(sender.tab);
        sendResponse({ success: true });
        break;
        
      case 'getJobData':
        this.getJobDataFromTab(sender.tab.id)
          .then(data => sendResponse({ success: true, data }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        break;
        
      case 'saveJob':
        this.saveJobToMeridian(request.jobData, request.apiToken)
          .then(result => sendResponse({ success: true, result }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        break;
        
      case 'testApiToken':
        this.validateApiToken(request.token)
          .then(valid => sendResponse({ success: true, valid }))
          .catch(error => sendResponse({ success: false, error: error.message }));
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }

  handleActionClick(tab) {
    // This is called when user clicks the extension icon and popup doesn't open
    // (e.g., when not on a compatible page)
    
    if (tab.url.includes('linkedin.com/jobs/')) {
      // On LinkedIn job page - try to open popup
      chrome.action.openPopup();
    } else {
      // Not on LinkedIn - show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Meridian Job Saver',
        message: 'Please navigate to a LinkedIn job listing page to save jobs.'
      });
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Inject content script if on LinkedIn jobs page and tab finished loading
    if (changeInfo.status === 'complete' && 
        tab.url && 
        tab.url.includes('linkedin.com/jobs/')) {
      
      // Content script is already injected via manifest, but we can send a message
      // to re-initialize if needed
      chrome.tabs.sendMessage(tabId, { action: 'reinitialize' }).catch(() => {
        // Ignore errors if content script isn't ready yet
      });
    }
  }

  async openPopup(tab) {
    try {
      // Try to open the popup programmatically
      await chrome.action.openPopup();
    } catch (error) {
      // If popup can't open, create a notification instead
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'Meridian Job Saver',
        message: 'Click the extension icon to open the job saver popup.'
      });
    }
  }

  async getJobDataFromTab(tabId) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: 'extractJobData' });
      return response ? response.jobData : null;
    } catch (error) {
      throw new Error('Could not extract job data from current tab');
    }
  }

  async saveJobToMeridian(jobData, apiToken) {
    const apiUrl = 'https://job-application-tracker-wheat.vercel.app/api/applications';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving job to Meridian:', error);
      throw error;
    }
  }

  async validateApiToken(token) {
    const apiUrl = 'https://job-application-tracker-wheat.vercel.app/api/user';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating API token:', error);
      return false;
    }
  }

  showWelcomeNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'Welcome to Meridian Job Saver!',
      message: 'Navigate to LinkedIn job listings and click the extension icon to get started.'
    });
  }
}

// Initialize background script
const meridianBackground = new MeridianBackground();

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.notifications.clear(notificationId);
});

// Handle storage changes (for debugging/monitoring)
chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log('Storage changed:', changes, namespace);
});