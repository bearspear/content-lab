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
  getThemeStyles(theme?: string, centerContent: boolean = true): string {
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
      ${this.getInlineStyles(currentTheme, centerContent)}
    </style>
    `;
  }

  /**
   * Generate full HTML with theme applied
   */
  generateFullHtml(htmlContent: string, theme?: string, centerContent: boolean = true): string {
    const currentTheme = theme || this.getCurrentTheme();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Preview</title>
  ${this.getThemeStyles(currentTheme, centerContent)}
</head>
<body class="theme-${currentTheme}">
  <div class="markdown-body">
    ${htmlContent}
  </div>
</body>
</html>`;
  }

  /**
   * Get inline styles for the selected theme only
   */
  private getInlineStyles(theme: string, centerContent: boolean = true): string {
    return `
      ${this.getBaseStyles(centerContent)}
      ${this.getThemeSpecificStyles(theme)}
      ${this.getCommonStyles()}
    `;
  }

  /**
   * Get base styles (applied to all themes)
   */
  private getBaseStyles(centerContent: boolean = true): string {
    const centeringStyles = centerContent ? `
      .markdown-body {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
      }
    ` : '';

    return `
      /* Minimal base - only box-sizing */
      * {
        box-sizing: border-box;
      }

      ${centeringStyles}
    `;
  }

  /**
   * Get theme-specific styles based on the selected theme
   */
  private getThemeSpecificStyles(theme: string): string {
    switch (theme) {
      case 'claude':
        return this.getClaudeThemeStyles();
      case 'claude-web':
        return this.getClaudeWebThemeStyles();
      case 'github':
        return this.getGithubThemeStyles();
      case 'dark':
        return this.getDarkThemeStyles();
      case 'academic':
        return this.getAcademicThemeStyles();
      case 'minimal':
        return this.getMinimalThemeStyles();
      case 'pubcss':
        return this.getPubcssThemeStyles();
      case 'premium':
        return this.getPremiumThemeStyles();
      case 'medium':
        return this.getMediumThemeStyles();
      case 'readthedocs':
        return this.getReadthedocsThemeStyles();
      case 'notion':
        return this.getNotionThemeStyles();
      case 'gitbook':
        return this.getGitbookThemeStyles();
      case 'latex':
        return this.getLatexThemeStyles();
      case 'cyberpunk':
        return this.getCyberpunkThemeStyles();
      case 'newspaper':
        return this.getNewspaperThemeStyles();
      case 'gitbook-muted':
        return this.getGitbookMutedThemeStyles();
      case 'terminal':
        return this.getTerminalThemeStyles();
      case 'gradient-glass':
        return this.getGradientGlassThemeStyles();
      case 'article':
        return this.getArticleThemeStyles();
      case 'normalize':
        return this.getNormalizeThemeStyles();
      case 'bare':
        return this.getBareThemeStyles();
      default:
        return this.getClaudeThemeStyles(); // Default to Claude theme
    }
  }

  /**
   * Claude theme styles
   */
  private getClaudeThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Claude Web theme styles
   */
  private getClaudeWebThemeStyles(): string {
    return `
      /* ===== CLAUDE WEB THEME ===== */
      .theme-claude-web {
        background-color: #f8f7f4;
        color: #2d2d2d;
      }

      .theme-claude-web .markdown-body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        max-width: 768px;
        line-height: 1.6;
      }

      .theme-claude-web h1, .theme-claude-web h2, .theme-claude-web h3,
      .theme-claude-web h4, .theme-claude-web h5, .theme-claude-web h6 {
        color: #2d2d2d;
        font-weight: 600;
        line-height: 1.3;
        margin-top: 24px;
        margin-bottom: 16px;
      }

      .theme-claude-web h1 {
        font-size: 28px;
        border-bottom: 1px solid #e5e5e5;
        padding-bottom: 0.3em;
      }

      .theme-claude-web h2 {
        font-size: 24px;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 0.3em;
      }

      .theme-claude-web h3 { font-size: 20px; }
      .theme-claude-web h4 { font-size: 18px; }
      .theme-claude-web h5 { font-size: 16px; }
      .theme-claude-web h6 {
        font-size: 14px;
        color: #666666;
      }

      .theme-claude-web p {
        margin-bottom: 16px;
        color: #2d2d2d;
      }

      .theme-claude-web a {
        color: #cc785c;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .theme-claude-web a:hover {
        color: #b86b4f;
        text-decoration: underline;
      }

      .theme-claude-web code {
        background-color: #f0f0f0;
        color: #2d2d2d;
        padding: 2px 6px;
        border-radius: 6px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
        font-size: 14px;
      }

      .theme-claude-web pre {
        background-color: #1e1e1e;
        padding: 16px;
        border-radius: 12px;
        overflow-x: auto;
        margin: 16px 0;
        border: 1px solid #e5e5e5;
      }

      .theme-claude-web pre code {
        background: none;
        color: #d4d4d4;
        padding: 0;
        font-size: 13px;
        line-height: 1.5;
      }

      .theme-claude-web blockquote {
        border-left: 3px solid #e5e5e5;
        padding-left: 16px;
        margin: 16px 0;
        color: #666666;
        font-style: italic;
      }

      .theme-claude-web table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
        font-size: 14px;
      }

      .theme-claude-web table th,
      .theme-claude-web table td {
        border-bottom: 1px solid #e5e5e5;
        padding: 8px 16px;
        text-align: left;
      }

      .theme-claude-web table th {
        font-weight: 600;
        color: #666666;
        background-color: #f4f4f4;
      }

      .theme-claude-web table tr:last-child td {
        border-bottom: none;
      }

      .theme-claude-web ul, .theme-claude-web ol {
        margin: 16px 0;
        padding-left: 24px;
      }

      .theme-claude-web li {
        margin: 8px 0;
      }

      .theme-claude-web hr {
        border: none;
        border-top: 1px solid #e5e5e5;
        margin: 24px 0;
      }

      .theme-claude-web strong, .theme-claude-web b {
        font-weight: 600;
        color: #2d2d2d;
      }

      .theme-claude-web em, .theme-claude-web i {
        font-style: italic;
      }
    `;
  }

  /**
   * GitHub theme styles
   */
  private getGithubThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Dark theme styles
   */
  private getDarkThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Academic theme styles
   */
  private getAcademicThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Minimal theme styles
   */
  private getMinimalThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * PubCSS theme styles
   */
  private getPubcssThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Premium theme styles
   */
  private getPremiumThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Medium theme styles
   */
  private getMediumThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Readthedocs theme styles
   */
  private getReadthedocsThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Notion theme styles
   */
  private getNotionThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Gitbook theme styles
   */
  private getGitbookThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Latex theme styles
   */
  private getLatexThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Cyberpunk theme styles
   */
  private getCyberpunkThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Newspaper theme styles
   */
  private getNewspaperThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Gitbook Muted theme styles
   */
  private getGitbookMutedThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Terminal theme styles
   */
  private getTerminalThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Gradient Glass theme styles
   */
  private getGradientGlassThemeStyles(): string {
    return `
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
    `;
  }

  /**
   * Article theme styles
   */
  private getArticleThemeStyles(): string {
    return `
      /* ===== PROFESSIONAL ARTICLE THEME ===== */
      .theme-article {
        background-color: #ffffff;
        color: #1a1a1a;
      }

      .theme-article .markdown-body {
        font-family: 'Charter', 'Georgia', 'Cambria', 'Times New Roman', serif;
        font-size: 1.125rem;
        line-height: 1.75;
        max-width: 680px;
        padding: 32px;
      }

      /* Headings */
      .theme-article h1,
      .theme-article h2,
      .theme-article h3,
      .theme-article h4,
      .theme-article h5,
      .theme-article h6 {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 700;
        line-height: 1.3;
        color: #1a1a1a;
        scroll-margin-top: 2rem;
      }

      .theme-article h1 {
        font-size: 2.25rem;
        margin-top: 0;
        margin-bottom: 2rem;
        border-bottom: 2px solid #dee2e6;
        padding-bottom: 1rem;
      }

      .theme-article h2 {
        font-size: 1.875rem;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #e9ecef;
        padding-bottom: 0.5rem;
      }

      .theme-article h3 {
        font-size: 1.5rem;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
      }

      .theme-article h4 {
        font-size: 1.25rem;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
      }

      .theme-article h5 {
        font-size: 1.125rem;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
      }

      .theme-article h6 {
        font-size: 1rem;
        color: #4a4a4a;
        margin-top: 3rem;
        margin-bottom: 1.5rem;
      }

      /* Paragraphs & Text */
      .theme-article p {
        margin-bottom: 1.5rem;
        color: #1a1a1a;
      }

      .theme-article p:last-child {
        margin-bottom: 0;
      }

      .theme-article strong,
      .theme-article b {
        font-weight: 700;
        color: #1a1a1a;
      }

      .theme-article em,
      .theme-article i {
        font-style: italic;
      }

      .theme-article mark {
        background-color: #fff3cd;
        padding: 0.1em 0.3em;
        border-radius: 3px;
      }

      .theme-article del,
      .theme-article s {
        text-decoration: line-through;
        opacity: 0.7;
      }

      .theme-article small {
        font-size: 0.875rem;
      }

      /* Links */
      .theme-article a {
        color: #0066cc;
        text-decoration: none;
        transition: color 0.2s ease;
      }

      .theme-article a:hover {
        color: #0052a3;
        text-decoration: underline;
      }

      /* Lists */
      .theme-article ul,
      .theme-article ol {
        margin-bottom: 1.5rem;
        padding-left: 2rem;
      }

      .theme-article li {
        margin-bottom: 0.5rem;
        line-height: 1.6;
      }

      .theme-article li > p {
        margin-bottom: 0.5rem;
      }

      .theme-article li:last-child {
        margin-bottom: 0;
      }

      .theme-article li > ul,
      .theme-article li > ol {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .theme-article ul {
        list-style-type: disc;
      }

      .theme-article ul ul {
        list-style-type: circle;
      }

      .theme-article ul ul ul {
        list-style-type: square;
      }

      .theme-article ol {
        list-style-type: decimal;
      }

      .theme-article ol ol {
        list-style-type: lower-alpha;
      }

      .theme-article ol ol ol {
        list-style-type: lower-roman;
      }

      /* Blockquotes */
      .theme-article blockquote {
        margin: 2rem 0;
        padding: 1rem 1.5rem;
        border-left: 4px solid #0066cc;
        background-color: #f8f9fa;
        border-radius: 6px;
        color: #4a4a4a;
        font-style: italic;
      }

      .theme-article blockquote p {
        margin-bottom: 1rem;
      }

      .theme-article blockquote p:last-child {
        margin-bottom: 0;
      }

      .theme-article blockquote blockquote {
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        border-left-width: 3px;
      }

      /* Code */
      .theme-article code {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
        font-size: 0.9em;
        background-color: #f6f8fa;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        border: 1px solid #d0d7de;
        color: #1a1a1a;
      }

      .theme-article pre {
        background-color: #f6f8fa;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 1.5rem;
        margin: 2rem 0;
        overflow-x: auto;
        line-height: 1.6;
      }

      .theme-article pre code {
        background-color: transparent;
        padding: 0;
        border: none;
        font-size: 0.875rem;
        line-height: inherit;
      }

      /* Scrollbar for code blocks */
      .theme-article pre::-webkit-scrollbar {
        height: 8px;
      }

      .theme-article pre::-webkit-scrollbar-track {
        background: #f8f9fa;
        border-radius: 6px;
      }

      .theme-article pre::-webkit-scrollbar-thumb {
        background: #dee2e6;
        border-radius: 6px;
      }

      .theme-article pre::-webkit-scrollbar-thumb:hover {
        background: #6c757d;
      }

      /* Tables */
      .theme-article table {
        width: 100%;
        border-collapse: collapse;
        margin: 2rem 0;
        overflow: hidden;
        border-radius: 6px;
        border: 1px solid #dee2e6;
        font-size: 1rem;
      }

      .theme-article thead {
        background-color: #f6f8fa;
      }

      .theme-article th {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-weight: 700;
        text-align: left;
        padding: 1rem;
        border-bottom: 2px solid #dee2e6;
        color: #1a1a1a;
      }

      .theme-article td {
        padding: 1rem;
        border-bottom: 1px solid #e9ecef;
      }

      .theme-article tr:last-child td {
        border-bottom: none;
      }

      .theme-article tbody tr:hover {
        background-color: #f8f9fa;
      }

      .theme-article th[align="center"],
      .theme-article td[align="center"] {
        text-align: center;
      }

      .theme-article th[align="right"],
      .theme-article td[align="right"] {
        text-align: right;
      }

      /* Horizontal Rules */
      .theme-article hr {
        border: none;
        border-top: 2px solid #dee2e6;
        margin: 4rem 0;
      }

      /* Images */
      .theme-article img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 2rem auto;
        border-radius: 6px;
      }

      .theme-article figure {
        margin: 2rem 0;
      }

      .theme-article figcaption {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
        font-size: 0.875rem;
        color: #6c757d;
        text-align: center;
        margin-top: 0.5rem;
        font-style: italic;
      }

      /* Details/Summary */
      .theme-article details {
        margin: 1.5rem 0;
        padding: 1rem;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        background-color: #f8f9fa;
      }

      .theme-article summary {
        font-weight: 700;
        cursor: pointer;
        user-select: none;
        padding: 0.5rem;
        margin: -1rem;
        border-radius: 6px;
        transition: background-color 0.2s;
      }

      .theme-article summary:hover {
        background-color: #e9ecef;
      }

      .theme-article details[open] summary {
        margin-bottom: 1rem;
        border-bottom: 1px solid #e9ecef;
        border-radius: 6px 6px 0 0;
      }

      /* Keyboard keys */
      .theme-article kbd {
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Courier New', monospace;
        font-size: 0.875rem;
        padding: 0.2em 0.4em;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 3px;
        box-shadow: 0 1px 0 #dee2e6;
      }

      .theme-article abbr[title] {
        text-decoration: underline dotted;
        cursor: help;
      }
    `;
  }

  /**
   * Normalize theme styles
   */
  private getNormalizeThemeStyles(): string {
    return `
      /* ===== NORMALIZE THEME ===== */
      /* Based on normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */
      /* ONLY normalize.css - no additional styling */

      .theme-normalize .markdown-body {
        max-width: none;
        margin: 0;
        padding: 8px;
      }

      .theme-normalize html {
        line-height: 1.15;
        -webkit-text-size-adjust: 100%;
      }

      .theme-normalize body {
        margin: 0;
      }

      .theme-normalize main {
        display: block;
      }

      .theme-normalize h1 {
        font-size: 2em;
        margin: 0.67em 0;
      }

      .theme-normalize hr {
        box-sizing: content-box;
        height: 0;
        overflow: visible;
      }

      .theme-normalize pre {
        font-family: monospace, monospace;
        font-size: 1em;
      }

      .theme-normalize a {
        background-color: transparent;
      }

      .theme-normalize abbr[title] {
        border-bottom: none;
        text-decoration: underline;
        text-decoration: underline dotted;
      }

      .theme-normalize b,
      .theme-normalize strong {
        font-weight: bolder;
      }

      .theme-normalize code,
      .theme-normalize kbd,
      .theme-normalize samp {
        font-family: monospace, monospace;
        font-size: 1em;
      }

      .theme-normalize small {
        font-size: 80%;
      }

      .theme-normalize sub,
      .theme-normalize sup {
        font-size: 75%;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
      }

      .theme-normalize sub {
        bottom: -0.25em;
      }

      .theme-normalize sup {
        top: -0.5em;
      }

      .theme-normalize img {
        border-style: none;
      }

      .theme-normalize button,
      .theme-normalize input,
      .theme-normalize optgroup,
      .theme-normalize select,
      .theme-normalize textarea {
        font-family: inherit;
        font-size: 100%;
        line-height: 1.15;
        margin: 0;
      }

      .theme-normalize button,
      .theme-normalize input {
        overflow: visible;
      }

      .theme-normalize button,
      .theme-normalize select {
        text-transform: none;
      }

      .theme-normalize button,
      .theme-normalize [type="button"],
      .theme-normalize [type="reset"],
      .theme-normalize [type="submit"] {
        -webkit-appearance: button;
      }

      .theme-normalize button::-moz-focus-inner,
      .theme-normalize [type="button"]::-moz-focus-inner,
      .theme-normalize [type="reset"]::-moz-focus-inner,
      .theme-normalize [type="submit"]::-moz-focus-inner {
        border-style: none;
        padding: 0;
      }

      .theme-normalize button:-moz-focusring,
      .theme-normalize [type="button"]:-moz-focusring,
      .theme-normalize [type="reset"]:-moz-focusring,
      .theme-normalize [type="submit"]:-moz-focusring {
        outline: 1px dotted ButtonText;
      }

      .theme-normalize fieldset {
        padding: 0.35em 0.75em 0.625em;
      }

      .theme-normalize legend {
        box-sizing: border-box;
        color: inherit;
        display: table;
        max-width: 100%;
        padding: 0;
        white-space: normal;
      }

      .theme-normalize progress {
        vertical-align: baseline;
      }

      .theme-normalize textarea {
        overflow: auto;
      }

      .theme-normalize [type="checkbox"],
      .theme-normalize [type="radio"] {
        box-sizing: border-box;
        padding: 0;
      }

      .theme-normalize [type="number"]::-webkit-inner-spin-button,
      .theme-normalize [type="number"]::-webkit-outer-spin-button {
        height: auto;
      }

      .theme-normalize [type="search"] {
        -webkit-appearance: textfield;
        outline-offset: -2px;
      }

      .theme-normalize [type="search"]::-webkit-search-decoration {
        -webkit-appearance: none;
      }

      .theme-normalize ::-webkit-file-upload-button {
        -webkit-appearance: button;
        font: inherit;
      }

      .theme-normalize details {
        display: block;
      }

      .theme-normalize summary {
        display: list-item;
      }

      .theme-normalize template {
        display: none;
      }

      .theme-normalize [hidden] {
        display: none;
      }
    `;
  }

  /**
   * Bare theme styles
   */
  private getBareThemeStyles(): string {
    return `
      /* ===== BARE (USER AGENT) THEME ===== */
      /* No custom styles - pure browser defaults */

      .theme-bare .markdown-body {
        max-width: none;
        margin: 0;
        padding: 8px;
      }
    `;
  }

  /**
   * Common styles shared across all themes
   */
  private getCommonStyles(): string {
    return `
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
