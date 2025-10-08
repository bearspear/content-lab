import { Component, OnInit, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import hljs from 'highlight.js';
import * as katex from 'katex';

interface Theme {
  name: string;
  value: string;
  description: string;
}

@Component({
  selector: 'app-md-converter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './md-converter.component.html',
  styleUrl: './md-converter.component.scss'
})
export class MdConverterComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  markdownContent: string = '';
  htmlContent: string = '';
  isDragging: boolean = false;
  currentTheme: string = 'claude';

  themes: Theme[] = [
    { name: 'Claude AI', value: 'claude', description: 'Clean, modern design inspired by claude.ai' },
    { name: 'GitHub', value: 'github', description: 'GitHub markdown style' },
    { name: 'Dark Mode', value: 'dark', description: 'Dark theme for reduced eye strain' },
    { name: 'Academic', value: 'academic', description: 'Academic paper style' },
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
    return `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
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

      /* Syntax highlighting - default light */
      .hljs {
        display: block;
        overflow-x: auto;
        padding: 0;
        color: #333;
      }

      .hljs-comment { color: #998; font-style: italic; }
      .hljs-keyword { color: #a71d5d; font-weight: bold; }
      .hljs-string { color: #0086b3; }
      .hljs-number { color: #0086b3; }
      .hljs-built_in { color: #0086b3; }
      .hljs-title { color: #795da3; }
      .hljs-function { color: #a71d5d; }
      .hljs-params { color: #333; }
      .hljs-attr { color: #795da3; }
      .hljs-variable { color: #ed6a43; }

      /* Dark theme syntax highlighting */
      .theme-dark .hljs {
        color: #e0e0e0;
      }

      .theme-dark .hljs-comment { color: #7c7c7c; }
      .theme-dark .hljs-keyword { color: #cc7832; }
      .theme-dark .hljs-string { color: #6a8759; }
      .theme-dark .hljs-number { color: #6897bb; }
      .theme-dark .hljs-built_in { color: #8888c6; }
      .theme-dark .hljs-title { color: #ffc66d; }
      .theme-dark .hljs-function { color: #cc7832; }
      .theme-dark .hljs-variable { color: #9876aa; }

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
}
