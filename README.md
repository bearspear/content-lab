# Content Lab

> **Laboratory for Content Transformation** - A modern multi-tool content editor and converter suite built with Angular.

Transform, edit, and forge content in multiple formats with professional-grade tools. Content Lab combines powerful editors for Markdown, JSON, CSV, JavaScript, and plain text into one seamless application.

---

## 🚀 Features

### 🔧 Multi-Tool Suite

Content Lab includes 5 specialized tools:

#### 1. **Markdown Converter & Editor**
- Real-time markdown to HTML conversion
- Live preview with multiple professional themes
- Syntax highlighting for code blocks (powered by highlight.js)
- Math equation rendering with KaTeX (inline `$...$` and block)
- GitHub Flavored Markdown (GFM) support
- Footnotes, tables, and advanced formatting
- Drag-and-drop file upload
- Export to HTML and PDF
- Multiple export formats: HTML, PDF, Markdown, AsciiDoc, Plain Text, JSON, YAML

#### 2. **JSON Editor**
- Monaco editor with full IntelliSense
- Syntax highlighting and validation
- Auto-formatting and beautification
- Error detection and reporting
- Dark/light theme support
- Import/export JSON files

#### 3. **CSV Editor**
- Interactive spreadsheet-like interface
- Add, edit, and delete rows/columns
- Import/export CSV files
- Column sorting and filtering
- Bulk editing capabilities
- Header row management

#### 4. **JavaScript Playground**
- Live code execution environment
- Monaco editor with autocomplete
- Real-time console output
- Error handling and debugging
- Support for modern ES6+ syntax
- Code persistence across sessions

#### 5. **Text Editor**
- Clean, distraction-free text editing
- Monaco editor integration
- Syntax highlighting for multiple languages
- Word/character count
- Auto-save functionality

---

## 🎨 Themes

Choose from **27 professionally designed themes** for markdown preview:

### Featured Themes:
- **Claude Chatbox** (Default) - Compact chat-optimized variant with tighter spacing
- **GitHub** - Classic GitHub markdown style
- **Dark Mode** - Dark theme for reduced eye strain
- **Academic** - Professional academic paper style
- **PubCSS** - Academic publication style (ACM SIG format)
- **Premium** - High-quality publish-ready theme with elegant typography
- **Medium** - Reader-friendly design inspired by Medium.com
- **ReadTheDocs** - Technical documentation style
- **Notion** - Clean minimal aesthetic
- **GitBook Clean** - Modern documentation with translucency
- **LaTeX** - Academic paper style with Computer Modern fonts
- **Cyberpunk Neon** - Futuristic theme with neon colors
- **Newspaper** - Traditional newspaper layout
- **Terminal** - Retro terminal aesthetic
- **Gradient Glass** - Modern glassmorphism
- **Professional Article** - Elegant typography with serif fonts
- And more...

---

## 📦 Display Options

Multi-select dropdown with customizable display settings:
- **Center Content** - Center content with 900px max-width
- **Hide Plaintext** - Hide plaintext code blocks
- **Hide Markdown** - Hide markdown code blocks
- **Hide Images** - Hide all images in preview

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18.x or higher
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/mbehringer/content-lab.git

# Navigate to project directory
cd content-lab

# Install dependencies
yarn install

# Start development server
yarn start
```

The application will be available at **`http://localhost:5001`**

### Development Commands

```bash
# Start development server
yarn start

# Build for production
yarn build

# Watch mode for development
yarn watch

# Run tests
yarn test
```

---

## 📖 Usage

### Markdown Tool
1. Upload a markdown file or start typing
2. Choose a theme from the dropdown
3. Use the display options to customize view
4. Export to HTML, PDF, or other formats

### JSON Editor
1. Click "JSON Editor" in the tool selector
2. Paste or type your JSON
3. Use auto-formatting features
4. Export when ready

### CSV Editor
1. Select "CSV Editor" from tools
2. Import a CSV file or start from scratch
3. Edit cells directly in the spreadsheet
4. Export your modified CSV

