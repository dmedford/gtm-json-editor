# CLAUDE.md

Development guidance for Claude Code when working with the GTM JSON Editor.

## Project Overview

Professional client-side GTM container JSON editor with **streamlined workflow**, **smart template system**, and **Google Sheets integration**. Features automatic variable detection using standardized naming conventions, dual property lookup (name/URL), and comprehensive variable updates for GA4, Google Ads, and TTD tracking. **Major UX improvement**: Users only need to enter property name/URL after initial template setup.

## Development Commands

**Run:** Open `index.html` in browser (no server required)
**Debug:** Browser console (F12) - emoji-prefixed logging with detailed pattern matching
**Test:** Use default template or upload GTM JSON, test property sync with name/URL, verify all 10+ variable updates

## Architecture

### Core Architecture

**Main Class:** `GTMEditor` - Application state, streamlined workflow management, template system, and Google Sheets integration

**Key Properties:** 
- Core: `gtmData`, `selectedItems`, `currentTab`, `currentEditItem`, `filteredItems`
- Sheets: `sheetsData`, `pendingChanges`, `SHEET_ID`, `API_KEY`, `CONFIG_API_KEY`
- Template: `DEFAULT_TEMPLATE_PATH`, `AUTO_LOAD_TEMPLATE`
- Workflow: Collapsible template options, primary property sync focus

**Data Flow:** Template Detection → Property Sync (Primary) → Review/Edit → Export

### Streamlined Workflow

**⚙️ Template Options (Collapsible):**
- Auto-detects saved templates and config file paths
- Collapses when template is available to de-emphasize
- Manual template management (upload, save, clear)
- Smart status indicators showing template source

**1️⃣ Sync with Property Data (Primary Step):**
- Tabbed input: Property Name OR Website URL
- Google Sheets API integration (A:AZ columns)
- Pattern matching for variable detection
- Preview changes before applying
- Skip option to proceed without sync

**2️⃣ Review & Export:**
- Full container editor with tabs (Tags, Triggers, Variables, Folders, Settings)
- Template management in Settings tab
- Bulk operations and search/filter
- Export modified JSON

### Template System Architecture

**Template Storage Priority:**
1. **Browser localStorage** - Instant loading of saved templates
2. **Config file path** - Developer-specified template files
3. **Manual upload** - Traditional fallback

**Key Template Methods:**
- `loadDefaultTemplate()` - Smart template loading with multiple sources
- `saveTemplateToStorage()` - Save current container as default
- `checkTemplateAvailability()` - Detect and show template status
- `toggleTemplateOptions()` - Collapsible template management
- `useDefaultTemplate()` - One-click template loading

**Template Workflow Integration:**
- Auto-collapse template options when available
- Direct progression to property sync step
- Contextual UI updates based on template availability
- Settings tab template management interface

### Configuration System

**Config File Support (Optional):**
```javascript
// config.js (git-ignored)
window.GTMEditorConfig = {
    googleSheets: {
        apiKey: 'your-api-key',
        sheetId: 'your-sheet-id'
    },
    template: {
        defaultPath: './templates/template.json',
        autoLoad: true
    },
    development: {
        debugMode: true,
        autoLoadConfig: true
    }
};
```

**Configuration Loading:**
- `loadConfiguration()` - Load config from global object
- Priority: Config file → defaults
- Template auto-loading support
- Development convenience features

### GTM Data Structure

**Container Format:** Standard GTM export with `containerVersion` containing arrays for `tag`, `trigger`, `variable`, `folder`

**Variable Storage (6 locations):**
- `variable` (custom)
- `builtInVariable`, `enabledBuiltInVariable`, `disabledBuiltInVariable` (built-ins)
- `workspaceBuiltInVariable`, `customVariable` (alternatives)

**Critical:** Merge all variable arrays with deduplication by `variableId`

### Key Methods

**Template System:**
- `loadDefaultTemplate()`, `saveTemplateToStorage()`, `loadStoredTemplate()`, `clearStoredTemplate()`
- `checkTemplateAvailability()`, `showTemplateStatus()`, `toggleTemplateOptions()`
- `saveCurrentAsTemplate()`, `useDefaultTemplate()`

**Workflow:** `updateWorkflowStep()`, `proceedToStep2()`, `skipToStep2()`
**File:** `handleFileImport()`, `exportJSON()`
**Config:** `loadConfiguration()`, `loadApiKey()`, `encodeApiKey()`, `decodeApiKey()`
**Render:** `renderCurrentTab()`, `render{Tags|Triggers|Variables|Folders}()`, `filterItemsBySearch()`, `renderSettings()`
**Edit:** `editItem()`, `generateEditForm()`, `saveItemChanges()`
**Bulk:** `selectAllItems()`, `applyBulkChanges()`, `bulkDeleteItems()`
**Property Input:** `switchInputTab()`, `getCurrentPropertyInput()`, `findPropertyRowByInput()`, `cleanUrl()`
**Sheets:** `syncFromSheetMain()`, `findGTMMatches()`, `getAllVariables()`, `showPreviewMain()`, `applySheetChangesMain()`
**Pattern Matching:** `findVariableByPattern()`, `findVariableBySpecificPattern()`

### Implementation Details

