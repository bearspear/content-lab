import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { EpubOptions } from '@content-lab/core';
import { MarkdownService } from '@content-lab/core';

@Component({
  selector: 'app-epub-publish-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="epub-button-group">
      <button class="epub-btn" (click)="openDialog()" title="Publish as EPUB e-book">
        <svg class="book-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Publish EPUB
      </button>
      <button class="help-btn" (click)="openHelpModal()" title="How to create EPUBs">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </button>
    </div>

    <!-- EPUB Options Dialog -->
    <div class="dialog-overlay" *ngIf="isDialogOpen" (click)="closeDialog()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>Publish as EPUB</h2>
          <button class="close-btn" (click)="closeDialog()" aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="dialog-body">
          <div class="option-section">
            <h3>Book Settings</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="options.includeCover">
                <span>Include cover page</span>
              </label>
              <p class="help-text">Generate a cover page from YAML metadata or EPUB:COVER marker</p>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="options.includeToc">
                <span>Include table of contents</span>
              </label>
              <p class="help-text">Generate TOC from chapter headings</p>
            </div>

            <div class="form-group">
              <label for="tocDepth">TOC Depth</label>
              <select id="tocDepth" [(ngModel)]="options.tocDepth" class="select-input">
                <option [value]="1">Level 1 (H1 only)</option>
                <option [value]="2">Level 2 (H1, H2)</option>
                <option [value]="3">Level 3 (H1, H2, H3)</option>
              </select>
              <p class="help-text">How many heading levels to include in TOC</p>
            </div>
          </div>

          <div class="option-section">
            <h3>Typography</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="options.fontEmbedding">
                <span>Embed custom fonts</span>
              </label>
              <p class="help-text">Embed Literata, Inter, and Source Code Pro fonts for consistent typography</p>
            </div>

            <div class="form-group">
              <label for="textAlign">Text Alignment</label>
              <select id="textAlign" [(ngModel)]="options.textAlign" class="select-input">
                <option value="left">Left aligned</option>
                <option value="justify">Justified</option>
              </select>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="options.hyphenation">
                <span>Enable hyphenation</span>
              </label>
              <p class="help-text">Automatic word hyphenation for better text flow</p>
            </div>
          </div>

          <div class="option-section">
            <h3>Appearance</h3>

            <div class="form-group">
              <label for="theme">Color Theme</label>
              <select id="theme" [(ngModel)]="options.theme" class="select-input">
                <option value="light">Light (white background)</option>
                <option value="sepia">Sepia (warm tones)</option>
                <option value="dark">Dark (black background)</option>
              </select>
              <p class="help-text">Default color scheme for e-readers</p>
            </div>
          </div>

          <div class="info-box">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Markdown Features Supported:</strong>
              <ul>
                <li>Chapter splitting by H1 headings</li>
                <li>Image embedding (external URLs and base64)</li>
                <li>Math equations (KaTeX)</li>
                <li>Syntax highlighting (Highlight.js)</li>
                <li>Special markers: EPUB:COVER, EPUB:PART, EPUB:PAGEBREAK</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-secondary" (click)="closeDialog()">Cancel</button>
          <button class="btn btn-primary" (click)="generateEpub()" [disabled]="!hasContent">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Generate EPUB
          </button>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div class="dialog-overlay help-overlay" *ngIf="isHelpOpen" (click)="closeHelpModal()">
      <div class="dialog-content help-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>EPUB Publishing Guide</h2>
          <button class="close-btn" (click)="closeHelpModal()" aria-label="Close help">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="dialog-body help-body">
          <div *ngIf="isLoadingHelp" class="loading-message">
            Loading guide...
          </div>
          <div *ngIf="!isLoadingHelp && helpContent" class="help-rendered-content" [innerHTML]="helpContent"></div>
          <div *ngIf="!isLoadingHelp && !helpContent" class="error-message">
            Failed to load help guide. Please try again.
          </div>
        </div>

        <div class="dialog-footer">
          <button class="btn btn-primary" (click)="closeHelpModal()">Got it!</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .epub-button-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .epub-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .epub-btn .book-icon {
      width: 20px;
      height: 20px;
    }

    .epub-btn:hover {
      background: linear-gradient(135deg, #5568d3 0%, #6a3e8a 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }

    .epub-btn:active {
      transform: translateY(0);
    }

    .epub-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.4);
    }

    /* Help Button */
    .help-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      background: #f0f4f8;
      color: #667eea;
      border: 2px solid #e0e7ff;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .help-btn svg {
      width: 20px;
      height: 20px;
    }

    .help-btn:hover {
      background: #e0e7ff;
      border-color: #667eea;
      transform: translateY(-1px);
    }

    .help-btn:active {
      transform: translateY(0);
    }

    .help-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    }

    /* Dialog Overlay */
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Dialog Content */
    .dialog-content {
      background: white;
      border-radius: 12px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Dialog Header */
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      border-bottom: 1px solid #e2e8f0;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a202c;
    }

    .close-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      background: none;
      border: none;
      color: #718096;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn svg {
      width: 20px;
      height: 20px;
    }

    .close-btn:hover {
      background-color: #f7fafc;
      color: #2d3748;
    }

    /* Dialog Body */
    .dialog-body {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
    }

    .option-section {
      margin-bottom: 24px;
    }

    .option-section:last-child {
      margin-bottom: 0;
    }

    .option-section h3 {
      margin: 0 0 16px 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      font-size: 0.9rem;
      color: #4a5568;
    }

    .checkbox-label {
      display: flex !important;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      margin-bottom: 4px !important;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-label span {
      font-weight: 500;
      color: #2d3748;
    }

    .select-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 0.95rem;
      color: #2d3748;
      background-color: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .select-input:hover {
      border-color: #a0aec0;
    }

    .select-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .help-text {
      margin: 4px 0 0 0;
      font-size: 0.85rem;
      color: #718096;
      line-height: 1.4;
    }

    .info-box {
      display: flex;
      gap: 12px;
      padding: 16px;
      background-color: #ebf8ff;
      border: 1px solid #bee3f8;
      border-radius: 8px;
      margin-top: 24px;
    }

    .info-box svg {
      width: 20px;
      height: 20px;
      color: #3182ce;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .info-box strong {
      display: block;
      margin-bottom: 8px;
      color: #2c5282;
      font-size: 0.95rem;
    }

    .info-box ul {
      margin: 0;
      padding-left: 20px;
      color: #2c5282;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .info-box li {
      margin-bottom: 4px;
    }

    /* Dialog Footer */
    .dialog-footer {
      display: flex;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
      justify-content: flex-end;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn svg {
      width: 18px;
      height: 18px;
    }

    .btn-secondary {
      background-color: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background-color: #cbd5e0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #5568d3 0%, #6a3e8a 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Help Modal Specific Styles */
    .help-content {
      max-width: 1100px;
      max-height: 90vh;
    }

    .help-body {
      font-size: 1rem;
      line-height: 1.8;
      scroll-behavior: smooth;
      padding: 32px 48px;
    }

    ::ng-deep .help-rendered-content {
      color: #1a202c;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      max-width: 900px;
      margin: 0 auto;
    }

    /* Headings with improved hierarchy */
    ::ng-deep .help-rendered-content h1 {
      font-size: 2.25em;
      font-weight: 800;
      margin: 0 0 0.9em 0;
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 0.5em;
      letter-spacing: -0.02em;
    }

    ::ng-deep .help-rendered-content h1:first-child {
      margin-top: 0;
    }

    ::ng-deep .help-rendered-content h2 {
      font-size: 1.75em;
      font-weight: 700;
      margin: 1.8em 0 0.7em 0;
      color: #2d3748;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.4em;
      letter-spacing: -0.01em;
    }

    ::ng-deep .help-rendered-content h2:first-child {
      margin-top: 0.8em;
    }

    ::ng-deep .help-rendered-content h3 {
      font-size: 1.35em;
      font-weight: 600;
      margin: 1.5em 0 0.6em 0;
      color: #4a5568;
      position: relative;
      padding-left: 1em;
    }

    ::ng-deep .help-rendered-content h3::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.4em;
      width: 4px;
      height: 1em;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }

    ::ng-deep .help-rendered-content h4 {
      font-size: 1.15em;
      font-weight: 600;
      margin: 1.2em 0 0.5em 0;
      color: #4a5568;
    }

    /* Paragraphs and text */
    ::ng-deep .help-rendered-content p {
      margin: 0.9em 0;
      line-height: 1.8;
    }

    ::ng-deep .help-rendered-content strong {
      font-weight: 600;
      color: #2d3748;
    }

    ::ng-deep .help-rendered-content em {
      font-style: italic;
      color: #4a5568;
    }

    /* Inline code with enhanced styling */
    ::ng-deep .help-rendered-content code {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      color: #c7254e;
      padding: 0.25em 0.5em;
      border-radius: 4px;
      font-size: 0.88em;
      font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace;
      font-weight: 500;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    /* Code blocks with modern styling */
    ::ng-deep .help-rendered-content pre {
      background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
      color: #e2e8f0;
      padding: 1.5em;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1.4em 0;
      border: 1px solid #4a5568;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    ::ng-deep .help-rendered-content pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: 0.9em;
      line-height: 1.6;
      white-space: pre;
    }

    ::ng-deep .help-rendered-content pre::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px 8px 0 0;
    }

    /* Lists with improved spacing */
    ::ng-deep .help-rendered-content ul,
    ::ng-deep .help-rendered-content ol {
      margin: 1em 0 1em 1.5em;
      padding-left: 1.5em;
      line-height: 1.8;
    }

    ::ng-deep .help-rendered-content ul {
      list-style-type: disc;
      list-style-position: outside;
    }

    ::ng-deep .help-rendered-content ul li {
      margin: 0.5em 0;
      padding-left: 0.5em;
    }

    ::ng-deep .help-rendered-content ul li::marker {
      color: #667eea;
      font-size: 1.1em;
    }

    ::ng-deep .help-rendered-content ol {
      list-style-type: decimal;
      list-style-position: outside;
    }

    ::ng-deep .help-rendered-content ol li {
      margin: 0.5em 0;
      padding-left: 0.5em;
    }

    ::ng-deep .help-rendered-content ol li::marker {
      color: #667eea;
      font-weight: 600;
    }

    /* Nested lists */
    ::ng-deep .help-rendered-content li > ul,
    ::ng-deep .help-rendered-content li > ol {
      margin-top: 0.6em;
      margin-bottom: 0.6em;
      margin-left: 0;
      padding-left: 1.5em;
    }

    ::ng-deep .help-rendered-content li > ul {
      list-style-type: circle;
    }

    ::ng-deep .help-rendered-content li > ol {
      list-style-type: lower-alpha;
    }

    /* Tables with modern design */
    ::ng-deep .help-rendered-content table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.4em 0;
      font-size: 0.92em;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }

    ::ng-deep .help-rendered-content th,
    ::ng-deep .help-rendered-content td {
      padding: 0.9em 1em;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    ::ng-deep .help-rendered-content thead th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85em;
      letter-spacing: 0.05em;
      border: none;
    }

    ::ng-deep .help-rendered-content thead th:first-child {
      border-radius: 8px 0 0 0;
    }

    ::ng-deep .help-rendered-content thead th:last-child {
      border-radius: 0 8px 0 0;
    }

    ::ng-deep .help-rendered-content tbody tr {
      background-color: white;
      transition: background-color 0.2s;
    }

    ::ng-deep .help-rendered-content tbody tr:nth-child(even) {
      background-color: #f7fafc;
    }

    ::ng-deep .help-rendered-content tbody tr:hover {
      background-color: #edf2f7;
    }

    ::ng-deep .help-rendered-content tbody tr:last-child td {
      border-bottom: none;
    }

    ::ng-deep .help-rendered-content tbody tr:last-child td:first-child {
      border-radius: 0 0 0 8px;
    }

    ::ng-deep .help-rendered-content tbody tr:last-child td:last-child {
      border-radius: 0 0 8px 0;
    }

    ::ng-deep .help-rendered-content td code {
      font-size: 0.85em;
      padding: 0.15em 0.35em;
    }

    /* Blockquotes with enhanced design */
    ::ng-deep .help-rendered-content blockquote {
      border-left: 4px solid #667eea;
      background: linear-gradient(90deg, #f7fafc 0%, #ffffff 100%);
      padding: 1em 1.5em;
      margin: 1.4em 0;
      color: #4a5568;
      border-radius: 0 6px 6px 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    ::ng-deep .help-rendered-content blockquote p {
      margin: 0.5em 0;
    }

    ::ng-deep .help-rendered-content blockquote p:first-child {
      margin-top: 0;
    }

    ::ng-deep .help-rendered-content blockquote p:last-child {
      margin-bottom: 0;
    }

    ::ng-deep .help-rendered-content blockquote code {
      background-color: #edf2f7;
    }

    /* Horizontal rules with gradient */
    ::ng-deep .help-rendered-content hr {
      border: none;
      height: 3px;
      background: linear-gradient(90deg, transparent 0%, #667eea 50%, transparent 100%);
      margin: 2em 0;
      opacity: 0.6;
    }

    /* Links with modern styling */
    ::ng-deep .help-rendered-content a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      transition: all 0.2s;
      position: relative;
    }

    ::ng-deep .help-rendered-content a:hover {
      color: #764ba2;
      border-bottom-color: #764ba2;
    }

    ::ng-deep .help-rendered-content a:active {
      color: #5568d3;
    }

    /* Special callout boxes for important information */
    ::ng-deep .help-rendered-content p strong:first-child {
      display: inline-block;
      margin-bottom: 0.3em;
    }

    /* Loading and error states */
    .loading-message {
      text-align: center;
      padding: 4em 2em;
      color: #667eea;
      font-size: 1.15em;
      font-weight: 500;
    }

    .loading-message::after {
      content: '...';
      animation: dots 1.5s steps(4, end) infinite;
    }

    @keyframes dots {
      0%, 20% { content: '.'; }
      40% { content: '..'; }
      60%, 100% { content: '...'; }
    }

    .error-message {
      text-align: center;
      padding: 4em 2em;
      color: #e53e3e;
      font-size: 1.15em;
      font-weight: 500;
    }

    /* Keyboard shortcuts styling */
    ::ng-deep .help-rendered-content kbd {
      display: inline-block;
      padding: 0.2em 0.5em;
      font-size: 0.85em;
      font-family: 'SFMono-Regular', monospace;
      color: #2d3748;
      background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);
      border: 1px solid #cbd5e0;
      border-radius: 4px;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
    }

    /* Improved scrollbar for help content */
    .help-body::-webkit-scrollbar {
      width: 10px;
    }

    .help-body::-webkit-scrollbar-track {
      background: #f7fafc;
      border-radius: 5px;
    }

    .help-body::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 5px;
    }

    .help-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #5568d3 0%, #6a3e8a 100%);
    }

    /* Responsive */
    @media (max-width: 640px) {
      .dialog-content {
        max-width: 100%;
        max-height: 100vh;
        border-radius: 0;
      }

      .help-content {
        max-width: 100%;
        max-height: 100vh;
      }

      .dialog-header,
      .dialog-footer {
        padding: 16px;
      }

      .dialog-body {
        padding: 16px;
      }

      .help-body {
        padding: 20px 16px;
      }

      ::ng-deep .help-rendered-content {
        max-width: 100%;
      }

      ::ng-deep .help-rendered-content h1 {
        font-size: 1.85em;
      }

      ::ng-deep .help-rendered-content h2 {
        font-size: 1.5em;
        margin: 1.5em 0 0.6em 0;
      }

      ::ng-deep .help-rendered-content h3 {
        font-size: 1.25em;
        margin: 1.2em 0 0.5em 0;
      }

      ::ng-deep .help-rendered-content ul,
      ::ng-deep .help-rendered-content ol {
        margin-left: 1em;
        padding-left: 1.25em;
      }

      ::ng-deep .help-rendered-content pre {
        padding: 1.25em;
        margin: 1.2em 0;
      }

      .epub-button-group {
        flex-wrap: wrap;
      }
    }
  `]
})
export class EpubPublishButtonComponent implements OnInit {
  @Input() hasContent: boolean = false;
  @Output() publish = new EventEmitter<EpubOptions>();

  isDialogOpen: boolean = false;
  isHelpOpen: boolean = false;
  isLoadingHelp: boolean = false;
  helpContent: SafeHtml | null = null;

  // Default EPUB options
  options: EpubOptions = {
    includeCover: true,
    includeToc: true,
    tocDepth: 2,
    fontEmbedding: true,
    hyphenation: true,
    textAlign: 'justify',
    theme: 'light'
  };

  constructor(
    private http: HttpClient,
    private markdownService: MarkdownService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Preload help content for faster display
    this.preloadHelpContent();
  }

  openDialog(): void {
    this.isDialogOpen = true;
  }

  closeDialog(): void {
    this.isDialogOpen = false;
  }

  generateEpub(): void {
    if (!this.hasContent) return;

    this.publish.emit(this.options);
    this.closeDialog();
  }

  async openHelpModal(): Promise<void> {
    this.isHelpOpen = true;

    // Load content if not already loaded
    if (!this.helpContent) {
      await this.loadHelpContent();
    }
  }

  closeHelpModal(): void {
    this.isHelpOpen = false;
  }

  private async preloadHelpContent(): Promise<void> {
    // Silently preload in the background
    try {
      const markdown = await firstValueFrom(
        this.http.get('assets/epub-help-guide.md', { responseType: 'text' })
      );
      const html = this.markdownService.convertToHtml(markdown);
      this.helpContent = this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      // Silently fail - will try again when modal opens
      console.warn('Failed to preload help content:', error);
    }
  }

  private async loadHelpContent(): Promise<void> {
    this.isLoadingHelp = true;
    try {
      const markdown = await firstValueFrom(
        this.http.get('assets/epub-help-guide.md', { responseType: 'text' })
      );
      const html = this.markdownService.convertToHtml(markdown);
      this.helpContent = this.sanitizer.bypassSecurityTrustHtml(html);
    } catch (error) {
      console.error('Failed to load help content:', error);
      this.helpContent = null;
    } finally {
      this.isLoadingHelp = false;
    }
  }
}
