# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side web application for editing Google Tag Manager (GTM) container JSON files. The application is built with vanilla HTML, CSS, and JavaScript with no external dependencies or build process required.

## Development Commands

**Local Development:**
- Open `index.html` directly in a web browser - no server required
- For development with live reload, use any simple HTTP server:
  - `python -m http.server 8000` (Python)
  - `npx serve .` (if Node.js available)
  - Any local development server

**Testing:**
- No automated tests currently exist
- Manual testing: Import a GTM JSON file and verify all functionality works
- Check browser console (F12) for debugging output during development

**Debugging:**
- All debug information is logged to browser console with emoji prefixes
- Import process shows detailed file structure analysis
- Rendering operations show step-by-step processing
- Edit operations show form generation and data handling

## Architecture

### Core Application Structure

**Main Class:** `GTMEditor` - Single class that manages the entire application state and UI interactions.

**Key State Properties:**
- `gtmData` - Stores the parsed GTM JSON container data
- `selectedItems` - Set of currently selected item IDs for bulk operations
- `currentTab` - Active tab ('tags', 'triggers', 'variables', 'folders', 'settings')
- `currentEditItem` - Item being edited in modal
- `filteredItems` - Current filtered/searched items for display

### Data Flow

1. **Import:** User selects JSON file → `handleFileImport()` → Parse and validate → Update UI
2. **Display:** `renderCurrentTab()` → `render{Tags|Triggers|Variables|Folders}()` → Generate HTML → Attach event listeners
3. **Edit:** User clicks item → `editItem()` → `generateEditForm()` → Show modal → `saveItemChanges()` → Update data → Re-render
4. **Bulk Operations:** Select items → Enable bulk buttons → Apply changes → Update multiple items → Re-render
5. **Export:** `exportJSON()` → Create blob from modified `gtmData` → Download file

### GTM Data Structure

The application expects standard GTM container export format:
```
gtmData = {
  exportFormatVersion: "2",
  exportTime: "...",
  containerVersion: {
    accountId: "...",
    containerId: "...",
    containerVersionId: "...",
    name: "Container Name",
    tag: [],      // Array of tag objects
    trigger: [],  // Array of trigger objects  
    variable: [], // Array of variable objects
    folder: []    // Array of folder objects
  }
}
```

### Key Methods by Functionality

**File Operations:**
- `handleFileImport()` - Process uploaded JSON files with comprehensive logging
- `exportJSON()` - Generate and download modified JSON

**Rendering:**
- `renderCurrentTab()` - Main rendering dispatcher
- `render{Tags|Triggers|Variables|Folders}()` - Category-specific rendering with proper index mapping
- `filterItemsBySearch()` - Search and filter logic with debugging

**Editing:**
- `editItem(type, index)` - Open edit modal for individual items
- `generateEditForm(type, item)` - Create form HTML with HTML escaping
- `saveItemChanges()` - Update item data from form inputs

**Bulk Operations:**
- `selectAllItems()` / `deselectAllItems()` - Selection management
- `applyBulkChanges()` - Apply bulk edits to selected items
- `bulkDeleteItems()` - Remove multiple items

### Important Implementation Details

**Index Mapping:** The application maintains both filtered and original item arrays. When rendering filtered results, it maps back to original indices to ensure edit operations work on the correct items.

**HTML Escaping:** All user data is escaped before insertion into HTML to prevent XSS issues.

**Event Handling:** Uses inline onclick handlers for dynamically generated content, with the global `gtmEditor` instance.

**Logging Strategy:** Comprehensive console logging with emoji prefixes for easy debugging:
- 🔄 Process steps
- ✅ Success operations  
- ❌ Errors
- 🏷️ Tags, ⚡ Triggers, 🔢 Variables, 📁 Folders
- 🔍 Search/filter operations
- ✏️ Edit operations
- 📝 Form generation

### Security Considerations

- All processing is client-side - no data leaves the user's computer
- Files are processed using the File API - no server uploads
- HTML content is escaped to prevent XSS
- No external dependencies or CDN usage

### Known Limitations

- Large containers (500+ items) may have slower rendering performance
- Complex tag parameter structures are shown as read-only previews
- No validation of GTM-specific business rules (handled by GTM on import)
- Search is simple text matching, not advanced querying

## Debugging Workflow

When users report issues:

1. Ask them to open browser console (F12 → Console)
2. Have them upload their GTM file and capture console output
3. Look for the structured logging to identify where the process fails
4. Check for data structure issues in the "GTM Data Structure Analysis" output
5. Verify item counts match expectations
6. Look for filtering or rendering errors in the detailed logs