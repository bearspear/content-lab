import { Component, OnInit, ViewChild, ElementRef, SecurityContext, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import hljs from 'highlight.js';
import * as katex from 'katex';
import { KATEX_CSS, HIGHLIGHT_CSS_LIGHT, HIGHLIGHT_CSS_DARK } from '../embedded-styles';

interface Theme {
  name: string;
  value: string;
  description: string;
}

@Component({
  selector: 'app-md-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './md-converter.component.html',
  styleUrl: './md-converter.component.scss'
})
export class MdConverterComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChild('markdownEditor') markdownEditor!: ElementRef<HTMLTextAreaElement>;

  markdownContent: string = '';
  htmlContent: string = '';
  isDragging: boolean = false;
  currentTheme: string = 'claude';
  isFullViewport: boolean = false;
  isDropdownOpen: boolean = false;
  viewMode: 'write' | 'preview' = 'preview';

  themes: Theme[] = [
    { name: 'Claude AI', value: 'claude', description: 'Clean, modern design inspired by claude.ai' },
    { name: 'GitHub', value: 'github', description: 'GitHub markdown style' },
    { name: 'Dark Mode', value: 'dark', description: 'Dark theme for reduced eye strain' },
    { name: 'Academic', value: 'academic', description: 'Academic paper style' },
    { name: 'PubCSS', value: 'pubcss', description: 'Academic publication style (ACM SIG format)' },
    { name: 'Minimal', value: 'minimal', description: 'Minimalist design' }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.configureMarked();
    this.loadSampleMarkdown();
  }

  configureMarked(): void {
    // Configure marked with custom renderer
    const renderer = new marked.Renderer();

    // Override code rendering for syntax highlighting
    renderer.code = (code: string, language: string | undefined): string => {
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
        } catch (err) {
          console.error('Highlighting error:', err);
        }
      }
      return `<pre><code class="hljs">${this.escapeHtml(code)}</code></pre>`;
    };

    // Override paragraph rendering to handle inline math
    const originalParagraph = renderer.paragraph.bind(renderer);
    renderer.paragraph = (text: string): string => {
      // Handle inline math: $...$
      text = text.replace(/\$([^$]+)\$/g, (match, math) => {
        try {
          return katex.renderToString(math, { throwOnError: false });
        } catch (e) {
          return match;
        }
      });
      return originalParagraph(text);
    };

    // Handle block-level math: $$...$$
    const originalBlockquote = renderer.blockquote.bind(renderer);
    renderer.blockquote = (quote: string): string => {
      // Check if this is a math block
      const mathMatch = quote.match(/^\s*\$\$([\s\S]+)\$\$/);
      if (mathMatch) {
        try {
          return `<div class="math-block">${katex.renderToString(mathMatch[1], {
            throwOnError: false,
            displayMode: true
          })}</div>`;
        } catch (e) {
          return originalBlockquote(quote);
        }
      }
      return originalBlockquote(quote);
    };

    // Support footnotes rendering
    renderer.link = (href: string, title: string | null | undefined, text: string): string => {
      // Handle footnote references
      if (href.startsWith('#fn-')) {
        return `<sup><a href="${href}" class="footnote-ref" id="fnref-${href.slice(4)}">${text}</a></sup>`;
      }
      // Handle footnote definitions
      if (href.startsWith('#fnref-')) {
        return `<a href="${href}" class="footnote-backref">↩</a>`;
      }
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
      pedantic: false
    });
  }

  loadSampleMarkdown(): void {
    this.markdownContent = `# Markdown to HTML Converter

Welcome to the **Markdown to HTML Converter**! This tool supports:

## Features

1. **Standard Markdown** - All GFM (GitHub Flavored Markdown) features
2. **Syntax Highlighting** - Beautiful code blocks
3. **Math Equations** - Using KaTeX for LaTeX rendering
4. **Footnotes** - Academic-style references
5. **Multiple Themes** - Choose from various style presets

## Code Example

\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
\`\`\`

## Math Equations

Inline math: The formula $E = mc^2$ is Einstein's famous equation.

Block math (use \`\`\` blocks with "math" language):

\`\`\`math
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
\`\`\`

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✓ | H1-H6 |
| Lists | ✓ | Ordered & Unordered |
| Code | ✓ | Inline and blocks |
| Math | ✓ | KaTeX rendering |

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

---

> **Tip**: Try uploading your own markdown file or drag and drop it into the upload area!

## Links and Images

- [GitHub](https://github.com)
- [Markdown Guide](https://www.markdownguide.org)

*Try changing the theme using the dropdown above!*
`;
    this.convertMarkdown();
  }

  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.readFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown') {
        this.readFile(file);
      } else {
        alert('Please upload a markdown file (.md or .markdown)');
      }
    }
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.markdownContent = e.target.result as string;
        this.convertMarkdown();
      }
    };
    reader.readAsText(file);
  }

  convertMarkdown(): void {
    if (!this.markdownContent.trim()) {
      this.htmlContent = '<p class="empty-message">No content to display. Upload a markdown file to get started.</p>';
      this.updateIframe();
      return;
    }

    try {
      // Convert markdown to HTML
      let html = marked.parse(this.markdownContent) as string;

      // Handle math blocks ($$...$$) in the markdown
      html = html.replace(/```math\n([\s\S]+?)```/g, (match, math) => {
        try {
          return `<div class="math-block">${katex.renderToString(math.trim(), {
            throwOnError: false,
            displayMode: true
          })}</div>`;
        } catch (e) {
          return `<pre class="math-error">${match}</pre>`;
        }
      });

      // Process footnotes
      html = this.processFootnotes(html);

      this.htmlContent = html;
      this.updateIframe();
    } catch (error) {
      console.error('Markdown conversion error:', error);
      this.htmlContent = `<div class="error">Error converting markdown: ${error}</div>`;
      this.updateIframe();
    }
  }

  processFootnotes(html: string): string {
    const footnotes: { id: string; content: string }[] = [];

    // Extract footnote definitions [^1]: content
    html = html.replace(/\[(\^[\w]+)\]:\s*(.+)/g, (match, id, content) => {
      footnotes.push({ id: id.slice(1), content });
      return '';
    });

    // Replace footnote references [^1]
    html = html.replace(/\[(\^[\w]+)\]/g, (match, id) => {
      const fnId = id.slice(1);
      return `<sup><a href="#fn-${fnId}" class="footnote-ref" id="fnref-${fnId}">[${fnId}]</a></sup>`;
    });

    // Add footnotes section if any exist
    if (footnotes.length > 0) {
      let footnotesHtml = '<hr class="footnotes-separator"><div class="footnotes"><ol>';
      footnotes.forEach(fn => {
        footnotesHtml += `<li id="fn-${fn.id}">${fn.content} <a href="#fnref-${fn.id}" class="footnote-backref">↩</a></li>`;
      });
      footnotesHtml += '</ol></div>';
      html += footnotesHtml;
    }

    return html;
  }

  updateIframe(): void {
    setTimeout(() => {
      const iframe = this.previewFrame?.nativeElement;
      if (!iframe) return;

      const fullHtml = this.generateFullHtml();
      const blob = new Blob([fullHtml], { type: 'text/html' });
      iframe.src = URL.createObjectURL(blob);
    }, 0);
  }

  generateFullHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  ${this.getThemeStyles()}