### JavaScript Playground
1. Navigate to "JS Playground"
2. Write your JavaScript code
3. Click "Run" to execute
4. View output in the console panel

### Text Editor
1. Open "Text Editor"
2. Start writing or paste content
3. Select language for syntax highlighting
4. Content auto-saves

---

## 🏗️ Project Structure

```
content-lab/
├── src/
│   ├── app/
│   │   ├── core/                      # Core services and models
│   │   │   ├── services/              # Theme, export, markdown services
│   │   │   ├── models/                # TypeScript interfaces
│   │   │   └── base/                  # Base components
│   │   ├── features/
│   │   │   ├── markdown-converter/    # Markdown tool
│   │   │   ├── json-editor/           # JSON editor tool
│   │   │   ├── csv-editor/            # CSV editor tool
│   │   │   ├── js-playground/         # JavaScript playground
│   │   │   └── text-editor/           # Text editor tool
│   │   ├── shared/                    # Shared components and utilities
│   │   │   ├── components/            # Reusable UI components
│   │   │   ├── constants/             # App constants
│   │   │   └── utils/                 # Utility functions
│   │   ├── md-converter/              # Main converter component
│   │   └── app.component.ts           # Root component
│   ├── embedded-styles/               # KaTeX and Highlight.js CSS
│   ├── styles.scss                    # Global styles
│   └── index.html                     # Main HTML file
├── docs/                              # Documentation and backups
├── angular.json                       # Angular CLI configuration
├── package.json                       # Dependencies
└── tsconfig.json                      # TypeScript configuration
```

---

## 💻 Technologies Used

### Core Framework
- **Angular 17** - Modern web framework with standalone components
- **TypeScript 5.4** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming
- **SCSS** - Advanced styling

### Editor & Rendering
- **Monaco Editor** - VS Code's powerful editor
- **Marked 12.0.2** - Markdown parser with GFM support
- **Highlight.js 11.11** - Syntax highlighting for 190+ languages
- **KaTeX 0.16** - Fast math equation rendering
- **html2pdf.js 0.12** - Client-side PDF generation

### Build & Development
- **Angular CLI 17.3** - Command-line interface
- **Yarn** - Package manager

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 📊 Bundle Size

- **Main Bundle**: ~607 KB (optimized)
- **Polyfills**: ~88 KB
- **Styles**: ~1 KB
- **Total**: ~696 KB (initial load)

---

## 🎯 Key Features by Tool

| Feature | Markdown | JSON | CSV | JavaScript | Text |
|---------|----------|------|-----|------------|------|
| Monaco Editor | ✓ | ✓ | - | ✓ | ✓ |
| Syntax Highlighting | ✓ | ✓ | - | ✓ | ✓ |
| Live Preview | ✓ | - | - | - | - |
| Multiple Themes | ✓ | - | - | - | - |
| Export Formats | 7 | 1 | 1 | - | 1 |
| File Import | ✓ | ✓ | ✓ | - | ✓ |
| Auto-save | ✓ | ✓ | ✓ | ✓ | ✓ |
| Code Execution | - | - | - | ✓ | - |

---

## 📝 License

MIT License - See LICENSE file for details

**Author**: Michael Behringer
**Repository**: [github.com/mbehringer/content-lab](https://github.com/mbehringer/content-lab)

---

## 🙏 Acknowledgments

- Theme designs inspired by Claude.ai, GitHub, Medium, Notion, and more
- Markdown parsing powered by [marked.js](https://marked.js.org/)
- Math rendering by [KaTeX](https://katex.org/)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)
- Code editor by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- Built with [Claude Code](https://claude.com/claude-code)

---

## 🚧 Future Enhancements

- [ ] Real-time collaboration features
- [ ] More export formats (DOCX, EPUB)
- [ ] Plugin system for custom tools
- [ ] Cloud storage integration
- [ ] Template library
- [ ] Advanced CSV operations (formulas, charts)
- [ ] JavaScript library imports

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Content Lab** - *Forge any content, in any format* 🔬✨
