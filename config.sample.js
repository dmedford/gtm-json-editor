/**
 * GTM JSON Editor Configuration
 * 
 * This is a sample configuration file. To use it:
 * 1. Copy this file to 'config.js' 
 * 2. Add your actual API key and Sheet ID
 * 3. The 'config.js' file is ignored by git for security
 * 
 * For production/shared environments, users will be prompted for API keys
 * For development, this provides convenience without security risks
 */

window.GTMEditorConfig = {
    // Google Sheets API Configuration
    googleSheets: {
        // Your Google Sheets API key from Google Cloud Console
        apiKey: 'YOUR_API_KEY_HERE',
        
        // Your Google Sheets document ID (from the URL)
        sheetId: 'YOUR_SHEET_ID_HERE'
    },
    
    // Development settings
    development: {
        // Set to true to enable additional console logging
        debugMode: false,
        
        // Set to true to auto-load config without prompting
        autoLoadConfig: true
    },
    
    // UI preferences (optional)
    ui: {
        // Default tab to show when container loads
        defaultTab: 'tags',
        
        // Show additional debugging info in UI
        showDebugInfo: false
    }
};

// Log that config was loaded (only if API key is set)
if (window.GTMEditorConfig.googleSheets.apiKey !== 'YOUR_API_KEY_HERE') {
    console.log('🔧 GTM Editor config loaded from local file');
} else {
    console.log('📝 GTM Editor config template loaded - please set your API key');
}