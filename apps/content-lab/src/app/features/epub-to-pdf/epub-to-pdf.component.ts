import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import {
  EpubPdfApiService,
  ParsedEpubData,
  PdfConversionOptions,
  ConversionPreset,
  JobStatusResponse
} from '@content-lab/core';

// Import child components (will be created next)
import { EpubUploadComponent } from './components/epub-upload.component';
import { EpubPreviewComponent } from './components/epub-preview.component';
import { PdfOptionsPanelComponent } from './components/pdf-options-panel.component';
import { ConversionProgressComponent } from './components/conversion-progress.component';
import { PresetSelectorComponent } from './components/preset-selector.component';
import { HtmlEditorComponent } from './components/html-editor.component';

type WorkflowStep = 'upload' | 'preview' | 'options' | 'html-editor' | 'converting' | 'complete';

@Component({
  selector: 'app-epub-to-pdf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EpubUploadComponent,
    EpubPreviewComponent,
    PdfOptionsPanelComponent,
    ConversionProgressComponent,
    PresetSelectorComponent,
    HtmlEditorComponent
  ],
  template: `
    <div class="epub-to-pdf-container">
      <!-- Header -->
      <div class="header">
        <h1>📚 EPUB to PDF Converter</h1>
        <p class="subtitle">Convert your EPUB books to high-quality PDF</p>
      </div>

      <!-- Progress Steps -->
      <div class="progress-steps">
        <div class="step" [class.active]="currentStep === 'upload'" [class.completed]="isStepCompleted('upload')">
          <div class="step-number">1</div>
          <div class="step-label">Upload</div>
        </div>
        <div class="step-divider"></div>
        <div class="step" [class.active]="currentStep === 'preview'" [class.completed]="isStepCompleted('preview')">
          <div class="step-number">2</div>
          <div class="step-label">Preview</div>
        </div>
        <div class="step-divider"></div>
        <div class="step" [class.active]="currentStep === 'options'" [class.completed]="isStepCompleted('options')">
          <div class="step-number">3</div>
          <div class="step-label">Configure</div>
        </div>
        <div class="step-divider"></div>
        <div class="step" [class.active]="currentStep === 'converting'" [class.completed]="isStepCompleted('converting')">
          <div class="step-number">4</div>
          <div class="step-label">Convert</div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content">
        <!-- Step 1: Upload -->
        <app-epub-upload
          *ngIf="currentStep === 'upload'"
          (fileUploaded)="onFileUploaded($event)"
          (error)="onError($event)"
        ></app-epub-upload>

        <!-- Step 2: Preview -->
        <app-epub-preview
          *ngIf="currentStep === 'preview' && epubData"
          [epubData]="epubData"
          [filename]="uploadedFilename"
          (continue)="goToOptions()"
          (back)="goToUpload()"
        ></app-epub-preview>

        <!-- Step 3: Options -->
        <div *ngIf="currentStep === 'options'" class="options-step">
          <app-preset-selector
            [presets]="presets"
            [selectedPreset]="selectedPreset"
            (presetSelected)="onPresetSelected($event)"
          ></app-preset-selector>

          <app-pdf-options-panel
            *ngIf="pdfOptions"
            [options]="pdfOptions"
            [epubData]="epubData"
            (optionsChange)="onOptionsChange($event)"
            (htmlEditorToggle)="onHtmlEditorToggle($event)"
          ></app-pdf-options-panel>

          <div class="options-actions">
            <button class="btn btn-secondary" (click)="goToPreview()">
              ← Back to Preview
            </button>
            <button class="btn btn-primary" (click)="proceedFromOptions()">
              {{ enableHtmlEditor ? 'Preview HTML →' : 'Generate PDF →' }}
            </button>
          </div>
        </div>

        <!-- Step 3.5: HTML Editor (optional) -->
        <app-html-editor
          *ngIf="currentStep === 'html-editor'"
          [initialHtml]="htmlContent"
          (generatePdf)="generatePdfFromHtml($event)"
          (cancel)="goToOptions()"
        ></app-html-editor>

        <!-- Step 4: Converting -->
        <app-conversion-progress
          *ngIf="currentStep === 'converting' && jobStatus"
          [jobStatus]="jobStatus"
        ></app-conversion-progress>

        <!-- Step 5: Complete -->
        <div *ngIf="currentStep === 'complete' && jobStatus" class="complete-step">
          <div class="success-icon">✓</div>
          <h2>PDF Generated Successfully!</h2>
          <p>Your EPUB has been converted to a high-quality PDF.</p>

          <div class="completion-stats">
            <div class="stat">
              <span class="stat-label">Processing Time:</span>
              <span class="stat-value">{{ jobStatus.elapsedTime }}s</span>
            </div>
            <div class="stat" *ngIf="jobStatus.totalPages">
              <span class="stat-label">Pages:</span>
              <span class="stat-value">{{ jobStatus.totalPages }}</span>
            </div>
          </div>

          <div class="complete-actions">
            <button class="btn btn-primary btn-large" (click)="downloadPdf()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
            <button class="btn btn-secondary" (click)="startOver()">
              Convert Another EPUB
            </button>
          </div>
        </div>

        <!-- Error Display -->
        <div *ngIf="error" class="error-message">
          <div class="error-icon">⚠️</div>
          <div class="error-content">
            <h3>Error</h3>
            <p>{{ error }}</p>
            <button class="btn btn-secondary" (click)="clearError()">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .epub-to-pdf-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1a202c;
    }

    .subtitle {
      font-size: 1.1rem;
      color: #718096;
      margin: 0;
    }

    /* Progress Steps */
    .progress-steps {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 48px;
      padding: 0 20px;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      color: #718096;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.1rem;
      transition: all 0.3s;
    }

    .step.active .step-number {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: scale(1.1);
    }

    .step.completed .step-number {
      background: #48bb78;
      color: white;
    }

    .step-label {
      font-size: 0.9rem;
      color: #718096;
      font-weight: 500;
    }

    .step.active .step-label {
      color: #667eea;
      font-weight: 600;
    }

    .step-divider {
      width: 80px;
      height: 2px;
      background: #e2e8f0;
      margin: 0 12px;
    }

    /* Content Area */
    .content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 32px;
    }

    /* Options Step */
    .options-step {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .options-actions {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    /* Complete Step */
    .complete-step {
      text-align: center;
      padding: 40px 20px;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #48bb78;
      color: white;
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .complete-step h2 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: #1a202c;
    }

    .complete-step p {
      font-size: 1.1rem;
      color: #718096;
      margin: 0 0 32px 0;
    }

    .completion-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-bottom: 32px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #718096;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .complete-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* Buttons */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn svg {
      width: 20px;
      height: 20px;
    }

    .btn-large {
      padding: 16px 32px;
      font-size: 1.1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background: #cbd5e0;
    }

    /* Error Message */
    .error-message {
      background: #fff5f5;
      border: 2px solid #fc8181;
      border-radius: 8px;
      padding: 24px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .error-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;
    }

    .error-content h3 {
      margin: 0 0 8px 0;
      color: #c53030;
    }

    .error-content p {
      margin: 0 0 16px 0;
      color: #742a2a;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .progress-steps {
        flex-wrap: wrap;
        gap: 16px;
      }

      .step-divider {
        display: none;
      }

      .content {
        padding: 20px;
      }

      .options-actions,
      .complete-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class EpubToPdfComponent implements OnDestroy {
  currentStep: WorkflowStep = 'upload';
  error: string | null = null;

  // Upload data
  uploadedFile: File | null = null;
  uploadedFilename: string = '';
  fileId: string | null = null;

  // EPUB data
  epubData: ParsedEpubData | null = null;

  // PDF options
  presets: ConversionPreset[] = [];
  selectedPreset: ConversionPreset | null = null;
  pdfOptions: PdfConversionOptions | null = null;

  // Conversion job
  jobId: string | null = null;
  jobStatus: JobStatusResponse | null = null;

  // HTML Editor
  enableHtmlEditor = false;
  htmlContent = '';

  private destroy$ = new Subject<void>();

  constructor(private epubPdfApi: EpubPdfApiService) {
    this.loadPresets();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPresets(): void {
    this.epubPdfApi.getPresets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.presets = response.presets;
          this.selectedPreset = this.presets.find(p => p.id === 'print') || this.presets[0];
          if (this.selectedPreset) {
            this.pdfOptions = { ...this.selectedPreset.options };
          }
        },
        error: (err) => {
          console.error('Failed to load presets:', err);
        }
      });
  }

  onFileUploaded(event: { fileId: string; filename: string; file: File }): void {
    this.fileId = event.fileId;
    this.uploadedFilename = event.filename;
    this.uploadedFile = event.file;

    // Parse EPUB
    this.epubPdfApi.parseEpub(event.fileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.epubData = {
            metadata: response.metadata,
            structure: response.structure,
            tableOfContents: response.tableOfContents,
            spine: response.spine,
            resources: response.resources
          };
          this.currentStep = 'preview';
        },
        error: (err) => {
          this.onError(`Failed to parse EPUB: ${err.error?.error || err.message}`);
        }
      });
  }

  onPresetSelected(preset: ConversionPreset): void {
    this.selectedPreset = preset;
    this.pdfOptions = { ...preset.options };
  }

  onOptionsChange(options: PdfConversionOptions): void {
    this.pdfOptions = options;
  }

  onHtmlEditorToggle(enabled: boolean): void {
    this.enableHtmlEditor = enabled;
  }

  proceedFromOptions(): void {
    if (this.enableHtmlEditor) {
      // Generate HTML preview
      this.previewHtml();
    } else {
      // Go straight to PDF conversion
      this.startConversion();
    }
  }

  previewHtml(): void {
    if (!this.fileId || !this.pdfOptions) return;

    this.epubPdfApi.previewHtml(this.fileId, this.pdfOptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.htmlContent = response.html;
          this.currentStep = 'html-editor';
        },
        error: (err) => {
          this.onError(`Failed to generate HTML preview: ${err.error?.error || err.message}`);
        }
      });
  }

  generatePdfFromHtml(editedHtml: string): void {
    if (!this.fileId || !this.pdfOptions) return;

    this.currentStep = 'converting';

    this.epubPdfApi.convertHtmlToPdf(editedHtml, this.fileId, this.pdfOptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.jobId = response.jobId;
          this.pollJobStatus();
        },
        error: (err) => {
          this.onError(`Failed to convert HTML to PDF: ${err.error?.error || err.message}`);
        }
      });
  }

  startConversion(): void {
    if (!this.fileId || !this.pdfOptions) return;

    this.currentStep = 'converting';

    this.epubPdfApi.convertToPdf(this.fileId, this.pdfOptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.jobId = response.jobId;
          this.pollJobStatus();
        },
        error: (err) => {
          this.onError(`Failed to start conversion: ${err.error?.error || err.message}`);
        }
      });
  }

  pollJobStatus(): void {
    if (!this.jobId) return;

    this.epubPdfApi.pollJobStatus(this.jobId, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          this.jobStatus = status;

          if (status.status === 'completed') {
            this.currentStep = 'complete';
          } else if (status.status === 'failed') {
            this.onError(`Conversion failed: ${status.error || 'Unknown error'}`);
          }
        },
        error: (err) => {
          this.onError(`Failed to get job status: ${err.error?.error || err.message}`);
        }
      });
  }

  downloadPdf(): void {
    if (!this.jobId) return;

    const filename = this.uploadedFilename.replace('.epub', '.pdf');

    this.epubPdfApi.downloadAndSavePdf(this.jobId, filename)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err) => {
          this.onError(`Failed to download PDF: ${err.error?.error || err.message}`);
        }
      });
  }

  goToUpload(): void {
    this.currentStep = 'upload';
  }

  goToPreview(): void {
    this.currentStep = 'preview';
  }

  goToOptions(): void {
    this.currentStep = 'options';
  }

  startOver(): void {
    this.currentStep = 'upload';
    this.error = null;
    this.uploadedFile = null;
    this.uploadedFilename = '';
    this.fileId = null;
    this.epubData = null;
    this.jobId = null;
    this.jobStatus = null;
  }

  isStepCompleted(step: WorkflowStep): boolean {
    const steps: WorkflowStep[] = ['upload', 'preview', 'options', 'converting', 'complete'];
    const currentIndex = steps.indexOf(this.currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  }

  onError(error: string): void {
    this.error = error;
    console.error(error);
  }

  clearError(): void {
    this.error = null;
  }
}
