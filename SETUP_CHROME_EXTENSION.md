# Meridian Chrome Extension - Complete Setup Guide

This guide covers setting up both the Chrome Extension and the required API changes to your Next.js app.

## Part 1: Database Migration (Run First!)

### 1. Update Database Schema

The new API token fields have already been added to your Prisma schema. Now you need to apply the migration:

```bash
# Navigate to your project directory
cd d:\projects\job-application-tracker

# Generate and apply the migration
npx prisma migrate dev --name add_api_token_fields

# Generate updated Prisma client
npx prisma generate
```

### 2. Verify Migration

After running the migration, your `User` model now includes:
- `apiToken` - Unique API token for external access
- `apiTokenCreatedAt` - When the token was created

## Part 2: API Token Management

### Generate Your First API Token

1. **Start your Next.js app locally:**
   ```bash
   npm run dev
   ```

2. **Sign in to your app** (http://localhost:3000)

3. **Generate API token via API call:**
   ```bash
   # Using curl (replace with your session cookie)
   curl -X POST http://localhost:3000/api/user \
     -H "Content-Type: application/json" \
     -b "your-session-cookie"
     
   # Or use your browser's dev tools to make the request
   ```

4. **Alternative: Add to Settings Page**
   You can add API token management to your existing settings page with this code:

   ```typescript
   // Add to your Settings component
   const [apiToken, setApiToken] = useState<string | null>(null)
   const [isGenerating, setIsGenerating] = useState(false)

   const generateApiToken = async () => {
     setIsGenerating(true)
     try {
       const response = await fetch('/api/user', { method: 'POST' })
       const data = await response.json()
       if (data.success) {
         setApiToken(data.data.apiToken)
         alert('API token generated! Copy it now - it won\'t be shown again.')
       }
     } catch (error) {
       alert('Error generating API token')
     } finally {
       setIsGenerating(false)
     }
   }

   const revokeApiToken = async () => {
     try {
       const response = await fetch('/api/user?action=revoke-token', { 
         method: 'DELETE' 
       })
       if (response.ok) {
         setApiToken(null)
         alert('API token revoked successfully')
       }
     } catch (error) {
       alert('Error revoking API token')
     }
   }

   // In your JSX:
   <div className="api-token-section">
     <h3>API Access</h3>
     <p>Generate an API token for the Chrome Extension:</p>
     
     {apiToken ? (
       <div>
         <input 
           type="text" 
           value={apiToken} 
           readOnly 
           style={{fontFamily: 'monospace'}}
         />
         <button onClick={() => navigator.clipboard.writeText(apiToken)}>
           Copy Token
         </button>
         <button onClick={revokeApiToken}>Revoke Token</button>
       </div>
     ) : (
       <button onClick={generateApiToken} disabled={isGenerating}>
         {isGenerating ? 'Generating...' : 'Generate API Token'}
       </button>
     )}
   </div>
   ```

## Part 3: Install Chrome Extension

### Method 1: Load as Unpacked Extension

1. **Open Chrome Extensions page:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top-right toggle)

2. **Load the extension:**
   - Click "Load unpacked"
   - Select the `chrome-extension` folder: `d:\projects\job-application-tracker\chrome-extension`

3. **Pin the extension:**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Meridian Job Saver" and click the pin icon

### Method 2: Package Extension (Optional)

If you want to create a .crx file:

```bash
# Install Chrome extension CLI (if not installed)
npm install -g chrome-extension-cli

# Package the extension
chrome-extension-cli pack chrome-extension
```

## Part 4: Configure Extension

### 1. Get Your API Token

- Use the method from Part 2 to generate your API token
- Copy the token (starts with `mrd_`)

### 2. Set Up Extension

1. Navigate to any LinkedIn job page: `https://www.linkedin.com/jobs/view/XXXXXXX`
2. Click the Meridian extension icon in your toolbar
3. Click "⚙️ Settings"
4. Paste your API token in the "Meridian API Token" field
5. Click "Save Token"
6. You should see "Token saved successfully!"

### 3. Test the Extension

#### Method 1: Floating Button
1. Go to a LinkedIn job listing page
2. Look for the floating "➕ Save to Meridian" button on the right side
3. Click it to save the job directly

#### Method 2: Extension Popup
1. On a LinkedIn job page, click the extension icon
2. Review the auto-extracted job details
3. Click "💾 Save to Meridian"

## Part 5: Testing & Verification

### Test API Endpoints

**Test token validation:**
```bash
curl -H "Authorization: Bearer mrd_your_token_here" \
     https://job-application-tracker-wheat.vercel.app/api/user
```

**Test saving a job:**
```bash
curl -X POST https://job-application-tracker-wheat.vercel.app/api/applications \
  -H "Authorization: Bearer mrd_your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "Software Engineer",
    "company": "Test Company",
    "status": "applied",
    "appliedDate": "2026-03-02T00:00:00.000Z",
    "priority": "MEDIUM",
    "tags": ["LinkedIn"]
  }'
```

### Verify in Your App

1. Open your Meridian app: https://job-application-tracker-wheat.vercel.app
2. Check the Applications page - you should see jobs saved from LinkedIn
3. Jobs saved via Chrome Extension will have:
   - Status: "Applied"
   - Priority: "Medium" 
   - Tags: ["LinkedIn", "Employment-Type"]
   - Notes: Include location, job description, etc.

## Part 6: Production Deployment

### Deploy API Changes

```bash
# Build and deploy your Next.js app
npm run build
vercel deploy --prod

# Or push to your Git repository if using automatic deployments
git add .
git commit -m "Add Chrome Extension API support with Bearer token authentication"
git push origin main
```

### Update Extension for Production

In the extension files, the API URL is already set to production:
`https://job-application-tracker-wheat.vercel.app/api`

No changes needed for production use!

## Troubleshooting

### Common Issues

1. **"Invalid API token" error**
   - Regenerate your API token in settings
   - Make sure you copied the complete token (starts with `mrd_`)

2. **Extension not extracting job data**
   - Refresh the LinkedIn page
   - Make sure you're on a job listing page (not search results)
   - Try a different job listing

3. **Database migration failed**
   - Ensure your `DATABASE_URL` is set correctly
   - Check PostgreSQL connection
   - Run `npx prisma db push` as an alternative

4. **Jobs not appearing in your app**
   - Check browser console for errors (F12)
   - Verify API token is valid via `/api/user` endpoint
   - Ensure you're logged into the same account

### Error Logs

Check these locations for debugging:
- **Browser Console**: F12 → Console tab
- **Extension Console**: `chrome://extensions/` → Extension details → "Inspect views: service worker"  
- **Network Tab**: F12 → Network tab (for API calls)

### Chrome Extension Development

**Reload extension after changes:**
1. Go to `chrome://extensions/`
2. Click refresh icon on your extension
3. Refresh any LinkedIn pages where you're testing

**View extension logs:**
- Background script: Extension details → "Inspect views: service worker"
- Content script: Page console (F12)
- Popup: Right-click extension icon → "Inspect popup"

---

## 🎉 You're All Set!

Your Chrome Extension is now ready to save LinkedIn jobs to Meridian with one click! Happy job hunting! 🚀

### Quick Links:
- **Extension folder**: `d:\projects\job-application-tracker\chrome-extension\`
- **LinkedIn jobs**: https://www.linkedin.com/jobs/
- **Meridian app**: https://job-application-tracker-wheat.vercel.app
- **Test API**: GET `/api/user` with Bearer token