# Markdown to HTML Converter

A modern, feature-rich Angular application that converts Markdown files to beautifully styled HTML with advanced features like syntax highlighting, math equation rendering, and multiple theme options.

## Features

### Core Functionality
- **File Upload**: Standard file picker and drag-and-drop support for `.md` and `.markdown` files
- **Real-time Preview**: Live iframe preview of converted HTML
- **Download HTML**: Export the converted HTML with embedded styles as a standalone file

### Markdown Support
- **GitHub Flavored Markdown (GFM)**: Full support for standard markdown syntax
- **Syntax Highlighting**: Beautiful code blocks with syntax highlighting using highlight.js
- **Math Equations**:
  - Inline math using `$equation$`
  - Block math using code blocks with `math` language
  - Powered by KaTeX
- **Footnotes**: Academic-style footnote references and definitions
- **Tables**: Full table support with proper formatting
- **Links & Lists**: Ordered, unordered lists and external links

### Themes
Choose from 5 professionally designed themes:
1. **Claude AI** (Default) - Clean, modern design inspired by claude.ai
2. **GitHub** - Classic GitHub markdown style
3. **Dark Mode** - Dark theme for reduced eye strain
4. **Academic** - Professional academic paper style with serif fonts
5. **Minimal** - Minimalist design with clean typography

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- Yarn package manager

### Installation

The project is already set up and ready to run. Simply start the development server:

```bash
cd /Users/mbehringer/Projects2/md-html
yarn start
```

The application will be available at `http://localhost:5001`

**Note**: Port 5000 was already in use by another service, so the app runs on port 5001.

### Development Commands

```bash
# Start development server (port 5000)
yarn start

# Build for production
yarn build

# Run tests
yarn test
```

## Usage

1. **Upload a Markdown File**:
   - Click the upload area to browse for files, or
   - Drag and drop a `.md` or `.markdown` file

2. **Choose a Theme**:
   - Select from the dropdown menu to change the preview style
   - Themes are applied in real-time

3. **Preview**:
   - View the rendered HTML in the iframe preview
   - All markdown features render immediately

4. **Download**:
   - Click "Download HTML" to save the converted file
   - The downloaded file includes all styles and is standalone

## Example Markdown Features

### Code Blocks with Syntax Highlighting

\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### Math Equations

Inline: The famous equation $E = mc^2$ discovered by Einstein.

Block:
\`\`\`math
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
\`\`\`

### Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✓ | Full GFM support |
| Math | ✓ | KaTeX rendering |
| Themes | ✓ | 5 options |

## Project Structure

```
md-html/
├── src/
│   ├── app/
│   │   ├── md-converter/          # Main converter component
│   │   │   ├── md-converter.component.ts    # Component logic
│   │   │   ├── md-converter.component.html  # Template
│   │   │   └── md-converter.component.scss  # Styles
│   │   ├── app.component.ts       # Root component
│   │   └── app.config.ts          # App configuration
│   ├── styles.scss                # Global styles
│   └── index.html                 # Main HTML file
├── angular.json                   # Angular CLI configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## Technologies Used

- **Angular 17**: Modern web framework
- **TypeScript**: Type-safe JavaScript
- **Marked**: Markdown parser (v12.0.2)
- **Highlight.js**: Syntax highlighting
- **KaTeX**: Math equation rendering
- **SCSS**: Styling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is a demonstration application created with Claude Code.

## Contributing

This is a demo project. Feel free to fork and modify as needed.

## Acknowledgments

- Theme design inspired by claude.ai
- Markdown parsing by marked.js
- Math rendering by KaTeX
- Syntax highlighting by highlight.js
