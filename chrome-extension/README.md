# Meridian Job Saver - Chrome Extension

A Chrome extension to save LinkedIn job listings directly to your Meridian job application tracker with one click.

## Features

- 🔍 **Auto-Extract Job Data** - Automatically extracts job title, company, location, description, and more from LinkedIn job pages
- ⚡ **One-Click Save** - Floating save button directly on LinkedIn job pages  
- 🔐 **Secure API Integration** - Uses your Meridian API token for secure authentication
- 📱 **Clean Popup Interface** - Review and edit job details before saving
- 🎯 **Smart Detection** - Only activates on LinkedIn job listing pages
- 💾 **Persistent Settings** - Your API token is securely stored and remembered

## Installation Instructions

### Load as Unpacked Extension (Development)

1. **Download the Extension**
   - Save all the extension files to a folder on your computer (e.g., `meridian-chrome-extension/`)

2. **Open Chrome Extension Management**
   - Open Chrome and go to `chrome://extensions/`
   - Or click the three-dot menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Navigate to your extension folder and select it
   - The extension should now appear in your extensions list

5. **Pin the Extension (Recommended)**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Meridian Job Saver" and click the pin icon
   - The extension icon will now appear in your toolbar

## Setup & Configuration

### 1. Get Your Meridian API Token

1. Go to your Meridian app: https://job-application-tracker-wheat.vercel.app
2. Sign in to your account
3. Navigate to **Settings** → **API Access** 
4. Generate a new API token (copy it securely)

### 2. Configure the Extension

1. Click the Meridian extension icon in your browser toolbar
2. Click "⚙️ Settings" 
3. Paste your API token in the "Meridian API Token" field
4. Click "Save Token"
5. You should see a "Token saved successfully!" message

## How to Use

### Method 1: Floating Save Button (Easiest)

1. Navigate to any LinkedIn job listing page (`https://www.linkedin.com/jobs/*`)
2. The extension will automatically extract job details
3. Look for the **"➕ Save to Meridian"** floating button on the right side
4. Click the button to save the job directly to your Meridian tracker
5. You'll see a confirmation notification when the job is saved

### Method 2: Extension Popup

1. Navigate to any LinkedIn job listing page
2. Click the Meridian extension icon in your toolbar
3. Review the pre-filled job details (edit if needed)
4. Click **"💾 Save to Meridian"**
5. Wait for confirmation message

## Extracted Data Fields

The extension automatically extracts:

- ✅ **Job Title** - From page heading
- ✅ **Company Name** - From company information
- ✅ **Location** - Job location details  
- ✅ **Employment Type** - Full-time, Part-time, Contract, etc.
- ✅ **Job Description** - Full job posting content
- ✅ **Job URL** - Current LinkedIn page URL
- ✅ **Date Posted** - When the job was posted (if available)

Additional data added:
- **Status**: Set to "Applied" by default
- **Priority**: Set to "Medium" by default  
- **Tags**: Includes employment type and "LinkedIn"
- **Applied Date**: Current date/time

## Troubleshooting

### Extension Not Working

1. **Check if you're on LinkedIn**: Extension only works on `https://www.linkedin.com/jobs/*` URLs
2. **Refresh the page**: Try refreshing the LinkedIn job page
3. **Check API token**: Ensure your API token is correctly configured in Settings

### Job Data Not Extracting

1. **Wait for page to load**: LinkedIn pages load dynamically, wait a few seconds
2. **Try a different job listing**: Some job pages may have different layouts
3. **Fill manually**: You can always edit the fields manually in the popup

### Save Button Not Appearing

1. **Check URL**: Ensure you're on a job listing page (not search results)
2. **Refresh extension**: Disable and re-enable the extension
3. **Check console**: Press F12 and check for JavaScript errors

### API Errors

1. **Invalid token**: Re-generate your API token in Meridian settings
2. **Network issues**: Check your internet connection
3. **Server issues**: The Meridian API may be temporarily unavailable

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup interface
├── popup.js              # Popup logic and API communication
├── content.js            # LinkedIn page integration and data extraction
├── background.js         # Background service worker  
├── styles.css            # Extension styling
└── README.md             # This file
```

## Development

### Required Files

- **manifest.json** - Extension manifest (Manifest V3)
- **popup.html/popup.js** - Extension popup interface
- **content.js** - Content script for LinkedIn integration
- **background.js** - Service worker for background tasks
- **styles.css** - Styling for popup and injected elements

### Technologies Used

- **Manifest V3** - Latest Chrome extension format
- **Vanilla JavaScript** - No external frameworks
- **Chrome Extensions API** - Storage, tabs, messaging
- **Fetch API** - HTTP requests to Meridian API

### Testing

1. Test on various LinkedIn job pages
2. Test with/without API token configured
3. Test error scenarios (network failures, invalid tokens)
4. Test popup functionality and data extraction

## Privacy & Security

- 🔒 **API tokens are stored locally** using `chrome.storage.sync`
- 🔒 **No data is sent to third parties** except your Meridian app
- 🔒 **Only activates on LinkedIn job pages**
- 🔒 **Uses HTTPS for all API communications**

## Support

If you encounter issues:

1. Check the browser console for error messages (F12)
2. Verify your API token is valid in Meridian settings
3. Ensure you're using the latest version of Chrome
4. Try disabling and re-enabling the extension

---

**Happy job hunting! 🚀**