/**
 * Meridian Job Saver - Popup Script
 * Handles the popup UI interactions, data extraction, and API communication
 */

class MeridianPopup {
  constructor() {
    this.apiBaseUrl = 'https://job-application-tracker-wheat.vercel.app/api';
    this.init();
  }

  async init() {
    // Load saved API token
    await this.loadApiToken();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Try to extract job data from current tab (if on LinkedIn)
    await this.extractJobDataFromTab();
    
    // Update UI state
    this.updateUIState();
  }

  setupEventListeners() {
    // Save job button
    document.getElementById('saveJobBtn').addEventListener('click', () => this.saveJobToMeridian());
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
    
    // Save token button  
    document.getElementById('saveTokenBtn').addEventListener('click', () => this.saveApiToken());
    
    // Back to job button
    document.getElementById('backToJobBtn').addEventListener('click', () => this.showJobSection());
    
    // Auto-resize textarea
    document.getElementById('jobDescription').addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
    });
  }

  async loadApiToken() {
    try {
      const result = await chrome.storage.sync.get(['meridianApiToken']);
      this.apiToken = result.meridianApiToken || '';
      
      if (this.apiToken) {
        document.getElementById('apiToken').value = this.apiToken;
      }
    } catch (error) {
      console.error('Error loading API token:', error);
    }
  }

  async saveApiToken() {
    const tokenInput = document.getElementById('apiToken');
    const token = tokenInput.value.trim();
    
    if (!token) {
      this.showStatus('Please enter an API token', 'error');
      return;
    }

    try {
      // Test the token by making a test API call
      const response = await fetch(`${this.apiBaseUrl}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Save the token
        await chrome.storage.sync.set({ meridianApiToken: token });
        this.apiToken = token;
        this.showStatus('API token saved successfully!', 'success');
        setTimeout(() => this.showJobSection(), 1500);
      } else {
        this.showStatus('Invalid API token. Please check and try again.', 'error');
      }
    } catch (error) {
      console.error('Error validating API token:', error);
      this.showStatus('Error validating token. Please try again.', 'error');
    }
  }

  async extractJobDataFromTab() {
    try {
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('linkedin.com/jobs/')) {
        this.showStatus('Please navigate to a LinkedIn job listing page', 'info');
        return;
      }

      // Send message to content script to extract job data
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractJobData' });
      
      if (response && response.jobData) {
        this.populateJobForm(response.jobData);
        this.showStatus('Job details extracted successfully!', 'success');
      } else {
        this.showStatus('Could not extract job data. Please fill in manually.', 'warning');
      }
    } catch (error) {
      console.error('Error extracting job data:', error);
      this.showStatus('Error extracting job data. Please fill in manually.', 'warning');
    }
  }

  populateJobForm(jobData) {
    // Populate form fields with extracted data
    if (jobData.title) document.getElementById('jobTitle').value = jobData.title;
    if (jobData.company) document.getElementById('company').value = jobData.company;
    if (jobData.location) document.getElementById('location').value = jobData.location;
    if (jobData.employmentType) document.getElementById('employmentType').value = jobData.employmentType;
    if (jobData.description) document.getElementById('jobDescription').value = jobData.description;
    if (jobData.jobUrl) document.getElementById('jobUrl').value = jobData.jobUrl;
    if (jobData.datePosted) document.getElementById('datePosted').value = jobData.datePosted;
    
    // Auto-resize description textarea
    const descTextarea = document.getElementById('jobDescription');
    descTextarea.style.height = 'auto';
    descTextarea.style.height = descTextarea.scrollHeight + 'px';
  }

  async saveJobToMeridian() {
    if (!this.apiToken) {
      this.showSettings();
      this.showStatus('Please configure your API token first', 'error');
      return;
    }

    const jobData = this.getJobFormData();
    
    if (!this.validateJobData(jobData)) {
      return;
    }

    const saveBtn = document.getElementById('saveJobBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');
    
    // Show loading state
    saveBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
      const response = await fetch(`${this.apiBaseUrl}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const result = await response.json();

      if (response.ok) {
        this.showStatus('Job saved to Meridian successfully! 🎉', 'success');
        // Optionally close popup after success
        setTimeout(() => window.close(), 2000);
      } else {
        console.error('API Error:', result);
        this.showStatus(`Error: ${result.message || 'Failed to save job'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      this.showStatus('Network error. Please check your connection and try again.', 'error');
    } finally {
      // Reset button state
      saveBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  getJobFormData() {
    const formData = {
      role: document.getElementById('jobTitle').value.trim(),
      company: document.getElementById('company').value.trim(),
      status: 'applied', // Default status
      appliedDate: new Date().toISOString(), // Current date
      notes: this.generateJobNotes(),
      jobUrl: document.getElementById('jobUrl').value.trim() || null,
      priority: 'MEDIUM', // Default priority
      tags: this.generateJobTags()
    };

    return formData;
  }

  generateJobNotes() {
    const location = document.getElementById('location').value.trim();
    const employmentType = document.getElementById('employmentType').value;
    const description = document.getElementById('jobDescription').value.trim();
    const datePosted = document.getElementById('datePosted').value;
    
    let notes = '';
    
    if (location) notes += `Location: ${location}\n`;
    if (employmentType) notes += `Type: ${employmentType}\n`;
    if (datePosted) notes += `Date Posted: ${datePosted}\n`;
    if (description) {
      notes += `\nJob Description:\n${description.substring(0, 1500)}${description.length > 1500 ? '...' : ''}`;
    }
    
    return notes || null;
  }

  generateJobTags() {
    const tags = [];
    const employmentType = document.getElementById('employmentType').value;
    
    if (employmentType) tags.push(employmentType);
    tags.push('LinkedIn');
    
    return tags;
  }

  validateJobData(jobData) {
    if (!jobData.role) {
      this.showStatus('Job title is required', 'error');
      document.getElementById('jobTitle').focus();
      return false;
    }
    
    if (!jobData.company) {
      this.showStatus('Company name is required', 'error');
      document.getElementById('company').focus();
      return false;
    }
    
    return true;
  }

  showSettings() {
    document.getElementById('jobSection').style.display = 'none';
    document.getElementById('actionSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'block';
  }

  showJobSection() {
    document.getElementById('settingsSection').style.display = 'none';
    document.getElementById('jobSection').style.display = 'block';
    document.getElementById('actionSection').style.display = 'block';
  }

  updateUIState() {
    // Show appropriate sections based on state
    if (this.apiToken) {
      this.showJobSection();
    } else {
      // If no API token, show a message to configure it
      this.showStatus('Click Settings to configure your API token', 'info');
    }
  }

  showStatus(message, type = 'info') {
    const statusElement = document.getElementById('statusMessage');
    const statusText = document.getElementById('statusText');
    
    statusText.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    // Auto-hide after a delay
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, type === 'success' ? 3000 : 5000);
  }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MeridianPopup();
});