# CLAUDE.md

Development guidance for Claude Code when working with the GTM JSON Editor.

## Project Overview

Professional client-side GTM container JSON editor with step-by-step workflow and Google Sheets integration. Features automatic variable detection using standardized naming conventions, dual property lookup (name/URL), and comprehensive variable updates for GA4, Google Ads, and TTD tracking.

## Development Commands

**Run:** Open `index.html` in browser (no server required)
**Debug:** Browser console (F12) - emoji-prefixed logging with detailed pattern matching
**Test:** Import GTM JSON, test property sync with name/URL, verify all 10+ variable updates

## Architecture

### Core Architecture

**Main Class:** `GTMEditor` - Application state, step-by-step workflow management, and Google Sheets integration

**Key Properties:** 
- Core: `gtmData`, `selectedItems`, `currentTab`, `currentEditItem`, `filteredItems`
- Sheets: `sheetsData`, `pendingChanges`, `SHEET_ID`, `API_KEY`
- Workflow: Step progression, property input handling (name/URL), sync status

**Data Flow:** Import GTM → Property Sync (Optional) → Review/Edit → Export

### Step-by-Step Workflow

**Step 1: Import GTM Template**
- File upload and JSON parsing
- Container info display with variable counts
- Automatic progression to Step 2

**Step 2: Sync with Property Data**
- Tabbed input: Property Name OR Website URL
- Google Sheets API integration (A:AZ columns)
- Pattern matching for variable detection
- Preview changes before applying
- Skip option to proceed without sync

**Step 3: Review & Export**
- Full container editor with tabs (Tags, Triggers, Variables, Folders, Settings)
- Bulk operations and search/filter
- Export modified JSON

### GTM Data Structure

**Container Format:** Standard GTM export with `containerVersion` containing arrays for `tag`, `trigger`, `variable`, `folder`

**Variable Storage (6 locations):**
- `variable` (custom)
- `builtInVariable`, `enabledBuiltInVariable`, `disabledBuiltInVariable` (built-ins)
- `workspaceBuiltInVariable`, `customVariable` (alternatives)

**Critical:** Merge all variable arrays with deduplication by `variableId`

### Key Methods

**Workflow:** `updateWorkflowStep()`, `proceedToStep3()`, `skipToStep3()`
**File:** `handleFileImport()`, `exportJSON()`
**Render:** `renderCurrentTab()`, `render{Tags|Triggers|Variables|Folders}()`, `filterItemsBySearch()`
**Edit:** `editItem()`, `generateEditForm()`, `saveItemChanges()`
**Bulk:** `selectAllItems()`, `applyBulkChanges()`, `bulkDeleteItems()`
**Property Input:** `switchInputTab()`, `getCurrentPropertyInput()`, `findPropertyRowByInput()`, `cleanUrl()`
**Sheets:** `syncFromSheetMain()`, `findGTMMatches()`, `getAllVariables()`, `showPreviewMain()`, `applySheetChangesMain()`
**Pattern Matching:** `findVariableByPattern()`, `findVariableBySpecificPattern()`

### Implementation Details

**Google Sheets Integration:**
- **API Integration:** Google Sheets API v4 with fetch() calls to `sheets.googleapis.com` (A:AZ columns)
- **Dual Property Lookup:** Supports property name OR website URL matching with `findPropertyRowByInput()`
- **Standardized Pattern Matching:** Reliable variable detection using consistent naming conventions
- **Comprehensive Updates:** 10+ variables including GA4, Google Ads labels, TTD tracking, CallRail
- **Change Preview:** Before/after comparison with user confirmation via `showPreviewMain()`
- **Smart Workflow:** Automatic progression through steps with skip options

**Variable Merging:** 6 arrays → deduplicate by `variableId` → accurate counts via `getAllVariables()`

**Parameter Editing:** Type-specific forms (HTML→textarea, URL→validation, ID→text, Boolean→checkbox)

**Security:** HTML escaping, client-side processing, API key for sheets access

**UI:** Professional dark theme, Settings tab with Google Sheets integration section

**Logging:** Emoji prefixes - 🔄 🏷️ ⚡ 🔢 📁 🔍 ✏️ 📝 💾 📋 🔗

### Security & Limitations

**Security:** Client-side only, File API, HTML escaping, Google Sheets API key required

**Standardized Variable Names:** Requires consistent GTM variable naming for reliable pattern matching

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

**Workflow:** Browser console (F12) → Upload GTM file → Test property sync → Check detailed pattern matching logs

**Google Sheets Issues:**
- **API Errors:** Check API key validity, sheet permissions, network connectivity
- **Property Not Found:** Verify property name/URL spelling, check sheet columns
- **Variable Matching:** Check "🔍 Pattern search" and "✅ Match" logs for each variable
- **Final Summary:** Look for "🎯 FINAL MATCHING SUMMARY" showing all detected variables

**Common Issues:**
- **Wrong Variable Count:** Check "Variable breakdown" logs and standardized naming
- **Pattern Matching Failures:** Verify GTM variables follow exact naming convention
- **Workflow Issues:** Check step progression logs and input validation