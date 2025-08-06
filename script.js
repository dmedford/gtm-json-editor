class GTMEditor {
    constructor() {
        this.gtmData = null;
        this.selectedItems = new Set();
        this.currentTab = 'tags';
        this.currentEditItem = null;
        this.filteredItems = [];
        
        // Google Sheets integration
        this.sheetsData = null;
        this.pendingChanges = null;
        
        // Load configuration from config file (if available) or fallback to defaults
        this.loadConfiguration();
        
        // Load API key from config, storage, or prompt user
        this.API_KEY = this.loadApiKey();
        
        this.initializeEventListeners();
        
        // Check for default template availability and show status
        this.checkTemplateAvailability();
        
        // Auto-load default template if configured
        if (this.AUTO_LOAD_TEMPLATE) {
            this.loadDefaultTemplate();
        }
    }

    initializeEventListeners() {
        // File input and template management
        document.getElementById('fileInput').addEventListener('change', this.handleFileImport.bind(this));
        document.getElementById('useDefaultBtn').addEventListener('click', this.useDefaultTemplate.bind(this));
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Bulk actions
        document.getElementById('selectAllBtn').addEventListener('click', this.selectAllItems.bind(this));
        document.getElementById('deselectAllBtn').addEventListener('click', this.deselectAllItems.bind(this));
        document.getElementById('bulkEditBtn').addEventListener('click', this.openBulkEditModal.bind(this));
        document.getElementById('bulkDeleteBtn').addEventListener('click', this.bulkDeleteItems.bind(this));
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', this.filterItems.bind(this));
        document.getElementById('statusFilter').addEventListener('change', this.filterItems.bind(this));
        
        // Export
        document.getElementById('exportBtn').addEventListener('click', this.exportJSON.bind(this));
        
        // Google Sheets integration (Settings tab - legacy)
        document.getElementById('propertyNameInput').addEventListener('input', this.onPropertyNameChange.bind(this));
        document.getElementById('syncFromSheetBtn').addEventListener('click', this.syncFromSheet.bind(this));
        document.getElementById('applyChangesBtn').addEventListener('click', this.applySheetChanges.bind(this));
        document.getElementById('cancelChangesBtn').addEventListener('click', this.cancelSheetChanges.bind(this));

        // Main workflow Google Sheets integration
        document.getElementById('propertyNameInputMain').addEventListener('input', this.onPropertyInputChangeMain.bind(this));
        document.getElementById('propertyUrlInputMain').addEventListener('input', this.onPropertyInputChangeMain.bind(this));
        document.getElementById('syncFromSheetBtnMain').addEventListener('click', this.syncFromSheetMain.bind(this));
        document.getElementById('applyChangesBtnMain').addEventListener('click', this.applySheetChangesMain.bind(this));
        document.getElementById('cancelChangesBtnMain').addEventListener('click', this.cancelSheetChangesMain.bind(this));
        document.getElementById('skipSyncBtn').addEventListener('click', this.skipToStep2.bind(this));

        // Input tab switching
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.addEventListener('click', this.switchInputTab.bind(this));
        });
        
        // Modal controls
        this.setupModalControls();
    }

    setupModalControls() {
        // Edit modal
        const editModal = document.getElementById('editModal');
        const bulkEditModal = document.getElementById('bulkEditModal');
        
        // Close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.closeModals.bind(this));
        });
        
        // Modal buttons
        document.getElementById('saveBtn').addEventListener('click', this.saveItemChanges.bind(this));
        document.getElementById('cancelBtn').addEventListener('click', this.closeModals.bind(this));
        document.getElementById('applyBulkBtn').addEventListener('click', this.applyBulkChanges.bind(this));
        document.getElementById('cancelBulkBtn').addEventListener('click', this.closeModals.bind(this));
        
        // Bulk edit checkboxes
        document.getElementById('bulkUpdateFolder').addEventListener('change', (e) => {
            document.getElementById('bulkFolderSelect').disabled = !e.target.checked;
        });
        
        document.getElementById('bulkFindReplace').addEventListener('change', (e) => {
            document.getElementById('findText').disabled = !e.target.checked;
            document.getElementById('replaceText').disabled = !e.target.checked;
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        console.log('🔄 Starting GTM JSON file import...');
        console.log('📁 File name:', file.name);
        console.log('📊 File size:', (file.size / 1024).toFixed(2) + ' KB');
        
        try {
            const text = await file.text();
            console.log('✅ File read successfully, parsing JSON...');
            
            this.gtmData = JSON.parse(text);
            console.log('✅ JSON parsed successfully');
            console.log('📋 Raw GTM Data Structure:', this.gtmData);
            
            // Log the main structure
            console.log('🏗️ GTM Data Structure Analysis:');
            console.log('  - Export Format Version:', this.gtmData.exportFormatVersion);
            console.log('  - Export Time:', this.gtmData.exportTime);
            console.log('  - Container Version exists:', !!this.gtmData.containerVersion);
            
            if (this.gtmData.containerVersion) {
                const cv = this.gtmData.containerVersion;
                console.log('📦 Container Version Details:');
                console.log('  - Account ID:', cv.accountId);
                console.log('  - Container ID:', cv.containerId);
                console.log('  - Container Version ID:', cv.containerVersionId);
                console.log('  - Container Name:', cv.name);
                console.log('  - Description:', cv.description);
                
                // Log counts of each item type
                const tags = cv.tag || [];
                const triggers = cv.trigger || [];
                const variables = cv.variable || [];
                const folders = cv.folder || [];
                
                // Check for built-in variables that might be stored separately
                const builtInVariables = cv.builtInVariable || [];
                const customVariables = cv.customVariable || [];
                
                // Check for other possible variable locations
                const enabledBuiltInVariables = cv.enabledBuiltInVariable || [];
                const disabledBuiltInVariables = cv.disabledBuiltInVariable || [];
                const workspaceBuiltInVariables = cv.workspaceBuiltInVariable || [];
                
                console.log('📊 Item Counts:');
                console.log('  - Tags:', tags.length);
                console.log('  - Triggers:', triggers.length);
                console.log('  - Variables (custom):', variables.length);
                console.log('  - Built-in Variables:', builtInVariables.length);
                console.log('  - Custom Variables (alt):', customVariables.length);
                console.log('  - Enabled Built-in Variables:', enabledBuiltInVariables.length);
                console.log('  - Disabled Built-in Variables:', disabledBuiltInVariables.length);
                console.log('  - Workspace Built-in Variables:', workspaceBuiltInVariables.length);
                console.log('  - Folders:', folders.length);
                
                const totalVariables = variables.length + builtInVariables.length + customVariables.length + 
                                     enabledBuiltInVariables.length + disabledBuiltInVariables.length + workspaceBuiltInVariables.length;
                console.log('  - TOTAL Variables:', totalVariables);
                
                // Log all container version properties to see what else might be there
                console.log('📋 All container version properties:', Object.keys(cv));
                
                // Look for any other properties that might contain variables
                const allProps = Object.keys(cv);
                const variableProps = allProps.filter(prop => prop.toLowerCase().includes('variable'));
                console.log('📋 All properties containing "variable":', variableProps);
                
                // Log sample data from each variable array to understand structure
                if (builtInVariables.length > 0) {
                    console.log('📋 Sample built-in variable:', builtInVariables[0]);
                }
                if (enabledBuiltInVariables.length > 0) {
                    console.log('📋 Sample enabled built-in variable:', enabledBuiltInVariables[0]);
                }
                
                // Check if variables might be stored at root level
                console.log('📋 Root level properties:', Object.keys(this.gtmData));
                const rootVariableProps = Object.keys(this.gtmData).filter(prop => prop.toLowerCase().includes('variable'));
                console.log('📋 Root properties containing "variable":', rootVariableProps);
                
                // Log first few items of each type for inspection
                if (tags.length > 0) {
                    console.log('🏷️ Sample Tags (first 3):');
                    tags.slice(0, 3).forEach((tag, index) => {
                        console.log(`  Tag ${index + 1}:`, {
                            name: tag.name,
                            type: tag.type,
                            tagId: tag.tagId,
                            paused: tag.paused,
                            parentFolderId: tag.parentFolderId
                        });
                    });
                }
                
                if (triggers.length > 0) {
                    console.log('⚡ Sample Triggers (first 3):');
                    triggers.slice(0, 3).forEach((trigger, index) => {
                        console.log(`  Trigger ${index + 1}:`, {
                            name: trigger.name,
                            type: trigger.type,
                            triggerId: trigger.triggerId,
                            parentFolderId: trigger.parentFolderId
                        });
                    });
                }
                
                if (variables.length > 0) {
                    console.log('🔢 Sample Variables (first 3):');
                    variables.slice(0, 3).forEach((variable, index) => {
                        console.log(`  Variable ${index + 1}:`, {
                            name: variable.name,
                            type: variable.type,
                            variableId: variable.variableId,
                            parentFolderId: variable.parentFolderId
                        });
                    });
                }
                
                if (folders.length > 0) {
                    console.log('📁 Sample Folders:');
                    folders.forEach((folder, index) => {
                        console.log(`  Folder ${index + 1}:`, {
                            name: folder.name,
                            folderId: folder.folderId
                        });
                    });
                }
            } else {
                console.error('❌ No containerVersion found in GTM data');
            }
            
            document.getElementById('fileName').textContent = file.name;
            console.log('🔄 Displaying container info...');
            this.displayContainerInfo();
            
            console.log('🔄 Populating folder options...');
            this.populateFolderOptions();
            
            console.log('🔄 Updating workflow - activating property sync step...');
            this.updateWorkflowStep(1, 'active');
            
            // Show step 2 (property sync)
            document.getElementById('step2').style.display = 'block';
            
            // Enable the main property input
            this.onPropertyInputChangeMain();
            
            console.log('✅ GTM JSON import completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during GTM JSON import:', error);
            console.error('Error details:', error.message);
            alert('Error parsing JSON file: ' + error.message);
        }
    }

    // Load default template from config, localStorage, or file path
    async loadDefaultTemplate() {
        console.log('🔄 Attempting to load default template...');
        
        // Priority 1: Check for stored template in localStorage
        const storedTemplate = this.loadStoredTemplate();
        if (storedTemplate) {
            console.log('✅ Loaded template from browser storage');
            this.gtmData = storedTemplate;
            this.displayContainerInfo();
            this.populateFolderOptions();
            
            // Update workflow - Set Step 1 (Property Sync) as active
            this.updateWorkflowStep(1, 'active');
            document.getElementById('step2').style.display = 'block';
            document.getElementById('editorSection').style.display = 'block';
            
            document.getElementById('fileName').textContent = 'Default Template (from storage)';
            
            // Enable property input monitoring
            this.onPropertyInputChangeMain();
            
            return true;
        }
        
        // Priority 2: Load from file path if configured
        if (this.DEFAULT_TEMPLATE_PATH) {
            try {
                console.log('🔄 Loading template from path:', this.DEFAULT_TEMPLATE_PATH);
                const response = await fetch(this.DEFAULT_TEMPLATE_PATH);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const templateData = await response.json();
                console.log('✅ Template loaded from file path');
                
                this.gtmData = templateData;
                this.displayContainerInfo();
                this.populateFolderOptions();
                
                // Update workflow - Set Step 1 (Property Sync) as active
                this.updateWorkflowStep(1, 'active');
                document.getElementById('step2').style.display = 'block';
                document.getElementById('editorSection').style.display = 'block';
                
                document.getElementById('fileName').textContent = `Default Template (${this.DEFAULT_TEMPLATE_PATH})`;
                
                // Enable property input monitoring
                this.onPropertyInputChangeMain();
                
                // Optionally save to storage for faster future loads
                this.saveTemplateToStorage(templateData);
                
                return true;
            } catch (error) {
                console.warn('⚠️ Failed to load template from path:', error.message);
            }
        }
        
        console.log('📝 No default template available');
        return false;
    }
    
    // Save template to localStorage for faster future loads
    saveTemplateToStorage(templateData) {
        try {
            const templateString = JSON.stringify(templateData);
            // Compress large templates by removing whitespace
            localStorage.setItem('gtm_editor_default_template', templateString);
            console.log('💾 Template saved to browser storage for faster loading');
        } catch (error) {
            console.warn('⚠️ Could not save template to storage (likely too large):', error.message);
        }
    }
    
    // Load template from localStorage
    loadStoredTemplate() {
        try {
            const stored = localStorage.getItem('gtm_editor_default_template');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('⚠️ Could not load stored template:', error.message);
            // Clear corrupted data
            localStorage.removeItem('gtm_editor_default_template');
        }
        return null;
    }
    
    // Clear stored template
    clearStoredTemplate() {
        localStorage.removeItem('gtm_editor_default_template');
        console.log('🗑️ Stored template cleared');
    }
    
    // Check if default template is available and update UI
    async checkTemplateAvailability() {
        const hasStoredTemplate = !!this.loadStoredTemplate();
        const hasConfigPath = !!this.DEFAULT_TEMPLATE_PATH;
        
        if (hasStoredTemplate || hasConfigPath) {
            this.showTemplateStatus(hasStoredTemplate, hasConfigPath);
        }
    }
    
    // Show template availability status in Step 1
    showTemplateStatus(hasStored, hasConfigPath) {
        const templateStatus = document.getElementById('templateStatus');
        const templateStatusText = document.getElementById('templateStatusText');
        const uploadLabel = document.querySelector('label[for="fileInput"]');
        const templateOptionsTitle = document.getElementById('templateOptionsTitle');
        const step1 = document.getElementById('step1');
        
        let statusMessage = '📁 Default template available';
        if (hasStored && hasConfigPath) {
            statusMessage = '📁 Default template available (storage + config)';
        } else if (hasStored) {
            statusMessage = '📁 Default template available (from storage)';
        } else if (hasConfigPath) {
            statusMessage = '📁 Default template available (from config)';
        }
        
        templateStatusText.textContent = statusMessage;
        templateStatus.style.display = 'block';
        uploadLabel.textContent = '📁 Choose Different JSON File';
        templateOptionsTitle.textContent = 'GTM Template Options (Template Available)';
        
        // Show Step 2 as the primary workflow
        document.getElementById('step2').style.display = 'block';
        
        // Collapse template options to de-emphasize them
        step1.classList.add('collapsed');
        
        console.log('📋 Template status displayed:', statusMessage);
    }
    
    // Use default template (button click handler)
    async useDefaultTemplate() {
        console.log('🔄 Using default template...');
        const success = await this.loadDefaultTemplate();
        
        if (success) {
            console.log('✅ Default template loaded and workflow advanced');
        } else {
            alert('Could not load default template. Please choose a file manually.');
        }
    }
    
    // Save current container as default template
    saveCurrentAsTemplate() {
        if (!this.gtmData) {
            alert('No GTM container loaded. Please load a container first.');
            return;
        }
        
        console.log('💾 Saving current container as default template...');
        this.saveTemplateToStorage(this.gtmData);
        
        // Update UI to show template is now available
        this.checkTemplateAvailability();
        this.renderSettings();
        
        alert('✅ Current container saved as default template!\n\nNext time you open the tool, you can use this template without uploading the file again.');
    }
    
    // Toggle template options visibility
    toggleTemplateOptions() {
        const templateOptionsEl = document.getElementById('step1');
        const collapseIndicator = document.getElementById('collapseIndicator');
        
        templateOptionsEl.classList.toggle('collapsed');
        
        if (templateOptionsEl.classList.contains('collapsed')) {
            console.log('📁 Template options collapsed');
        } else {
            console.log('📁 Template options expanded');
        }
    }

    displayContainerInfo() {
        console.log('📋 Displaying container info...');
        const containerInfo = document.getElementById('containerInfo');
        const cv = this.gtmData.containerVersion;
        
        if (!cv) {
            containerInfo.innerHTML = '<div class="error">No container version data found</div>';
            return;
        }
        
        // Enhanced container name detection - check multiple possible locations
        let containerName = 'Unnamed Container';
        
        // Check different possible locations for container name
        if (cv.name) {
            containerName = cv.name;
            console.log('📋 Container name found in cv.name:', containerName);
        } else if (cv.containerName) {
            containerName = cv.containerName;
            console.log('📋 Container name found in cv.containerName:', containerName);
        } else if (this.gtmData.containerName) {
            containerName = this.gtmData.containerName;
            console.log('📋 Container name found in gtmData.containerName:', containerName);
        } else if (cv.container && cv.container.name) {
            containerName = cv.container.name;
            console.log('📋 Container name found in cv.container.name:', containerName);
        } else {
            console.log('📋 No container name found in any expected location');
            console.log('📋 Available cv properties:', Object.keys(cv));
            console.log('📋 cv.name value:', cv.name);
            console.log('📋 cv.name type:', typeof cv.name);
        }
        
        const accountId = cv.accountId || 'Unknown';
        const containerId = cv.containerId || 'Unknown';
        const version = cv.containerVersionId || 'Unknown';
        const exportFormat = this.gtmData.exportFormatVersion || 'Unknown';
        
        // Count items using comprehensive counting logic
        const tagCount = cv.tag?.length || 0;
        const triggerCount = cv.trigger?.length || 0;
        const folderCount = cv.folder?.length || 0;
        
        // Use the same comprehensive variable counting as renderVariables and getItemsByType
        const customVariables = cv.variable || [];
        const builtInVariables = cv.builtInVariable || [];
        const altCustomVariables = cv.customVariable || [];
        const enabledBuiltInVariables = cv.enabledBuiltInVariable || [];
        const disabledBuiltInVariables = cv.disabledBuiltInVariable || [];
        const workspaceBuiltInVariables = cv.workspaceBuiltInVariable || [];
        
        const allVariables = [
            ...customVariables,
            ...builtInVariables,
            ...altCustomVariables,
            ...enabledBuiltInVariables,
            ...disabledBuiltInVariables,
            ...workspaceBuiltInVariables
        ];
        
        // Remove duplicates based on variableId
        const uniqueVariableIds = new Set();
        const uniqueVariables = allVariables.filter(variable => {
            const id = variable.variableId || variable.builtInVariableId;
            if (id && !uniqueVariableIds.has(id)) {
                uniqueVariableIds.add(id);
                return true;
            } else if (!id) {
                return true; // Include variables without IDs
            }
            return false;
        });
        
        const variableCount = uniqueVariables.length;
        console.log('📋 Container info variable count calculation:', variableCount);
        
        // Escape HTML to prevent display issues
        const escapeHtml = (text) => {
            if (!text) return 'Unknown';
            return text.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };
        
        containerInfo.innerHTML = `
            <div class="container-info-item">
                <strong>📦 Container:</strong>
                <span class="info-value">${escapeHtml(containerName)}</span>
            </div>
            <div class="container-info-item">
                <strong>🆔 ID:</strong>
                <span class="info-value">${escapeHtml(containerId)}</span>
            </div>
            <div class="container-info-item">
                <strong>📊 Version:</strong>
                <span class="info-value">${escapeHtml(version)}</span>
            </div>
            <div class="container-info-item">
                <strong>🏷️ Tags:</strong>
                <span class="info-value">${tagCount}</span>
            </div>
            <div class="container-info-item">
                <strong>⚡ Triggers:</strong>
                <span class="info-value">${triggerCount}</span>
            </div>
            <div class="container-info-item">
                <strong>🔢 Variables:</strong>
                <span class="info-value">${variableCount}</span>
            </div>
            <div class="container-info-item">
                <strong>📁 Folders:</strong>
                <span class="info-value">${folderCount}</span>
            </div>
        `;
        
        console.log('📋 Final container name displayed:', containerName);
        console.log('📋 Container info displayed successfully');
    }

    populateFolderOptions() {
        const folderSelect = document.getElementById('bulkFolderSelect');
        folderSelect.innerHTML = '<option value="">No Folder</option>';
        
        if (this.gtmData.containerVersion?.folder) {
            this.gtmData.containerVersion.folder.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.folderId;
                option.textContent = folder.name;
                folderSelect.appendChild(option);
            });
        }
    }


    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        this.selectedItems.clear();
        this.updateBulkActionButtons();
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        console.log(`🔄 Rendering tab: ${this.currentTab}`);
        
        switch (this.currentTab) {
            case 'tags':
                this.renderTags();
                break;
            case 'triggers':
                this.renderTriggers();
                break;
            case 'variables':
                this.renderVariables();
                break;
            case 'folders':
                this.renderFolders();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    renderTags() {
        console.log('🏷️ Starting to render tags...');
        const tagsList = document.getElementById('tagsList');
        const tags = this.gtmData.containerVersion?.tag || [];
        
        console.log('🏷️ Raw tags data:', tags);
        console.log('🏷️ Found', tags.length, 'tags in container');
        
        // Store original tags for filtering
        this.originalItems = tags;
        this.filteredItems = this.filterItemsBySearch(tags);
        
        console.log('🏷️ After filtering:', this.filteredItems.length, 'tags to display');
        
        if (this.filteredItems.length === 0) {
            tagsList.innerHTML = '<div class="no-items">No tags found</div>';
            console.log('🏷️ No tags to display after filtering');
            return;
        }
        
        const renderedHTML = this.filteredItems.map((tag, filteredIndex) => {
            // Find the original index in the full tags array
            const originalIndex = tags.findIndex(t => t.tagId === tag.tagId);
            console.log(`🏷️ Rendering tag ${filteredIndex + 1}:`, {
                name: tag.name,
                type: tag.type,
                tagId: tag.tagId,
                originalIndex: originalIndex,
                paused: tag.paused
            });
            
            return `
                <div class="item-card" data-type="tag" data-index="${originalIndex}" data-id="${tag.tagId}">
                    <div class="item-header">
                        <input type="checkbox" class="item-checkbox" data-id="${tag.tagId}">
                        <div class="item-name" onclick="gtmEditor.editItem('tag', ${originalIndex})">${tag.name || 'Unnamed Tag'}</div>
                        <div class="item-status ${tag.paused ? 'disabled' : 'enabled'}">
                            ${tag.paused ? 'Disabled' : 'Enabled'}
                        </div>
                        <div class="item-actions">
                            <button class="btn-small" onclick="gtmEditor.editItem('tag', ${originalIndex})">Edit</button>
                            <button class="btn-small" onclick="gtmEditor.toggleItemStatus('tag', ${originalIndex})">
                                ${tag.paused ? 'Enable' : 'Disable'}
                            </button>
                        </div>
                    </div>
                    <div class="item-details">
                        <span class="item-type">${tag.type || 'Unknown Type'}</span>
                        ${tag.firingTriggerId && tag.firingTriggerId.length > 0 ? ` | Triggers: ${tag.firingTriggerId.length}` : ' | No triggers'}
                        ${tag.parentFolderId ? ` | Folder: ${this.getFolderName(tag.parentFolderId)}` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        tagsList.innerHTML = renderedHTML;
        console.log('🏷️ Tags rendered successfully');
        
        this.attachItemCheckboxListeners();
    }

    renderTriggers() {
        console.log('⚡ Starting to render triggers...');
        const triggersList = document.getElementById('triggersList');
        const triggers = this.gtmData.containerVersion?.trigger || [];
        
        console.log('⚡ Raw triggers data:', triggers);
        console.log('⚡ Found', triggers.length, 'triggers in container');
        
        // Store original triggers for filtering
        this.originalItems = triggers;
        this.filteredItems = this.filterItemsBySearch(triggers);
        
        console.log('⚡ After filtering:', this.filteredItems.length, 'triggers to display');
        
        if (this.filteredItems.length === 0) {
            triggersList.innerHTML = '<div class="no-items">No triggers found</div>';
            console.log('⚡ No triggers to display after filtering');
            return;
        }
        
        const renderedHTML = this.filteredItems.map((trigger, filteredIndex) => {
            // Find the original index in the full triggers array
            const originalIndex = triggers.findIndex(t => t.triggerId === trigger.triggerId);
            console.log(`⚡ Rendering trigger ${filteredIndex + 1}:`, {
                name: trigger.name,
                type: trigger.type,
                triggerId: trigger.triggerId,
                originalIndex: originalIndex
            });
            
            return `
                <div class="item-card" data-type="trigger" data-index="${originalIndex}" data-id="${trigger.triggerId}">
                    <div class="item-header">
                        <input type="checkbox" class="item-checkbox" data-id="${trigger.triggerId}">
                        <div class="item-name" onclick="gtmEditor.editItem('trigger', ${originalIndex})">${trigger.name || 'Unnamed Trigger'}</div>
                        <div class="item-status enabled">Active</div>
                        <div class="item-actions">
                            <button class="btn-small" onclick="gtmEditor.editItem('trigger', ${originalIndex})">Edit</button>
                        </div>
                    </div>
                    <div class="item-details">
                        <span class="item-type">${trigger.type || 'Unknown Type'}</span>
                        ${trigger.parentFolderId ? ` | Folder: ${this.getFolderName(trigger.parentFolderId)}` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        triggersList.innerHTML = renderedHTML;
        console.log('⚡ Triggers rendered successfully');
        
        this.attachItemCheckboxListeners();
    }

    renderVariables() {
        console.log('🔢 Starting to render variables...');
        const variablesList = document.getElementById('variablesList');
        const cv = this.gtmData.containerVersion;
        
        // Combine all variable types from all possible locations
        const customVariables = cv?.variable || [];
        const builtInVariables = cv?.builtInVariable || [];
        const altCustomVariables = cv?.customVariable || [];
        const enabledBuiltInVariables = cv?.enabledBuiltInVariable || [];
        const disabledBuiltInVariables = cv?.disabledBuiltInVariable || [];
        const workspaceBuiltInVariables = cv?.workspaceBuiltInVariable || [];
        
        // Merge all variables into one array
        const allVariables = [
            ...customVariables.map(v => ({ ...v, variableType: 'custom' })),
            ...builtInVariables.map(v => ({ ...v, variableType: 'built-in', variableId: v.builtInVariableId || v.variableId })),
            ...altCustomVariables.map(v => ({ ...v, variableType: 'custom-alt' })),
            ...enabledBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-enabled', variableId: v.builtInVariableId || v.variableId })),
            ...disabledBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-disabled', variableId: v.builtInVariableId || v.variableId })),
            ...workspaceBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-workspace', variableId: v.builtInVariableId || v.variableId }))
        ];
        
        console.log('🔢 Variable breakdown:');
        console.log('  - Custom variables:', customVariables.length);
        console.log('  - Built-in variables:', builtInVariables.length);
        console.log('  - Alt custom variables:', altCustomVariables.length);
        console.log('  - Enabled built-in variables:', enabledBuiltInVariables.length);
        console.log('  - Disabled built-in variables:', disabledBuiltInVariables.length);
        console.log('  - Workspace built-in variables:', workspaceBuiltInVariables.length);
        console.log('  - TOTAL variables found:', allVariables.length);
        
        // Remove duplicates based on variableId
        const uniqueVariables = [];
        const seenIds = new Set();
        
        allVariables.forEach(variable => {
            const id = variable.variableId || variable.builtInVariableId;
            if (id && !seenIds.has(id)) {
                seenIds.add(id);
                uniqueVariables.push(variable);
            } else if (!id) {
                // If no ID, include it anyway but log a warning
                console.warn('🔢 Variable without ID found:', variable);
                uniqueVariables.push(variable);
            }
        });
        
        console.log('🔢 After deduplication:', uniqueVariables.length, 'unique variables');
        console.log('🔢 All variables data sample (first 5):', uniqueVariables.slice(0, 5));
        
        // Store original variables for filtering (use the unique combined array)
        this.originalItems = uniqueVariables;
        this.filteredItems = this.filterItemsBySearch(uniqueVariables);
        
        console.log('🔢 After filtering:', this.filteredItems.length, 'variables to display');
        
        if (this.filteredItems.length === 0) {
            variablesList.innerHTML = '<div class="no-items">No variables found</div>';
            console.log('🔢 No variables to display after filtering');
            return;
        }
        
        const renderedHTML = this.filteredItems.map((variable, filteredIndex) => {
            // Find the original index in the full variables array
            const originalIndex = uniqueVariables.findIndex(v => v.variableId === variable.variableId);
            console.log(`🔢 Rendering variable ${filteredIndex + 1}:`, {
                name: variable.name,
                type: variable.type,
                variableType: variable.variableType,
                variableId: variable.variableId,
                originalIndex: originalIndex
            });
            
            const variableTypeDisplay = variable.variableType?.includes('built-in') ? 'Built-in' : 'Custom';
            
            return `
                <div class="item-card" data-type="variable" data-index="${originalIndex}" data-id="${variable.variableId}">
                    <div class="item-header">
                        <input type="checkbox" class="item-checkbox" data-id="${variable.variableId}">
                        <div class="item-name" onclick="gtmEditor.editItem('variable', ${originalIndex})">${variable.name || 'Unnamed Variable'}</div>
                        <div class="item-status ${variable.variableType === 'built-in' ? 'built-in' : 'enabled'}">${variableTypeDisplay}</div>
                        <div class="item-actions">
                            <button class="btn-small" onclick="gtmEditor.editItem('variable', ${originalIndex})">Edit</button>
                        </div>
                    </div>
                    <div class="item-details">
                        <span class="item-type">${variable.type || 'Unknown Type'}</span>
                        ${variable.parentFolderId ? ` | Folder: ${this.getFolderName(variable.parentFolderId)}` : ''}
                        ${variable.variableType === 'built-in' ? ' | Built-in Variable' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        variablesList.innerHTML = renderedHTML;
        console.log('🔢 Variables rendered successfully');
        
        this.attachItemCheckboxListeners();
    }

    renderFolders() {
        const foldersList = document.getElementById('foldersList');
        const folders = this.gtmData.containerVersion?.folder || [];
        this.filteredItems = this.filterItemsBySearch(folders);
        
        foldersList.innerHTML = this.filteredItems.map((folder, index) => `
            <div class="item-card" data-type="folder" data-index="${index}">
                <div class="item-header">
                    <input type="checkbox" class="item-checkbox" data-id="${folder.folderId}">
                    <div class="item-name" onclick="gtmEditor.editItem('folder', ${index})">${folder.name}</div>
                    <div class="item-status enabled">Active</div>
                    <div class="item-actions">
                        <button class="btn-small" onclick="gtmEditor.editItem('folder', ${index})">Edit</button>
                    </div>
                </div>
                <div class="item-details">
                    <span class="item-type">Folder</span>
                </div>
            </div>
        `).join('');
        
        this.attachItemCheckboxListeners();
    }

    renderSettings() {
        const settingsForm = document.getElementById('settingsForm');
        const containerVersion = this.gtmData.containerVersion || {};
        
        // Check if container settings section already exists
        let containerSettingsSection = settingsForm.querySelector('.container-settings-section');
        if (!containerSettingsSection) {
            // Create container settings section
            containerSettingsSection = document.createElement('div');
            containerSettingsSection.className = 'container-settings-section';
            settingsForm.appendChild(containerSettingsSection);
        }
        
        containerSettingsSection.innerHTML = `
            <h3>📋 Container Settings</h3>
            <div class="form-group">
                <label>Container Name:</label>
                <input type="text" id="containerName" value="${containerVersion.name || ''}" onchange="gtmEditor.updateContainerSetting('name', this.value)">
            </div>
            <div class="form-group">
                <label>Description:</label>
                <textarea id="containerDescription" onchange="gtmEditor.updateContainerSetting('description', this.value)">${containerVersion.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Notes:</label>
                <textarea id="containerNotes" onchange="gtmEditor.updateContainerSetting('notes', this.value)">${containerVersion.notes || ''}</textarea>
            </div>
        `;
        
        // Add API key management section
        let apiKeySection = settingsForm.querySelector('.api-key-section');
        if (!apiKeySection) {
            apiKeySection = document.createElement('div');
            apiKeySection.className = 'api-key-section';
            settingsForm.appendChild(apiKeySection);
        }
        
        const hasStoredKey = !!localStorage.getItem('gtm_editor_api_key');
        const hasConfigKey = !!this.CONFIG_API_KEY;
        let statusHtml = '';
        let helpText = '';
        
        if (hasConfigKey) {
            statusHtml = '<span class="status-config">🔧 API key loaded from config.js file</span>';
            helpText = '🔧 API key is loaded from your local config.js file (ignored by git). This is convenient for development.';
        } else if (hasStoredKey) {
            statusHtml = '<span class="status-saved">✅ API key saved in browser storage</span>';
            helpText = '🔒 Your API key is stored securely in browser local storage with encoding. It never leaves your browser.';
        } else {
            statusHtml = '<span class="status-none">❌ No API key available</span>';
            helpText = '🔑 No API key found. You will be prompted to enter one when using Google Sheets sync.';
        }
        
        apiKeySection.innerHTML = `
            <h3>🔐 API Key Management</h3>
            <div class="form-group">
                <label>Google Sheets API Key Status:</label>
                <div class="api-key-status">
                    ${statusHtml}
                </div>
            </div>
            <div class="form-group">
                <button type="button" class="btn-secondary" onclick="gtmEditor.updateApiKey()" ${hasConfigKey ? 'disabled title="API key is managed via config.js file"' : ''}>
                    ${hasConfigKey ? '🔧 Managed via config.js' : (hasStoredKey ? '🔄 Update API Key' : '🔑 Set API Key')}
                </button>
                ${hasStoredKey && !hasConfigKey ? 
                    '<button type="button" class="btn-secondary" onclick="gtmEditor.clearApiKey(); gtmEditor.renderSettings();" style="margin-left: 10px;">🗑️ Clear API Key</button>' : 
                    ''
                }
            </div>
            <div class="form-group">
                <small class="help-text">
                    ${helpText}
                </small>
            </div>
        `;
        
        // Template management section
        let templateSection = settingsForm.querySelector('.template-management-section');
        if (!templateSection) {
            templateSection = document.createElement('div');
            templateSection.className = 'template-management-section';
            settingsForm.appendChild(templateSection);
        }
        
        const hasStoredTemplate = !!this.loadStoredTemplate();
        const hasConfigPath = !!this.DEFAULT_TEMPLATE_PATH;
        
        templateSection.innerHTML = `
            <h3>📋 Template Management</h3>
            <div class="form-group">
                <label>Default Template Status:</label>
                <div class="template-status-info">
                    ${hasStoredTemplate ? 
                        '<span class="status-saved">✅ Template saved in browser storage</span>' : 
                        '<span class="status-none">❌ No template stored</span>'
                    }
                    ${hasConfigPath ? 
                        '<br><span class="status-config">🔧 Template path configured: ' + this.DEFAULT_TEMPLATE_PATH + '</span>' : 
                        ''
                    }
                </div>
            </div>
            <div class="form-group">
                <button type="button" class="btn-secondary" onclick="gtmEditor.saveCurrentAsTemplate()" ${!this.gtmData ? 'disabled title="Load a GTM container first"' : ''}>
                    💾 Save Current Container as Default Template
                </button>
                ${hasStoredTemplate ? 
                    '<button type="button" class="btn-secondary" onclick="gtmEditor.clearStoredTemplate(); gtmEditor.renderSettings();" style="margin-left: 10px;">🗑️ Clear Stored Template</button>' : 
                    ''
                }
            </div>
            <div class="form-group">
                <small class="help-text">
                    💡 Save your most frequently used GTM container as a default template. This eliminates the need to upload the same file repeatedly.
                    ${hasConfigPath ? '<br>🔧 You can also specify a template file path in your config.js file.' : ''}
                </small>
            </div>
        `;
    }

    attachItemCheckboxListeners() {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = e.target.dataset.id;
                if (e.target.checked) {
                    this.selectedItems.add(itemId);
                } else {
                    this.selectedItems.delete(itemId);
                }
                this.updateBulkActionButtons();
                this.updateItemCardSelection(e.target);
            });
        });
    }

    updateItemCardSelection(checkbox) {
        const itemCard = checkbox.closest('.item-card');
        if (checkbox.checked) {
            itemCard.classList.add('selected');
        } else {
            itemCard.classList.remove('selected');
        }
    }

    updateBulkActionButtons() {
        const hasSelection = this.selectedItems.size > 0;
        document.getElementById('bulkEditBtn').disabled = !hasSelection;
        document.getElementById('bulkDeleteBtn').disabled = !hasSelection;
    }

    selectAllItems() {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            this.selectedItems.add(checkbox.dataset.id);
            this.updateItemCardSelection(checkbox);
        });
        this.updateBulkActionButtons();
    }

    deselectAllItems() {
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            this.selectedItems.delete(checkbox.dataset.id);
            this.updateItemCardSelection(checkbox);
        });
        this.selectedItems.clear();
        this.updateBulkActionButtons();
    }

    filterItems() {
        this.renderCurrentTab();
    }

    filterItemsBySearch(items) {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        
        console.log(`🔍 Filtering ${items.length} items...`);
        console.log('🔍 Search term:', searchTerm);
        console.log('🔍 Status filter:', statusFilter);
        
        const filteredItems = items.filter(item => {
            const itemName = (item.name || '').toLowerCase();
            const itemType = (item.type || '').toLowerCase();
            
            const matchesSearch = !searchTerm || 
                itemName.includes(searchTerm) ||
                itemType.includes(searchTerm);
            
            const matchesStatus = !statusFilter || 
                (statusFilter === 'enabled' && !item.paused) ||
                (statusFilter === 'disabled' && item.paused);
            
            const shouldInclude = matchesSearch && matchesStatus;
            
            if (searchTerm && !shouldInclude) {
                console.log(`🔍 Filtered out: "${item.name}" (search: ${matchesSearch}, status: ${matchesStatus})`);
            }
            
            return shouldInclude;
        });
        
        console.log(`🔍 Filtered result: ${filteredItems.length} items`);
        return filteredItems;
    }

    getFolderName(folderId) {
        const folder = this.gtmData.containerVersion?.folder?.find(f => f.folderId === folderId);
        return folder ? folder.name : 'Unknown Folder';
    }

    editItem(type, index) {
        console.log(`✏️ Editing ${type} at index ${index}...`);
        
        const items = this.getItemsByType(type);
        console.log(`✏️ Total ${type} items available:`, items.length);
        console.log(`✏️ All ${type} items:`, items);
        
        if (index < 0 || index >= items.length) {
            console.error(`❌ Invalid index ${index} for ${type}. Max index: ${items.length - 1}`);
            alert(`Error: Invalid item index. Please refresh and try again.`);
            return;
        }
        
        const item = items[index];
        console.log(`✏️ Item to edit:`, item);
        
        this.currentEditItem = { type, index, item };
        
        const modal = document.getElementById('editModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}: ${item.name || 'Unnamed Item'}`;
        modalBody.innerHTML = this.generateEditForm(type, item);
        modal.style.display = 'block';
        
        console.log('✏️ Edit modal opened successfully');
    }

    generateEditForm(type, item) {
        console.log(`📝 Generating edit form for ${type}:`, item);
        
        // Escape HTML to prevent issues with quotes and special characters
        const escapeHtml = (text) => {
            if (!text) return '';
            return text.toString()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };
        
        let formHTML = `
            <div class="form-group">
                <label>Name:</label>
                <input type="text" id="editName" value="${escapeHtml(item.name)}" required>
            </div>
        `;
        
        // Add ID field for reference (readonly)
        const idField = this.getItemId(item, type);
        if (idField) {
            formHTML += `
                <div class="form-group">
                    <label>ID:</label>
                    <input type="text" id="editId" value="${escapeHtml(idField)}" readonly>
                </div>
            `;
        }
        
        if (type === 'tag' || type === 'trigger' || type === 'variable') {
            formHTML += `
                <div class="form-group">
                    <label>Type:</label>
                    <input type="text" id="editType" value="${escapeHtml(item.type)}" readonly>
                </div>
            `;
        }
        
        // Enhanced parameter editing based on type
        if (item.parameter && item.parameter.length > 0) {
            formHTML += `<div class="parameters-section">
                <h4>Configuration Parameters</h4>
                <div id="parametersContainer">`;
            
            item.parameter.forEach((param, index) => {
                const paramKey = param.key || param.type || `param_${index}`;
                const paramValue = param.value || '';
                const paramType = param.type || 'text';
                
                // Special handling for different parameter types
                if (paramKey === 'html' || paramType === 'template') {
                    // Custom HTML or template content
                    formHTML += `
                        <div class="form-group parameter-group" data-param-index="${index}">
                            <label>${escapeHtml(paramKey)}:</label>
                            <textarea class="parameter-input html-editor" data-key="${escapeHtml(paramKey)}" rows="8">${escapeHtml(paramValue)}</textarea>
                        </div>
                    `;
                } else if (paramKey.toLowerCase().includes('id') || paramKey.toLowerCase().includes('label')) {
                    // ID or label fields
                    formHTML += `
                        <div class="form-group parameter-group" data-param-index="${index}">
                            <label>${escapeHtml(paramKey)}:</label>
                            <input type="text" class="parameter-input" data-key="${escapeHtml(paramKey)}" value="${escapeHtml(paramValue)}">
                        </div>
                    `;
                } else if (paramKey.toLowerCase().includes('url') || paramKey.toLowerCase().includes('src')) {
                    // URL fields
                    formHTML += `
                        <div class="form-group parameter-group" data-param-index="${index}">
                            <label>${escapeHtml(paramKey)}:</label>
                            <input type="url" class="parameter-input" data-key="${escapeHtml(paramKey)}" value="${escapeHtml(paramValue)}">
                        </div>
                    `;
                } else if (paramType === 'boolean' || paramValue === 'true' || paramValue === 'false') {
                    // Boolean fields
                    formHTML += `
                        <div class="form-group parameter-group" data-param-index="${index}">
                            <label>
                                <input type="checkbox" class="parameter-input" data-key="${escapeHtml(paramKey)}" ${paramValue === 'true' ? 'checked' : ''}>
                                ${escapeHtml(paramKey)}
                            </label>
                        </div>
                    `;
                } else {
                    // Default text input
                    formHTML += `
                        <div class="form-group parameter-group" data-param-index="${index}">
                            <label>${escapeHtml(paramKey)}:</label>
                            <input type="text" class="parameter-input" data-key="${escapeHtml(paramKey)}" value="${escapeHtml(paramValue)}">
                        </div>
                    `;
                }
            });
            
            formHTML += `</div></div>`;
        }
        
        // Tag-specific fields
        if (type === 'tag') {
            formHTML += `
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="editPaused" ${item.paused ? 'checked' : ''}> 
                        Paused
                    </label>
                </div>
            `;
            
            // Show firing triggers info
            if (item.firingTriggerId && item.firingTriggerId.length > 0) {
                formHTML += `
                    <div class="form-group">
                        <label>Firing Triggers (${item.firingTriggerId.length}):</label>
                        <div class="trigger-list">
                            ${item.firingTriggerId.map(triggerId => {
                                const trigger = this.gtmData.containerVersion?.trigger?.find(t => t.triggerId === triggerId);
                                return `<div class="trigger-item">${trigger ? trigger.name : triggerId}</div>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        // Variable-specific fields
        if (type === 'variable' && item.variableType === 'built-in') {
            formHTML += `
                <div class="form-group">
                    <div class="info-message">
                        <strong>Note:</strong> This is a built-in GTM variable. Some properties may not be editable.
                    </div>
                </div>
            `;
        }
        
        formHTML += `
            <div class="form-group">
                <label>Folder:</label>
                <select id="editFolder">
                    <option value="">No Folder</option>
                    ${this.gtmData.containerVersion?.folder?.map(folder => 
                        `<option value="${folder.folderId}" ${item.parentFolderId === folder.folderId ? 'selected' : ''}>${escapeHtml(folder.name)}</option>`
                    ).join('') || ''}
                </select>
            </div>
        `;
        
        // Always show notes field
        formHTML += `
            <div class="form-group">
                <label>Notes:</label>
                <textarea id="editNotes">${escapeHtml(item.notes)}</textarea>
            </div>
        `;
        
        console.log('📝 Enhanced edit form HTML generated with parameter editing');
        return formHTML;
    }

    saveItemChanges() {
        if (!this.currentEditItem) return;
        
        console.log('💾 Saving item changes...');
        const { type, index } = this.currentEditItem;
        const items = this.getItemsByType(type);
        const item = items[index];
        
        console.log('💾 Original item:', item);
        
        // Update basic fields
        item.name = document.getElementById('editName').value;
        
        const folderSelect = document.getElementById('editFolder');
        if (folderSelect.value) {
            item.parentFolderId = folderSelect.value;
        } else {
            delete item.parentFolderId;
        }
        
        const notesField = document.getElementById('editNotes');
        if (notesField) {
            item.notes = notesField.value;
        }
        
        // Update parameters if they exist
        if (item.parameter && item.parameter.length > 0) {
            console.log('💾 Updating parameters...');
            const parameterInputs = document.querySelectorAll('.parameter-input');
            
            parameterInputs.forEach(input => {
                const paramKey = input.dataset.key;
                const paramIndex = parseInt(input.closest('.parameter-group').dataset.paramIndex);
                
                if (item.parameter[paramIndex] && item.parameter[paramIndex].key === paramKey) {
                    if (input.type === 'checkbox') {
                        item.parameter[paramIndex].value = input.checked ? 'true' : 'false';
                    } else {
                        item.parameter[paramIndex].value = input.value;
                    }
                    console.log(`💾 Updated parameter ${paramKey}:`, item.parameter[paramIndex].value);
                }
            });
        }
        
        // Type-specific updates
        if (type === 'tag') {
            const pausedCheckbox = document.getElementById('editPaused');
            if (pausedCheckbox) {
                item.paused = pausedCheckbox.checked;
            }
        }
        
        console.log('💾 Updated item:', item);
        console.log('💾 Item changes saved successfully');
        
        this.closeModals();
        this.renderCurrentTab();
    }

    toggleItemStatus(type, index) {
        const items = this.getItemsByType(type);
        const item = items[index];
        
        if (type === 'tag') {
            item.paused = !item.paused;
        }
        
        this.renderCurrentTab();
    }

    openBulkEditModal() {
        const modal = document.getElementById('bulkEditModal');
        
        // Reset form
        document.getElementById('bulkToggleStatus').checked = false;
        document.getElementById('bulkUpdateFolder').checked = false;
        document.getElementById('bulkFindReplace').checked = false;
        document.getElementById('bulkFolderSelect').disabled = true;
        document.getElementById('findText').disabled = true;
        document.getElementById('replaceText').disabled = true;
        document.getElementById('findText').value = '';
        document.getElementById('replaceText').value = '';
        
        modal.style.display = 'block';
    }

    applyBulkChanges() {
        const selectedIds = Array.from(this.selectedItems);
        const items = this.getItemsByType(this.currentTab);
        
        selectedIds.forEach(id => {
            const item = items.find(item => this.getItemId(item, this.currentTab) === id);
            if (!item) return;
            
            // Toggle status
            if (document.getElementById('bulkToggleStatus').checked && this.currentTab === 'tags') {
                item.paused = !item.paused;
            }
            
            // Update folder
            if (document.getElementById('bulkUpdateFolder').checked) {
                const folderId = document.getElementById('bulkFolderSelect').value;
                if (folderId) {
                    item.parentFolderId = folderId;
                } else {
                    delete item.parentFolderId;
                }
            }
            
            // Find and replace
            if (document.getElementById('bulkFindReplace').checked) {
                const findText = document.getElementById('findText').value;
                const replaceText = document.getElementById('replaceText').value;
                if (findText) {
                    item.name = item.name.replace(new RegExp(findText, 'g'), replaceText);
                }
            }
        });
        
        this.closeModals();
        this.renderCurrentTab();
    }

    bulkDeleteItems() {
        if (!confirm(`Are you sure you want to delete ${this.selectedItems.size} selected items?`)) {
            return;
        }
        
        const selectedIds = Array.from(this.selectedItems);
        const items = this.getItemsByType(this.currentTab);
        
        // Remove items from the array
        for (let i = items.length - 1; i >= 0; i--) {
            const itemId = this.getItemId(items[i], this.currentTab);
            if (selectedIds.includes(itemId)) {
                items.splice(i, 1);
            }
        }
        
        this.selectedItems.clear();
        this.updateBulkActionButtons();
        this.renderCurrentTab();
    }

    getItemsByType(type) {
        const containerVersion = this.gtmData.containerVersion;
        switch (type) {
            case 'tags':
            case 'tag':
                return containerVersion?.tag || [];
            case 'triggers':
            case 'trigger':
                return containerVersion?.trigger || [];
            case 'variables':
            case 'variable':
                // Return combined variables array (same logic as renderVariables)
                const customVariables = containerVersion?.variable || [];
                const builtInVariables = containerVersion?.builtInVariable || [];
                const altCustomVariables = containerVersion?.customVariable || [];
                const enabledBuiltInVariables = containerVersion?.enabledBuiltInVariable || [];
                const disabledBuiltInVariables = containerVersion?.disabledBuiltInVariable || [];
                const workspaceBuiltInVariables = containerVersion?.workspaceBuiltInVariable || [];
                
                const allVariables = [
                    ...customVariables.map(v => ({ ...v, variableType: 'custom' })),
                    ...builtInVariables.map(v => ({ ...v, variableType: 'built-in', variableId: v.builtInVariableId || v.variableId })),
                    ...altCustomVariables.map(v => ({ ...v, variableType: 'custom-alt' })),
                    ...enabledBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-enabled', variableId: v.builtInVariableId || v.variableId })),
                    ...disabledBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-disabled', variableId: v.builtInVariableId || v.variableId })),
                    ...workspaceBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-workspace', variableId: v.builtInVariableId || v.variableId }))
                ];
                
                // Remove duplicates
                const uniqueVariables = [];
                const seenIds = new Set();
                
                allVariables.forEach(variable => {
                    const id = variable.variableId || variable.builtInVariableId;
                    if (id && !seenIds.has(id)) {
                        seenIds.add(id);
                        uniqueVariables.push(variable);
                    } else if (!id) {
                        uniqueVariables.push(variable);
                    }
                });
                
                return uniqueVariables;
            case 'folders':
            case 'folder':
                return containerVersion?.folder || [];
            default:
                return [];
        }
    }

    getItemId(item, type) {
        switch (type) {
            case 'tags':
            case 'tag':
                return item.tagId;
            case 'triggers':
            case 'trigger':
                return item.triggerId;
            case 'variables':
            case 'variable':
                return item.variableId;
            case 'folders':
            case 'folder':
                return item.folderId;
            default:
                return item.id;
        }
    }

    updateContainerSetting(setting, value) {
        if (!this.gtmData.containerVersion) {
            this.gtmData.containerVersion = {};
        }
        this.gtmData.containerVersion[setting] = value;
    }
    
    updateApiKey() {
        const result = this.promptForApiKey();
        if (result) {
            this.renderSettings(); // Refresh the settings display
        }
    }

    closeModals() {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('bulkEditModal').style.display = 'none';
        this.currentEditItem = null;
    }

    exportJSON() {
        const dataStr = JSON.stringify(this.gtmData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `gtm-container-modified-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    // Google Sheets Integration Methods
    getAllVariables() {
        const cv = this.gtmData.containerVersion;
        
        // Combine all variable types from all possible locations (same as renderVariables)
        const customVariables = cv?.variable || [];
        const builtInVariables = cv?.builtInVariable || [];
        const altCustomVariables = cv?.customVariable || [];
        const enabledBuiltInVariables = cv?.enabledBuiltInVariable || [];
        const disabledBuiltInVariables = cv?.disabledBuiltInVariable || [];
        const workspaceBuiltInVariables = cv?.workspaceBuiltInVariable || [];
        
        // Merge all variables into one array with type labels
        const allVariables = [
            ...customVariables.map(v => ({ ...v, variableType: 'custom' })),
            ...builtInVariables.map(v => ({ ...v, variableType: 'built-in', variableId: v.builtInVariableId || v.variableId })),
            ...altCustomVariables.map(v => ({ ...v, variableType: 'custom-alt' })),
            ...enabledBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-enabled', variableId: v.builtInVariableId || v.variableId })),
            ...disabledBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-disabled', variableId: v.builtInVariableId || v.variableId })),
            ...workspaceBuiltInVariables.map(v => ({ ...v, variableType: 'built-in-workspace', variableId: v.builtInVariableId || v.variableId }))
        ];
        
        // Remove duplicates based on variable ID
        const uniqueVariables = [];
        const seenIds = new Set();
        
        allVariables.forEach(variable => {
            const id = variable.variableId || variable.builtInVariableId;
            if (id && !seenIds.has(id)) {
                seenIds.add(id);
                uniqueVariables.push(variable);
            } else if (!id) {
                uniqueVariables.push(variable);
            }
        });
        
        console.log('🔢 getAllVariables() found:', uniqueVariables.length, 'unique variables');
        return uniqueVariables;
    }

    onPropertyNameChange() {
        const propertyName = document.getElementById('propertyNameInput').value.trim();
        const syncBtn = document.getElementById('syncFromSheetBtn');
        syncBtn.disabled = !propertyName || !this.gtmData;
    }

    async syncFromSheet() {
        const propertyName = document.getElementById('propertyNameInput').value.trim();
        
        if (!propertyName) {
            this.showSyncStatus('Please enter a property name', 'error');
            return;
        }

        if (!this.API_KEY) {
            if (!this.promptForApiKey()) {
                this.showSyncStatus('API key required for Google Sheets sync', 'error');
                return;
            }
        }

        console.log('🔄 Starting Google Sheets sync for property:', propertyName);
        
        try {
            this.showSyncStatus('Loading sheet data...', 'loading');
            
            // Fetch sheet data
            const sheetData = await this.fetchSheetData();
            console.log('📋 Sheet data loaded:', sheetData);
            
            // Find property row
            const propertyRow = this.findPropertyRow(sheetData, propertyName);
            if (!propertyRow) {
                this.showSyncStatus(`Property "${propertyName}" not found in sheet`, 'error');
                return;
            }
            
            console.log('✅ Found property row:', propertyRow);
            
            // Find matching GTM variables and tags
            const changes = this.findGTMMatches(propertyRow);
            console.log('🔍 Found GTM matches:', changes);
            
            if (changes.length === 0) {
                this.showSyncStatus('No matching GTM variables found', 'error');
                return;
            }
            
            // Show preview
            this.showPreview(changes);
            this.showSyncStatus(`Found ${changes.length} variables to update`, 'success');
            
        } catch (error) {
            console.error('❌ Sync error:', error);
            this.showSyncStatus('Error loading sheet data', 'error');
        }
    }

    async fetchSheetData() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values/Tracker%20Sheet!A:AZ?key=${this.API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.values || [];
    }

    findPropertyRow(sheetData, propertyName) {
        console.log('🔍 Searching for property:', propertyName);
        
        if (sheetData.length < 2) return null;
        
        const headers = sheetData[0];
        const propertyColIndex = headers.findIndex(header => 
            header.toLowerCase().includes('property')
        );
        
        if (propertyColIndex === -1) {
            console.log('❌ Property column not found in headers:', headers);
            return null;
        }
        
        for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            if (row[propertyColIndex] && 
                row[propertyColIndex].toLowerCase().includes(propertyName.toLowerCase())) {
                
                // Map row data to column names
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index] || '';
                });
                
                console.log('✅ Found matching row:', rowData);
                return rowData;
            }
        }
        
        return null;
    }

    findPropertyRowByInput(sheetData, propertyInput) {
        console.log('🔍 Searching for property by', propertyInput.type + ':', propertyInput.value);
        
        if (sheetData.length < 2) return null;
        
        const headers = sheetData[0];
        let searchColumnIndex = -1;
        
        if (propertyInput.type === 'name') {
            // Look for property name column
            searchColumnIndex = headers.findIndex(header => 
                header.toLowerCase().includes('property')
            );
        } else if (propertyInput.type === 'url') {
            // Look for website URL column
            searchColumnIndex = headers.findIndex(header => 
                header.toLowerCase().includes('website') || 
                header.toLowerCase().includes('url')
            );
        }
        
        if (searchColumnIndex === -1) {
            console.log(`❌ ${propertyInput.type === 'name' ? 'Property' : 'Website URL'} column not found in headers:`, headers);
            return null;
        }
        
        console.log(`🔍 Searching in column ${searchColumnIndex}: ${headers[searchColumnIndex]}`);
        
        for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const cellValue = row[searchColumnIndex];
            
            if (!cellValue) continue;
            
            let isMatch = false;
            
            if (propertyInput.type === 'name') {
                // For property name, use partial matching (case insensitive)
                isMatch = cellValue.toLowerCase().includes(propertyInput.value.toLowerCase());
            } else if (propertyInput.type === 'url') {
                // For URL, clean both URLs and compare
                const cleanInputUrl = this.cleanUrl(propertyInput.value);
                const cleanCellUrl = this.cleanUrl(cellValue);
                isMatch = cleanCellUrl.includes(cleanInputUrl) || cleanInputUrl.includes(cleanCellUrl);
            }
            
            if (isMatch) {
                // Map row data to column names
                const rowData = {};
                headers.forEach((header, index) => {
                    rowData[header] = row[index] || '';
                });
                
                console.log('✅ Found matching row:', rowData);
                return rowData;
            }
        }
        
        return null;
    }

    cleanUrl(url) {
        if (!url) return '';
        
        // Remove protocol, www, trailing slashes, and convert to lowercase
        return url
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');
    }

    findGTMMatches(propertyRow) {
        const changes = [];
        
        // Get all variables (merge all variable arrays)
        const allVariables = this.getAllVariables();
        
        console.log('🔍 ===== ENHANCED VARIABLE DEBUGGING =====');
        console.log('🔍 Total variables found:', allVariables.length);
        console.log('🔍 Available sheet columns:', Object.keys(propertyRow));
        
        // Debug: Show ALL variables with detailed info
        console.log('🔍 ALL GTM VARIABLES:');
        allVariables.forEach((variable, index) => {
            console.log(`  ${index + 1}: "${variable.name}" (type: ${variable.type}, variableType: ${variable.variableType})`);
            if (variable.parameter && variable.parameter.length > 0) {
                variable.parameter.forEach(param => {
                    console.log(`    Parameter: ${param.key} = "${param.value}"`);
                });
            }
        });
        
        // Find GA4 Measurement ID variable
        console.log('🔍 Searching for GA4 Measurement ID variable...');
        const ga4Patterns = ['ga4', 'measurement', 'tracking', 'google analytics'];
        const ga4Variable = this.findVariableByPattern(allVariables, ga4Patterns);
        console.log('🔍 GA4 variable search result:', ga4Variable ? ga4Variable.name : 'NOT FOUND');
        console.log('🔍 Sheet GA4 value:', propertyRow['GA4 Measurement ID']);
        
        if (ga4Variable && propertyRow['GA4 Measurement ID']) {
            console.log('✅ Adding GA4 Measurement ID change');
            changes.push({
                type: 'variable',
                item: ga4Variable,
                field: 'defaultValue',
                oldValue: ga4Variable.parameter?.find(p => p.key === 'defaultValue')?.value || '',
                newValue: propertyRow['GA4 Measurement ID'],
                description: `GA4 Measurement ID Variable: ${ga4Variable.name}`
            });
        }
        
        // Find Conversion ID variable (using Conversion ID column K)
        console.log('🔍 Searching for Conversion ID variable...');
        const conversionIdPatterns = ['conversion', 'conv', 'ads', 'google ads', 'account'];
        const conversionIdVariable = this.findVariableByPattern(allVariables, conversionIdPatterns);
        console.log('🔍 Conversion ID variable search result:', conversionIdVariable ? conversionIdVariable.name : 'NOT FOUND');
        console.log('🔍 Sheet Conversion ID value:', propertyRow['Conversion ID']);
        
        if (conversionIdVariable && propertyRow['Conversion ID']) {
            console.log('✅ Adding Conversion ID change');
            changes.push({
                type: 'variable',
                item: conversionIdVariable,
                field: 'defaultValue',
                oldValue: conversionIdVariable.parameter?.find(p => p.key === 'defaultValue')?.value || '',
                newValue: propertyRow['Conversion ID'],
                description: `Conversion ID Variable: ${conversionIdVariable.name}`
            });
        }
        
        // Debug: Show all variables that might be label variables
        console.log('🔍 All variables for label matching:');
        allVariables.forEach((variable, index) => {
            const name = variable.name.toLowerCase();
            if (name.includes('label') || name.includes('conversion')) {
                console.log(`  ${index}: "${variable.name}"`);
            }
        });

        // Debug: Show all column names from the sheet
        console.log('🔍 All column names in property row:');
        Object.keys(propertyRow).forEach(columnName => {
            console.log(`  "${columnName}": "${propertyRow[columnName]}"`);
        });

        // Find GAds Conversion Label variables (only GAds, no TTD updates)
        // Simplified patterns for standardized GTM variable names
        const labelMappings = [
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'apply', 'start'], 
                column: 'Gads Conversion Label\nApply Now Start'
            },
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'apply', 'end'], 
                column: 'Gads Conversion Label\nApply Now End'
            },
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'contact', 'start'], 
                column: 'Gads Conversion Label\nContact Submit Start'
            },
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'contact', 'end'], 
                column: 'Gads Conversion Label\nContact Submit End'
            },
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'tour', 'start'], 
                column: 'Gads Conversion Label\nSchedule Tour Start'
            },
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'tour', 'end'], 
                column: 'Gads Conversion Label\nSchedule Tour End'
            },
            { 
                gadsPattern: ['gads', 'conversion', 'label', 'virtual', 'tour'], 
                column: 'Gads Conversion Label\nVirtual Tour'
            }
        ];
        
        labelMappings.forEach((mapping, index) => {
            console.log(`🔍 Trying GAds label mapping ${index + 1}:`);
            console.log(`  GAds pattern: [${mapping.gadsPattern.join(', ')}]`);
            console.log(`  Column: ${mapping.column}`);
            console.log(`  Column value: "${propertyRow[mapping.column]}"`);

            // Debug: Show which variables contain any of the pattern words
            console.log(`  🔍 Variables containing pattern words:`);
            allVariables.forEach(variable => {
                const name = variable.name.toLowerCase();
                const matchedWords = mapping.gadsPattern.filter(pattern => name.includes(pattern.toLowerCase()));
                if (matchedWords.length > 0) {
                    console.log(`    "${variable.name}" - matches: [${matchedWords.join(', ')}]`);
                }
            });

            // Look for GAds label variables only
            const gadsLabelVariable = this.findVariableBySpecificPattern(allVariables, mapping.gadsPattern);
            console.log(`  GAds match result:`, gadsLabelVariable ? gadsLabelVariable.name : 'NO MATCH');
            
            if (gadsLabelVariable && propertyRow[mapping.column]) {
                console.log('✅ Found GAds label variable:', gadsLabelVariable.name, 'for column:', mapping.column);
                changes.push({
                    type: 'variable',
                    item: gadsLabelVariable,
                    field: 'defaultValue',
                    oldValue: gadsLabelVariable.parameter?.find(p => p.key === 'defaultValue')?.value || '',
                    newValue: propertyRow[mapping.column],
                    description: `GAds Label Variable: ${gadsLabelVariable.name}`
                });
            }
        });
        
        // Find TTD Conversion Label variables (columns AO-AY)
        const ttdLabelMappings = [
            { 
                ttdPattern: ['ttd', 'ct', 'apply', 'start'],
                column: 'TTD - Apply Start CT'
            },
            { 
                ttdPattern: ['ttd', 'ct', 'apply', 'end'],
                column: 'TTD - Apply End CT'
            },
            { 
                ttdPattern: ['ttd', 'ct', 'contact', 'start'],
                column: 'TTD - Contact Start CT'
            },
            { 
                ttdPattern: ['ttd', 'ct', 'contact', 'end'],
                column: 'TTD - Contact End CT'
            },
            { 
                ttdPattern: ['ttd', 'ct', 'schedule', 'tour', 'start'],
                column: 'TTD - Schedule a Tour Start CT'
            },
            { 
                ttdPattern: ['ttd', 'ct', 'schedule', 'tour', 'end'],
                column: 'TTD - Schedule a Tour End CT'
            },
            { 
                ttdPattern: ['ttd', 'ct', 'virtual', 'tour'],
                column: 'TTD - Virtual Tour CT'
            }
        ];
        
        ttdLabelMappings.forEach((mapping, index) => {
            console.log(`🔍 Trying TTD label mapping ${index + 1}:`);
            console.log(`  TTD pattern: [${mapping.ttdPattern.join(', ')}]`);
            console.log(`  Column: ${mapping.column}`);
            console.log(`  Column value: "${propertyRow[mapping.column]}"`);

            // Look for TTD label variables
            const ttdLabelVariable = this.findVariableBySpecificPattern(allVariables, mapping.ttdPattern);
            console.log(`  TTD match result:`, ttdLabelVariable ? ttdLabelVariable.name : 'NO MATCH');
            
            if (ttdLabelVariable && propertyRow[mapping.column]) {
                console.log('✅ Found TTD label variable:', ttdLabelVariable.name, 'for column:', mapping.column);
                changes.push({
                    type: 'variable',
                    item: ttdLabelVariable,
                    field: 'defaultValue',
                    oldValue: ttdLabelVariable.parameter?.find(p => p.key === 'defaultValue')?.value || '',
                    newValue: propertyRow[mapping.column],
                    description: `TTD Label Variable: ${ttdLabelVariable.name}`
                });
            }
        });
        
        // Find CallRail Custom HTML tag
        const callrailTag = this.findCallRailTag();
        if (callrailTag && propertyRow['CallRail Tag']) {
            const htmlParam = callrailTag.parameter?.find(p => 
                p.key === 'html' || p.key === 'customHtml'
            );
            
            if (htmlParam) {
                changes.push({
                    type: 'tag',
                    item: callrailTag,
                    field: 'html',
                    oldValue: htmlParam.value || '',
                    newValue: propertyRow['CallRail Tag'],
                    description: `CallRail HTML Tag: ${callrailTag.name}`
                });
            }
        }
        
        // Final summary
        console.log('🎯 ===== FINAL MATCHING SUMMARY =====');
        console.log('🎯 Total changes found:', changes.length);
        changes.forEach((change, index) => {
            console.log(`  ${index + 1}. ${change.description}: "${change.oldValue}" → "${change.newValue}"`);
        });
        console.log('🎯 Expected 10 variables: GA4 ID, Conversion ID, 4 GAds Labels, CallRail, 3 TTD (if data exists)');
        
        this.pendingChanges = changes;
        return changes;
    }

    findVariableByPattern(variables, patterns) {
        console.log(`🔍 Pattern search with [${patterns.join(', ')}]:`);
        
        const matches = variables.filter(variable => {
            const name = variable.name.toLowerCase();
            const hasMatch = patterns.some(pattern => name.includes(pattern.toLowerCase()));
            if (hasMatch) {
                console.log(`  ✅ Match: "${variable.name}"`);
            }
            return hasMatch;
        });
        
        console.log(`🔍 Found ${matches.length} matches`);
        return matches[0]; // Return first match
    }

    findVariableBySpecificPattern(variables, patterns) {
        console.log(`🔍 Specific pattern search (ALL required) with [${patterns.join(', ')}]:`);
        
        const matches = variables.filter(variable => {
            const name = variable.name.toLowerCase();
            // ALL patterns must be present in the variable name
            const hasAllPatterns = patterns.every(pattern => name.includes(pattern.toLowerCase()));
            if (hasAllPatterns) {
                console.log(`  ✅ Match: "${variable.name}"`);
            } else {
                // Show which patterns matched and which didn't
                const matchedPatterns = patterns.filter(pattern => name.includes(pattern.toLowerCase()));
                if (matchedPatterns.length > 0) {
                    console.log(`  ⚠️ Partial match: "${variable.name}" (has: [${matchedPatterns.join(', ')}], missing: [${patterns.filter(p => !matchedPatterns.includes(p)).join(', ')}])`);
                }
            }
            return hasAllPatterns;
        });
        
        console.log(`🔍 Found ${matches.length} specific pattern matches`);
        return matches[0]; // Return first match
    }

    findCallRailTag() {
        const tags = this.gtmData.containerVersion.tag || [];
        return tags.find(tag => {
            if (tag.type !== 'html') return false;
            
            const htmlParam = tag.parameter?.find(p => 
                p.key === 'html' || p.key === 'customHtml'
            );
            
            if (!htmlParam) return false;
            
            const html = htmlParam.value.toLowerCase();
            return html.includes('callrail') || html.includes('cdn.callrail.com');
        });
    }

    showPreview(changes) {
        const previewEl = document.getElementById('syncPreview');
        const contentEl = document.getElementById('previewContent');
        
        contentEl.innerHTML = changes.map(change => `
            <div class="preview-item">
                <div class="preview-item-name">${this.escapeHtml(change.description)}</div>
                <div class="preview-item-change">
                    <span class="old-value">${this.escapeHtml(change.oldValue)}</span>
                    <span style="margin: 0 8px;">→</span>
                    <span class="new-value">${this.escapeHtml(change.newValue)}</span>
                </div>
            </div>
        `).join('');
        
        previewEl.style.display = 'block';
    }

    applySheetChanges() {
        if (!this.pendingChanges) return;
        
        console.log('💾 Applying sheet changes:', this.pendingChanges);
        
        this.pendingChanges.forEach((change, index) => {
            console.log(`💾 Processing change ${index + 1}:`, change);
            console.log(`💾 Variable structure:`, {
                name: change.item.name,
                type: change.item.type,
                parameter: change.item.parameter,
                defaultValue: change.item.defaultValue
            });
            
            if (change.type === 'variable') {
                // Try different ways to update the variable value
                
                // Method 1: Look for defaultValue parameter
                const defaultValueParam = change.item.parameter?.find(p => p.key === 'defaultValue');
                if (defaultValueParam) {
                    console.log('💾 Found defaultValue parameter, updating...');
                    defaultValueParam.value = change.newValue;
                    console.log('💾 Updated defaultValue parameter to:', defaultValueParam.value);
                }
                
                // Method 2: Look for value parameter
                const valueParam = change.item.parameter?.find(p => p.key === 'value');
                if (valueParam) {
                    console.log('💾 Found value parameter, updating...');
                    valueParam.value = change.newValue;
                    console.log('💾 Updated value parameter to:', valueParam.value);
                }
                
                // Method 3: Check if variable has direct defaultValue property
                if (change.item.hasOwnProperty('defaultValue')) {
                    console.log('💾 Found direct defaultValue property, updating...');
                    change.item.defaultValue = change.newValue;
                    console.log('💾 Updated defaultValue property to:', change.item.defaultValue);
                }
                
                // Method 4: If no existing parameters, create defaultValue parameter
                if (!defaultValueParam && !valueParam && !change.item.hasOwnProperty('defaultValue')) {
                    console.log('💾 No existing value found, creating defaultValue parameter...');
                    if (!change.item.parameter) change.item.parameter = [];
                    change.item.parameter.push({
                        key: 'defaultValue',
                        type: 'template',
                        value: change.newValue
                    });
                    console.log('💾 Created new defaultValue parameter');
                }
                
            } else if (change.type === 'tag') {
                // Update tag HTML parameter
                const param = change.item.parameter?.find(p => 
                    p.key === 'html' || p.key === 'customHtml'
                );
                if (param) {
                    console.log('💾 Updating HTML parameter...');
                    param.value = change.newValue;
                    console.log('💾 Updated HTML parameter');
                }
            }
        });
        
        console.log('💾 All changes applied, refreshing view...');
        
        // Refresh the current view
        this.renderCurrentTab();
        
        // Hide preview and show success
        document.getElementById('syncPreview').style.display = 'none';
        this.showSyncStatus('✅ Changes applied successfully!', 'success');
        
        this.pendingChanges = null;
    }

    cancelSheetChanges() {
        document.getElementById('syncPreview').style.display = 'none';
        this.pendingChanges = null;
        this.showSyncStatus('Changes cancelled', 'error');
    }

    showSyncStatus(message, type) {
        const statusEl = document.getElementById('syncStatus');
        statusEl.textContent = message;
        statusEl.className = `sync-status ${type}`;
    }

    // Load configuration from config file or set defaults
    loadConfiguration() {
        // Check if config file was loaded
        if (typeof window.GTMEditorConfig !== 'undefined') {
            const config = window.GTMEditorConfig;
            
            // Load Google Sheets configuration
            this.SHEET_ID = config.googleSheets?.sheetId || '1Q2W7RIOBpTNhtOHVmwjhcVPyJktgXQUqu-UB-ieTUSQ';
            this.CONFIG_API_KEY = config.googleSheets?.apiKey === 'YOUR_API_KEY_HERE' ? null : config.googleSheets?.apiKey;
            
            // Load development settings
            this.DEBUG_MODE = config.development?.debugMode || false;
            this.AUTO_LOAD_CONFIG = config.development?.autoLoadConfig || false;
            
            // Load template configuration
            this.DEFAULT_TEMPLATE_PATH = config.template?.defaultPath || null;
            this.AUTO_LOAD_TEMPLATE = config.template?.autoLoad || false;
            
            // Load UI preferences
            this.DEFAULT_TAB = config.ui?.defaultTab || 'tags';
            
            if (this.CONFIG_API_KEY) {
                console.log('🔧 Configuration loaded from config.js file');
            } else {
                console.log('📝 Config file found but API key not set');
            }
        } else {
            // Default configuration when no config file is present
            this.SHEET_ID = '1Q2W7RIOBpTNhtOHVmwjhcVPyJktgXQUqu-UB-ieTUSQ';
            this.CONFIG_API_KEY = null;
            this.DEBUG_MODE = false;
            this.AUTO_LOAD_CONFIG = false;
            this.DEFAULT_TEMPLATE_PATH = null;
            this.AUTO_LOAD_TEMPLATE = false;
            this.DEFAULT_TAB = 'tags';
            
            console.log('📝 No config file found - using defaults');
        }
    }

    // Simple encoding/decoding for localStorage (not cryptographically secure, but prevents casual viewing)
    encodeApiKey(key) {
        return btoa(key.split('').reverse().join(''));
    }
    
    decodeApiKey(encodedKey) {
        return atob(encodedKey).split('').reverse().join('');
    }
    
    // Load API key from config file, browser storage, or return null
    loadApiKey() {
        // Priority 1: Config file (for development)
        if (this.CONFIG_API_KEY) {
            console.log('🔧 API key loaded from config file');
            return this.CONFIG_API_KEY;
        }
        
        // Priority 2: Browser storage (for user convenience)
        try {
            const stored = localStorage.getItem('gtm_editor_api_key');
            if (stored) {
                console.log('🔐 API key loaded from secure browser storage');
                return this.decodeApiKey(stored);
            }
        } catch (error) {
            console.warn('⚠️ Could not load stored API key:', error);
        }
        
        // Priority 3: No key available - will prompt user when needed
        return null;
    }
    
    // Save API key to secure browser storage
    saveApiKey(apiKey) {
        try {
            const encoded = this.encodeApiKey(apiKey);
            localStorage.setItem('gtm_editor_api_key', encoded);
            console.log('🔐 API key saved to secure browser storage');
        } catch (error) {
            console.warn('⚠️ Could not save API key:', error);
        }
    }
    
    // Clear stored API key
    clearApiKey() {
        try {
            localStorage.removeItem('gtm_editor_api_key');
            this.API_KEY = null;
            console.log('🔐 API key cleared from storage');
        } catch (error) {
            console.warn('⚠️ Could not clear API key:', error);
        }
    }

    promptForApiKey() {
        const apiKey = prompt(`🔐 Google Sheets API Key Required
        
Please enter your Google Sheets API key to sync data.

🔒 SECURITY NOTE: This key will be stored securely in your browser's local storage for convenience. You can clear it anytime from the Settings tab.

Get your API key from: Google Cloud Console → APIs & Services → Credentials

API Key:`);
        
        if (apiKey && apiKey.trim()) {
            this.API_KEY = apiKey.trim();
            this.saveApiKey(this.API_KEY);
            console.log('🔐 API key set and saved to secure storage');
            return true;
        } else {
            console.log('❌ No API key provided - sheets sync unavailable');
            return false;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // Workflow Management Methods
    updateWorkflowStep(stepNumber, state) {
        const stepEl = document.getElementById(`step${stepNumber}`);
        if (!stepEl) return;

        // Remove existing state classes
        stepEl.classList.remove('active', 'completed');
        
        // Add new state class
        if (state === 'active' || state === 'completed') {
            stepEl.classList.add(state);
        }

        console.log(`🔄 Updated step ${stepNumber} to ${state}`);
    }

    switchInputTab(event) {
        const tabName = event.target.dataset.tab;
        
        // Update tab buttons
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Update input sections
        document.querySelectorAll('.input-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}Input`).classList.add('active');
        
        // Update sync button state
        this.onPropertyInputChangeMain();
        
        console.log(`🔄 Switched to ${tabName} input tab`);
    }

    onPropertyInputChangeMain() {
        const propertyName = document.getElementById('propertyNameInputMain').value.trim();
        const propertyUrl = document.getElementById('propertyUrlInputMain').value.trim();
        const syncBtn = document.getElementById('syncFromSheetBtnMain');
        
        // Enable sync button if either input has value and GTM data is loaded
        const hasInput = propertyName || propertyUrl;
        syncBtn.disabled = !hasInput || !this.gtmData;
    }

    getCurrentPropertyInput() {
        const activeTab = document.querySelector('.input-tab.active').dataset.tab;
        
        if (activeTab === 'name') {
            return {
                type: 'name',
                value: document.getElementById('propertyNameInputMain').value.trim()
            };
        } else {
            return {
                type: 'url',
                value: document.getElementById('propertyUrlInputMain').value.trim()
            };
        }
    }

    async syncFromSheetMain() {
        const propertyInput = this.getCurrentPropertyInput();
        
        if (!propertyInput.value) {
            this.showSyncStatusMain(`Please enter a property ${propertyInput.type}`, 'error');
            return;
        }

        if (!this.API_KEY) {
            if (!this.promptForApiKey()) {
                this.showSyncStatusMain('API key required for Google Sheets sync', 'error');
                return;
            }
        }

        console.log('🔄 Starting main workflow Google Sheets sync for property:', propertyInput);
        
        try {
            this.showSyncStatusMain('Loading sheet data...', 'loading');
            
            // Fetch sheet data
            const sheetData = await this.fetchSheetData();
            console.log('📋 Sheet data loaded:', sheetData);
            
            // Find property row
            const propertyRow = this.findPropertyRowByInput(sheetData, propertyInput);
            if (!propertyRow) {
                this.showSyncStatusMain(`Property "${propertyInput.value}" not found in sheet`, 'error');
                return;
            }
            
            console.log('✅ Found property row:', propertyRow);
            
            // Find matching GTM variables and tags
            const changes = this.findGTMMatches(propertyRow);
            console.log('🔍 Found GTM matches:', changes);
            
            if (changes.length === 0) {
                this.showSyncStatusMain('No matching GTM variables found', 'error');
                return;
            }
            
            // Show preview
            this.showPreviewMain(changes);
            this.showSyncStatusMain(`Found ${changes.length} variables to update`, 'success');
            
        } catch (error) {
            console.error('❌ Sync error:', error);
            this.showSyncStatusMain('Error loading sheet data', 'error');
        }
    }

    showPreviewMain(changes) {
        const previewEl = document.getElementById('syncPreviewMain');
        const contentEl = document.getElementById('previewContentMain');
        
        contentEl.innerHTML = changes.map(change => `
            <div class="preview-item">
                <div class="preview-item-name">${this.escapeHtml(change.description)}</div>
                <div class="preview-item-change">
                    <span class="old-value">${this.escapeHtml(change.oldValue)}</span>
                    <span style="margin: 0 8px;">→</span>
                    <span class="new-value">${this.escapeHtml(change.newValue)}</span>
                </div>
            </div>
        `).join('');
        
        previewEl.style.display = 'block';
    }

    applySheetChangesMain() {
        if (!this.pendingChanges) return;
        
        console.log('💾 Applying main workflow sheet changes:', this.pendingChanges);
        
        // Apply the changes (reuse existing logic)
        this.pendingChanges.forEach((change, index) => {
            console.log(`💾 Processing change ${index + 1}:`, change);
            
            if (change.type === 'variable') {
                // Try different ways to update the variable value
                const defaultValueParam = change.item.parameter?.find(p => p.key === 'defaultValue');
                const valueParam = change.item.parameter?.find(p => p.key === 'value');
                
                if (defaultValueParam) {
                    defaultValueParam.value = change.newValue;
                } else if (valueParam) {
                    valueParam.value = change.newValue;
                } else if (change.item.hasOwnProperty('defaultValue')) {
                    change.item.defaultValue = change.newValue;
                } else {
                    if (!change.item.parameter) change.item.parameter = [];
                    change.item.parameter.push({
                        key: 'defaultValue',
                        type: 'template',
                        value: change.newValue
                    });
                }
            } else if (change.type === 'tag') {
                const param = change.item.parameter?.find(p => 
                    p.key === 'html' || p.key === 'customHtml'
                );
                if (param) {
                    param.value = change.newValue;
                }
            }
        });
        
        // Hide preview and show success
        document.getElementById('syncPreviewMain').style.display = 'none';
        this.showSyncStatusMain('✅ Changes applied successfully!', 'success');
        
        // Progress to step 3
        this.proceedToStep2();
        
        this.pendingChanges = null;
    }

    cancelSheetChangesMain() {
        document.getElementById('syncPreviewMain').style.display = 'none';
        this.pendingChanges = null;
        this.showSyncStatusMain('Changes cancelled', 'error');
    }

    showSyncStatusMain(message, type) {
        const statusEl = document.getElementById('syncStatusMain');
        statusEl.textContent = message;
        statusEl.className = `sync-status-main ${type}`;
    }

    proceedToStep2() {
        console.log('🔄 Proceeding to step 2 (Review & Export)...');
        
        // Update workflow steps - Step 1 becomes completed, Step 2 (Review) becomes active
        this.updateWorkflowStep(1, 'completed');
        this.updateWorkflowStep(2, 'active');
        
        // Show step 3 (which is visually Step 2) and editor
        document.getElementById('step3').style.display = 'block';
        document.getElementById('editorSection').style.display = 'block';
        
        // Render the current tab
        this.renderCurrentTab();
        
        console.log('✅ Advanced to step 2 - Review & Export');
    }

    skipToStep2() {
        console.log('⏭️ Skipping Google Sheets sync, proceeding directly to step 2...');
        this.proceedToStep2();
    }
}

// Initialize the GTM Editor
const gtmEditor = new GTMEditor();