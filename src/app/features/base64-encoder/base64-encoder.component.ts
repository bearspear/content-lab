import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { StateManagerService, MonacoThemeService } from '../../core/services';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';
import { StatefulComponent } from '../../core/base';

interface Base64State {
  inputText: string;
  outputText: string;
  mode: 'encode' | 'decode';
  variant: 'standard' | 'url-safe' | 'mime';
  inputType: 'text' | 'file' | 'image';
  activeTab: 'converter' | 'data-uri' | 'file-converter' | 'jwt' | 'history';
  mimeType: string;
  encoding: 'utf-8' | 'utf-16' | 'ascii' | 'latin1';
  lineWrap: 'none' | '64' | '76' | 'custom';
  customWrapLength: number;
  removePadding: boolean;
  monacoTheme: 'vs' | 'vs-dark';
}

interface HistoryItem {
  id: string;
  timestamp: number;
  mode: 'encode' | 'decode';
  inputPreview: string;
  outputPreview: string;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  data: string;
  isImage: boolean;
  dimensions?: { width: number; height: number };
}

@Component({
  selector: 'app-base64-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './base64-encoder.component.html',
  styleUrl: './base64-encoder.component.scss'
})
export class Base64EncoderComponent extends StatefulComponent<Base64State> implements AfterViewInit, OnDestroy {
  protected readonly TOOL_ID = 'base64-encoder';

  @ViewChild('inputEditorContainer') inputEditorContainer!: ElementRef;
  @ViewChild('outputEditorContainer') outputEditorContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('imagePreview') imagePreview!: ElementRef<HTMLImageElement>;

  inputEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  outputEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private themeSubscription: any;

  // State properties
  inputText: string = '';
  outputText: string = '';
  mode: 'encode' | 'decode' = 'encode';
  variant: 'standard' | 'url-safe' | 'mime' = 'standard';
  inputType: 'text' | 'file' | 'image' = 'text';
  activeTab: 'converter' | 'data-uri' | 'file-converter' | 'jwt' | 'history' = 'converter';
  mimeType: string = 'text/plain';
  encoding: 'utf-8' | 'utf-16' | 'ascii' | 'latin1' = 'utf-8';
  lineWrap: 'none' | '64' | '76' | 'custom' = 'none';
  customWrapLength: number = 76;
  removePadding: boolean = false;
  monacoTheme: 'vs' | 'vs-dark' = 'vs';

  // Statistics
  inputLength: number = 0;
  outputLength: number = 0;
  inputBytes: number = 0;
  outputBytes: number = 0;
  sizeChange: number = 0;

  // File handling
  currentFile: FileInfo | null = null;
  isDragOver: boolean = false;

  // History
  history: HistoryItem[] = [];
  maxHistoryItems: number = 20;

  // Validation
  isValid: boolean = true;
  validationMessage: string = '';

  // Common MIME types
  commonMimeTypes = [
    { value: 'text/plain', label: 'Text' },
    { value: 'image/png', label: 'PNG Image' },
    { value: 'image/jpeg', label: 'JPEG Image' },
    { value: 'image/gif', label: 'GIF Image' },
    { value: 'image/svg+xml', label: 'SVG Image' },
    { value: 'image/webp', label: 'WebP Image' },
    { value: 'application/json', label: 'JSON' },
    { value: 'application/pdf', label: 'PDF' },
    { value: 'application/xml', label: 'XML' },
    { value: 'text/html', label: 'HTML' },
    { value: 'text/css', label: 'CSS' },
    { value: 'application/javascript', label: 'JavaScript' }
  ];

  constructor(
    stateManager: StateManagerService,
    private monacoThemeService: MonacoThemeService
  ) {
    super(stateManager);
  }