**Smart Template System:**
- **Multi-source Loading:** localStorage → config file → manual upload
- **Automatic Detection:** Check availability on page load
- **UI State Management:** Collapsible options, contextual messaging
- **Developer Support:** Config file paths, auto-loading
- **User Convenience:** Save current container, one-click usage
- **Security:** Git-ignored config files, browser-only storage

**Google Sheets Integration:**
- **API Integration:** Google Sheets API v4 with fetch() calls to `sheets.googleapis.com` (A:AZ columns)
- **Dual Property Lookup:** Supports property name OR website URL matching with `findPropertyRowByInput()`
- **Standardized Pattern Matching:** Reliable variable detection using consistent naming conventions
- **Comprehensive Updates:** 10+ variables including GA4, Google Ads labels, TTD tracking, CallRail
- **Change Preview:** Before/after comparison with user confirmation via `showPreviewMain()`
- **Smart Workflow:** Automatic progression through steps with skip options

**API Key Management:**
- **Multi-source Priority:** Config file → localStorage → user prompt
- **Secure Storage:** Encoded localStorage with management interface
- **Status Display:** Clear indicators showing key source
- **Development Support:** Config file loading for seamless development

**Variable Merging:** 6 arrays → deduplicate by `variableId` → accurate counts via `getAllVariables()`

**Parameter Editing:** Type-specific forms (HTML→textarea, URL→validation, ID→text, Boolean→checkbox)

**Security:** HTML escaping, client-side processing, git-ignored config files, API key encoding

**UI:** Professional dark theme, collapsible template options, Settings tab with comprehensive management

**Logging:** Emoji prefixes - 🔄 🏷️ ⚡ 🔢 📁 🔍 ✏️ 📝 💾 📋 🔗 ⚙️

### User Experience Flow

**First-Time User:**
1. Expand template options (⚙️ icon)
2. Upload GTM JSON file
3. Settings → Save Current Container as Default Template
4. Future sessions: Direct to property sync

**Regular User (Template Available):**
1. Template auto-detected, options collapsed
2. Enter property name OR website URL
3. Sync from Google Sheets
4. Export updated container

**Developer (Config File):**
1. Set template path in config.js
2. Auto-loading on page load (optional)
3. Zero manual setup required

### Security & Configuration

**Security Features:**
- **Git-ignored Config:** Template files and API keys never committed
- **Client-side Only:** No server-side data storage
- **API Key Encoding:** Browser storage with basic encoding
- **Multi-source Management:** Config file, storage, or manual entry
- **HTML Escaping:** XSS prevention throughout

**Configuration Management:**
- **Template Sources:** Browser storage, config file paths, manual upload
- **API Key Sources:** Config file, localStorage, user prompt
- **Development Features:** Debug mode, auto-loading, console logging
- **UI Preferences:** Default tab, debug info display

## Required GTM Variable Naming Convention

**Google Ads Variables:**
```
Variable - GAds - Conversion ID
Variable - GAds - Conversion Label - Apply Start
Variable - GAds - Conversion Label - Apply End
Variable - GAds - Conversion Label - Contact Start
Variable - GAds - Conversion Label - Contact End
Variable - GAds - Conversion Label - Tour Start
Variable - GAds - Conversion Label - Tour End
Variable - GAds - Conversion Label - Virtual Tour
```

**GA4 & TTD Variables:**
```
Variable - GA4 - Measurement ID
Variable - TTD - CT - Apply Start
Variable - TTD - CT - Apply End
Variable - TTD - CT - Contact Start
Variable - TTD - CT - Contact End
Variable - TTD - CT - Schedule a Tour Start
Variable - TTD - CT - Schedule a Tour End
Variable - TTD - CT - Virtual Tour
```

**Limitations:** 
- Google Sheets API requires publicly viewable sheet or authentication
- Requires standardized GTM variable naming convention
- Large containers (500+ items) slower rendering
- No GTM business rule validation

## Debugging

**Template System Issues:**
- **Template Not Loading:** Check browser localStorage, config file path, console logs
- **Auto-collapse Not Working:** Verify `checkTemplateAvailability()` execution
- **Config File Issues:** Check file loading, global object creation, console messages

**Workflow Issues:**
- **Step Progression:** Check `updateWorkflowStep()` calls and element visibility
- **Template Options:** Verify collapse/expand functionality with `toggleTemplateOptions()`
- **Settings Display:** Check template status in Settings tab rendering

**Google Sheets Issues:**
- **API Errors:** Check API key validity, source priority (config vs storage vs prompt)
- **Property Not Found:** Verify property name/URL spelling, check sheet columns
- **Variable Matching:** Check "🔍 Pattern search" and "✅ Match" logs for each variable
- **Final Summary:** Look for "🎯 FINAL MATCHING SUMMARY" showing all detected variables

**Common Issues:**
- **Template Not Detected:** Check localStorage, config file loading, console warnings
- **Workflow Steps Wrong:** Verify step numbering (Template Options → Step 1 → Step 2)
- **API Key Problems:** Check multi-source loading priority and Settings tab status
- **Config File Not Loading:** Verify file exists, script tag placement, global object
- **Pattern Matching Failures:** Verify GTM variables follow exact naming convention