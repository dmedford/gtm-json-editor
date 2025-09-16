/**
 * GTM JSON Editor - Production Configuration
 * 
 * ⚠️ SECURITY NOTICE FOR PRODUCTION DEPLOYMENT ⚠️
 * 
 * This is a TEMPLATE file for production environments.
 * DO NOT put real API keys in this file as it will be publicly accessible.
 * 
 * For production deployment:
 * 1. Users will be prompted to enter their API key when needed
 * 2. API keys are stored securely in browser localStorage only
 * 3. No API keys are transmitted to or stored on the server
 * 4. Each user manages their own API key securely
 */

window.GTMEditorConfig = {
    // Google Sheets API Configuration - PRODUCTION SAFE
    googleSheets: {
        // DO NOT PUT REAL API KEYS HERE IN PRODUCTION
        // Users will be prompted to enter their API key
        apiKey: null,
        
        // Default sheet ID (can be overridden by users)
        sheetId: '1Q2W7RIOBpTNhtOHVmwjhcVPyJktgXQUqu-UB-ieTUSQ'
    },
    
    // Template configuration - PRODUCTION SAFE
    template: {
        // No default template path in production for security
        defaultPath: null,
        
        // Don't auto-load templates in production
        autoLoad: false
    },
    
    // Production settings
    production: {
        // Environment indicator
        environment: 'production',
        
        // Disable debug mode in production
        debugMode: false,
        
        // Security reminder for users
        showSecurityReminders: true
    },
    
    // UI preferences
    ui: {
        defaultTab: 'tags',
        showDebugInfo: false,
        
        // Show security notices in production
        showSecurityNotices: true
    }
};

// Log production configuration loaded
console.log('🌐 GTM Editor production configuration loaded');
console.log('🔒 Security mode: API keys must be entered by each user');
console.log('📝 No sensitive data is stored on the server');