  override ngOnInit(): void {
    // Subscribe to global theme changes
    this.themeSubscription = this.monacoThemeService.theme$.subscribe(theme => {
      this.monacoTheme = theme;
      if (this.inputEditor && this.outputEditor) {
        monaco.editor.setTheme(theme);
        this.updateThemeClass();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeEditors();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.inputEditor) {
      this.inputEditor.dispose();
    }
    if (this.outputEditor) {
      this.outputEditor.dispose();
    }
  }

  protected getDefaultState(): Base64State {
    return {
      inputText: '',
      outputText: '',
      mode: 'encode',
      variant: 'standard',
      inputType: 'text',
      activeTab: 'converter',
      mimeType: 'text/plain',
      encoding: 'utf-8',
      lineWrap: 'none',
      customWrapLength: 76,
      removePadding: false,
      monacoTheme: 'vs'
    };
  }

  protected applyState(state: Base64State): void {
    this.mode = state.mode;
    this.variant = state.variant;
    this.inputType = state.inputType;
    this.activeTab = state.activeTab;
    this.mimeType = state.mimeType;
    this.encoding = state.encoding;
    this.lineWrap = state.lineWrap;
    this.customWrapLength = state.customWrapLength;
    this.removePadding = state.removePadding;

    // Theme is managed globally via subscription
    this.monacoTheme = this.monacoThemeService.currentTheme;

    if (this.inputEditor) {
      this.inputEditor.setValue(state.inputText);
      this.updateThemeClass();
    }
    if (this.outputEditor) {
      this.outputEditor.setValue(state.outputText);
    }

    this.updateStatistics();
  }

  protected getCurrentState(): Base64State {
    return {
      inputText: this.inputEditor?.getValue() || '',
      outputText: this.outputEditor?.getValue() || '',
      mode: this.mode,
      variant: this.variant,
      inputType: this.inputType,
      activeTab: this.activeTab,
      mimeType: this.mimeType,
      encoding: this.encoding,
      lineWrap: this.lineWrap,
      customWrapLength: this.customWrapLength,
      removePadding: this.removePadding,
      monacoTheme: this.monacoTheme
    };
  }

  public override onReset(): void {
    super.onReset();
    this.currentFile = null;
  }

  private initializeEditors(): void {
    if (!this.inputEditorContainer || !this.outputEditorContainer) {
      return;
    }

    // Input editor
    this.inputEditor = monaco.editor.create(this.inputEditorContainer.nativeElement, {
      value: '',
      language: 'plaintext',
      theme: this.monacoTheme,
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      padding: { top: 12, bottom: 12 },
      readOnly: false
    });

    // Output editor
    this.outputEditor = monaco.editor.create(this.outputEditorContainer.nativeElement, {
      value: '',
      language: 'plaintext',
      theme: this.monacoTheme,
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      padding: { top: 12, bottom: 12 },
      readOnly: true
    });

    // Update on content change
    this.inputEditor.onDidChangeModelContent(() => {
      this.updateStatistics();
      this.processConversion();
      this.saveState();
    });

    this.updateStatistics();
    this.loadState();

    // Note: Don't apply theme here to avoid global Monaco theme interference
  }

  // Main conversion logic
  processConversion(): void {
    if (!this.inputEditor || !this.outputEditor) return;

    const input = this.inputEditor.getValue();
    if (!input.trim()) {
      this.outputEditor.setValue('');
      this.isValid = true;
      this.validationMessage = '';
      return;
    }

    try {
      let result: string;

      if (this.mode === 'encode') {
        result = this.encodeBase64(input);
      } else {
        result = this.decodeBase64(input);
      }

      this.outputEditor.setValue(result);
      this.isValid = true;
      this.validationMessage = '';

      // Add to history
      this.addToHistory(input, result);
    } catch (error: any) {
      this.isValid = false;
      this.validationMessage = error.message || 'Invalid input';
      this.outputEditor.setValue(`Error: ${this.validationMessage}`);
    }

    this.updateStatistics();
  }

  private encodeBase64(input: string): string {
    let encoded: string;

    // Encode based on encoding type
    if (this.encoding === 'utf-8') {
      encoded = btoa(unescape(encodeURIComponent(input)));
    } else {
      encoded = btoa(input);
    }

    // Apply variant modifications
    if (this.variant === 'url-safe') {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_');
      if (this.removePadding) {
        encoded = encoded.replace(/=/g, '');
      }
    } else if (this.variant === 'mime') {
      // MIME Base64 with line wrapping at 76 characters
      encoded = this.wrapLines(encoded, 76);
    }

    // Apply line wrapping if specified
    if (this.lineWrap !== 'none' && this.variant !== 'mime') {
      const wrapLength = this.lineWrap === 'custom' ? this.customWrapLength : parseInt(this.lineWrap);
      encoded = this.wrapLines(encoded, wrapLength);
    }

    // Remove padding if specified (for standard variant)
    if (this.removePadding && this.variant === 'standard') {
      encoded = encoded.replace(/=/g, '');
    }

    return encoded;
  }

  private decodeBase64(input: string): string {
    // Clean input
    let cleaned = input.trim().replace(/\s+/g, '');

    // Handle URL-safe variant
    if (this.variant === 'url-safe') {
      cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
    }

    // Add padding if missing
    while (cleaned.length % 4 !== 0) {
      cleaned += '=';
    }

    // Validate Base64 characters
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
      throw new Error('Invalid Base64 characters detected');
    }

    // Decode
    let decoded: string;
    try {
      if (this.encoding === 'utf-8') {
        decoded = decodeURIComponent(escape(atob(cleaned)));
      } else {
        decoded = atob(cleaned);
      }
    } catch (error) {
      throw new Error('Failed to decode: Invalid Base64 string');
    }

    return decoded;
  }

  private wrapLines(text: string, length: number): string {
    const lines: string[] = [];
    for (let i = 0; i < text.length; i += length) {
      lines.push(text.substring(i, i + length));
    }
    return lines.join('\n');
  }

  // File handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

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

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  processFile(file: File): void {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1] || result;

      this.currentFile = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: base64,
        isImage: isImage
      };

