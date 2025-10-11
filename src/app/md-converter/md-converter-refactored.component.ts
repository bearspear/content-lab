import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { MarkdownService, ExportService, ThemeService, FileService } from '../core/services';

// Models
import { EditorAction, ExportFormat } from '../core/models';

// Components
import {
  MarkdownToolbarComponent,
  MarkdownEditorComponent,
  MarkdownPreviewComponent,
  ThemeSelectorComponent,
  ExportButtonComponent,
  EditorContentChange,
  ImageDropEvent,
  MarkdownFileDropEvent
} from '../features/markdown-converter/components';

@Component({
  selector: 'app-md-converter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MarkdownToolbarComponent,
    MarkdownEditorComponent,
    MarkdownPreviewComponent,
    ThemeSelectorComponent,
    ExportButtonComponent
  ],
  templateUrl: './md-converter.component.html',
  styleUrl: './md-converter.component.scss'
})
export class MdConverterComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MarkdownEditorComponent) editorComponent!: MarkdownEditorComponent;

  // State
  markdownContent: string = '';
  htmlContent: string = '';
  currentTheme: string = 'claude';
  isDragging: boolean = false;
  isFullViewport: boolean = false;
  viewMode: 'write' | 'preview' = 'preview';

  constructor(
    private markdownService: MarkdownService,
    private exportService: ExportService,
    private themeService: ThemeService,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.loadSampleMarkdown();
  }

  /**
   * Load sample markdown content on init
   */
  private loadSampleMarkdown(): void {
    this.markdownContent = this.markdownService.getSampleMarkdown();
    this.convertMarkdown();
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
    } catch (error) {
      console.error('Error loading markdown file:', error);
      alert(`Failed to load file: ${file.name}`);
    }
  }

  // ===== Theme Handlers =====

  onThemeChange(theme: string): void {
    this.currentTheme = theme;
    this.themeService.setTheme(theme);
  }

  // ===== View Mode Handlers =====

  setViewMode(mode: 'write' | 'preview'): void {
    this.viewMode = mode;
    if (mode === 'preview') {
      this.convertMarkdown();
    }
  }

  toggleFullViewport(): void {
    this.isFullViewport = !this.isFullViewport;
  }

  // ===== Editor Handlers =====

  onEditorAction(action: EditorAction): void {
    if (this.editorComponent) {
      this.editorComponent.handleAction(action);
    }
  }

  onEditorContentChange(event: EditorContentChange): void {
    this.markdownContent = event.content;
    this.convertMarkdown();
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
        { format, theme: this.currentTheme },
        this.markdownContent,
        this.htmlContent
      );
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      alert(`Failed to export as ${format}. Please try again.`);
    }
  }
}
