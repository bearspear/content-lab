import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewEncapsulation, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditorState, StateEffect, StateField } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, Decoration, DecorationSet } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { foldGutter, foldKeymap, foldEffect } from '@codemirror/language';

@Component({
  selector: 'app-html-editor',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="html-editor-container" [class.fullscreen]="isFullscreen">
      <div class="editor-header">
        <h3>Edit HTML Content</h3>
        <div class="editor-info">
          <span class="info-badge">CodeMirror Editor</span>
          <span class="info-text">Base64 images and style tags auto-collapsed</span>
        </div>
        <div class="editor-actions">
          <button class="action-button secondary" (click)="onCancel()" *ngIf="!isFullscreen">
            Cancel
          </button>
          <button class="action-button toggle" (click)="togglePreview()">
            {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
          </button>
          <button class="action-button fullscreen-btn" (click)="toggleFullscreen()">
            {{ isFullscreen ? '✕ Exit Fullscreen' : '⛶ Fullscreen' }}
          </button>
          <button class="action-button primary" (click)="onGeneratePdf()">
            Generate PDF
          </button>
        </div>
      </div>

      <div class="editor-content" [class.with-preview]="showPreview">
        <div class="editor-pane">
          <div #editorElement class="codemirror-wrapper"></div>
        </div>

        <div class="preview-pane" *ngIf="showPreview">
          <div class="preview-header">
            <h4>Live Preview</h4>
          </div>
          <div #previewContent class="preview-content" (scroll)="onPreviewScroll()"></div>
        </div>
      </div>

      <div class="editor-footer">
        <p class="help-text">
          <strong>Tips:</strong> Click the arrows in the gutter to fold/unfold code blocks.
          Base64 images and style tags are automatically collapsed to keep the view clean.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .html-editor-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 200px);
      min-height: 600px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .html-editor-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      border-radius: 0;
      box-shadow: none;
    }

    .editor-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f7fafc;
      flex-shrink: 0;
      gap: 16px;
      flex-wrap: wrap;
    }

    .editor-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
    }

    .editor-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .info-badge {
      background: #805ad5;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .info-text {
      color: #718096;
      font-size: 13px;
    }

    .editor-actions {
      display: flex;
      gap: 12px;
    }

    .action-button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .action-button.primary {
      background: #4299e1;
      color: white;
    }

    .action-button.primary:hover {
      background: #3182ce;
    }

    .action-button.secondary {
      background: #e2e8f0;
      color: #2d3748;
    }

    .action-button.secondary:hover {
      background: #cbd5e0;
    }

    .action-button.toggle {
      background: #48bb78;
      color: white;
    }

    .action-button.toggle:hover {
      background: #38a169;
    }

    .action-button.fullscreen-btn {
      background: #805ad5;
      color: white;
    }

    .action-button.fullscreen-btn:hover {
      background: #6b46c1;
    }

    .editor-content {
      flex: 1;
      overflow: hidden;
      display: flex;
    }

    .editor-content.with-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .editor-pane {
      flex: 1;
      overflow: auto;
      background: #282c34;
    }

    .codemirror-wrapper {
      height: 100%;
    }

    .preview-pane {
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      background: #f7fafc;
      overflow: hidden;
      height: 100%;
    }

    .preview-header {
      padding: 12px 20px;
      background: white;
      border-bottom: 1px solid #e2e8f0;
    }

    .preview-header h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    .preview-content {
      flex: 1;
      padding: 40px;
      overflow: auto;
      background: white;
    }

    .editor-footer {
      padding: 16px 20px;
      border-top: 1px solid #e2e8f0;
      background: #f7fafc;
      flex-shrink: 0;
    }

    .help-text {
      margin: 0;
      font-size: 14px;
      color: #718096;
    }

    .help-text strong {
      color: #2d3748;
    }

    /* CodeMirror custom styles */
    .cm-editor {
      height: 100%;
      font-size: 14px;
    }

    .cm-scroller {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    }

    .cm-foldPlaceholder {
      background: #3e4451;
      border: 1px solid #528bff;
      color: #abb2bf;
      border-radius: 3px;
      padding: 0 6px;
      margin: 0 3px;
      cursor: pointer;
    }

    .cm-foldPlaceholder:hover {
      background: #4e5561;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .editor-content.with-preview {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
      }

      .preview-pane {
        border-left: none;
        border-top: 1px solid #e2e8f0;
      }
    }

    @media (max-width: 768px) {
      .editor-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .editor-info {
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .editor-actions {
        width: 100%;
        flex-wrap: wrap;
      }

      .action-button {
        flex: 1;
      }
    }
  `]
})
export class HtmlEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() initialHtml: string = '';
  @Output() generatePdf = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('editorElement', { static: false }) editorElement!: ElementRef;
  @ViewChild('previewContent', { static: false }) previewContent!: ElementRef;

  htmlContent: string = '';
  showPreview: boolean = false;
  isFullscreen: boolean = false;
  private editorView?: EditorView;
  private syncScrolling = false;

  ngOnInit(): void {
    this.htmlContent = this.initialHtml;
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.editorView) {
      this.editorView.destroy();
    }
  }

  initializeEditor(): void {
    // Create auto-fold extension that folds base64 images and style tags
    const autoFoldExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged && this.editorView) {
        // Use setTimeout to ensure document is fully updated
        setTimeout(() => {
          this.autoFoldContent();
        }, 100);
      }
    });

    // Create scroll sync extension
    const scrollSyncExtension = EditorView.domEventHandlers({
      scroll: () => {
        this.onEditorScroll();
        return false;
      }
    });

    const startState = EditorState.create({
      doc: this.htmlContent,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        history(),
        foldGutter({
          openText: '▼',
          closedText: '▶'
        }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...foldKeymap
        ]),
        html(),
        oneDark,
        autoFoldExtension,
        scrollSyncExtension,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            this.htmlContent = update.state.doc.toString();
            // Re-render preview with new content if visible
            if (this.showPreview && this.previewContent?.nativeElement) {
              setTimeout(() => {
                if (this.previewContent?.nativeElement) {
                  this.previewContent.nativeElement.innerHTML = this.htmlContent;
                }
              }, 300);
            }
          }
        }),
        EditorView.lineWrapping
      ]
    });

    this.editorView = new EditorView({
      state: startState,
      parent: this.editorElement.nativeElement
    });

    // Fold content on initial load
    setTimeout(() => {
      this.autoFoldContent();
    }, 100);
  }

  autoFoldContent(): void {
    if (!this.editorView) return;

    const state = this.editorView.state;
    const doc = state.doc;
    const text = doc.toString();
    const effects: any[] = [];

    // Find and fold style tags (multi-line)
    const styleRegex = /<style[^>]*>[\s\S]*?<\/style>/gi;
    let match;

    while ((match = styleRegex.exec(text)) !== null) {
      const from = match.index;
      const to = match.index + match[0].length;

      try {
        const startLine = doc.lineAt(from);
        const endLine = doc.lineAt(to);

        // Only fold if it spans multiple lines
        if (endLine.number > startLine.number) {
          effects.push(foldEffect.of({ from: startLine.from, to: endLine.to }));
        }
      } catch (e) {
        // Ignore errors for invalid ranges
      }
    }

    // Find and fold base64 images (both single-line and multi-line)
    // Match the base64 data portion only: data:image/...;base64,XXXX
    const base64Regex = /data:image\/[^;]+;base64,[A-Za-z0-9+/=]{200,}/g;
    while ((match = base64Regex.exec(text)) !== null) {
      const from = match.index;
      const to = match.index + match[0].length;

      try {
        const startLine = doc.lineAt(from);
        const endLine = doc.lineAt(to);

        // Fold if base64 data spans multiple lines
        if (endLine.number > startLine.number) {
          effects.push(foldEffect.of({ from: startLine.from, to: endLine.to }));
        } else {
          // For single-line base64, we'll fold just the base64 data portion
          // Find where base64 data starts (after "base64,")
          const base64StartIndex = match[0].indexOf('base64,') + 7;
          const base64DataFrom = from + base64StartIndex;

          // Only show first 20 chars of base64 data by folding the rest
          if (to - base64DataFrom > 40) {
            const foldFrom = base64DataFrom + 20;
            const foldTo = to - 10; // Keep last 10 chars visible

            // Create a fold for the middle portion of base64 data
            const line = doc.lineAt(foldFrom);
            if (foldTo > foldFrom) {
              effects.push(foldEffect.of({ from: foldFrom, to: foldTo }));
            }
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Dispatch all fold effects at once
    if (effects.length > 0) {
      this.editorView.dispatch({ effects });
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      // Render preview after DOM updates
      setTimeout(() => {
        if (this.previewContent?.nativeElement) {
          this.previewContent.nativeElement.innerHTML = this.htmlContent;
        }
      }, 100);
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
  }

  onEditorScroll(): void {
    if (!this.editorView || !this.showPreview || this.syncScrolling) return;

    this.syncScrolling = true;

    try {
      // Get the line at the top of the editor viewport
      const scroller = this.editorView.scrollDOM;
      const scrollTop = scroller.scrollTop;
      const topPos = this.editorView.lineBlockAtHeight(scrollTop);
      const topLine = this.editorView.state.doc.lineAt(topPos.from).number;

      // Get a range of lines around the viewport to search for IDs
      const endPos = this.editorView.lineBlockAtHeight(scrollTop + scroller.clientHeight);
      const endLine = this.editorView.state.doc.lineAt(endPos.from).number;

      // Search for id="..." in the visible range
      const visibleText = this.editorView.state.doc.sliceString(topPos.from, endPos.to);
      const idMatch = visibleText.match(/id=["']([^"']+)["']/);

      if (idMatch && this.previewContent?.nativeElement) {
        const elementId = idMatch[1];
        const preview = this.previewContent.nativeElement;
        const targetElement = preview.querySelector(`#${CSS.escape(elementId)}`);

        if (targetElement) {
          // Scroll the preview to show this element
          const elementTop = (targetElement as HTMLElement).offsetTop;
          preview.scrollTop = elementTop - 20; // 20px offset from top
        }
      }
    } catch (e) {
      // Fallback: do nothing if there's an error
    }

    setTimeout(() => {
      this.syncScrolling = false;
    }, 50);
  }

  onPreviewScroll(): void {
    if (!this.editorView || !this.showPreview || this.syncScrolling) return;

    this.syncScrolling = true;

    try {
      const preview = this.previewContent.nativeElement;
      const scrollTop = preview.scrollTop;

      // Find all elements with IDs in the preview
      const elementsWithIds = Array.from(preview.querySelectorAll('[id]')) as HTMLElement[];

      // Find the first visible element with an ID
      let visibleElement: HTMLElement | null = null;
      for (const element of elementsWithIds) {
        const rect = element.getBoundingClientRect();
        const previewRect = preview.getBoundingClientRect();

        // Check if element is visible in preview viewport
        if (rect.top >= previewRect.top && rect.top <= previewRect.bottom) {
          visibleElement = element;
          break;
        }
      }

      if (visibleElement && visibleElement.id) {
        // Find this ID in the editor
        const searchId = visibleElement.id;
        const doc = this.editorView.state.doc;
        const text = doc.toString();

        // Search for id="searchId" or id='searchId'
        const pattern = new RegExp(`id=["']${searchId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
        const match = pattern.exec(text);

        if (match) {
          const pos = match.index;
          const line = doc.lineAt(pos);

          // Scroll editor to this line
          this.editorView.dispatch({
            effects: EditorView.scrollIntoView(line.from, { y: 'start', yMargin: 100 })
          });
        }
      }
    } catch (e) {
      // Fallback: do nothing if there's an error
    }

    setTimeout(() => {
      this.syncScrolling = false;
    }, 50);
  }

  onGeneratePdf(): void {
    // Get the current content from the editor
    if (this.editorView) {
      this.htmlContent = this.editorView.state.doc.toString();
    }
    // Emit the HTML exactly as edited - no modifications
    this.generatePdf.emit(this.htmlContent);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
