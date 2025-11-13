# Content Lab

> **Laboratory for Content Transformation** - A modern plugin-based multi-tool suite for content editing, transformation, and visualization built with Angular 17.

Transform, edit, visualize, and create content in multiple formats with 20+ professional-grade tools. Content Lab features a powerful plugin architecture with editors, converters, visualizations, games, and utilities all in one seamless application.

[![Angular](https://img.shields.io/badge/Angular-17-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

Content Lab includes **20 specialized tools** organized into 6 categories:

### 📝 Content & Design (4 tools)
- **Markdown to HTML** - Real-time markdown conversion with 27+ themes, math equations, syntax highlighting, and multiple export formats
- **Text Editor** - Monaco-powered editor with syntax highlighting for 190+ languages
- **SVG Editor** - Vector graphics editor with real-time preview and export
- **EPUB to PDF** - Convert EPUB books to PDF format (requires backend server)

### 💻 Code & Development (6 tools)
- **JSON Editor** - Monaco editor with IntelliSense, validation, and auto-formatting
- **JavaScript Playground** - Live code execution environment with console output
- **Regex Tester** - Interactive regular expression testing with explanations
- **Diff Checker** - Side-by-side text comparison with syntax highlighting
- **API Tester** - HTTP client for testing REST APIs with request/response views
- **Prompt Builder** - AI prompt engineering tool with templates and optimization

### 📊 Data & Text (2 tools)
- **CSV Editor** - Spreadsheet-like interface with sorting, filtering, and bulk editing
- **Word Counter** - Text analysis with word count, character count, and readability metrics

### 🛠️ Utilities (3 tools)
- **Base64 Encoder** - Encode/decode text and files to Base64
- **World Clock** - Multiple timezone clock with converter
- **FLAC Player** - High-fidelity audio player for FLAC files

### 🌍 Visualizations (4 tools)
- **Timeline Visualizer** - Interactive timeline creator with events and milestones
- **Globe Visualizer** - 3D Earth visualization with Three.js (locations, arcs, labels)
- **Star Map** - Astronomical visualization of stars and constellations
- **ASCII Art Generator** - Convert text/images to ASCII art, create charts, tables, and decorative borders

### 🎮 Games (1 tool)
- **Tetris** - Classic block-stacking game

---

## 🏗️ Architecture

Content Lab uses a **convention-based plugin architecture** (Phase 3) with:

- **Auto-discovery**: Plugins follow `features/[name]/[name].plugin.ts` pattern
- **Zero configuration**: Enable/disable features via `feature.config.js`
- **Auto-generated routes**: Routes generated from discovered plugins at build time
- **Automated validation**: Build-time checks prevent configuration errors
- **Lazy loading**: Features loaded on-demand for optimal performance
- **Lifecycle hooks**: Full plugin lifecycle (onInitialize, onActivate, onDeactivate, onDestroy)

### Monorepo Structure

```
content-lab/
├── apps/
│   ├── content-lab/              # Angular 17 frontend (20 features)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── features/     # Plugin features
│   │       │   ├── core/         # Core services
│   │       │   └── shared/       # Shared components
│   │       └── feature.config.js # Feature enable/disable
│   └── server/                   # Node.js backend (Express)
│       └── src/
│           └── api/              # REST APIs
├── packages/                     # Shared libraries
│   ├── plugin-system/            # Core plugin system
│   ├── core/                     # Shared core
│   ├── components/               # Shared components
│   └── ui-components/            # UI library
├── scripts/                      # Build automation
│   ├── generate-routes.js        # Auto-generate routes
│   └── validate-plugins.js       # Validate plugins
└── docs/                         # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 8.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/mbehringer/content-lab.git

# Navigate to project directory
cd content-lab

# Install dependencies
npm install

# Generate routes (auto-discovers plugins)
npm run generate:routes

# Start development server (frontend only)
npm start

# OR start with backend server (frontend + backend)
npm run start:dev
```

The application will be available at:
- **Frontend**: `http://localhost:5002`
- **Backend** (if running): `http://localhost:3000`

---

## 📦 Development Commands

```bash
# Generate routes from plugins
npm run generate:routes

# Validate plugin configuration
npm run validate:plugins

# Start frontend only (port 5002)
npm start

# Start frontend + backend (ports 5002 + 3000)
npm run start:dev

# Build for production
npm run build

# Build with specific configuration
npm run build:full          # All features (~1.04 MB)
npm run build:lightweight   # Essential tools (~600-800 KB)
npm run build:developer     # Dev-focused tools (~900 KB)
npm run build:writer        # Content writer tools (~800 KB)

# Analyze bundle size
npm run analyze

# Run tests
npm test

# Build server executables
npm run build:executables
```

---

## 🎨 Markdown Themes

Choose from **27 professionally designed themes** for markdown preview:

**Featured Themes:**
- Claude Chatbox (Default), GitHub, Dark Mode, Academic
- PubCSS (ACM SIG format), Premium, Medium, ReadTheDocs
- Notion, GitBook Clean, LaTeX, Cyberpunk Neon
- Newspaper, Terminal, Gradient Glass, Professional Article
- And more...

---

## 💻 Technology Stack

### Core Framework
- **Angular 17.3** - Modern web framework with standalone components
- **TypeScript 5.4** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming
- **Nx 21.6** - Monorepo build system
- **SCSS** - Advanced styling

### Editors & Rendering
- **Monaco Editor 0.54** - VS Code's powerful code editor
- **CodeMirror 6.0** - Lightweight code editor
- **Marked 12.0** - Markdown parser with GFM support
- **Highlight.js 11.11** - Syntax highlighting for 190+ languages
- **KaTeX 0.16** - Fast math equation rendering
- **html2pdf.js 0.12** - Client-side PDF generation

### Visualizations
- **Three.js 0.180** - 3D graphics library (Globe, Star Map)
- **D3.js 7.9** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18** - Web server framework
- **Puppeteer 21.6** - Headless browser for EPUB-PDF conversion
- **Nodemon** - Auto-restart development server

### Build & Development
- **Angular CLI 17.3** - Command-line interface
- **Webpack** - Module bundler
- **ESBuild** - Fast JavaScript bundler

---

## 🔌 Plugin Development

### Creating a New Plugin

1. **Create plugin directory:**
   ```
   apps/content-lab/src/app/features/my-feature/
   ```

2. **Create plugin file:**
   ```typescript
   // my-feature.plugin.ts
   import { Plugin } from '@content-lab/plugin-system';

   export const myFeaturePlugin: Plugin = {
     id: 'my-feature',
     name: 'My Feature',
     description: 'Description of my feature',
     version: '1.0.0',
     route: 'my-feature',
     icon: 'icon-name',
     category: 'utilities',

     load: async () => {
       const { MyFeatureComponent } = await import('./my-feature.component');
       return MyFeatureComponent;
     },

     onInitialize: () => console.log('[MyFeature] Initialized'),
     onActivate: () => console.log('[MyFeature] Activated'),
     onDeactivate: () => console.log('[MyFeature] Deactivated'),
     onDestroy: () => console.log('[MyFeature] Destroyed')
   };

   export default myFeaturePlugin;
   ```

3. **Enable in config:**
   ```javascript
   // feature.config.js
   export default {
     features: {
       'my-feature': { enabled: true }
     }
   };
   ```

4. **Generate routes:**
   ```bash
   npm run generate:routes
   ```

See [docs/PLUGIN_DEVELOPMENT_GUIDE.md](docs/PLUGIN_DEVELOPMENT_GUIDE.md) for detailed documentation.

---

## 🌐 Server APIs

The backend server provides the following REST APIs:

- `POST /api/epub-pdf/convert` - Convert EPUB to PDF
- `POST /api/proxy` - CORS proxy for API Tester
- `POST /api/web-capture/capture` - Web page capture (experimental)
- `GET /api/health` - Health check endpoint

---

## 📊 Build Configurations

Content Lab supports multiple build configurations for different use cases:

| Configuration | Size | Features | Use Case |
|--------------|------|----------|----------|
| **Full** | ~1.04 MB | All 20 features | Complete toolkit |
| **Lightweight** | ~600-800 KB | Essential tools | Fast loading |
| **Developer** | ~900 KB | Dev-focused | Software engineers |
| **Writer** | ~800 KB | Content tools | Content creators |

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Note**: Some features (e.g., 3D visualizations) require WebGL support.

---

## 📖 Documentation

- [Plugin Development Guide](docs/PLUGIN_DEVELOPMENT_GUIDE.md)
- [Plugin System Analysis](docs/PLUGIN_SYSTEM_ANALYSIS.md)
- [Phase 4 Completion](docs/PHASE_4_COMPLETION.md)
- [Troubleshooting Plugin Loading](docs/TROUBLESHOOTING_PLUGIN_LOADING.md)
- [Deploy to Server](docs/DEPLOY_TO_SERVER.md)
- [Feature Suggestions](docs/content-lab-feature-suggestions.md)

---

## 🎯 Feature Highlights

| Feature | Monaco Editor | Live Preview | Export | 3D Graphics | Backend Required |
|---------|---------------|--------------|--------|-------------|------------------|
| Markdown to HTML | ✓ | ✓ | 7 formats | - | - |
| JSON Editor | ✓ | - | JSON | - | - |
| JavaScript Playground | ✓ | ✓ | - | - | - |
| CSV Editor | - | ✓ | CSV | - | - |
| Text Editor | ✓ | - | TXT | - | - |
| Globe Visualizer | - | ✓ | - | ✓ | - |
| Star Map | - | ✓ | - | ✓ | - |
| ASCII Art Generator | - | ✓ | TXT | - | - |
| EPUB to PDF | - | - | PDF | - | ✓ |
| API Tester | - | ✓ | - | - | ✓ (proxy) |

---

## 🚧 Roadmap

### In Progress
- [x] Plugin system Phase 3 (convention-based)
- [x] Plugin lifecycle hooks Phase 4
- [x] ASCII Art Generator (5 modes)
- [x] Prompt Builder tool
- [ ] Web Capture tool (backend complete, frontend in progress)

### Planned Features
- [ ] Real-time collaboration
- [ ] Cloud storage integration
- [ ] More export formats (DOCX, EPUB)
- [ ] Template library
- [ ] Advanced data visualizations
- [ ] Plugin marketplace
- [ ] Mobile-responsive design improvements
- [ ] Offline mode with service workers
- [ ] Custom plugin API extensions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the plugin development guide for new features
4. Ensure all validation passes (`npm run validate:plugins`)
5. Commit your changes (`git commit -m 'Add AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Contribution Guidelines
- Follow Angular style guide
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Update documentation for new features
- Ensure bundle size remains reasonable

---

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

**Author**: Michael Behringer
**Repository**: [github.com/mbehringer/content-lab](https://github.com/mbehringer/content-lab)

---

## 🙏 Acknowledgments

Built with the help of powerful open-source libraries:

- **Frameworks**: Angular, Express, Nx
- **Editors**: Monaco Editor (Microsoft), CodeMirror
- **Rendering**: Marked.js, KaTeX, Highlight.js, html2pdf.js
- **3D Graphics**: Three.js
- **Data Viz**: D3.js
- **Backend**: Puppeteer, Nodemon
- Theme designs inspired by Claude.ai, GitHub, Medium, Notion, and more
- Built with [Claude Code](https://claude.com/claude-code)

---

## 📧 Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/mbehringer/content-lab/issues)
- Check [documentation](docs/) for guides and troubleshooting

---

## ⭐ Star History

If you find Content Lab useful, please consider giving it a star on GitHub!

---

**Content Lab** - *Your Laboratory for Content Transformation* 🔬✨

Transform anything, create everything.
