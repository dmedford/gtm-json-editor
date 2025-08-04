# GTM JSON Editor

A professional web-based tool for importing, editing, and exporting Google Tag Manager (GTM) container JSON files with Google Sheets integration for dynamic variable updates.

## 🚀 Features

- **🔄 Step-by-Step Workflow**: Import GTM Template → Sync with Property Data → Review & Export
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

**Prerequisites:** Modern web browser, GTM container export JSON file, Google Sheets API key

**Installation:** Open `index.html` directly in browser - no server required

**Step-by-Step Usage:**
1. **Import GTM Template**: Upload your GTM container JSON file
2. **Sync with Property Data**: Enter property name OR website URL, sync from Google Sheet
3. **Review & Export**: Preview changes, apply updates, and download modified JSON

**Google Sheets Setup:**
1. Get API key from Google Cloud Console → APIs & Services → Credentials
2. Enable Google Sheets API v4
3. **Configure API Key Restrictions** (IMPORTANT for security):
   - Set HTTP referrers restriction to your domain/localhost
   - Restrict to Google Sheets API only
4. Ensure sheet is publicly viewable
5. Use "Tracker Sheet" tab with standardized column names

**Security:** Your API key is requested only when needed and stored temporarily in browser session only.

## 📁 Architecture

**Files:** `index.html`, `styles.css`, `script.js`, `CLAUDE.md`, `README.md`

**Core Class:** `GTMEditor` - Manages application state, UI interactions, and Google Sheets integration

**🔗 Google Sheets Integration:**
- **API Integration:** Google Sheets API v4 with configurable sheet ID and API key
- **Smart Property Matching:** Supports both property name and website URL lookup
- **Standardized Variable Detection:** Pattern matching for GA4, Google Ads, and TTD variables
- **Data Mapping:** Automatic column-to-variable mapping with comprehensive coverage
- **Change Preview:** Before/after comparison with user confirmation

**Variable Detection:** Merges 6 GTM variable arrays with deduplication by variable ID

**Security:** Client-side only, secure API key handling, HTML escaping for XSS prevention

## 🔐 Security Features

**API Key Protection:**
- No hardcoded API keys in source code
- User provides API key only when needed via secure prompt
- API key stored temporarily in browser session only (never persisted)
- Recommendations for API key restrictions provided

**Additional Security:**
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

## 🐛 Known Limitations

- Google Sheets API requires publicly viewable sheet or proper authentication
- Requires standardized GTM variable naming convention for reliable matching
- Large containers (500+ items) may have slower rendering
- No GTM business rule validation (handled by GTM on import)

## ⚠️ Disclaimer

Not affiliated with Google/GTM. Always backup containers before changes and test in development environment. Keep API keys secure.

## 📞 Support

For issues: Check browser console (F12), verify API key and sheet access, ensure valid GTM JSON, open GitHub issue with console logs.