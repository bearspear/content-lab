import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PdfConversionOptions, ParsedEpubData } from '@content-lab/core';

@Component({
  selector: 'app-pdf-options-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="options-panel" *ngIf="options">
      <h3>⚙️ PDF Options</h3>

      <div class="options-grid">
        <!-- Page Settings -->
        <div class="option-section">
          <h4>Page Settings</h4>
          <div class="form-group">
            <label>Page Size</label>
            <select [(ngModel)]="options.pageSettings.size" (ngModelChange)="emitChanges()">
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div class="form-group">
            <label>Orientation</label>
            <select [(ngModel)]="options.pageSettings.orientation" (ngModelChange)="emitChanges()">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        <!-- Typography -->
        <div class="option-section">
          <h4>Typography</h4>
          <div class="form-group">
            <label>Font Size ({{ options.typography.fontSize }}pt)</label>
            <input type="range" min="8" max="18" [(ngModel)]="options.typography.fontSize" (ngModelChange)="emitChanges()" />
          </div>
          <div class="form-group">
            <label>Text Align</label>
            <select [(ngModel)]="options.typography.textAlign" (ngModelChange)="emitChanges()">
              <option value="left">Left</option>
              <option value="justify">Justified</option>
            </select>
          </div>
          <div class="form-group checkbox-group">
            <label><input type="checkbox" [(ngModel)]="options.typography.hyphenation" (ngModelChange)="emitChanges()" /> Enable Hyphenation</label>
          </div>
        </div>

        <!-- Quality -->
        <div class="option-section">
          <h4>Quality</h4>
          <div class="form-group">
            <label>DPI</label>
            <select [(ngModel)]="options.quality.dpi" (ngModelChange)="emitChanges()">
              <option [value]="72">72 (Screen)</option>
              <option [value]="150">150 (Standard)</option>
              <option [value]="300">300 (Print)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Compression</label>
            <select [(ngModel)]="options.quality.compression" (ngModelChange)="emitChanges()">
              <option value="high">High (Smaller)</option>
              <option value="medium">Medium</option>
              <option value="low">Low (Larger)</option>
            </select>
          </div>
        </div>

        <!-- Table of Contents -->
        <div class="option-section" *ngIf="hasToc">
          <h4>Table of Contents</h4>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="options.tableOfContents.includePrintedToc" (ngModelChange)="emitChanges()" />
              Include Printed TOC
            </label>
          </div>
          <div class="form-group" *ngIf="options.tableOfContents.includePrintedToc">
            <label>TOC Title</label>
            <input type="text" [(ngModel)]="options.tableOfContents.tocTitle" (ngModelChange)="emitChanges()" />
          </div>
          <div class="form-group checkbox-group" *ngIf="options.tableOfContents.includePrintedToc">
            <label>
              <input type="checkbox" [(ngModel)]="options.tableOfContents.tocPageNumbers" (ngModelChange)="emitChanges()" />
              Show Page Numbers
            </label>
          </div>
        </div>

        <!-- Layout Options -->
        <div class="option-section">
          <h4>Layout</h4>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="options.layout.chapterPageBreaks" (ngModelChange)="emitChanges()" />
              Start Each Chapter on New Page
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="options.layout.includeImages" (ngModelChange)="emitChanges()" />
              Include Images
            </label>
          </div>
        </div>

        <!-- Advanced Options -->
        <div class="option-section advanced-options">
          <h4>⚡ Advanced Options</h4>
          <div class="form-group checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="enableHtmlEditor" (ngModelChange)="onHtmlEditorToggle($event)" />
              Edit HTML Before Converting
            </label>
          </div>
          <p class="help-text" *ngIf="enableHtmlEditor">
            You'll be able to edit the generated HTML in a WYSIWYG editor before creating the PDF.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .options-panel { background: #f7fafc; border-radius: 8px; padding: 24px; }
    h3 { margin: 0 0 20px 0; font-size: 1.3rem; }
    h4 { margin: 0 0 12px 0; font-size: 1.1rem; color: #2d3748; }
    .options-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
    .option-section { background: white; padding: 16px; border-radius: 6px; }
    .form-group { margin-bottom: 16px; }
    .form-group:last-child { margin-bottom: 0; }
    label { display: block; margin-bottom: 6px; font-weight: 500; color: #4a5568; }
    select, input[type="range"], input[type="text"] { width: 100%; padding: 8px; border: 1px solid #cbd5e0; border-radius: 4px; }
    input[type="text"]:focus { outline: none; border-color: #4299e1; }
    .checkbox-group label { display: flex; align-items: center; gap: 8px; }
    .checkbox-group input[type="checkbox"] { width: auto; }
    .advanced-options { border: 2px solid #4299e1; background: #ebf8ff; }
    .help-text { margin: 12px 0 0 0; font-size: 0.85rem; color: #4a5568; font-style: italic; }
  `]
})
export class PdfOptionsPanelComponent implements OnInit {
  @Input() options!: PdfConversionOptions;
  @Input() epubData: ParsedEpubData | null | undefined;
  @Output() optionsChange = new EventEmitter<PdfConversionOptions>();
  @Output() htmlEditorToggle = new EventEmitter<boolean>();

  enableHtmlEditor = false;

  get hasToc(): boolean {
    const result = this.epubData?.structure?.hasTableOfContents ?? false;
    console.log('[PdfOptionsPanel] hasToc check:', {
      hasEpubData: !!this.epubData,
      hasStructure: !!this.epubData?.structure,
      hasTableOfContents: this.epubData?.structure?.hasTableOfContents,
      result
    });
    return result;
  }

  ngOnInit(): void {
    if (!this.options) {
      console.error('No options provided to PdfOptionsPanelComponent');
    }
    console.log('[PdfOptionsPanel] Initialized with:', {
      hasOptions: !!this.options,
      hasEpubData: !!this.epubData,
      epubData: this.epubData
    });
  }

  emitChanges(): void {
    this.optionsChange.emit(this.options);
  }

  onHtmlEditorToggle(enabled: boolean): void {
    this.htmlEditorToggle.emit(enabled);
  }
}