</head>
<body class="theme-${this.currentTheme}">
  <div class="markdown-body">
    ${this.htmlContent}
  </div>
</body>
</html>`;
  }

  getThemeStyles(): string {
    // Determine which highlight.js theme to use based on current theme
    const highlightCss = this.currentTheme === 'dark' ? HIGHLIGHT_CSS_DARK : HIGHLIGHT_CSS_LIGHT;

    return `
    <style>
      /* KaTeX Styles */
      ${KATEX_CSS}

      /* Highlight.js Styles */
      ${highlightCss}
    </style>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        line-height: 1.6;
        padding: 20px;
        transition: background-color 0.3s, color 0.3s;
      }

      .markdown-body {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
      }

      /* ===== CLAUDE THEME (Default) ===== */
      .theme-claude {
        background-color: #f9f9f8;
        color: #2d2d2d;
      }

      .theme-claude .markdown-body {
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .theme-claude h1, .theme-claude h2, .theme-claude h3 {
        color: #1a1a1a;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }

      .theme-claude h1 {
        font-size: 2em;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 0.3em;
      }

      .theme-claude h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 0.3em;
      }

      .theme-claude h3 { font-size: 1.25em; }
      .theme-claude h4 { font-size: 1em; }
      .theme-claude h5 { font-size: 0.875em; }
      .theme-claude h6 { font-size: 0.85em; color: #6b6b6b; }

      .theme-claude p {
        margin-bottom: 16px;
      }

      .theme-claude a {
        color: #0066cc;
        text-decoration: none;
      }

      .theme-claude a:hover {
        text-decoration: underline;
      }

      .theme-claude code {
        background-color: #f6f6f6;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 0.9em;
        color: #d73a49;
      }

      .theme-claude pre {
        background-color: #f6f6f6;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 16px 0;
        border: 1px solid #e5e5e5;
      }

      .theme-claude pre code {
        background: none;
        padding: 0;
        color: inherit;
        font-size: 0.85em;
        line-height: 1.45;
      }

      .theme-claude blockquote {
        border-left: 4px solid #0066cc;
        padding-left: 16px;
        margin: 16px 0;
        color: #6b6b6b;
        font-style: italic;
      }

      .theme-claude table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }

      .theme-claude table th,
      .theme-claude table td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }

      .theme-claude table th {
        background-color: #f6f6f6;
        font-weight: 600;
      }

      .theme-claude ul, .theme-claude ol {
        margin: 16px 0;
        padding-left: 32px;
      }

      .theme-claude li {
        margin: 4px 0;
      }

      .theme-claude hr {
        border: none;
        border-top: 1px solid #e5e5e5;
        margin: 24px 0;
      }

      /* ===== GITHUB THEME ===== */
      .theme-github {
        background-color: #ffffff;
        color: #24292f;
      }

      .theme-github h1 {
        border-bottom: 1px solid #d8dee4;
        padding-bottom: 0.3em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-size: 2em;
        font-weight: 600;
      }

      .theme-github h2 {
        border-bottom: 1px solid #d8dee4;
        padding-bottom: 0.3em;
        font-size: 1.5em;
        font-weight: 600;
      }

      .theme-github code {
        background-color: rgba(175, 184, 193, 0.2);
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 85%;
      }

      .theme-github pre {
        background-color: #f6f8fa;
        border-radius: 6px;
        padding: 16px;
        overflow: auto;
      }

      .theme-github blockquote {
        border-left: 0.25em solid #d0d7de;
        color: #57606a;
        padding: 0 1em;
      }

      /* ===== DARK THEME ===== */
      .theme-dark {
        background-color: #1a1a1a;
        color: #e0e0e0;
      }

      .theme-dark .markdown-body {
        background: #2d2d2d;
      }

      .theme-dark h1, .theme-dark h2, .theme-dark h3,
      .theme-dark h4, .theme-dark h5, .theme-dark h6 {
        color: #ffffff;
      }

      .theme-dark h1, .theme-dark h2 {
        border-bottom-color: #444;
      }

      .theme-dark a {
        color: #58a6ff;
      }

      .theme-dark code {
        background-color: #3d3d3d;
        color: #f97583;
      }

      .theme-dark pre {
        background-color: #0d1117;
        border: 1px solid #444;
      }

      .theme-dark blockquote {
        border-left-color: #58a6ff;
        color: #b0b0b0;
      }

      .theme-dark table th {
        background-color: #3d3d3d;
      }

      .theme-dark table th,
      .theme-dark table td {
        border-color: #444;
      }

      .theme-dark hr {
        border-top-color: #444;
      }

      /* ===== ACADEMIC THEME ===== */
      .theme-academic {
        background-color: #fafafa;
        color: #000000;
      }

      .theme-academic .markdown-body {
        font-family: 'Georgia', 'Times New Roman', serif;
        max-width: 750px;
        line-height: 1.8;
      }

      .theme-academic h1 {
        text-align: center;
        font-size: 2.2em;
        margin-bottom: 0.5em;
        font-weight: bold;
      }

      .theme-academic h2 {
        font-size: 1.5em;
        margin-top: 1.5em;
        font-weight: bold;
      }

      .theme-academic p {
        text-align: justify;
        margin-bottom: 1em;
      }

      .theme-academic code {
        font-family: 'Courier New', monospace;
        background-color: #f0f0f0;
      }

      .theme-academic blockquote {
        border-left: 3px solid #999;
        font-style: italic;
      }

      /* ===== MINIMAL THEME ===== */
      .theme-minimal {
        background-color: #ffffff;
        color: #333333;
      }

      .theme-minimal .markdown-body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        max-width: 800px;
        line-height: 1.7;
      }

      .theme-minimal h1, .theme-minimal h2, .theme-minimal h3 {
        font-weight: 300;
        letter-spacing: -0.02em;
      }

      .theme-minimal h1 {
        font-size: 2.5em;
        border-bottom: none;
      }

      .theme-minimal h2 {
        font-size: 1.8em;
        border-bottom: none;
      }

      .theme-minimal code {
        background-color: transparent;
        border: 1px solid #ddd;
        padding: 2px 4px;
      }

      .theme-minimal pre {
        background-color: #fafafa;
        border: 1px solid #eee;
      }

      /* ===== PUBCSS THEME (Academic Publication) ===== */
      .theme-pubcss {
        background-color: #ffffff;
        color: #000000;
      }

      .theme-pubcss .markdown-body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 10pt;
        max-width: 750px;
        line-height: 1.2;
        text-align: justify;
      }

      .theme-pubcss h1 {
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
        margin: 1.33em 0;
        text-align: left;
      }

      .theme-pubcss h2 {
        font-size: 12pt;
        font-weight: bold;
        margin: 1.33em 0;
      }

      .theme-pubcss h3,
      .theme-pubcss h4 {
        font-size: 11pt;
        font-style: italic;
        font-weight: normal;
        margin: 1.33em 0;
      }

      .theme-pubcss p {
        margin: 0 0 0.5em;
        text-indent: 0;
      }

      .theme-pubcss code {
        font-family: Courier, monospace;
        font-size: 9pt;
        background-color: #f5f5f5;
        padding: 2px 4px;
      }

      .theme-pubcss pre {
        font-family: Courier, monospace;
        background-color: #f5f5f5;
        padding: 12px;
        margin: 1em 0;
        border: 1px solid #ddd;
        overflow-x: auto;
      }

      .theme-pubcss pre code {
        background: none;
        padding: 0;
      }

      .theme-pubcss table {
        border-collapse: collapse;
        width: 100%;
        margin: 1.667em 0 1em;
        font-size: 9pt;
      }

      .theme-pubcss table th,
      .theme-pubcss table td {
        border: 0.5px solid #000;
        padding: 0.333em;
        text-align: center;
      }

      .theme-pubcss table th {
        font-weight: bold;
        background-color: transparent;
      }

      .theme-pubcss blockquote {
        border-left: 2px solid #666;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        color: #333;
      }

      .theme-pubcss ul,
      .theme-pubcss ol {
        margin: 0.5em 0;
        padding-left: 2em;
      }

      .theme-pubcss li {
        margin: 0.25em 0;
      }

      .theme-pubcss a {
        color: #000;
        text-decoration: none;
      }

      .theme-pubcss a:hover {
        text-decoration: underline;
      }

      .theme-pubcss hr {
        border: none;
        border-top: 1px solid #000;
        margin: 2em 0;
      }

      /* ===== COMMON STYLES ===== */
      .math-block {
        margin: 20px 0;
        overflow-x: auto;
        text-align: center;
      }

      .footnotes {
        margin-top: 40px;
        font-size: 0.9em;
      }

      .footnotes-separator {
        margin: 40px 0 20px 0;
      }

      .footnote-ref {
        text-decoration: none;
      }

      .footnote-backref {
        text-decoration: none;
        margin-left: 5px;
      }

      .empty-message {
        text-align: center;
        color: #999;
        font-style: italic;
        padding: 40px;
      }

      .error {
        color: #d73a49;
        background-color: #ffeef0;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid #d73a49;
      }

      /* Syntax highlighting is now provided by highlight.js themes above */

      @media print {
        body {
          background: white;
        }
        .markdown-body {
          box-shadow: none;
        }
      }
    </style>
    `;
  }

  onThemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentTheme = select.value;
    this.updateIframe();
  }

  downloadHtml(): void {
    const fullHtml = this.generateFullHtml();
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-markdown.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  toggleFullViewport(): void {
    this.isFullViewport = !this.isFullViewport;
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.split-button-container');
    if (!dropdown && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  async downloadPdf(): Promise<void> {
    this.isDropdownOpen = false;

    // Create a styled container for PDF generation
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width

    // Add theme styles
    const highlightCss = this.currentTheme === 'dark' ? HIGHLIGHT_CSS_DARK : HIGHLIGHT_CSS_LIGHT;
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      ${KATEX_CSS}
      ${highlightCss}
      ${this.getInlineStyles()}
    `;

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = `theme-${this.currentTheme}`;
    contentWrapper.innerHTML = `<div class="markdown-body">${this.htmlContent}</div>`;

    container.appendChild(styleElement);
    container.appendChild(contentWrapper);
    document.body.appendChild(container);

    try {
      // Dynamic import for html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: 'converted-markdown.pdf',
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const
        }
      };

      await html2pdf().set(options).from(contentWrapper).save();
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      document.body.removeChild(container);
    }
  }

  downloadAsciiDoc(): void {
    this.isDropdownOpen = false;

    const asciiDoc = this.convertMarkdownToAsciiDoc(this.markdownContent);
    const blob = new Blob([asciiDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-markdown.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadPlainText(): void {
    this.isDropdownOpen = false;

    const plainText = this.convertHtmlToPlainText(this.htmlContent);
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-markdown-plain.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadJson(): void {
    this.isDropdownOpen = false;

    const jsonData = this.convertToJson(this.htmlContent);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-markdown.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private convertToJson(html: string): any {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Find the first H1 as title
    const h1Element = temp.querySelector('h1');
    const title = h1Element ? h1Element.textContent?.trim() || 'Untitled' : 'Untitled';

    // Parse the content
    const content = this.parseElementChildren(temp);

    return {
      meta: {
        generatedAt: new Date().toISOString(),
        theme: this.currentTheme,
        converter: 'Markdown to HTML Converter'
      },
      title: title,
      content: content
    };
  }

  private parseElementChildren(element: Element): any[] {
    const result: any[] = [];

    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      const parsed = this.parseElement(child);
      if (parsed) {
        result.push(parsed);
      }
    }

    return result;
  }

  private parseElement(element: Element): any | null {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          level: parseInt(tagName.charAt(1)),
          content: element.textContent?.trim() || ''
        };

      case 'p':
        const pContent = this.parseInlineContent(element);
        return pContent.length > 0 ? {
          type: 'paragraph',
          content: pContent
        } : null;

      case 'pre':
        const codeElement = element.querySelector('code');
        const language = codeElement?.className.match(/language-(\w+)/)?.[1] || '';
        return {
          type: 'code',
          language: language,
          content: codeElement?.textContent || element.textContent || ''
        };

      case 'ul':
        return {
          type: 'list',
          ordered: false,
          items: this.parseListItems(element)
        };

      case 'ol':
        return {
          type: 'list',
          ordered: true,
          items: this.parseListItems(element)
        };

      case 'blockquote':
        return {
          type: 'blockquote',
          content: this.parseElementChildren(element)
        };

      case 'table':
        return this.parseTable(element);

      case 'hr':
        return {
          type: 'divider'
        };

      case 'div':
        // Handle special divs like math-block or footnotes
        if (element.classList.contains('math-block')) {
          return {
            type: 'math',
            displayMode: true,
            content: element.textContent?.trim() || ''
          };
        } else if (element.classList.contains('footnotes')) {
          return {
            type: 'footnotes',
            content: this.parseElementChildren(element)
          };
        }
        // For other divs, parse children
        const divChildren = this.parseElementChildren(element);
        return divChildren.length > 0 ? { type: 'container', content: divChildren } : null;

      default:
        // For unknown elements, try to parse children
        const children = this.parseElementChildren(element);
        if (children.length > 0) {
          return { type: tagName, content: children };
        }
        return null;
    }
  }

  private parseInlineContent(element: Element): any[] {
    const result: any[] = [];
    const nodes = element.childNodes;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          result.push({ type: 'text', content: text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element;
        const tagName = elem.tagName.toLowerCase();

        switch (tagName) {
          case 'strong':
          case 'b':
            result.push({
              type: 'bold',
              content: elem.textContent?.trim() || ''
            });
            break;

          case 'em':
          case 'i':
            result.push({
              type: 'italic',
              content: elem.textContent?.trim() || ''
            });
            break;

          case 'code':
            result.push({
              type: 'inlineCode',
              content: elem.textContent?.trim() || ''
            });
            break;

          case 'a':
            result.push({
              type: 'link',
              url: elem.getAttribute('href') || '',
              text: elem.textContent?.trim() || ''
            });
            break;

          case 'img':
            result.push({
              type: 'image',
              src: elem.getAttribute('src') || '',
              alt: elem.getAttribute('alt') || ''
            });
            break;

          case 'sup':
            // Handle footnote references
            const link = elem.querySelector('a');
            if (link && link.classList.contains('footnote-ref')) {
              result.push({
                type: 'footnoteRef',
                id: link.getAttribute('href')?.substring(1) || '',
                text: elem.textContent?.trim() || ''
              });
            }
            break;

          default:
            const text = elem.textContent?.trim();
            if (text) {
              result.push({ type: 'text', content: text });
            }
        }
      }
    }

    return result;
  }

  private parseListItems(listElement: Element): any[] {
    const items: any[] = [];
    const liElements = listElement.querySelectorAll(':scope > li');

    liElements.forEach(li => {
      // Check if this list item contains a nested list
      const nestedList = li.querySelector('ul, ol');

      if (nestedList) {
        // Get the text before the nested list
        const textContent: any[] = [];
        for (let i = 0; i < li.childNodes.length; i++) {
          const node = li.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text) {
              textContent.push({ type: 'text', content: text });
            }
          } else if (node !== nestedList) {
            const elem = node as Element;
            if (elem.tagName && elem.tagName.toLowerCase() !== 'ul' && elem.tagName.toLowerCase() !== 'ol') {
              const text = elem.textContent?.trim();
              if (text) {
                textContent.push({ type: 'text', content: text });
              }
            }
          }
        }

        items.push({
          type: 'listItem',
          content: textContent,
          nested: this.parseElement(nestedList)
        });
      } else {
        items.push({
          type: 'listItem',
          content: this.parseInlineContent(li)
        });
      }
    });

    return items;
  }

  private parseTable(tableElement: Element): any {
    const rows: any[] = [];
    const thead = tableElement.querySelector('thead');
    const tbody = tableElement.querySelector('tbody');

    // Parse header rows
    if (thead) {
      const headerRows = thead.querySelectorAll('tr');
      headerRows.forEach(tr => {
        const cells: any[] = [];
        tr.querySelectorAll('th, td').forEach(cell => {
          cells.push({
            type: cell.tagName.toLowerCase() === 'th' ? 'header' : 'cell',
            content: cell.textContent?.trim() || ''
          });
        });
        rows.push({ type: 'row', cells });
      });
    }

    // Parse body rows
    const bodyRows = tbody ? tbody.querySelectorAll('tr') : tableElement.querySelectorAll('tr');
    bodyRows.forEach(tr => {
      const cells: any[] = [];
      tr.querySelectorAll('th, td').forEach(cell => {
        cells.push({
          type: cell.tagName.toLowerCase() === 'th' ? 'header' : 'cell',
          content: cell.textContent?.trim() || ''
        });
      });
      if (cells.length > 0) {
        rows.push({ type: 'row', cells });
      }
    });

    return {
      type: 'table',
      rows: rows
    };
  }

  private convertHtmlToPlainText(html: string): string {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove script and style elements
    const scripts = temp.getElementsByTagName('script');
    const styles = temp.getElementsByTagName('style');

    for (let i = scripts.length - 1; i >= 0; i--) {
      scripts[i].remove();
    }

    for (let i = styles.length - 1; i >= 0; i--) {
      styles[i].remove();
    }

    // Get text content and clean it up
    let text = temp.textContent || temp.innerText || '';

    // Clean up excessive whitespace
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // Multiple blank lines to double
    text = text.replace(/[ \t]+/g, ' '); // Multiple spaces to single space
    text = text.trim();

    return text;
  }

  private convertMarkdownToAsciiDoc(markdown: string): string {
    let asciidoc = markdown;

    // Convert headers (reverse order to handle longer sequences first)
    asciidoc = asciidoc.replace(/^######\s+(.+)$/gm, '====== $1');
    asciidoc = asciidoc.replace(/^#####\s+(.+)$/gm, '===== $1');
    asciidoc = asciidoc.replace(/^####\s+(.+)$/gm, '==== $1');
    asciidoc = asciidoc.replace(/^###\s+(.+)$/gm, '=== $1');
    asciidoc = asciidoc.replace(/^##\s+(.+)$/gm, '== $1');
    asciidoc = asciidoc.replace(/^#\s+(.+)$/gm, '= $1');

    // Convert code blocks with language
    asciidoc = asciidoc.replace(/```(\w+)\n([\s\S]*?)```/g, (_match, lang, code) => {
      return `[source,${lang}]\n----\n${code.trim()}\n----`;
    });

    // Convert code blocks without language
    asciidoc = asciidoc.replace(/```\n([\s\S]*?)```/g, (_match, code) => {
      return `----\n${code.trim()}\n----`;
    });

    // Convert inline code
    asciidoc = asciidoc.replace(/`([^`]+)`/g, '`$1`');

    // Convert bold and italic (order matters!)
    // Bold + Italic: ***text*** or ___text___
    asciidoc = asciidoc.replace(/\*\*\*(.+?)\*\*\*/g, '*_$1_*');
    asciidoc = asciidoc.replace(/___(.+?)___/g, '*_$1_*');

    // Bold: **text** or __text__
    asciidoc = asciidoc.replace(/\*\*(.+?)\*\*/g, '*$1*');
    asciidoc = asciidoc.replace(/__(.+?)__/g, '*$1*');

    // Italic: *text* or _text_
    asciidoc = asciidoc.replace(/\*(.+?)\*/g, '_$1_');
    asciidoc = asciidoc.replace(/_(.+?)_/g, '_$1_');

    // Convert links: [text](url) to link:url[text]
    asciidoc = asciidoc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 'link:$2[$1]');

    // Convert images: ![alt](url) to image::url[alt]
    asciidoc = asciidoc.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, 'image::$2[$1]');

    // Convert unordered lists (*, -, +)
    asciidoc = asciidoc.replace(/^[\*\-\+]\s+(.+)$/gm, '* $1');

    // Convert ordered lists
    asciidoc = asciidoc.replace(/^\d+\.\s+(.+)$/gm, '. $1');

    // Convert blockquotes
    asciidoc = asciidoc.replace(/^>\s+(.+)$/gm, '____\n$1\n____');

    // Convert horizontal rules
    asciidoc = asciidoc.replace(/^(\-{3,}|_{3,}|\*{3,})$/gm, "'''");

    // Convert tables
    asciidoc = asciidoc.replace(/^\|(.+)\|$/gm, (match) => {
      // Check if this is a separator line
      if (/^[\|\-\s:]+$/.test(match)) {
        return ''; // Remove separator lines
      }
      return match;
    });

    // Add table delimiters
    const lines = asciidoc.split('\n');
    let inTable = false;
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
      const isSeparator = /^\|[\-\s:]+\|$/.test(line.trim());

      if (isTableRow && !isSeparator) {
        if (!inTable) {
          result.push('[options="header"]');
          result.push('|===');
          inTable = true;
        }
        result.push(line);
      } else if (isSeparator) {
        // Skip separator lines
        continue;
      } else {
        if (inTable) {
          result.push('|===');
          result.push('');
          inTable = false;
        }
        result.push(line);
      }
    }

    if (inTable) {
      result.push('|===');
    }

    asciidoc = result.join('\n');

    // Convert math blocks (if using $$...$$ notation)
    asciidoc = asciidoc.replace(/\$\$([^\$]+)\$\$/g, '[latexmath]\n++++\n$1\n++++');

    // Convert inline math
    asciidoc = asciidoc.replace(/\$([^\$]+)\$/g, 'latexmath:[$1]');

    // Convert footnotes [^1] to footnote:[text]
    // First collect footnote definitions
    const footnotes: { [key: string]: string } = {};
    asciidoc = asciidoc.replace(/^\[\^(\w+)\]:\s*(.+)$/gm, (_match, id, content) => {
      footnotes[id] = content;
      return '';
    });

    // Replace footnote references
    asciidoc = asciidoc.replace(/\[\^(\w+)\]/g, (match, id) => {
      const content = footnotes[id];
      return content ? `footnote:[${content}]` : match;
    });

    // Clean up multiple blank lines
    asciidoc = asciidoc.replace(/\n{3,}/g, '\n\n');

    return asciidoc.trim();
  }

  // View mode toggle
  setViewMode(mode: 'write' | 'preview'): void {
    this.viewMode = mode;
    if (mode === 'preview') {
      this.convertMarkdown();
    }
  }

  // Editor input handler
  onEditorInput(): void {
    // Auto-convert markdown while typing (debounced via setTimeout)
    if (this.viewMode === 'write') {
      this.convertMarkdown();
    }
  }

  // Keyboard shortcuts handler
  onEditorKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          this.insertBold();
          break;
        case 'i':
          event.preventDefault();
          this.insertItalic();
          break;
        case 'k':
          event.preventDefault();
          this.insertLink();
          break;
      }
    }

    // Handle Tab key for indentation
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertAtCursor('\t');
    }
  }

  // Helper method to insert text at cursor position
  private insertAtCursor(text: string, selectText: boolean = false): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(end);

    this.markdownContent = before + text + after;

    // Update cursor position
    setTimeout(() => {
      if (selectText) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + text.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  // Helper method to wrap selected text
  private wrapSelection(prefix: string, suffix: string = prefix, placeholder: string = ''): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.markdownContent.substring(start, end);
    const textToWrap = selectedText || placeholder;

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(end);

    this.markdownContent = before + prefix + textToWrap + suffix + after;

    setTimeout(() => {
      if (!selectedText) {
        // Select the placeholder text
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + textToWrap.length;
      } else {
        // Place cursor after the wrapped text
        textarea.selectionStart = textarea.selectionEnd = start + prefix.length + textToWrap.length + suffix.length;
      }
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  // Toolbar actions
  insertBold(): void {
    this.wrapSelection('**', '**', 'bold text');
  }

  insertItalic(): void {
    this.wrapSelection('*', '*', 'italic text');
  }

  insertStrikethrough(): void {
    this.wrapSelection('~~', '~~', 'strikethrough text');
  }

  insertCode(): void {
    this.wrapSelection('`', '`', 'code');
  }

  insertHeading(level: number): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && this.markdownContent[lineStart - 1] !== '\n') {
      lineStart--;
    }

    const before = this.markdownContent.substring(0, lineStart);
    const after = this.markdownContent.substring(lineStart);
    const heading = '#'.repeat(level) + ' ';

    this.markdownContent = before + heading + after;

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = lineStart + heading.length;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertCodeBlock(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.markdownContent.substring(start, end);

    const codeBlock = '\n```\n' + (selectedText || 'your code here') + '\n```\n';
    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(end);

    this.markdownContent = before + codeBlock + after;

    setTimeout(() => {
      if (!selectedText) {
        textarea.selectionStart = start + 5; // Position after ```\n
        textarea.selectionEnd = start + 5 + 'your code here'.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + codeBlock.length;
      }
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertBlockquote(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && this.markdownContent[lineStart - 1] !== '\n') {
      lineStart--;
    }

    const before = this.markdownContent.substring(0, lineStart);
    const after = this.markdownContent.substring(lineStart);

    this.markdownContent = before + '> ' + after;

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = lineStart + 2;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertUnorderedList(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const listItem = '\n- List item\n';

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(start);

    this.markdownContent = before + listItem + after;

    setTimeout(() => {
      textarea.selectionStart = start + 3; // After '\n- '
      textarea.selectionEnd = start + 3 + 'List item'.length;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertOrderedList(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const listItem = '\n1. List item\n';

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(start);

    this.markdownContent = before + listItem + after;

    setTimeout(() => {
      textarea.selectionStart = start + 4; // After '\n1. '
      textarea.selectionEnd = start + 4 + 'List item'.length;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertTask(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const task = '\n- [ ] Task item\n';

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(start);

    this.markdownContent = before + task + after;

    setTimeout(() => {
      textarea.selectionStart = start + 7; // After '\n- [ ] '
      textarea.selectionEnd = start + 7 + 'Task item'.length;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertLink(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.markdownContent.substring(start, end);

    const linkText = selectedText || 'link text';
    const link = `[${linkText}](url)`;

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(end);

    this.markdownContent = before + link + after;

    setTimeout(() => {
      // Select 'url' for easy replacement
      const urlStart = start + linkText.length + 3; // After '[linkText]('
      textarea.selectionStart = urlStart;
      textarea.selectionEnd = urlStart + 3;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertImage(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const image = '![alt text](image-url)';

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(start);

    this.markdownContent = before + image + after;

    setTimeout(() => {
      // Select 'image-url' for easy replacement
      textarea.selectionStart = start + 12; // After '![alt text]('
      textarea.selectionEnd = start + 12 + 9; // 'image-url' length
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertTable(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const table = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(start);

    this.markdownContent = before + table + after;

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + table.length;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertHorizontalRule(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const rule = '\n---\n';

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(start);

    this.markdownContent = before + rule + after;

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + rule.length;
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  insertMath(): void {
    const textarea = this.markdownEditor?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.markdownContent.substring(start, end);

    const mathText = selectedText || 'E = mc^2';
    const math = `$${mathText}$`;

    const before = this.markdownContent.substring(0, start);
    const after = this.markdownContent.substring(end);

    this.markdownContent = before + math + after;

    setTimeout(() => {
      if (!selectedText) {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1 + mathText.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + math.length;
      }
      textarea.focus();
      this.convertMarkdown();
    }, 0);
  }

  private getInlineStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
        line-height: 1.6;
        padding: 20px;
      }

      .markdown-body {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
      }

      .theme-claude {
        background-color: #f9f9f8;
        color: #2d2d2d;
      }

      .theme-claude .markdown-body {
        background: white;
      }

      .theme-claude h1, .theme-claude h2, .theme-claude h3 {
        color: #1a1a1a;
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }

      .theme-claude h1 {
        font-size: 2em;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 0.3em;
      }

      .theme-claude h2 {
        font-size: 1.5em;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 0.3em;
      }

      .theme-claude h3 { font-size: 1.25em; }
      .theme-claude h4 { font-size: 1em; }
      .theme-claude h5 { font-size: 0.875em; }
      .theme-claude h6 { font-size: 0.85em; color: #6b6b6b; }

      .theme-claude p {
        margin-bottom: 16px;
      }

      .theme-claude a {
        color: #0066cc;
        text-decoration: none;
      }

      .theme-claude code {
        background-color: #f6f6f6;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 0.9em;
        color: #d73a49;
      }

      .theme-claude pre {
        background-color: #f6f6f6;
        padding: 16px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 16px 0;
        border: 1px solid #e5e5e5;
      }

      .theme-claude pre code {
        background: none;
        padding: 0;
        color: inherit;
        font-size: 0.85em;
        line-height: 1.45;
      }

      .theme-claude blockquote {
        border-left: 4px solid #0066cc;
        padding-left: 16px;
        margin: 16px 0;
        color: #6b6b6b;
        font-style: italic;
      }

      .theme-claude table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }

      .theme-claude table th,
      .theme-claude table td {
        border: 1px solid #ddd;
        padding: 8px 12px;
        text-align: left;
      }

      .theme-claude table th {
        background-color: #f6f6f6;
        font-weight: 600;
      }

      .theme-claude ul, .theme-claude ol {
        margin: 16px 0;
        padding-left: 32px;
      }

      .theme-claude li {
        margin: 4px 0;
      }

      .theme-claude hr {
        border: none;
        border-top: 1px solid #e5e5e5;
        margin: 24px 0;
      }

      .theme-github {
        background-color: #ffffff;
        color: #24292f;
      }

      .theme-github h1 {
        border-bottom: 1px solid #d8dee4;
        padding-bottom: 0.3em;
        margin-top: 24px;
        margin-bottom: 16px;
        font-size: 2em;
        font-weight: 600;
      }

      .theme-github h2 {
        border-bottom: 1px solid #d8dee4;
        padding-bottom: 0.3em;
        font-size: 1.5em;
        font-weight: 600;
      }

      .theme-github code {
        background-color: rgba(175, 184, 193, 0.2);
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 85%;
      }

      .theme-github pre {
        background-color: #f6f8fa;
        border-radius: 6px;
        padding: 16px;
        overflow: auto;
      }

      .theme-github blockquote {
        border-left: 0.25em solid #d0d7de;
        color: #57606a;
        padding: 0 1em;
      }

      .theme-dark {
        background-color: #1a1a1a;
        color: #e0e0e0;
      }

      .theme-dark .markdown-body {
        background: #2d2d2d;
      }

      .theme-dark h1, .theme-dark h2, .theme-dark h3,
      .theme-dark h4, .theme-dark h5, .theme-dark h6 {
        color: #ffffff;
      }

      .theme-dark h1, .theme-dark h2 {
        border-bottom-color: #444;
      }

      .theme-dark a {
        color: #58a6ff;
      }

      .theme-dark code {
        background-color: #3d3d3d;
        color: #f97583;
      }

      .theme-dark pre {
        background-color: #0d1117;
        border: 1px solid #444;
      }

      .theme-dark blockquote {
        border-left-color: #58a6ff;
        color: #b0b0b0;
      }

      .theme-dark table th {
        background-color: #3d3d3d;
      }

      .theme-dark table th,
      .theme-dark table td {
        border-color: #444;
      }

      .theme-dark hr {
        border-top-color: #444;
      }

      .theme-academic {
        background-color: #fafafa;
        color: #000000;
      }

      .theme-academic .markdown-body {
        font-family: 'Georgia', 'Times New Roman', serif;
        max-width: 750px;
        line-height: 1.8;
      }

      .theme-academic h1 {
        text-align: center;
        font-size: 2.2em;
        margin-bottom: 0.5em;
        font-weight: bold;
      }

      .theme-academic h2 {
        font-size: 1.5em;
        margin-top: 1.5em;
        font-weight: bold;
      }

      .theme-academic p {
        text-align: justify;
        margin-bottom: 1em;
      }

      .theme-academic code {
        font-family: 'Courier New', monospace;
        background-color: #f0f0f0;
      }

      .theme-academic blockquote {
        border-left: 3px solid #999;
        font-style: italic;
      }

      .theme-minimal {
        background-color: #ffffff;
        color: #333333;
      }

      .theme-minimal .markdown-body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        max-width: 800px;
        line-height: 1.7;
      }

      .theme-minimal h1, .theme-minimal h2, .theme-minimal h3 {
        font-weight: 300;
        letter-spacing: -0.02em;
      }

      .theme-minimal h1 {
        font-size: 2.5em;
        border-bottom: none;
      }

      .theme-minimal h2 {
        font-size: 1.8em;
        border-bottom: none;
      }

      .theme-minimal code {
        background-color: transparent;
        border: 1px solid #ddd;
        padding: 2px 4px;
      }

      .theme-minimal pre {
        background-color: #fafafa;
        border: 1px solid #eee;
      }

      .theme-pubcss {
        background-color: #ffffff;
        color: #000000;
      }

      .theme-pubcss .markdown-body {
        font-family: 'Times New Roman', Times, serif;
        font-size: 10pt;
        max-width: 750px;
        line-height: 1.2;
        text-align: justify;
      }

      .theme-pubcss h1 {
        font-size: 14pt;
        font-weight: bold;
        text-transform: uppercase;
        margin: 1.33em 0;
        text-align: left;
      }

      .theme-pubcss h2 {
        font-size: 12pt;
        font-weight: bold;
        margin: 1.33em 0;
      }

      .theme-pubcss h3,
      .theme-pubcss h4 {
        font-size: 11pt;
        font-style: italic;
        font-weight: normal;
        margin: 1.33em 0;
      }

      .theme-pubcss p {
        margin: 0 0 0.5em;
        text-indent: 0;
      }

      .theme-pubcss code {
        font-family: Courier, monospace;
        font-size: 9pt;
        background-color: #f5f5f5;
        padding: 2px 4px;
      }

      .theme-pubcss pre {
        font-family: Courier, monospace;
        background-color: #f5f5f5;
        padding: 12px;
        margin: 1em 0;
        border: 1px solid #ddd;
        overflow-x: auto;
      }

      .theme-pubcss pre code {
        background: none;
        padding: 0;
      }

      .theme-pubcss table {
        border-collapse: collapse;
        width: 100%;
        margin: 1.667em 0 1em;
        font-size: 9pt;
      }

      .theme-pubcss table th,
      .theme-pubcss table td {
        border: 0.5px solid #000;
        padding: 0.333em;
        text-align: center;
      }

      .theme-pubcss table th {
        font-weight: bold;
        background-color: transparent;
      }

      .theme-pubcss blockquote {
        border-left: 2px solid #666;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        color: #333;
      }

      .theme-pubcss ul,
      .theme-pubcss ol {
        margin: 0.5em 0;
        padding-left: 2em;
      }

      .theme-pubcss li {
        margin: 0.25em 0;
      }

      .theme-pubcss a {
        color: #000;
        text-decoration: none;
      }

      .theme-pubcss a:hover {
        text-decoration: underline;
      }

      .theme-pubcss hr {
        border: none;
        border-top: 1px solid #000;
        margin: 2em 0;
      }

      .math-block {
        margin: 20px 0;
        overflow-x: auto;
        text-align: center;
      }

      .footnotes {
        margin-top: 40px;
        font-size: 0.9em;
      }

      .footnotes-separator {
        margin: 40px 0 20px 0;
      }

      .footnote-ref {
        text-decoration: none;
      }

      .footnote-backref {
        text-decoration: none;
        margin-left: 5px;
      }
    `;
  }
}
