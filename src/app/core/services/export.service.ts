import { Injectable } from '@angular/core';
import { ExportOptions } from '../models';
import {
  convertMarkdownToAsciiDoc,
  convertHtmlToPlainText,
  convertHtmlToYaml,
  parseHtmlToJson,
  downloadBlob,
  createTextBlob
} from '../../shared/utils';
import { KATEX_CSS, HIGHLIGHT_CSS_LIGHT, HIGHLIGHT_CSS_DARK } from '../../embedded-styles';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(private themeService: ThemeService) {}

  /**
   * Export content based on the specified format
   */
  async export(options: ExportOptions, markdownContent: string, htmlContent: string): Promise<void> {
    const filename = options.filename || this.generateFilename(options.format, markdownContent, options.theme);
    const centerContent = options.centerContent ?? true; // Default to true for backwards compatibility
    const stylePlaintextCode = options.stylePlaintextCode ?? false; // Default to false
    const hideMarkdownCode = options.hideMarkdownCode ?? false; // Default to false
    const hideImages = options.hideImages ?? false; // Default to false

    switch (options.format) {
      case 'html':
        this.exportAsHtml(htmlContent, options.theme || 'claude', filename, centerContent, stylePlaintextCode, hideMarkdownCode, hideImages);
        break;
      case 'pdf':
        await this.exportAsPdf(htmlContent, options.theme || 'claude', filename, centerContent, stylePlaintextCode, hideMarkdownCode, hideImages);
        break;
      case 'markdown':
        this.exportAsMarkdown(markdownContent, filename);
        break;
      case 'asciidoc':
        this.exportAsAsciiDoc(markdownContent, filename);
        break;
      case 'plaintext':
        this.exportAsPlainText(htmlContent, filename);
        break;
      case 'json':
        this.exportAsJson(htmlContent, options.theme || 'claude', filename);
        break;
      case 'yaml':
        this.exportAsYaml(htmlContent, options.theme || 'claude', filename);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export as standalone HTML file
   */
  private exportAsHtml(htmlContent: string, theme: string, filename: string, centerContent: boolean = true, stylePlaintextCode: boolean = false, hideMarkdownCode: boolean = false, hideImages: boolean = false): void {
    const fullHtml = this.themeService.generateFullHtml(htmlContent, theme, centerContent, stylePlaintextCode, hideMarkdownCode, hideImages, true);
    const blob = createTextBlob(fullHtml, 'text/html');
    downloadBlob(blob, filename);
  }

  /**
   * Export as PDF file
   */
  private async exportAsPdf(htmlContent: string, theme: string, filename: string, centerContent: boolean = true, stylePlaintextCode: boolean = false, hideMarkdownCode: boolean = false, hideImages: boolean = false): Promise<void> {
    // Create a styled container for PDF generation
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width

    // Use ThemeService styles for consistency - pass true for isExport
    const styleElement = document.createElement('style');
    const themeStyles = this.themeService.getThemeStyles(theme, centerContent, stylePlaintextCode, hideMarkdownCode, hideImages, true);
    // Extract just the CSS content from the style tags
    const cssMatch = themeStyles.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
    if (cssMatch) {
      styleElement.textContent = cssMatch.map(s => s.replace(/<\/?style[^>]*>/g, '')).join('\n');
    }

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = `theme-${theme}`;
    contentWrapper.innerHTML = `<div class="markdown-body">${htmlContent}</div>`;

    container.appendChild(styleElement);
    container.appendChild(contentWrapper);
    document.body.appendChild(container);

    try {
      // Dynamic import for html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: filename,
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
      throw new Error('Failed to generate PDF. Please try again.');
    } finally {
      document.body.removeChild(container);
    }
  }

  /**
   * Export as Markdown file
   */
  private exportAsMarkdown(markdownContent: string, filename: string): void {
    const blob = createTextBlob(markdownContent, 'text/markdown');
    downloadBlob(blob, filename);
  }

  /**
   * Export as AsciiDoc file
   */
  private exportAsAsciiDoc(markdownContent: string, filename: string): void {
    const asciiDoc = convertMarkdownToAsciiDoc(markdownContent);
    const blob = createTextBlob(asciiDoc, 'text/plain');
    downloadBlob(blob, filename);
  }

  /**
   * Export as plain text file
   */
  private exportAsPlainText(htmlContent: string, filename: string): void {
    const plainText = convertHtmlToPlainText(htmlContent);
    const blob = createTextBlob(plainText, 'text/plain');
    downloadBlob(blob, filename);
  }

  /**
   * Export as JSON file
   */
  private exportAsJson(htmlContent: string, theme: string, filename: string): void {
    const jsonData = parseHtmlToJson(htmlContent, theme);
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = createTextBlob(jsonString, 'application/json');
    downloadBlob(blob, filename);
  }

  /**
   * Export as YAML file
   */
  private exportAsYaml(htmlContent: string, theme: string, filename: string): void {
    const yaml = convertHtmlToYaml(htmlContent, theme);
    const blob = createTextBlob(yaml, 'text/yaml');
    downloadBlob(blob, filename);
  }

  /**
   * Get full HTML document with embedded styles (for copying to clipboard)
   * Uses ThemeService to ensure consistency with preview
   */
  public getFullHtml(htmlContent: string, theme: string, centerContent: boolean = true, stylePlaintextCode: boolean = false, hideMarkdownCode: boolean = false, hideImages: boolean = false): string {
    return this.themeService.generateFullHtml(htmlContent, theme, centerContent, stylePlaintextCode, hideMarkdownCode, hideImages, true);
  }

  /**
   * Get theme-specific styles for embedding
   */
  private getThemeStyles(theme: string): string {
    const highlightCss = theme === 'dark' ? HIGHLIGHT_CSS_DARK : HIGHLIGHT_CSS_LIGHT;

    return `
    <style>
      /* KaTeX Styles */
      ${KATEX_CSS}

      /* Highlight.js Styles */
      ${highlightCss}
    </style>
    <style>
      ${this.getInlineStyles()}
    </style>
    `;
  }

  /**
   * Get inline styles for all themes
   */
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

      /* ===== PREMIUM THEME (Elegant & Publish-Ready) ===== */
      .theme-premium {
        background: linear-gradient(135deg, #f5f7fa 0%, #fafbfc 100%);
        color: #2c3e50;
      }

      .theme-premium .markdown-body {
        font-family: 'Charter', 'Georgia', 'Cambria', 'Times New Roman', serif;
        max-width: 850px;
        line-height: 1.75;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
        padding: 60px;
      }

      .theme-premium h1,
      .theme-premium h2,
      .theme-premium h3,
      .theme-premium h4,
      .theme-premium h5,
      .theme-premium h6 {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        color: #1a202c;
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.3;
      }

      .theme-premium h1 {
        font-size: 2.75em;
        margin: 0 0 0.5em 0;
        padding-bottom: 0.4em;
        border-bottom: 3px solid transparent;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 40px rgba(102, 126, 234, 0.3);
        position: relative;
      }

      .theme-premium h1::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 80px;
        height: 4px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 2px;
        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
      }

      .theme-premium h2 {
        font-size: 2em;
        margin: 2em 0 0.75em 0;
        color: #2d3748;
        text-shadow: 0 0 30px rgba(45, 55, 72, 0.1);
        position: relative;
        padding-left: 20px;
      }

      .theme-premium h2::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 70%;
        background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
        border-radius: 3px;
        box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
      }

      .theme-premium h3 {
        font-size: 1.5em;
        margin: 1.75em 0 0.5em 0;
        color: #4a5568;
      }

      .theme-premium h4 {
        font-size: 1.25em;
        margin: 1.5em 0 0.5em 0;
        color: #4a5568;
      }

      .theme-premium h5, .theme-premium h6 {
        font-size: 1em;
        margin: 1.25em 0 0.5em 0;
        color: #718096;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
      }

      .theme-premium p {
        margin: 0 0 1.5em 0;
        font-size: 1.05em;
        text-align: justify;
        hyphens: auto;
      }

      .theme-premium a {
        color: #667eea;
        text-decoration: none;
        border-bottom: 1px solid rgba(102, 126, 234, 0.3);
        transition: all 0.2s ease;
        font-weight: 500;
      }

      .theme-premium a:hover {
        color: #764ba2;
        border-bottom-color: #764ba2;
        text-shadow: 0 0 8px rgba(102, 126, 234, 0.3);
      }

      .theme-premium code {
        font-family: 'SF Mono', 'Menlo', 'Monaco', 'Cascadia Code', 'Courier New', monospace;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        color: #e53e3e;
        padding: 0.25em 0.5em;
        border-radius: 5px;
        font-size: 0.9em;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .theme-premium pre {
        background: #1a202c;
        padding: 24px;
        border-radius: 10px;
        overflow-x: auto;
        margin: 2em 0;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2),
                    0 0 0 1px rgba(102, 126, 234, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
        position: relative;
      }

      .theme-premium pre::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px 10px 0 0;
      }

      .theme-premium pre code {
        background: none;
        color: #e2e8f0;
        border: none;
        padding: 0;
        font-size: 0.9em;
        line-height: 1.6;
        box-shadow: none;
      }

      .theme-premium blockquote {
        margin: 2em 0;
        padding: 1.5em 1.5em 1.5em 2em;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-left: 5px solid #667eea;
        border-radius: 8px;
        color: #4a5568;
        font-style: italic;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        position: relative;
      }

      .theme-premium blockquote::before {
        content: '\\201C';
        position: absolute;
        top: 10px;
        left: 15px;
        font-size: 3em;
        color: rgba(102, 126, 234, 0.2);
        font-family: Georgia, serif;
        line-height: 1;
      }

      .theme-premium ul, .theme-premium ol {
        margin: 1.5em 0;
        padding-left: 2.5em;
        line-height: 1.8;
      }

      .theme-premium li {
        margin: 0.75em 0;
        padding-left: 0.5em;
      }

      .theme-premium ul li::marker {
        color: #667eea;
        font-size: 1.2em;
      }

      .theme-premium ol li::marker {
        color: #667eea;
        font-weight: 700;
      }

      .theme-premium table {
        border-collapse: separate;
        border-spacing: 0;
        width: 100%;
        margin: 2em 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .theme-premium table th,
      .theme-premium table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
      }

      .theme-premium table th {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.85em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .theme-premium table tbody tr {
        background: white;
        transition: all 0.2s ease;
      }

      .theme-premium table tbody tr:nth-child(even) {
        background: #f7fafc;
      }

      .theme-premium table tbody tr:hover {
        background: #edf2f7;
        transform: scale(1.01);
      }

      .theme-premium hr {
        border: none;
        height: 3px;
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(102, 126, 234, 0.3) 20%,
          rgba(102, 126, 234, 0.6) 50%,
          rgba(102, 126, 234, 0.3) 80%,
          transparent 100%);
        margin: 3em 0;
        border-radius: 2px;
      }

      .theme-premium strong {
        color: #2d3748;
        font-weight: 700;
      }

      .theme-premium em {
        color: #4a5568;
        font-style: italic;
      }

      /* ===== MEDIUM THEME ===== */
      .theme-medium {
        background-color: #ffffff;
        color: #292929;
      }

      .theme-medium .markdown-body {
        font-family: Charter, 'Bitstream Charter', 'Sitka Text', Cambria, serif;
        max-width: 680px;
        font-size: 21px;
        line-height: 1.58;
        letter-spacing: -0.003em;
      }

      .theme-medium h1, .theme-medium h2, .theme-medium h3,
      .theme-medium h4, .theme-medium h5, .theme-medium h6 {
        font-family: sohne, "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-weight: 700;
        line-height: 1.25;
        margin-top: 2em;
        margin-bottom: 0.5em;
      }

      .theme-medium h1 { font-size: 2.2em; }
      .theme-medium h2 { font-size: 1.7em; }
      .theme-medium h3 { font-size: 1.4em; }

      .theme-medium p {
        margin-bottom: 32px;
      }

      .theme-medium a {
        color: inherit;
        text-decoration: underline;
      }

      .theme-medium code {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 3px 6px;
        border-radius: 3px;
        font-size: 0.85em;
        font-family: Menlo, Monaco, monospace;
      }

      .theme-medium pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 20px;
        border-radius: 4px;
        overflow-x: auto;
        margin: 32px 0;
      }

      .theme-medium pre code {
        background: none;
        padding: 0;
      }

      .theme-medium blockquote {
        border-left: 3px solid rgba(0, 0, 0, 0.8);
        padding-left: 20px;
        margin: 32px 0;
        font-style: italic;
        color: #6B6B6B;
      }

      /* ===== READTHEDOCS THEME ===== */
      .theme-readthedocs {
        background-color: #fcfcfc;
        color: #404040;
      }

      .theme-readthedocs .markdown-body {
        font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
        max-width: 1000px;
        line-height: 1.6;
      }

      .theme-readthedocs h1, .theme-readthedocs h2, .theme-readthedocs h3 {
        color: #2980B9;
        font-weight: 700;
      }

      .theme-readthedocs h1 {
        font-size: 2.4em;
        border-bottom: 3px solid #2980B9;
        padding-bottom: 0.3em;
        margin-bottom: 0.8em;
      }

      .theme-readthedocs h2 {
        font-size: 1.8em;
        border-bottom: 2px solid #e1e4e5;
        padding-bottom: 0.3em;
        margin-top: 1.5em;
      }

      .theme-readthedocs a {
        color: #2980B9;
        text-decoration: none;
      }

      .theme-readthedocs a:hover {
        color: #3091d1;
        text-decoration: underline;
      }

      .theme-readthedocs code {
        background-color: #f8f8f8;
        border: 1px solid #e1e4e5;
        padding: 2px 5px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9em;
      }

      .theme-readthedocs pre {
        background-color: #f8f8f8;
        border: 1px solid #e1e4e5;
        padding: 12px;
        overflow-x: auto;
        margin: 16px 0;
      }

      .theme-readthedocs pre code {
        background: none;
        border: none;
        padding: 0;
      }

      /* ===== NOTION THEME ===== */
      .theme-notion {
        background-color: #ffffff;
        color: #37352f;
      }

      .theme-notion .markdown-body {
        font-family: ui-sans-serif, -apple-system, system-ui, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        max-width: 900px;
      }

      .theme-notion h1, .theme-notion h2, .theme-notion h3 {
        font-weight: 700;
        line-height: 1.2;
        margin-top: 2em;
        margin-bottom: 0.5em;
      }

      .theme-notion h1 { font-size: 2em; }
      .theme-notion h2 { font-size: 1.5em; }
      .theme-notion h3 { font-size: 1.25em; }

      .theme-notion code {
        background-color: rgba(135, 131, 120, 0.15);
        color: #eb5757;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'SF Mono', Monaco, monospace;
        font-size: 85%;
      }

      .theme-notion pre {
        background-color: #f7f6f3;
        padding: 16px;
        border-radius: 3px;
        overflow-x: auto;
        margin: 16px 0;
      }

      .theme-notion pre code {
        background: none;
        color: inherit;
      }

      .theme-notion blockquote {
        border-left: 3px solid #37352f;
        padding-left: 16px;
        color: #787774;
        margin: 16px 0;
      }

      /* ===== GITBOOK CLEAN THEME ===== */
      .theme-gitbook {
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        color: #2d3748;
      }

      .theme-gitbook .markdown-body {
        font-family: Inter, -apple-system, system-ui, sans-serif;
        max-width: 850px;
        line-height: 1.7;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 48px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      }

      .theme-gitbook h1, .theme-gitbook h2, .theme-gitbook h3 {
        font-weight: 600;
        color: #1a202c;
      }

      .theme-gitbook h1 { font-size: 2.5em; margin-bottom: 0.5em; }
      .theme-gitbook h2 { font-size: 1.8em; margin-top: 1.5em; }
      .theme-gitbook h3 { font-size: 1.4em; }

      .theme-gitbook code {
        background-color: #f1f3f5;
        padding: 0.2em 0.4em;
        border-radius: 6px;
        font-size: 0.9em;
      }

      .theme-gitbook pre {
        background-color: #1a202c;
        color: #e2e8f0;
        padding: 20px;
        border-radius: 12px;
        overflow-x: auto;
        margin: 24px 0;
      }

      .theme-gitbook pre code {
        background: none;
        color: inherit;
      }

      /* ===== LATEX THEME ===== */
      .theme-latex {
        background-color: #ffffff;
        color: #000000;
      }

      .theme-latex .markdown-body {
        font-family: 'Latin Modern Roman', 'Computer Modern', serif;
        font-size: 11pt;
        line-height: 1.2;
        max-width: 7in;
        text-align: justify;
        hyphens: auto;
      }

      .theme-latex h1, .theme-latex h2, .theme-latex h3 {
        font-weight: bold;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }

      .theme-latex h1 { font-size: 1.8em; }
      .theme-latex h2 { font-size: 1.5em; }
      .theme-latex h3 { font-size: 1.2em; }

      .theme-latex code {
        font-family: 'Latin Modern Mono', 'Computer Modern Typewriter', monospace;
        font-size: 10pt;
      }

      .theme-latex pre {
        font-family: 'Latin Modern Mono', 'Computer Modern Typewriter', monospace;
        font-size: 10pt;
        border: 1px solid #ccc;
        padding: 10px;
        margin: 1em 0;
        overflow-x: auto;
      }

      .theme-latex blockquote {
        border-left: 2px solid #000;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
      }

      /* ===== CYBERPUNK NEON THEME ===== */
      .theme-cyberpunk {
        background-color: #0a0e27;
        color: #00ffff;
      }

      .theme-cyberpunk .markdown-body {
        font-family: 'Roboto Mono', 'Courier New', monospace;
        max-width: 900px;
        background: rgba(10, 14, 39, 0.8);
        border: 1px solid #ff00ff;
        box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        padding: 40px;
      }

      .theme-cyberpunk h1, .theme-cyberpunk h2, .theme-cyberpunk h3 {
        color: #ff00ff;
        text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .theme-cyberpunk h1 { font-size: 2.5em; }
      .theme-cyberpunk h2 { font-size: 2em; }
      .theme-cyberpunk h3 { font-size: 1.5em; }

      .theme-cyberpunk a {
        color: #ffff00;
        text-shadow: 0 0 5px #ffff00;
        text-decoration: none;
      }

      .theme-cyberpunk a:hover {
        text-shadow: 0 0 10px #ffff00, 0 0 20px #ffff00;
      }

      .theme-cyberpunk code {
        background-color: rgba(255, 0, 255, 0.1);
        color: #00ffff;
        padding: 0.2em 0.4em;
        border: 1px solid #ff00ff;
        border-radius: 3px;
      }

      .theme-cyberpunk pre {
        background-color: #000000;
        border: 1px solid #ff00ff;
        padding: 20px;
        overflow-x: auto;
        box-shadow: inset 0 0 10px rgba(255, 0, 255, 0.3);
      }

      .theme-cyberpunk pre code {
        background: none;
        border: none;
      }

      .theme-cyberpunk blockquote {
        border-left: 3px solid #ff00ff;
        padding-left: 16px;
        color: #00ffff;
        text-shadow: 0 0 5px #00ffff;
      }

      /* ===== NEWSPAPER THEME ===== */
      .theme-newspaper {
        background-color: #f8f8f8;
        color: #000000;
      }

      .theme-newspaper .markdown-body {
        font-family: 'Times New Roman', Times, serif;
        max-width: 1200px;
        line-height: 1.6;
        column-count: 2;
        column-gap: 40px;
      }

      .theme-newspaper h1 {
        column-span: all;
        text-align: center;
        font-size: 3em;
        font-weight: bold;
        text-transform: uppercase;
        border-top: 3px solid #000;
        border-bottom: 3px solid #000;
        padding: 20px 0;
        margin: 20px 0;
      }

      .theme-newspaper h2 {
        column-span: all;
        font-size: 1.8em;
        font-weight: bold;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-top: 30px;
      }

      .theme-newspaper h3 {
        font-size: 1.3em;
        font-weight: bold;
        margin-top: 1em;
      }

      .theme-newspaper p:first-of-type::first-letter {
        float: left;
        font-size: 4em;
        line-height: 0.9;
        margin: 0.1em 0.1em 0 0;
        font-weight: bold;
      }

      .theme-newspaper code {
        font-family: 'Courier New', Courier, monospace;
        background-color: #e8e8e8;
        padding: 2px 4px;
      }

      .theme-newspaper pre {
        background-color: #e8e8e8;
        padding: 10px;
        border: 1px solid #000;
        overflow-x: auto;
      }

      /* ===== GITBOOK MUTED THEME ===== */
      .theme-gitbook-muted {
        background-color: #fafaf9;
        color: #57534e;
      }

      .theme-gitbook-muted .markdown-body {
        font-family: Inter, -apple-system, system-ui, sans-serif;
        max-width: 850px;
        line-height: 1.7;
        background: #ffffff;
        border-radius: 12px;
        padding: 48px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      }

      .theme-gitbook-muted h1, .theme-gitbook-muted h2, .theme-gitbook-muted h3 {
        color: #44403c;
        font-weight: 600;
      }

      .theme-gitbook-muted h1 { font-size: 2.5em; }
      .theme-gitbook-muted h2 { font-size: 1.8em; margin-top: 1.5em; }
      .theme-gitbook-muted h3 { font-size: 1.4em; }

      .theme-gitbook-muted a {
        color: #78716c;
        text-decoration: underline;
      }

      .theme-gitbook-muted code {
        background-color: #f5f5f4;
        color: #a8a29e;
        padding: 0.2em 0.4em;
        border-radius: 4px;
        font-size: 0.9em;
      }

      .theme-gitbook-muted pre {
        background-color: #292524;
        color: #e7e5e4;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 24px 0;
      }

      .theme-gitbook-muted pre code {
        background: none;
        color: inherit;
      }

      .theme-gitbook-muted blockquote {
        border-left: 3px solid #d6d3d1;
        padding-left: 16px;
        color: #78716c;
      }

      /* ===== TERMINAL THEME ===== */
      .theme-terminal {
        background-color: #000000;
        color: #00ff00;
      }

      .theme-terminal .markdown-body {
        font-family: 'Courier New', Monaco, monospace;
        max-width: 100%;
        line-height: 1.4;
        padding: 20px;
      }

      .theme-terminal h1, .theme-terminal h2, .theme-terminal h3 {
        color: #00ff00;
        font-weight: bold;
        text-transform: uppercase;
        margin-top: 1.5em;
      }

      .theme-terminal h1 { font-size: 1.8em; }
      .theme-terminal h2 { font-size: 1.5em; }
      .theme-terminal h3 { font-size: 1.2em; }

      .theme-terminal a {
        color: #00ff00;
        text-decoration: underline;
      }

      .theme-terminal code {
        background-color: transparent;
        color: #00ff00;
        font-family: inherit;
      }

      .theme-terminal pre {
        background-color: #0a0a0a;
        border: 1px solid #00ff00;
        padding: 15px;
        overflow-x: auto;
      }

      .theme-terminal pre code {
        background: none;
      }

      .theme-terminal blockquote {
        border-left: 3px solid #00ff00;
        padding-left: 16px;
        margin: 16px 0;
      }

      .theme-terminal strong {
        color: #00ff00;
        font-weight: bold;
      }

      /* ===== GRADIENT GLASS THEME ===== */
      .theme-gradient-glass {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        color: #1a1a1a;
      }

      .theme-gradient-glass .markdown-body {
        font-family: -apple-system, system-ui, sans-serif;
        max-width: 850px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
        padding: 48px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      }

      .theme-gradient-glass h1, .theme-gradient-glass h2, .theme-gradient-glass h3 {
        color: #ffffff;
        font-weight: 700;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }

      .theme-gradient-glass h1 { font-size: 2.5em; }
      .theme-gradient-glass h2 { font-size: 2em; margin-top: 1.5em; }
      .theme-gradient-glass h3 { font-size: 1.5em; }

      .theme-gradient-glass p {
        color: rgba(255, 255, 255, 0.95);
        line-height: 1.7;
      }

      .theme-gradient-glass a {
        color: #ffffff;
        text-decoration: underline;
        text-decoration-color: rgba(255, 255, 255, 0.5);
      }

      .theme-gradient-glass code {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        padding: 0.2em 0.4em;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .theme-gradient-glass pre {
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(5px);
        color: #ffffff;
        padding: 20px;
        border-radius: 12px;
        overflow-x: auto;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .theme-gradient-glass pre code {
        background: none;
        border: none;
      }

      .theme-gradient-glass blockquote {
        background: rgba(255, 255, 255, 0.15);
        border-left: 4px solid rgba(255, 255, 255, 0.6);
        padding: 16px 16px 16px 20px;
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.95);
      }

      .theme-gradient-glass strong {
        color: #ffffff;
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
    `;
  }

  /**
   * Extract title from markdown content
   */
  private extractTitle(markdownContent: string): string | null {
    if (!markdownContent || !markdownContent.trim()) {
      return null;
    }

    // Try to find the first H1 heading (# Title or ===== underline style)
    const lines = markdownContent.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for # H1 syntax
      if (line.startsWith('# ')) {
        return line.substring(2).trim();
      }

      // Check for === underline style H1
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        if (nextLine && /^=+$/.test(nextLine) && line) {
          return line.trim();
        }
      }
    }

    return null;
  }

  /**
   * Convert title to filename-friendly format
   */
  private titleToFilename(title: string): string {
    return title
      // Replace spaces with underscores
      .replace(/\s+/g, '_')
      // Remove special characters except underscores, hyphens, and dots
      .replace(/[^\w\-_.]/g, '')
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, '')
      // Collapse multiple underscores
      .replace(/_+/g, '_')
      // Limit length to 100 characters
      .substring(0, 100)
      // Convert to lowercase for consistency
      .toLowerCase();
  }

  /**
   * Generate default filename for export
   */
  private generateFilename(format: string, markdownContent?: string, theme?: string): string {
    const extensions: { [key: string]: string } = {
      html: '.html',
      pdf: '.pdf',
      markdown: '.md',
      asciidoc: '.adoc',
      plaintext: '.txt',
      json: '.json',
      yaml: '.yaml'
    };

    const extension = extensions[format] || '.txt';
    let baseFilename = 'markdown-export';

    // Try to extract title from markdown
    if (markdownContent) {
      const title = this.extractTitle(markdownContent);
      if (title) {
        const filename = this.titleToFilename(title);
        if (filename) {
          baseFilename = filename;
        }
      }
    }

    // Append theme if provided
    if (theme) {
      return `${baseFilename}-${theme}${extension}`;
    }

    return `${baseFilename}${extension}`;
  }
}
