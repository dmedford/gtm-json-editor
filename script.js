class GTMEditor {
    constructor() {
        this.gtmData = null;
        this.selectedItems = new Set();
        this.currentTab = 'tags';
        this.currentEditItem = null;
        this.filteredItems = [];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File input
        document.getElementById('fileInput').addEventListener('change', this.handleFileImport.bind(this));
        
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
                
                console.log('📊 Item Counts:');
                console.log('  - Tags:', tags.length);
                console.log('  - Triggers:', triggers.length);
                console.log('  - Variables:', variables.length);
                console.log('  - Folders:', folders.length);
                
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
            
            console.log('🔄 Showing editor interface...');
            this.showEditor();
            
            console.log('🔄 Rendering current tab...');
            this.renderCurrentTab();
            
            console.log('✅ GTM JSON import completed successfully!');
            
        } catch (error) {
            console.error('❌ Error during GTM JSON import:', error);
            console.error('Error details:', error.message);
            alert('Error parsing JSON file: ' + error.message);
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
        
        const accountId = cv.accountId || 'Unknown';
        const containerId = cv.containerId || 'Unknown';
        const containerName = cv.name || 'Unnamed Container';
        const version = cv.containerVersionId || 'Unknown';
        const exportFormat = this.gtmData.exportFormatVersion || 'Unknown';
        
        // Count items
        const tagCount = cv.tag?.length || 0;
        const triggerCount = cv.trigger?.length || 0;
        const variableCount = cv.variable?.length || 0;
        const folderCount = cv.folder?.length || 0;
        
        containerInfo.innerHTML = `
            <div class="container-info-item">
                <strong>📦 Container:</strong> ${containerName}
            </div>
            <div class="container-info-item">
                <strong>🆔 Container ID:</strong> ${containerId}
            </div>
            <div class="container-info-item">
                <strong>📊 Version:</strong> ${version}
            </div>
            <div class="container-info-item">
                <strong>🏷️ Tags:</strong> ${tagCount}
            </div>
            <div class="container-info-item">
                <strong>⚡ Triggers:</strong> ${triggerCount}
            </div>
            <div class="container-info-item">
                <strong>🔢 Variables:</strong> ${variableCount}
            </div>
            <div class="container-info-item">
                <strong>📁 Folders:</strong> ${folderCount}
            </div>
        `;
        
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

    showEditor() {
        document.getElementById('editorSection').style.display = 'block';
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
        const variables = this.gtmData.containerVersion?.variable || [];
        
        console.log('🔢 Raw variables data:', variables);
        console.log('🔢 Found', variables.length, 'variables in container');
        
        // Store original variables for filtering
        this.originalItems = variables;
        this.filteredItems = this.filterItemsBySearch(variables);
        
        console.log('🔢 After filtering:', this.filteredItems.length, 'variables to display');
        
        if (this.filteredItems.length === 0) {
            variablesList.innerHTML = '<div class="no-items">No variables found</div>';
            console.log('🔢 No variables to display after filtering');
            return;
        }
        
        const renderedHTML = this.filteredItems.map((variable, filteredIndex) => {
            // Find the original index in the full variables array
            const originalIndex = variables.findIndex(v => v.variableId === variable.variableId);
            console.log(`🔢 Rendering variable ${filteredIndex + 1}:`, {
                name: variable.name,
                type: variable.type,
                variableId: variable.variableId,
                originalIndex: originalIndex
            });
            
            return `
                <div class="item-card" data-type="variable" data-index="${originalIndex}" data-id="${variable.variableId}">
                    <div class="item-header">
                        <input type="checkbox" class="item-checkbox" data-id="${variable.variableId}">
                        <div class="item-name" onclick="gtmEditor.editItem('variable', ${originalIndex})">${variable.name || 'Unnamed Variable'}</div>
                        <div class="item-status enabled">Active</div>
                        <div class="item-actions">
                            <button class="btn-small" onclick="gtmEditor.editItem('variable', ${originalIndex})">Edit</button>
                        </div>
                    </div>
                    <div class="item-details">
                        <span class="item-type">${variable.type || 'Unknown Type'}</span>
                        ${variable.parentFolderId ? ` | Folder: ${this.getFolderName(variable.parentFolderId)}` : ''}
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
        
        settingsForm.innerHTML = `
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
        
        // Show additional metadata in read-only format
        if (item.parameter && item.parameter.length > 0) {
            formHTML += `
                <div class="form-group">
                    <label>Parameters (${item.parameter.length}):</label>
                    <div class="parameter-preview">
                        ${item.parameter.slice(0, 3).map(param => 
                            `<div class="param-item"><strong>${escapeHtml(param.key || param.type)}:</strong> ${escapeHtml(param.value || param.name || 'N/A')}</div>`
                        ).join('')}
                        ${item.parameter.length > 3 ? `<div class="param-more">... and ${item.parameter.length - 3} more</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        console.log('📝 Edit form HTML generated');
        return formHTML;
    }

    saveItemChanges() {
        if (!this.currentEditItem) return;
        
        const { type, index } = this.currentEditItem;
        const items = this.getItemsByType(type);
        const item = items[index];
        
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
        
        // Type-specific updates
        if (type === 'tag') {
            item.paused = document.getElementById('editPaused').checked;
        }
        
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
                return containerVersion?.variable || [];
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
}

// Initialize the GTM Editor
const gtmEditor = new GTMEditor();