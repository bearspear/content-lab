import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParsedEpubData, TocItem } from '@content-lab/core';

@Component({
  selector: 'app-epub-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preview-container">
      <h2>📖 EPUB Preview</h2>

      <div class="preview-grid">
        <!-- Metadata Card -->
        <div class="card metadata-card">
          <h3>Book Information</h3>
          <div class="metadata-item">
            <span class="label">Title:</span>
            <span class="value">{{ epubData.metadata.title }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Author:</span>
            <span class="value">{{ epubData.metadata.author.join(', ') }}</span>
          </div>
          <div class="metadata-item" *ngIf="epubData.metadata.publisher">
            <span class="label">Publisher:</span>
            <span class="value">{{ epubData.metadata.publisher }}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Language:</span>
            <span class="value">{{ epubData.metadata.language }}</span>
          </div>
          <div class="metadata-item" *ngIf="epubData.metadata.isbn">
            <span class="label">ISBN:</span>
            <span class="value">{{ epubData.metadata.isbn }}</span>
          </div>
        </div>

        <!-- Structure Card -->
        <div class="card structure-card">
          <h3>Document Structure</h3>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-value">{{ epubData.structure.chapterCount }}</div>
              <div class="stat-label">Chapters</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ epubData.structure.imageCount }}</div>
              <div class="stat-label">Images</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ epubData.tableOfContents.length }}</div>
              <div class="stat-label">TOC Entries</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ epubData.structure.format }}</div>
              <div class="stat-label">Format</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table of Contents -->
      <div class="card toc-card" *ngIf="epubData.tableOfContents.length > 0">
        <h3>📑 Table of Contents</h3>
        <div class="toc-list">
          <div *ngFor="let item of epubData.tableOfContents.slice(0, 10)" class="toc-item" [style.padding-left.px]="item.level * 20">
            {{ item.label }}
          </div>
          <div *ngIf="epubData.tableOfContents.length > 10" class="toc-more">
            + {{ epubData.tableOfContents.length - 10 }} more chapters
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" (click)="back.emit()">← Back</button>
        <button class="btn btn-primary" (click)="continue.emit()">Continue to Options →</button>
      </div>
    </div>
  `,
  styles: [`
    .preview-container { padding: 20px; }
    h2 { margin: 0 0 24px 0; font-size: 1.8rem; }
    .preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .card { background: #f7fafc; border-radius: 8px; padding: 20px; }
    .card h3 { margin: 0 0 16px 0; font-size: 1.2rem; color: #2d3748; }
    .metadata-item { display: flex; gap: 12px; margin: 8px 0; }
    .label { font-weight: 600; color: #4a5568; min-width: 100px; }
    .value { color: #2d3748; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .stat-item { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: 700; color: #667eea; }
    .stat-label { font-size: 0.85rem; color: #718096; margin-top: 4px; }
    .toc-list { max-height: 300px; overflow-y: auto; }
    .toc-item { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    .toc-more { padding: 12px; text-align: center; color: #718096; font-style: italic; }
    .actions { display: flex; justify-content: space-between; gap: 16px; margin-top: 24px; }
    .btn { padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-secondary { background: #e2e8f0; color: #4a5568; }
    @media (max-width: 768px) { .preview-grid { grid-template-columns: 1fr; } }
  `]
})
export class EpubPreviewComponent {
  @Input() epubData!: ParsedEpubData;
  @Input() filename!: string;
  @Output() continue = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
}
