import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorAction, EditorActionType } from '@content-lab/core';

@Component({
  selector: 'app-markdown-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button class="toolbar-btn" (click)="emitAction('bold')" title="Bold (Ctrl+B)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('italic')" title="Italic (Ctrl+I)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="19" y1="4" x2="10" y2="4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="14" y1="20" x2="5" y2="20" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="15" y1="4" x2="9" y2="20" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('strikethrough')" title="Strikethrough">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18M9 4a3.5 3.5 0 013 1.75M15 20a3.5 3.5 0 01-3-1.75" />
          </svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn" (click)="emitAction('heading1')" title="Heading 1">H1</button>
        <button class="toolbar-btn" (click)="emitAction('heading2')" title="Heading 2">H2</button>
        <button class="toolbar-btn" (click)="emitAction('heading3')" title="Heading 3">H3</button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn" (click)="emitAction('code')" title="Inline Code">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="16 18 22 12 16 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <polyline points="8 6 2 12 8 18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('codeBlock')" title="Code Block">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="9" y1="15" x2="15" y2="15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('blockquote')" title="Blockquote">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5V9z" />
          </svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn" (click)="emitAction('unorderedList')" title="Unordered List">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="8" y1="6" x2="21" y2="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="8" y1="12" x2="21" y2="12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="8" y1="18" x2="21" y2="18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="3" y1="6" x2="3.01" y2="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="3" y1="12" x2="3.01" y2="12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="3" y1="18" x2="3.01" y2="18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('orderedList')" title="Ordered List">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="10" y1="6" x2="21" y2="6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="10" y1="12" x2="21" y2="12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="10" y1="18" x2="21" y2="18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('taskList')" title="Task List">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 11 12 14 22 4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn" (click)="emitAction('link')" title="Link (Ctrl+K)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('image')" title="Image">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <polyline points="21 15 16 10 5 21" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('table')" title="Table">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="3" y1="9" x2="21" y2="9" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="3" y1="15" x2="21" y2="15" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            <line x1="12" y1="3" x2="12" y2="21" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn" (click)="emitAction('horizontalRule')" title="Horizontal Rule">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="3" y1="12" x2="21" y2="12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
        </button>
        <button class="toolbar-btn" (click)="emitAction('math')" title="Math Equation">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <text x="6" y="18" font-size="16" font-style="italic" fill="currentColor">∑</text>
          </svg>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button class="toolbar-btn epub-prepare-btn" (click)="emitAction('epubPrepare')" title="Prepare for EPUB Publishing">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 20l-3-3 13-13 3 3L6 20z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 4l1-1M18 8l1-1M15 7l1-1M13 11l1-1"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .editor-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #f7fafc;
      border-bottom: 1px solid #e2e8f0;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background-color: #cbd5e0;
      margin: 0 4px;
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      background-color: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.15s;
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 32px;
      height: 32px;
    }

    .toolbar-btn svg {
      width: 18px;
      height: 18px;
    }

    .toolbar-btn:hover {
      background-color: #e2e8f0;
      color: #2d3748;
      border-color: #cbd5e0;
    }

    .toolbar-btn:active {
      background-color: #cbd5e0;
    }

    .toolbar-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
      border-color: #4299e1;
    }

    /* EPUB Prepare Button - Purple Gradient */
    .epub-prepare-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: transparent;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
    }

    .epub-prepare-btn svg {
      stroke: white;
    }

    .epub-prepare-btn:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b3fa0 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .epub-prepare-btn:active {
      background: linear-gradient(135deg, #4c51bf 0%, #5a32a3 100%);
      transform: translateY(0);
    }

    .epub-prepare-btn:focus {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
      border-color: transparent;
    }

    @media (max-width: 768px) {
      .editor-toolbar {
        padding: 8px 12px;
        gap: 4px;
      }

      .toolbar-divider {
        display: none;
      }

      .toolbar-btn {
        padding: 6px;
        min-width: 28px;
        height: 28px;
      }

      .toolbar-btn svg {
        width: 16px;
        height: 16px;
      }
    }
  `]
})
export class MarkdownToolbarComponent {
  @Output() action = new EventEmitter<EditorAction>();

  emitAction(type: EditorActionType): void {
    this.action.emit({ type });
  }
}
