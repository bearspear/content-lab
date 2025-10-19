import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportFormat } from '../../../core/models';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="split-button-container">
      <button class="download-btn main-action" (click)="onExport('html')">
        <svg class="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download HTML
      </button>
      <button class="download-btn dropdown-toggle" (click)="toggleDropdown()" [attr.aria-expanded]="isOpen">
        <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div class="dropdown-menu" [class.show]="isOpen">
        <button class="dropdown-item" (click)="onExport('html')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download HTML
        </button>
        <button class="dropdown-item" (click)="onExport('pdf')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Download PDF
        </button>
        <button class="dropdown-item" (click)="onExport('markdown')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m-6-3h8" />
          </svg>
          Download Markdown
        </button>
        <button class="dropdown-item" (click)="onExport('asciidoc')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download AsciiDoc
        </button>
        <button class="dropdown-item" (click)="onExport('plaintext')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download Plain Text
        </button>
        <button class="dropdown-item" (click)="onExport('json')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9h6M9 12h6M9 15h6" />
          </svg>
          Download JSON
        </button>
        <button class="dropdown-item" (click)="onExport('yaml')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4 4 4-4M8 15h8" />
          </svg>
          Download YAML
        </button>
      </div>
    </div>
  `,
  styles: [`
    .split-button-container {
      position: relative;
      display: inline-flex;
      white-space: nowrap;
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background-color: #3182ce;
      color: white;
      border: none;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .download-btn .download-icon,
    .download-btn .chevron-icon {
      width: 20px;
      height: 20px;
    }

    .download-btn.main-action {
      border-radius: 8px 0 0 8px;
      padding-right: 20px;
    }

    .download-btn.dropdown-toggle {
      border-radius: 0 8px 8px 0;
      padding: 12px 12px;
      border-left: 1px solid rgba(255, 255, 255, 0.3);
    }

    .download-btn.dropdown-toggle .chevron-icon {
      width: 16px;
      height: 16px;
    }

    .download-btn:hover {
      background-color: #2c5282;
    }

    .download-btn:active {
      transform: translateY(0);
    }

    .download-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.4);
      position: relative;
      z-index: 1;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      min-width: 180px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s;
      z-index: 1000;
    }

    .dropdown-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      color: #2d3748;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .dropdown-item svg {
      width: 18px;
      height: 18px;
      color: #4299e1;
      flex-shrink: 0;
    }

    .dropdown-item:first-child {
      border-radius: 6px 6px 0 0;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 6px 6px;
    }

    .dropdown-item:not(:last-child) {
      border-bottom: 1px solid #e2e8f0;
    }

    .dropdown-item:hover {
      background-color: #f7fafc;
      color: #1a202c;
    }

    .dropdown-item:hover svg {
      color: #3182ce;
    }

    .dropdown-item:focus {
      outline: none;
      background-color: #ebf8ff;
    }
  `]
})
export class ExportButtonComponent {
  @Output() export = new EventEmitter<ExportFormat>();

  isOpen: boolean = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  onExport(format: ExportFormat): void {
    this.isOpen = false;
    this.export.emit(format);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.split-button-container');
    if (!dropdown && this.isOpen) {
      this.isOpen = false;
    }
  }
}
