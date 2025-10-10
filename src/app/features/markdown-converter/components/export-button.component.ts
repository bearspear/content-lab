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
      </div>
    </div>
  `,
  styles: []
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
