import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { MarkdownService, ExportService, ThemeService, FileService, StateManagerService } from '../core/services';
import { StatefulComponent } from '../core/base';

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
import { ResetButtonComponent } from '../shared/components/reset-button/reset-button.component';

// State interface
interface MdConverterState {
  markdownContent: string;
  currentTheme: string;
  viewMode: 'write' | 'preview';
  centerContent: boolean;
}

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
    ExportButtonComponent,
    ResetButtonComponent
  ],
  templateUrl: './md-converter.component.html',
  styleUrl: './md-converter.component.scss',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
    }
  `]
})
export class MdConverterComponent extends StatefulComponent<MdConverterState> {
  protected readonly TOOL_ID = 'md-converter';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(MarkdownEditorComponent) editorComponent!: MarkdownEditorComponent;

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

  constructor(
    private markdownService: MarkdownService,
    private exportService: ExportService,
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
      centerContent: true
    };
  }

  protected applyState(state: MdConverterState): void {
    this.markdownContent = state.markdownContent;
    this.currentTheme = state.currentTheme;
    this.viewMode = state.viewMode;
    this.centerContent = state.centerContent ?? true; // Default to true if not set
    this.convertMarkdown();
  }

  protected getCurrentState(): MdConverterState {
    return {
      markdownContent: this.markdownContent,
      currentTheme: this.currentTheme,
      viewMode: this.viewMode,
      centerContent: this.centerContent
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

  // ===== Center Content Handlers =====

  toggleCenterContent(): void {
    this.centerContent = !this.centerContent;
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
        { format, theme: this.currentTheme, centerContent: this.centerContent },
        this.markdownContent,
        this.htmlContent
      );
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      alert(`Failed to export as ${format}. Please try again.`);
    }
  }

  // ===== Clipboard Handlers =====

  async copyMarkdownToClipboard(): Promise<void> {
    try {
      if (this.viewMode === 'preview') {
        // Copy complete HTML with styles and theme
        const fullHtml = this.exportService.getFullHtml(this.htmlContent, this.currentTheme, this.centerContent);
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
        ? this.exportService.getFullHtml(this.htmlContent, this.currentTheme, this.centerContent)
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
}
