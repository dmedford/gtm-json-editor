# GTM JSON Editor

A professional web-based tool for editing Google Tag Manager (GTM) container JSON files with **streamlined workflow**, **default template system**, and **Google Sheets integration** for dynamic variable updates.

## 🚀 Key Features

- **⚡ Streamlined Workflow**: Save GTM templates once, then just enter property name/URL - no more repetitive uploads!
- **📁 Smart Template System**: Auto-detects saved templates with browser storage and config file support
- **🔗 Google Sheets Integration**: Dynamically update GTM variables from live tracking spreadsheets
- **🎯 Smart Variable Matching**: Automatic detection of GA4, Google Ads, and TTD variables using standardized naming
- **🌐 Flexible Property Lookup**: Enter property name OR website URL for automatic data matching
- **👀 Preview Changes**: Review all updates before applying with before/after comparison
- **📊 Comprehensive Updates**: Updates 10+ variables including GA4 ID, Conversion Labels, CallRail HTML
- **🔧 Advanced Parameter Editing**: Edit Google Ads conversion IDs, Custom HTML, URLs, and all tag parameters
- **📁 Advanced Variable Detection**: Supports all 6 GTM variable storage locations with accurate counts
- **🔀 Bulk Operations**: Select/deselect all, status toggle, folder assignment, find & replace, delete
- **🎨 Professional Dark Theme**: GitHub-inspired dark mode with polished UI
- **🔍 Real-time Search & Filter**: Find items by name, type, or status

## 🛠️ Quick Start

### Prerequisites
- Modern web browser
- GTM container export JSON file (for first-time setup)
- Google Sheets API key

### Installation
Open `index.html` directly in browser - no server required

### Workflow

**🎯 Regular Usage (after setup):**
1. **Open Tool** → Default template auto-detected
2. **Enter Property Data** → Just property name OR website URL
3. **Export** → Download updated JSON file

**⚙️ First-Time Setup:**
1. **Click Template Options** (gear icon)
2. **Upload GTM JSON** → Import your container
3. **Save as Default** → Settings → Save Current Container as Default Template
4. **Future Sessions** → Skip directly to property sync!

**🔗 Google Sheets Setup:**
1. Get API key from Google Cloud Console → APIs & Services → Credentials
2. Enable Google Sheets API v4
3. **Configure API Key Restrictions** (IMPORTANT for security):
   - Set HTTP referrers restriction to your domain/localhost
   - Restrict to Google Sheets API only
4. Ensure sheet is publicly viewable
5. Use "Tracker Sheet" tab with standardized column names

## 📁 Template System

### Smart Template Detection
- **Browser Storage**: Saved templates load instantly
- **Config File**: Developer-specified template paths (optional)
- **Manual Upload**: Traditional fallback when needed

### Template Management
- **Save Current**: Settings → Save Current Container as Default Template
- **Clear Stored**: Remove saved templates from browser storage
- **Status Display**: Clear indicators showing template source
- **One-Click Use**: "Use Default Template" button for instant loading

### Developer Configuration (Optional)
Create a `config.js` file for development convenience:

```javascript
// config.js (git-ignored)
window.GTMEditorConfig = {
    googleSheets: {
        apiKey: 'your-api-key-here',
        sheetId: 'your-sheet-id-here'
    },
    template: {
        defaultPath: './templates/my-gtm-template.json',
        autoLoad: true  // Skip template selection entirely
    }
};
```

## 🔐 Security Features

### API Key Protection
- **Multiple Sources**: Config file (dev), browser storage (user), or manual entry
- **Secure Storage**: Browser localStorage with encoding for convenience
- **No Hardcoding**: No API keys in source code
- **Full Management**: Settings tab for view status, update, clear
- **Restrictions Guide**: Recommendations for API key security

### Template Security
- **Git-Ignored Config**: Template files and API keys never committed
- **Browser-Only Storage**: Templates stored locally, never transmitted
- **Graceful Fallbacks**: Works perfectly without templates

### Additional Security
- Client-side only processing (no server-side data storage)
- HTML escaping to prevent XSS attacks  
- Input validation and sanitization
- No persistent storage of sensitive data

## 🎯 Supported Variables

**Automatic Updates (10+ variables):**
- GA4 Measurement ID
- Google Ads Conversion ID  
- Google Ads Conversion Labels (Apply Start/End, Contact Start/End, Tour Start/End, Virtual Tour)
- CallRail HTML Tag
- TTD Conversion Tracking (Apply, Contact, Tour, Virtual Tour - when data available)

**Required GTM Variable Naming Convention:**
```
Variable - GA4 - Measurement ID
Variable - GAds - Conversion ID
Variable - GAds - Conversion Label - Apply Start
Variable - GAds - Conversion Label - Apply End
Variable - GAds - Conversion Label - Contact Start
Variable - GAds - Conversion Label - Contact End
Variable - GAds - Conversion Label - Tour Start
Variable - GAds - Conversion Label - Tour End
Variable - GAds - Conversion Label - Virtual Tour
Variable - TTD - CT - Apply Start
Variable - TTD - CT - Apply End
Variable - TTD - CT - Contact Start
Variable - TTD - CT - Contact End
Variable - TTD - CT - Schedule a Tour Start
Variable - TTD - CT - Schedule a Tour End
Variable - TTD - CT - Virtual Tour
```

## 📁 Architecture

### Core Files
- `index.html` - Main application interface
- `styles.css` - Professional dark theme styling
- `script.js` - GTMEditor class and application logic
- `config.sample.js` - Template for developer configuration
- `CLAUDE.md` - Development guidance for AI assistants

### Key Classes
- **GTMEditor**: Main application state and workflow management
- **Template System**: Auto-loading, storage, and management
- **Google Sheets Integration**: API calls and variable matching
- **Workflow Management**: Step progression and UI updates

### Data Flow
1. **Template Detection** → Auto-load or manual selection
2. **Property Sync** → Enter name/URL, fetch from sheets
3. **Variable Matching** → Pattern-based detection and updates
4. **Review & Export** → Preview changes, apply, download

## 🎨 User Experience

### Visual Workflow
```
⚙️ Template Options (Template Available) ← Collapsible, auto-collapsed
1️⃣ Sync with Property Data ← PRIMARY FOCUS  
2️⃣ Review & Export ← Full container editor
```

### Smart Interactions
- **Auto-collapse**: Template options hide when template is available
- **One-click actions**: Use default, save current, clear stored
- **Status indicators**: Clear feedback on template and API key status
- **Contextual help**: Guidance adapts based on available features

## 🐛 Known Limitations

- Google Sheets API requires publicly viewable sheet or proper authentication
- Requires standardized GTM variable naming convention for reliable matching
- Large containers (500+ items) may have slower rendering
- No GTM business rule validation (handled by GTM on import)

## 💡 Pro Tips

1. **Save Time**: Upload your most-used GTM container once, then just sync with property data
2. **Team Workflow**: Share `config.sample.js` with teammates for consistent setup
3. **Development**: Use config file auto-loading for seamless development experience
4. **Security**: Restrict API keys to specific domains and Google Sheets API only
5. **Backup**: Always test in GTM preview mode before publishing

## ⚠️ Disclaimer

Not affiliated with Google/GTM. Always backup containers before changes and test in development environment. Keep API keys secure.

## 📞 Support

For issues: Check browser console (F12), verify API key and sheet access, ensure valid GTM JSON, open GitHub issue with console logs.