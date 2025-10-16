import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { MarkdownService, ExportService, ThemeService, FileService, StateManagerService, EpubExportService, EpubOptions } from '../../core/services';
import { EpubPreparationService, PrepareOptions, EpubAnalysis, TransformedMarkdown } from '../../core/services/epub-preparation.service';
import { StatefulComponent } from '../../core/base';

// Models
import { EditorAction, ExportFormat } from '../../core/models';

// Components
import {
  MarkdownToolbarComponent,
  MarkdownEditorComponent,
  MarkdownPreviewComponent,
  ThemeSelectorComponent,
  ExportButtonComponent,
  DisplayOptionsComponent,
  DisplayOptions,
  EditorContentChange,
  ImageDropEvent,
  MarkdownFileDropEvent
} from '../markdown-converter/components';
import { EpubPublishButtonComponent } from '../markdown-converter/components/epub-publish-button.component';
import { EpubPrepareModalComponent } from '../markdown-converter/components/epub-prepare-modal.component';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';

// State interface
interface MdConverterState {
  markdownContent: string;
  currentTheme: string;
  viewMode: 'write' | 'preview';
  centerContent: boolean;
  stylePlaintextCode: boolean;
  hideMarkdownCode: boolean;
  hideImages: boolean;
}

@Component({
  selector: 'app-markdown-to-html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownToolbarComponent,
    MarkdownEditorComponent,
    MarkdownPreviewComponent,
    ThemeSelectorComponent,
    ExportButtonComponent,
    EpubPublishButtonComponent,
    EpubPrepareModalComponent,
    DisplayOptionsComponent,
    ResetButtonComponent
  ],
  templateUrl: './markdown-to-html.component.html',
  styleUrl: './markdown-to-html.component.scss',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
    }
  `]
})
export class MarkdownToHtmlComponent extends StatefulComponent<MdConverterState> {
  protected readonly TOOL_ID = 'markdown-to-html';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MarkdownEditorComponent) editorComponent!: MarkdownEditorComponent;
  @ViewChild(EpubPrepareModalComponent) epubPrepareModal!: EpubPrepareModalComponent;

  // State
  markdownContent: string = '';
  htmlContent: string = '';
  currentTheme: string = 'claude';
  isDragging: boolean = false;
  isFullViewport: boolean = false;
  viewMode: 'write' | 'preview' = 'preview';
  showCopyToast: boolean = false;
  copyToastMessage: string = 'Markdown copied to clipboard!';
  centerContent: boolean = true;
  stylePlaintextCode: boolean = false;
  hideMarkdownCode: boolean = false;
  hideImages: boolean = false;

  // Display options for multi-select dropdown
  displayOptions: DisplayOptions = {
    centerContent: true,
    hidePlaintext: false,
    hideMarkdown: false,
    hideImages: false
  };

  // EPUB Prepare Modal State
  isEpubPrepareModalOpen: boolean = false;
  epubPrepareAnalysis: EpubAnalysis | null = null;

  constructor(
    private markdownService: MarkdownService,
    private exportService: ExportService,
    private epubExportService: EpubExportService,
    private epubPreparationService: EpubPreparationService,
    private themeService: ThemeService,
    private fileService: FileService,
    stateManager: StateManagerService
  ) {
    super(stateManager);
  }

  protected getDefaultState(): MdConverterState {
    return {
      markdownContent: this.markdownService.getSampleMarkdown(),
      currentTheme: 'claude',
      viewMode: 'preview',
      centerContent: true,
      stylePlaintextCode: false,
      hideMarkdownCode: false,
      hideImages: false
    };
  }

  protected applyState(state: MdConverterState): void {
    this.markdownContent = state.markdownContent;
    this.currentTheme = state.currentTheme;
    this.viewMode = state.viewMode;
    this.centerContent = state.centerContent ?? true; // Default to true if not set
    this.stylePlaintextCode = state.stylePlaintextCode ?? false; // Default to false if not set
    this.hideMarkdownCode = state.hideMarkdownCode ?? false; // Default to false if not set
    this.hideImages = state.hideImages ?? false; // Default to false if not set

    // Update display options object
    this.displayOptions = {
      centerContent: this.centerContent,
      hidePlaintext: this.stylePlaintextCode,
      hideMarkdown: this.hideMarkdownCode,
      hideImages: this.hideImages
    };

    this.convertMarkdown();
  }

  protected getCurrentState(): MdConverterState {
    return {
      markdownContent: this.markdownContent,
      currentTheme: this.currentTheme,
      viewMode: this.viewMode,
      centerContent: this.centerContent,
      stylePlaintextCode: this.stylePlaintextCode,
      hideMarkdownCode: this.hideMarkdownCode,
      hideImages: this.hideImages
    };
  }

  /**
   * Override reset to reload sample markdown
   */
  public override onReset(): void {
    super.onReset();
  }

  /**
   * Convert markdown to HTML using MarkdownService
   */
  private convertMarkdown(): void {
    this.htmlContent = this.markdownService.convertToHtml(this.markdownContent);
  }

  // ===== File Upload Handlers =====

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleMarkdownFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.fileService.isMarkdownFile(file)) {
        this.handleMarkdownFile(file);
      } else {
        alert('Please upload a markdown file (.md or .markdown)');
      }
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  private async handleMarkdownFile(file: File): Promise<void> {
    try {
      const result = await this.fileService.readMarkdownFile(file);
      this.markdownContent = result.content;
      this.convertMarkdown();

      // Update editor component
      if (this.editorComponent) {
        this.editorComponent.setContent(result.content);
      }

      // Save state after loading file
      this.saveState();
    } catch (error) {
      console.error('Error loading markdown file:', error);
      alert(`Failed to load file: ${file.name}`);
    }
  }

  // ===== Theme Handlers =====

  onThemeChange(theme: string): void {
    this.currentTheme = theme;
    this.themeService.setTheme(theme);
    this.saveState();
  }

  // ===== Display Options Handlers =====

  onDisplayOptionsChange(options: DisplayOptions): void {
    this.centerContent = options.centerContent;
    this.stylePlaintextCode = options.hidePlaintext;
    this.hideMarkdownCode = options.hideMarkdown;
    this.hideImages = options.hideImages;
    this.displayOptions = options;
    this.saveState();
  }

  // ===== View Mode Handlers =====

  setViewMode(mode: 'write' | 'preview'): void {
    this.viewMode = mode;
    if (mode === 'preview') {
      this.convertMarkdown();
    }
    this.saveState();
  }

  toggleFullViewport(): void {
    this.isFullViewport = !this.isFullViewport;
  }

  // ===== Editor Handlers =====

  onEditorAction(action: EditorAction): void {
    // Handle EPUB prepare action at this component level
    if (action.type === 'epubPrepare') {
      this.openEpubPrepareModal();
      return;
    }

    // Pass all other actions to the editor component
    if (this.editorComponent) {
      this.editorComponent.handleAction(action);
    }
  }

  onEditorContentChange(event: EditorContentChange): void {
    this.markdownContent = event.content;
    this.convertMarkdown();
    this.saveState();
  }

  async onImageDrop(event: ImageDropEvent): Promise<void> {
    try {
      const result = await this.fileService.readImageFile(event.file);
      const imageMarkdown = this.fileService.createImageMarkdown(result.filename, result.content);

      // Format image markdown based on index
      const formattedImage = event.index === 0
        ? `\n${imageMarkdown}\n`
        : `${imageMarkdown}\n`;

      if (this.editorComponent) {
        this.editorComponent.insertImageMarkdown(formattedImage, event.cursorPosition);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`Failed to process image: ${event.file.name}`);
    }
  }

  async onMarkdownFileDrop(event: MarkdownFileDropEvent): Promise<void> {
    await this.handleMarkdownFile(event.file);
  }

  // ===== Export Handlers =====

  async onExport(format: ExportFormat): Promise<void> {
    try {
      await this.exportService.export(
        { format, theme: this.currentTheme, centerContent: this.centerContent, stylePlaintextCode: this.stylePlaintextCode, hideMarkdownCode: this.hideMarkdownCode, hideImages: this.hideImages },
        this.markdownContent,
        this.htmlContent
      );
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      alert(`Failed to export as ${format}. Please try again.`);
    }
  }

  async onPublishEpub(options: EpubOptions): Promise<void> {
    try {
      // Parse markdown into EPUB structure
      const structure = this.epubExportService.parseMarkdownToEpub(this.markdownContent);

      // Generate EPUB with user-selected options
      await this.epubExportService.generateEpub(structure, options);

      // Show success message
      this.showToast('EPUB generated successfully');
    } catch (error) {
      console.error('EPUB export failed:', error);
      alert('Failed to generate EPUB. Please check your markdown structure and try again.');
    }
  }

  // ===== Clipboard Handlers =====

  async copyMarkdownToClipboard(): Promise<void> {
    try {
      if (this.viewMode === 'preview') {
        // Copy complete HTML with styles and theme
        const fullHtml = this.exportService.getFullHtml(this.htmlContent, this.currentTheme, this.centerContent, this.stylePlaintextCode, this.hideMarkdownCode, this.hideImages);
        await navigator.clipboard.writeText(fullHtml);
        this.showToast('HTML');
      } else {
        // Copy raw markdown
        await navigator.clipboard.writeText(this.markdownContent);
        this.showToast('Markdown');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const content = this.viewMode === 'preview'
        ? this.exportService.getFullHtml(this.htmlContent, this.currentTheme, this.centerContent, this.stylePlaintextCode, this.hideMarkdownCode, this.hideImages)
        : this.markdownContent;
      this.fallbackCopyToClipboard(content);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      const contentType = this.viewMode === 'preview' ? 'HTML' : 'Markdown';
      this.showToast(contentType);
    } catch (error) {
      console.error('Fallback copy failed:', error);
      alert('Failed to copy to clipboard');
    }
    document.body.removeChild(textarea);
  }

  private showToast(contentType: string = 'Markdown'): void {
    this.copyToastMessage = `${contentType} copied to clipboard!`;
    this.showCopyToast = true;
    setTimeout(() => {
      this.showCopyToast = false;
    }, 2000);
  }

  // ===== EPUB Prepare Handlers =====

  /**
   * Open EPUB prepare modal and analyze current markdown
   */
  openEpubPrepareModal(): void {
    if (!this.markdownContent || this.markdownContent.trim() === '') {
      alert('No markdown content to prepare');
      return;
    }

    // Analyze the markdown
    this.epubPrepareAnalysis = this.epubPreparationService.analyzeMarkdown(this.markdownContent);

    // Open the modal
    this.isEpubPrepareModalOpen = true;
  }

  /**
   * Handle preview request from modal
   */
  onEpubPreparePreview(options: PrepareOptions): void {
    // Transform the markdown with selected options
    const result = this.epubPreparationService.transformMarkdown(this.markdownContent, options);

    // Pass the result back to the modal
    if (this.epubPrepareModal) {
      this.epubPrepareModal.setTransformed(result);
    }
  }

  /**
   * Apply transformed markdown to editor
   */
  onEpubPrepareApply(transformedContent: string): void {
    // Update the markdown content
    this.markdownContent = transformedContent;

    // Update the editor
    if (this.editorComponent) {
      this.editorComponent.setContent(transformedContent);
    }

    // Convert and save state
    this.convertMarkdown();
    this.saveState();

    // Show success toast
    this.showToast('EPUB preparation complete');
  }

  /**
   * Close EPUB prepare modal
   */
  closeEpubPrepareModal(): void {
    this.isEpubPrepareModalOpen = false;
    this.epubPrepareAnalysis = null;

    // Reset modal state
    if (this.epubPrepareModal) {
      this.epubPrepareModal.reset();
    }
  }
}
