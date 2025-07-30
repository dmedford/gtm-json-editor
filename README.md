# GTM JSON Editor

A web-based tool for importing, editing, and exporting Google Tag Manager (GTM) container JSON files. This tool provides an intuitive interface for bulk editing tags, triggers, variables, and folders within GTM containers.

## 🚀 Features

### Core Functionality
- **Import GTM JSON Files**: Upload and parse Google Tag Manager container export files
- **Interactive Editor**: Navigate between Tags, Triggers, Variables, Folders, and Settings
- **Individual Item Editing**: Edit properties of tags, triggers, and variables with modal forms
- **Export Modified JSON**: Download updated container files ready for GTM import

### Bulk Editing Capabilities
- **Select All/Deselect All**: Quickly manage multiple items
- **Bulk Status Toggle**: Enable/disable multiple tags at once
- **Bulk Folder Assignment**: Move multiple items to different folders
- **Bulk Find & Replace**: Update item names across selections
- **Bulk Delete**: Remove multiple items simultaneously

### Enhanced User Experience
- **Search & Filter**: Find items by name, type, or status
- **Real-time Updates**: See changes immediately in the interface
- **Responsive Design**: Works on desktop and mobile devices
- **Comprehensive Logging**: Detailed console output for debugging
- **Data Validation**: Prevents data corruption during editing

## 🛠️ Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Google Tag Manager container export file (.json)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/gtm-json-editor.git
   cd gtm-json-editor
   ```

2. Open `index.html` in your web browser
   - No server setup required - runs entirely in the browser
   - All processing happens client-side for security

### Usage

1. **Import Container**
   - Click "Choose JSON File" to upload your GTM container export
   - The tool will automatically parse and display container information

2. **Navigate & Edit**
   - Use tabs to switch between Tags, Triggers, Variables, Folders, and Settings
   - Click item names or "Edit" buttons to modify individual items
   - Use search and filter options to find specific items

3. **Bulk Operations**
   - Select multiple items using checkboxes
   - Use bulk action buttons to apply changes to selected items
   - Available bulk operations: status toggle, folder assignment, find & replace, delete

4. **Export Changes**
   - Click "Export Modified JSON" to download your updated container
   - Import the file into your target GTM container

## 📁 Project Structure

```
gtm-json-editor/
├── index.html          # Main HTML file with UI structure
├── styles.css          # CSS styling for responsive design
├── script.js           # JavaScript application logic
├── README.md           # Project documentation
└── .gitignore          # Git ignore file
```

## 🔍 Debugging

The application includes comprehensive console logging to help debug issues:

1. Open browser developer tools (F12 → Console)
2. Upload your GTM JSON file
3. Watch detailed logging output including:
   - File structure analysis
   - Item counts and data validation
   - Rendering process details
   - Filter and search operations
   - Edit form generation

## 🏗️ GTM JSON Structure

The tool works with standard GTM container export format containing:

- **Container Version**: Metadata about the container
- **Tags**: Tracking tags and their configurations
- **Triggers**: Conditions that fire tags
- **Variables**: Data layer variables and constants
- **Folders**: Organizational structure for items

## 🛡️ Security & Privacy

- **Client-Side Only**: All processing happens in your browser
- **No Data Upload**: Files never leave your computer
- **No External Dependencies**: Works completely offline
- **Data Validation**: Prevents corruption during editing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is not officially affiliated with Google or Google Tag Manager. Always backup your containers before making bulk changes and test thoroughly in a development environment.

## 🐛 Known Issues

- Large containers (500+ items) may experience slower rendering
- Complex tag configurations may not display all parameters in edit mode
- Some GTM-specific validation rules are not enforced

## 📞 Support

If you encounter issues or have questions:

1. Check the browser console for detailed error messages
2. Ensure your GTM JSON file is a valid container export
3. Open an issue on GitHub with details about your problem
4. Include console logs and sample data (remove sensitive information)

## 🚀 Future Enhancements

- [ ] Advanced parameter editing for tags and triggers
- [ ] Tag template support
- [ ] Workspace management
- [ ] Import/export validation
- [ ] Container comparison tools
- [ ] Custom tag type support