import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme } from '../models';
import { THEMES } from '../../shared/constants/themes.constant';
import { KATEX_CSS, HIGHLIGHT_CSS_LIGHT, HIGHLIGHT_CSS_DARK } from '../../embedded-styles';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('claude');

  /**
   * Observable of the current theme value
   */
  public currentTheme$: Observable<string> = this.currentThemeSubject.asObservable();

  /**
   * Get all available themes
   */
  getThemes(): Theme[] {
    return THEMES;
  }

  /**
   * Get the current theme value
   */
  getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }

  /**
   * Set the current theme
   */
  setTheme(themeValue: string): void {
    const themeExists = THEMES.some(theme => theme.value === themeValue);
    if (themeExists) {
      this.currentThemeSubject.next(themeValue);
    } else {
      console.warn(`Theme "${themeValue}" not found. Using default theme.`);
      this.currentThemeSubject.next('claude');
    }
  }

  /**
   * Get theme styles for iframe rendering
   */
  getThemeStyles(theme?: string): string {
    const currentTheme = theme || this.getCurrentTheme();
    const highlightCss = currentTheme === 'dark' ? HIGHLIGHT_CSS_DARK : HIGHLIGHT_CSS_LIGHT;

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
   * Generate full HTML with theme applied
   */
  generateFullHtml(htmlContent: string, theme?: string): string {
    const currentTheme = theme || this.getCurrentTheme();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  ${this.getThemeStyles(currentTheme)}
</head>
<body class="theme-${currentTheme}">
  <div class="markdown-body">
    ${htmlContent}
  </div>
</body>
</html>`;
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
}
