/**
 * Meridian Job Saver - Content Script
 * Extracts job data from LinkedIn job listing pages and adds a floating save button
 */

class LinkedInJobExtractor {
  constructor() {
    this.jobData = null;
    this.floatingButton = null;
    this.init();
  }

  init() {
    // Wait for page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    // Set up message listener for popup requests
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'extractJobData') {
        this.extractJobData();
        sendResponse({ jobData: this.jobData });
      }
    });

    // Extract job data immediately
    this.extractJobData();
    
    // Add floating save button
    this.addFloatingButton();
    
    // Watch for URL changes (LinkedIn is a SPA)
    this.observeUrlChanges();
  }

  extractJobData() {
    try {
      this.jobData = {
        title: this.extractJobTitle(),
        company: this.extractCompany(),
        location: this.extractLocation(),
        description: this.extractDescription(),
        jobUrl: window.location.href,
        datePosted: this.extractDatePosted(),
        employmentType: this.extractEmploymentType()
      };

      console.log('Extracted job data:', this.jobData);
      
      // Update floating button state
      this.updateFloatingButton();
      
      return this.jobData;
    } catch (error) {
      console.error('Error extracting job data:', error);
      return null;
    }
  }

  extractJobTitle() {
    // Try multiple selectors for job title
    const selectors = [
      '[data-job-title]',
      '.job-details-jobs-unified-top-card__job-title h1',
      '.jobs-unified-top-card__job-title h1',
      '[data-test-id="job-title"]',
      '.jobs-details__main-content h1',
      '.job-details-jobs-unified-top-card__job-title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    // Fallback: try to extract from page title
    const pageTitle = document.title;
    if (pageTitle.includes(' - ') && pageTitle.includes('LinkedIn')) {
      return pageTitle.split(' - ')[0].trim();
    }

    return '';
  }

  extractCompany() {
    // Try multiple selectors for company name
    const selectors = [
      '[data-job-company-name]',
      '.job-details-jobs-unified-top-card__company-name a',
      '.jobs-unified-top-card__company-name a',
      '[data-test-id="job-company"]',
      '.jobs-details__main-content .jobs-unified-top-card__company-name',
      '.job-details-jobs-unified-top-card__company-name'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    return '';
  }

  extractLocation() {
    // Try multiple selectors for location
    const selectors = [
      '[data-job-location]',
      '.job-details-jobs-unified-top-card__primary-description-without-tagline',
      '.jobs-unified-top-card__bullet',
      '[data-test-id="job-location"]',
      '.jobs-unified-top-card__primary-description'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        const text = element.textContent.trim();
        // Filter out non-location text (like "Full-time", etc.)
        if (!text.includes('Full-time') && !text.includes('Part-time') && !text.includes('Contract')) {
          return text;
        }
      }
    }

    return '';
  }

  extractDescription() {
    // Try multiple selectors for job description
    const selectors = [
      '.jobs-box__html-content',
      '.jobs-description__content',
      '[data-job-description]',
      '.jobs-description-content__text',
      '.job-view-layout .jobs-box--fadeable .jobs-box__html-content',
      '.jobs-description .jobs-box__html-content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        // Clean up the description text
        let description = element.textContent.trim();
        // Remove extra whitespace and line breaks
        description = description.replace(/\s+/g, ' ').trim();
        // Limit length to prevent overwhelming the form
        if (description.length > 3000) {
          description = description.substring(0, 3000) + '...';
        }
        return description;
      }
    }

    return '';
  }

  extractDatePosted() {
    // Try multiple selectors for date posted
    const selectors = [
      '[data-job-posted-date]',
      '.jobs-unified-top-card__subtitle-secondary-grouping time',
      '.job-details-jobs-unified-top-card__primary-description-container time',
      '.jobs-details__main-content time'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const dateTime = element.getAttribute('datetime');
        if (dateTime) {
          return dateTime.split('T')[0]; // Extract date part only
        }
        
        const textContent = element.textContent.trim();
        if (textContent) {
          // Parse relative dates like "2 days ago"
          const parsedDate = this.parseRelativeDate(textContent);
          if (parsedDate) {
            return parsedDate;
          }
        }
      }
    }

    return '';
  }

  extractEmploymentType() {
    // Try to extract employment type from various locations
    const selectors = [
      '.jobs-unified-top-card__job-insight',
      '.jobs-unified-top-card__bullet',
      '.job-details-jobs-unified-top-card__primary-description-without-tagline'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.trim().toLowerCase();
        if (text.includes('full-time')) return 'Full-time';
        if (text.includes('part-time')) return 'Part-time';
        if (text.includes('contract')) return 'Contract';
        if (text.includes('internship')) return 'Internship';
        if (text.includes('remote')) return 'Remote';
      }
    }

    return '';
  }

  parseRelativeDate(dateText) {
    const now = new Date();
    const text = dateText.toLowerCase();

    if (text.includes('today') || text.includes('less than 24 hours ago')) {
      return now.toISOString().split('T')[0];
    }
    
    if (text.includes('yesterday')) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return yesterday.toISOString().split('T')[0];
    }

    // Match patterns like "2 days ago", "1 week ago", "3 weeks ago"
    const match = text.match(/(\d+)\s+(day|week|month)s?\s+ago/);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2];
      const date = new Date(now);
      
      if (unit === 'day') {
        date.setDate(now.getDate() - amount);
      } else if (unit === 'week') {
        date.setDate(now.getDate() - (amount * 7));
      } else if (unit === 'month') {
        date.setMonth(now.getMonth() - amount);
      }
      
      return date.toISOString().split('T')[0];
    }

    return null;
  }

  addFloatingButton() {
    // Remove existing button if any
    if (this.floatingButton) {
      this.floatingButton.remove();
    }

    // Create floating save button
    this.floatingButton = document.createElement('div');
    this.floatingButton.id = 'meridian-save-btn';
    this.floatingButton.innerHTML = `
      <div class="meridian-floating-btn">
        <span class="meridian-btn-icon">➕</span>
        <span class="meridian-btn-text">Save to Meridian</span>
        <span class="meridian-btn-loading" style="display: none;">⏳</span>
      </div>
    `;

    // Add click handler
    this.floatingButton.addEventListener('click', () => this.saveJobDirectly());

    // Append to body
    document.body.appendChild(this.floatingButton);
  }

  updateFloatingButton() {
    if (this.floatingButton && this.jobData) {
      const hasJobData = this.jobData.title && this.jobData.company;
      this.floatingButton.classList.toggle('meridian-has-data', hasJobData);
      
      if (!hasJobData) {
        this.floatingButton.querySelector('.meridian-btn-text').textContent = 'No job data found';
      } else {
        this.floatingButton.querySelector('.meridian-btn-text').textContent = 'Save to Meridian';
      }
    }
  }

  async saveJobDirectly() {
    if (!this.jobData || !this.jobData.title || !this.jobData.company) {
      this.showNotification('Please ensure you\'re on a LinkedIn job listing page', 'error');
      return;
    }

    // Get API token from storage
    try {
      const result = await chrome.storage.sync.get(['meridianApiToken']);
      const apiToken = result.meridianApiToken;

      if (!apiToken) {
        this.showNotification('Please configure your API token in the extension popup first', 'error');
        // Open extension popup
        chrome.runtime.sendMessage({ action: 'openPopup' });
        return;
      }

      // Show loading state
      const btn = this.floatingButton.querySelector('.meridian-floating-btn');
      const icon = btn.querySelector('.meridian-btn-icon');
      const text = btn.querySelector('.meridian-btn-text');
      const loading = btn.querySelector('.meridian-btn-loading');

      btn.classList.add('meridian-loading');
      icon.style.display = 'none';
      text.style.display = 'none';
      loading.style.display = 'inline';

      // Prepare job data for API
      const jobData = {
        role: this.jobData.title,
        company: this.jobData.company,
        status: 'applied',
        appliedDate: new Date().toISOString(),
        notes: this.generateJobNotes(),
        jobUrl: this.jobData.jobUrl || window.location.href,
        priority: 'MEDIUM',
        tags: this.generateJobTags()
      };

      // Demo mode for testing
      if (apiToken === 'mrd_temp_development_token_123456789abcdef' || 
          apiToken.startsWith('mrd_demo_')) {
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Demo mode - Job data that would be saved:', jobData);
        this.showNotification('✅ Job saved successfully! (Demo Mode)\nCheck console for job data', 'success');
        btn.classList.add('meridian-success');
        return;
      }

      // Send to API
      const response = await fetch('https://job-application-tracker-wheat.vercel.app/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        this.showNotification('Job saved to Meridian successfully! 🎉', 'success');
        btn.classList.add('meridian-success');
      } else {
        const error = await response.json();
        this.showNotification(`Error: ${error.message || 'Failed to save job'}`, 'error');
      }

    } catch (error) {
      console.error('Error saving job:', error);
      
      // Fallback to demo success if API fails
      const jobData = {
        role: this.jobData.title,
        company: this.jobData.company,
        status: 'applied',
        appliedDate: new Date().toISOString(),
        notes: this.generateJobNotes(),
        jobUrl: this.jobData.jobUrl || window.location.href,
        priority: 'MEDIUM',
        tags: this.generateJobTags()
      };
      
      console.log('API failed - Job data for testing:', jobData);
      this.showNotification('⚠️ API unavailable - Job data logged to console for testing', 'info');
    } finally {
      // Reset button state
      const btn = this.floatingButton.querySelector('.meridian-floating-btn');
      const icon = btn.querySelector('.meridian-btn-icon');
      const text = btn.querySelector('.meridian-btn-text');
      const loading = btn.querySelector('.meridian-btn-loading');

      btn.classList.remove('meridian-loading');
      icon.style.display = 'inline';
      text.style.display = 'inline';
      loading.style.display = 'none';

      // Remove success class after delay
      setTimeout(() => {
        btn.classList.remove('meridian-success');
      }, 3000);
    }
  }

  generateJobNotes() {
    let notes = '';
    
    if (this.jobData.location) notes += `Location: ${this.jobData.location}\n`;
    if (this.jobData.employmentType) notes += `Type: ${this.jobData.employmentType}\n`;
    if (this.jobData.datePosted) notes += `Date Posted: ${this.jobData.datePosted}\n`;
    if (this.jobData.description) {
      notes += `\nJob Description:\n${this.jobData.description.substring(0, 1500)}${this.jobData.description.length > 1500 ? '...' : ''}`;
    }
    
    return notes || null;
  }

  generateJobTags() {
    const tags = [];
    
    if (this.jobData.employmentType) tags.push(this.jobData.employmentType);
    tags.push('LinkedIn');
    
    return tags;
  }

  showNotification(message, type = 'info') {
    // Create and show a temporary notification
    const notification = document.createElement('div');
    notification.className = `meridian-notification meridian-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after delay
    setTimeout(() => {
      notification.remove();
    }, type === 'success' ? 3000 : 5000);
  }

  observeUrlChanges() {
    let currentUrl = window.location.href;
    
    // Watch for URL changes using history API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          linkedInExtractor.handleUrlChange();
        }
      }, 100);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          linkedInExtractor.handleUrlChange();
        }
      }, 100);
    };
    
    // Also listen for popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        if (window.location.href !== currentUrl) {
          currentUrl = window.location.href;
          linkedInExtractor.handleUrlChange();
        }
      }, 100);
    });
  }

  handleUrlChange() {
    // Re-extract job data when URL changes
    if (window.location.href.includes('/jobs/')) {
      setTimeout(() => {
        this.extractJobData();
        this.updateFloatingButton();
      }, 1000); // Wait for new content to load
    } else {
      // Remove floating button if not on a job page
      if (this.floatingButton) {
        this.floatingButton.style.display = 'none';
      }
    }
  }
}

// Initialize the extractor
const linkedInExtractor = new LinkedInJobExtractor();