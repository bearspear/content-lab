import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrepareOptions, TransformedMarkdown, ChangeDescription, EpubAnalysis } from '@content-lab/core';

/**
 * Modal component for previewing and applying EPUB preparation transformations
 */
@Component({
  selector: 'app-epub-prepare-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <h2>
            <svg class="wand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 20l-3-3 13-13 3 3L6 20z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 4l1-1M18 8l1-1M15 7l1-1M13 11l1-1"/>
            </svg>
            EPUB Preparation
          </h2>
          <button class="close-btn" (click)="close()" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Options Section -->
        <div class="options-section" *ngIf="!transformed">
          <p class="section-description">Select transformations to prepare your markdown for EPUB publishing:</p>

          <!-- Analysis Summary -->
          <div class="analysis-summary" *ngIf="analysis">
            <h3>Document Analysis</h3>
            <div class="analysis-stats">
              <div class="stat">
                <span class="stat-label">Chapters (H1):</span>
                <span class="stat-value">{{ analysis.chapterCount }}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Metadata:</span>
                <span class="stat-value" [class.warning]="!analysis.hasMetadata">
                  {{ analysis.hasMetadata ? '✓ Present' : '✗ Missing' }}
                </span>
              </div>
              <div class="stat">
                <span class="stat-label">Issues Found:</span>
                <span class="stat-value" [class.warning]="analysis.issues.length > 0">
                  {{ analysis.issues.length }}
                </span>
              </div>
            </div>

            <!-- Issues List -->
            <div class="issues-list" *ngIf="analysis.issues.length > 0">
              <div class="issue" *ngFor="let issue of analysis.issues" [class]="'issue-' + issue.type">
                <span class="issue-icon">
                  <span *ngIf="issue.type === 'error'">⚠️</span>
                  <span *ngIf="issue.type === 'warning'">⚡</span>
                  <span *ngIf="issue.type === 'info'">ℹ️</span>
                </span>
                <span class="issue-message">{{ issue.message }}</span>
                <span class="auto-fix-badge" *ngIf="issue.autoFix">Auto-fixable</span>
              </div>
            </div>
          </div>

          <!-- Transformation Options -->
          <div class="options-grid">
            <label class="option-item">
              <input type="checkbox" [(ngModel)]="options.addMetadata">
              <div class="option-content">
                <span class="option-title">Add YAML Front Matter</span>
                <span class="option-description">Add title, author, and publication metadata</span>
              </div>
            </label>

            <label class="option-item">
              <input type="checkbox" [(ngModel)]="options.fixHeadings">
              <div class="option-content">
                <span class="option-title">Fix Heading Structure</span>
                <span class="option-description">Promote H2s to H1s for proper chapters</span>
              </div>
            </label>

            <label class="option-item">
              <input type="checkbox" [(ngModel)]="options.addPageBreaks">
              <div class="option-content">
                <span class="option-title">Add Page Breaks</span>
                <span class="option-description">Insert page breaks before each chapter</span>
              </div>
            </label>

            <label class="option-item">
              <input type="checkbox" [(ngModel)]="options.fixCodeBlocks">
              <div class="option-content">
                <span class="option-title">Auto-Detect Code Languages</span>
                <span class="option-description">Add language identifiers to code blocks</span>
              </div>
            </label>

            <label class="option-item">
              <input type="checkbox" [(ngModel)]="options.fixImages">
              <div class="option-content">
                <span class="option-title">Fix Image Alt Text</span>
                <span class="option-description">Generate alt text from filenames</span>
              </div>
            </label>

            <label class="option-item">
              <input type="checkbox" [(ngModel)]="options.cleanupFormatting">
              <div class="option-content">
                <span class="option-title">Cleanup Formatting</span>
                <span class="option-description">Fix spacing and remove extra blank lines</span>
              </div>
            </label>
          </div>

          <!-- Info Box -->
          <div class="info-box">
            <svg class="info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke-width="2"/>
              <path stroke-linecap="round" stroke-width="2" d="M12 16v-4M12 8h.01"/>
            </svg>
            <p>These transformations will optimize your markdown for EPUB publishing. You can preview changes before applying them.</p>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="preview-section" *ngIf="transformed">
          <div class="changes-summary">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Changes Applied
            </h3>
            <div class="changes-list">
              <div class="change-item" *ngFor="let change of transformed.changes">
                <span class="change-icon" [class]="'change-' + change.type">
                  <span *ngIf="change.type === 'metadata'">📄</span>
                  <span *ngIf="change.type === 'heading'">📑</span>
                  <span *ngIf="change.type === 'pagebreak'">📄</span>
                  <span *ngIf="change.type === 'codeblock'">💻</span>
                  <span *ngIf="change.type === 'image'">🖼️</span>
                  <span *ngIf="change.type === 'cleanup'">✨</span>
                </span>
                <span class="change-description">{{ change.description }}</span>
              </div>
              <div class="no-changes" *ngIf="transformed.changes.length === 0">
                <span>✓ Your markdown is already EPUB-ready!</span>
              </div>
            </div>
          </div>

          <!-- Split Preview -->
          <div class="split-preview">
            <div class="preview-pane">
              <h4>Original</h4>
              <textarea class="preview-textarea" readonly [value]="originalMarkdown"></textarea>
            </div>
            <div class="preview-pane">
              <h4>Transformed</h4>
              <textarea class="preview-textarea" [(ngModel)]="transformed.content"></textarea>
            </div>
          </div>

          <!-- Warnings -->
          <div class="warnings-section" *ngIf="transformed.warnings.length > 0">
            <h4>⚠️ Warnings</h4>
            <ul>
              <li *ngFor="let warning of transformed.warnings">{{ warning }}</li>
            </ul>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">
            Cancel
          </button>
          <button class="btn btn-primary" *ngIf="!transformed" (click)="preview()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Changes
          </button>
          <button class="btn btn-primary" *ngIf="transformed" (click)="apply()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      background: white;
      border-radius: 12px;
      max-width: 1200px;
      width: 95vw;
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

    /* Header */
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 32px;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .wand-icon {
      width: 28px;
      height: 28px;
      stroke: #667eea;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #f7fafc;
    }

    .close-btn svg {
      width: 24px;
      height: 24px;
      stroke: #718096;
    }

    /* Options Section */
    .options-section {
      padding: 32px;
      overflow-y: auto;
      max-height: calc(90vh - 200px);
    }

    .section-description {
      margin: 0 0 24px 0;
      color: #4a5568;
      font-size: 0.95rem;
    }

    /* Analysis Summary */
    .analysis-summary {
      background: #f7fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .analysis-summary h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .analysis-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #718096;
      font-weight: 500;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .stat-value.warning {
      color: #f56565;
    }

    /* Issues List */
    .issues-list {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .issue {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .issue-warning {
      background: #fef5e7;
      border-left: 3px solid #f59e0b;
    }

    .issue-error {
      background: #fee;
      border-left: 3px solid #ef4444;
    }

    .issue-info {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .issue-icon {
      font-size: 1.1rem;
    }

    .issue-message {
      flex: 1;
      color: #2d3748;
    }

    .auto-fix-badge {
      background: #10b981;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    /* Options Grid */
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .option-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .option-item:hover {
      border-color: #667eea;
      background: #f7fafc;
    }

    .option-item input[type="checkbox"] {
      margin-top: 4px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .option-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .option-title {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .option-description {
      font-size: 0.85rem;
      color: #718096;
    }

    /* Info Box */
    .info-box {
      display: flex;
      gap: 12px;
      padding: 16px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      margin-top: 24px;
    }

    .info-icon {
      width: 24px;
      height: 24px;
      stroke: #3b82f6;
      flex-shrink: 0;
    }

    .info-box p {
      margin: 0;
      color: #1e40af;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    /* Preview Section */
    .preview-section {
      padding: 32px;
      overflow-y: auto;
      max-height: calc(90vh - 200px);
    }

    .changes-summary {
      margin-bottom: 24px;
    }

    .changes-summary h3 {
      margin: 0 0 16px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .changes-summary h3 svg {
      width: 24px;
      height: 24px;
      stroke: #10b981;
    }

    .changes-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .change-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #f0fdf4;
      border-left: 3px solid #10b981;
      border-radius: 6px;
    }

    .change-icon {
      font-size: 1.2rem;
    }

    .change-description {
      color: #2d3748;
      font-size: 0.95rem;
    }

    .no-changes {
      padding: 20px;
      text-align: center;
      background: #f0fdf4;
      border-radius: 8px;
      color: #10b981;
      font-weight: 600;
    }

    /* Split Preview */
    .split-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .preview-pane {
      display: flex;
      flex-direction: column;
    }

    .preview-pane h4 {
      margin: 0 0 12px 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #4a5568;
    }

    .preview-textarea {
      flex: 1;
      min-height: 400px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 0.85rem;
      line-height: 1.6;
      resize: vertical;
    }

    .preview-textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Warnings */
    .warnings-section {
      padding: 16px;
      background: #fef5e7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .warnings-section h4 {
      margin: 0 0 12px 0;
      font-size: 1rem;
      color: #92400e;
    }

    .warnings-section ul {
      margin: 0;
      padding-left: 24px;
      color: #92400e;
    }

    .warnings-section li {
      margin: 6px 0;
      font-size: 0.9rem;
    }

    /* Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 32px;
      border-top: 1px solid #e2e8f0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn svg {
      width: 18px;
      height: 18px;
    }

    .btn-secondary {
      background: #f7fafc;
      color: #4a5568;
      border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
      background: #edf2f7;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-primary svg {
      stroke: white;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .modal-dialog {
        width: 100%;
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;
      }

      .split-preview {
        grid-template-columns: 1fr;
      }

      .options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EpubPrepareModalComponent {
  @Input() isOpen: boolean = false;
  @Input() originalMarkdown: string = '';
  @Input() analysis: EpubAnalysis | null = null;

  @Output() close$ = new EventEmitter<void>();
  @Output() apply$ = new EventEmitter<string>();
  @Output() previewRequest = new EventEmitter<PrepareOptions>();

  // Transformation options with sensible defaults
  options: PrepareOptions = {
    addMetadata: true,
    fixHeadings: true,
    addPageBreaks: true,
    fixCodeBlocks: true,
    fixImages: true,
    cleanupFormatting: true
  };

  transformed: TransformedMarkdown | null = null;

  /**
   * Set the transformed result from parent component
   */
  setTransformed(result: TransformedMarkdown): void {
    this.transformed = result;
  }

  /**
   * Request preview with current options
   */
  preview(): void {
    this.previewRequest.emit(this.options);
  }

  /**
   * Apply the transformed content
   */
  apply(): void {
    if (this.transformed) {
      this.apply$.emit(this.transformed.content);
      this.reset();
      this.close();
    }
  }

  /**
   * Close the modal
   */
  close(): void {
    this.close$.emit();
  }

  /**
   * Reset modal state
   */
  reset(): void {
    this.transformed = null;
    this.options = {
      addMetadata: true,
      fixHeadings: true,
      addPageBreaks: true,
      fixCodeBlocks: true,
      fixImages: true,
      cleanupFormatting: true
    };
  }
}
