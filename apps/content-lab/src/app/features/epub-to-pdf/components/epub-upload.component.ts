import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpubPdfApiService } from '@content-lab/core';

@Component({
  selector: 'app-epub-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-container">
      <div
        class="upload-area"
        [class.dragover]="isDragOver"
        (drop)="onDrop($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          accept=".epub"
          (change)="onFileSelected($event)"
          style="display: none"
        />

        <div class="upload-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <h3>Drop your EPUB file here</h3>
        <p>or click to browse</p>

        <div class="file-info">
          <span class="info-icon">📚</span>
          <span>Supports EPUB 2.0 and 3.0 formats</span>
        </div>
      </div>

      <div *ngIf="uploading" class="uploading">
        <div class="spinner"></div>
        <p>Uploading {{ selectedFile?.name }}...</p>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .upload-area {
      border: 3px dashed #cbd5e0;
      border-radius: 12px;
      padding: 60px 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #f7fafc;
    }

    .upload-area:hover {
      border-color: #667eea;
      background: #edf2f7;
    }

    .upload-area.dragover {
      border-color: #667eea;
      background: #e6f3ff;
      transform: scale(1.02);
    }

    .upload-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      color: #667eea;
    }

    .upload-icon svg {
      width: 100%;
      height: 100%;
    }

    .upload-area h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #2d3748;
    }

    .upload-area p {
      font-size: 1.1rem;
      color: #718096;
      margin: 0 0 24px 0;
    }

    .file-info {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: white;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #4a5568;
    }

    .info-icon {
      font-size: 1.2rem;
    }

    .uploading {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: #edf2f7;
      border-radius: 8px;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .uploading p {
      margin: 0;
      color: #4a5568;
      font-weight: 500;
    }
  `]
})
export class EpubUploadComponent {
  @Output() fileUploaded = new EventEmitter<{ fileId: string; filename: string; file: File }>();
  @Output() error = new EventEmitter<string>();

  isDragOver = false;
  uploading = false;
  selectedFile: File | null = null;

  constructor(private epubPdfApi: EpubPdfApiService) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      this.error.emit('Please select an EPUB file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      this.error.emit('File is too large. Maximum size is 100MB');
      return;
    }

    this.selectedFile = file;
    this.uploadFile(file);
  }

  private uploadFile(file: File): void {
    this.uploading = true;

    this.epubPdfApi.uploadEpub(file).subscribe({
      next: (response) => {
        this.uploading = false;
        this.fileUploaded.emit({
          fileId: response.fileId,
          filename: response.filename,
          file
        });
      },
      error: (err) => {
        this.uploading = false;
        this.error.emit(err.error?.error || 'Upload failed');
      }
    });
  }
}
