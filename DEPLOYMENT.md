# GTM JSON Editor - Deployment Guide

## 🚀 Vercel Deployment

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dmedford/gtm-json-editor)

### Manual Deployment Steps

1. **Fork or Clone Repository**
   ```bash
   git clone https://github.com/dmedford/gtm-json-editor.git
   cd gtm-json-editor
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings (all defaults work)

3. **Deploy**
   - Vercel will automatically deploy from the `main` branch
   - No build step required (static site)
   - Deployment URL will be provided

## 🔒 Security Features for Production

### Automatic Environment Detection
The application automatically detects production vs development:

- **Development (localhost)**: Loads `config.js` (git-ignored, can contain API keys)
- **Production (vercel.app, custom domain)**: Loads `config.production.js` (safe template)

### Production Security Measures

1. **No Hardcoded API Keys**
   - `config.production.js` contains no real API keys
   - Users prompted to enter their own API keys
   - API keys stored only in user's browser localStorage

2. **Security Headers** (via `vercel.json`)
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security` for HTTPS
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` to disable camera/microphone

3. **Client-Side Only Processing**
   - No server-side API key storage
   - No user data transmitted to server
   - All processing happens in user's browser

## 📋 Pre-Deployment Checklist

### Required Files
- ✅ `vercel.json` - Vercel configuration
- ✅ `config.production.js` - Production-safe config
- ✅ `index.html` - Updated with environment detection
- ✅ All static assets (CSS, JS)

### Security Verification
- ✅ No real API keys in `config.production.js`
- ✅ `config.js` is git-ignored (won't be deployed)
- ✅ Security headers configured
- ✅ Environment detection working

### Testing
- ✅ Test on localhost (should load `config.js`)
- ✅ Test on production URL (should load `config.production.js`)
- ✅ Verify API key prompting works in production
- ✅ Check browser console for security messages

## 🌐 Custom Domain Setup (Optional)

1. **Add Domain in Vercel Dashboard**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Security Settings**
   - Custom domain will use production config automatically
   - SSL certificate automatically provisioned
   - Security headers apply to custom domain

## 👥 User Instructions for Production

### For End Users

1. **Access the Tool**
   - Visit your deployed URL
   - No installation required

2. **API Key Setup**
   - When using Google Sheets sync, you'll be prompted for API key
   - Get API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Sheets API v4
   - Restrict API key to your domain and Google Sheets API only

3. **Security**
   - Your API key is stored only in your browser
   - Nothing is transmitted to our servers
   - Clear browser data to remove stored API key

### For Administrators

1. **Team Setup**
   - Share the deployed URL with team members
   - Each user manages their own API key
   - No central API key management needed

2. **Monitoring**
   - Check Vercel dashboard for usage metrics
   - Monitor any deployment issues
   - Review security headers in browser dev tools

## 🔧 Environment Variables (Optional)

No environment variables required! The application is designed to work without server-side configuration.

If you want to set a default Google Sheets ID for your organization:

1. **Edit `config.production.js`**
   ```javascript
   googleSheets: {
       apiKey: null, // Still null for security
       sheetId: 'your-organization-sheet-id'
   }
   ```

2. **Redeploy**
   - Vercel will automatically redeploy on git push
   - New default sheet ID will be used

## 🚨 Security Best Practices

### For Developers
- Never commit real API keys to git
- Always test production config before deploying
- Review security headers regularly
- Monitor for any security vulnerabilities

### For Users
- Use API key restrictions in Google Cloud Console
- Don't share API keys between users
- Regularly rotate API keys
- Clear browser data when finished

## 📞 Support

- **Deployment Issues**: Check Vercel dashboard logs
- **Security Concerns**: Review this deployment guide
- **Bug Reports**: Create GitHub issue with deployment URL
- **Feature Requests**: GitHub issues with production use case

## 🔄 Updates

The application auto-updates from the main branch:
- Push to main branch → Automatic Vercel deployment
- No manual updates required
- Users see changes immediately on next page load