      if (this.inputEditor) {
        if (this.mode === 'encode') {
          this.inputEditor.setValue(base64);
        } else {
          this.inputEditor.setValue(base64);
        }
      }

      // Get image dimensions if it's an image
      if (isImage && this.imagePreview) {
        const img = new Image();
        img.onload = () => {
          if (this.currentFile) {
            this.currentFile.dimensions = {
              width: img.width,
              height: img.height
            };
          }
        };
        img.src = result;
      }

      this.processConversion();
    };

    reader.readAsDataURL(file);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  clearFile(): void {
    this.currentFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Actions
  switchMode(): void {
    this.mode = this.mode === 'encode' ? 'decode' : 'encode';

    // Swap input and output
    if (this.inputEditor && this.outputEditor) {
      const temp = this.inputEditor.getValue();
      this.inputEditor.setValue(this.outputEditor.getValue());
      this.outputEditor.setValue(temp);
    }

    this.processConversion();
    this.saveState();
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard!');
    }).catch(() => {
      this.showNotification('Failed to copy');
    });
  }

  copyOutput(): void {
    if (this.outputEditor) {
      this.copyToClipboard(this.outputEditor.getValue());
    }
  }

  downloadOutput(): void {
    if (!this.outputEditor) return;

    const content = this.outputEditor.getValue();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = this.mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateDataURI(): string {
    if (!this.outputEditor) return '';
    const base64 = this.outputEditor.getValue();
    return `data:${this.mimeType};base64,${base64}`;
  }

  copyDataURI(): void {
    const dataURI = this.generateDataURI();
    this.copyToClipboard(dataURI);
  }

  // Statistics
  private updateStatistics(): void {
    if (!this.inputEditor || !this.outputEditor) return;

    const input = this.inputEditor.getValue();
    const output = this.outputEditor.getValue();

    this.inputLength = input.length;
    this.outputLength = output.length;

    // Calculate bytes (rough estimate)
    this.inputBytes = new Blob([input]).size;
    this.outputBytes = new Blob([output]).size;

    // Calculate size change percentage
    if (this.inputBytes > 0) {
      this.sizeChange = Math.round(((this.outputBytes - this.inputBytes) / this.inputBytes) * 100);
    } else {
      this.sizeChange = 0;
    }
  }

  // History
  private addToHistory(input: string, output: string): void {
    const item: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mode: this.mode,
      inputPreview: this.truncateText(input, 100),
      outputPreview: this.truncateText(output, 100)
    };

    this.history.unshift(item);
    if (this.history.length > this.maxHistoryItems) {
      this.history.pop();
    }
  }

  loadFromHistory(item: HistoryItem): void {
    // This would need full storage implementation
    this.showNotification('Loading from history...');
  }

  clearHistory(): void {
    if (confirm('Clear all history?')) {
      this.history = [];
      this.showNotification('History cleared');
    }
  }

  // Theme toggle removed - now controlled globally via sidebar

  private updateThemeClass(): void {
    if (this.monacoTheme === 'vs-dark') {
      document.body.classList.add('editor-dark-theme');
    } else {
      document.body.classList.remove('editor-dark-theme');
    }
  }

  // Utility
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private showNotification(message: string): void {
    // Simple notification - could be replaced with a toast component
    alert(message);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
    this.saveState();
  }

  setVariant(variant: typeof this.variant): void {
    this.variant = variant;
    this.processConversion();
    this.saveState();
  }

  setEncoding(encoding: typeof this.encoding): void {
    this.encoding = encoding;
    this.processConversion();
    this.saveState();
  }

  setLineWrap(wrap: typeof this.lineWrap): void {
    this.lineWrap = wrap;
    this.processConversion();
    this.saveState();
  }
}
