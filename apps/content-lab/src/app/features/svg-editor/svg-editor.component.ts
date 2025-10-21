import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadMonaco, getMonaco, Monaco } from '../js-playground/components/monaco-loader';
import { StateManagerService, MonacoThemeService } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components'  // NOTE: update to specific componentreset-button/reset-button.component';
import { StatefulComponent } from '@content-lab/core';
import { SvgEditorService, SvgInfo, OptimizationResult } from './svg-editor.service';

interface SvgEditorState {
  svgCode: string;
  viewMode: 'visual' | 'code' | 'split';
  width: number;
  height: number;
  viewBox: string;
  monacoTheme: 'vs' | 'vs-dark';
}

@Component({
  selector: 'app-svg-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './svg-editor.component.html',
  styleUrl: './svg-editor.component.scss'
})
export class SvgEditorComponent extends StatefulComponent<SvgEditorState> implements AfterViewInit, OnDestroy {
  protected readonly TOOL_ID = 'svg-editor';

  @ViewChild('codeEditorContainer') codeEditorContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('svgPreview') svgPreview!: ElementRef<HTMLDivElement>;

  codeEditor: any | null = null; // Monaco.editor.IStandaloneCodeEditor loaded via AMD
  private themeSubscription: any;

  // State properties
  svgCode: string = this.getDefaultSvg();
  viewMode: 'visual' | 'code' | 'split' = 'split';
  width: number = 400;
  height: number = 400;
  viewBox: string = '0 0 400 400';
  monacoTheme: 'vs' | 'vs-dark' = 'vs';

  // SVG info
  svgInfo: SvgInfo = {
    width: null,
    height: null,
    viewBox: null,
    hasViewBox: false,
    elementCount: 0,
    fileSize: 0
  };

  // Optimization
  showOptimization: boolean = false;
  optimizationResult: OptimizationResult | null = null;
  removeComments: boolean = true;
  removeMetadata: boolean = true;
  removeHidden: boolean = true;
  minifyColors: boolean = true;
  roundNumbers: number = 2;

  // Export
  showExport: boolean = false;
  exportFormat: 'svg' | 'png' | 'datauri' | 'react' | 'vue' = 'svg';
  exportWidth: number = 512;
  exportHeight: number = 512;
  lockAspect: boolean = true;

  // UI state
  isDragOver: boolean = false;
  isValid: boolean = true;
  validationError: string = '';
  showProperties: boolean = true;
  extractedColors: string[] = [];

  constructor(
    stateManager: StateManagerService,
    private monacoThemeService: MonacoThemeService,
    private svgService: SvgEditorService
  ) {
    super(stateManager);
  }

  override ngOnInit(): void {
    // Subscribe to global theme changes
    this.themeSubscription = this.monacoThemeService.theme$.subscribe(theme => {
      this.monacoTheme = theme;
      if (this.codeEditor && getMonaco()) {
        getMonaco()!.editor.setTheme(theme);
        this.updateThemeClass();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
    // Defer to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.updateSvgInfo(), 0);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.codeEditor) {
      this.codeEditor.dispose();
    }
  }

  protected getDefaultState(): SvgEditorState {
    return {
      svgCode: this.getDefaultSvg(),
      viewMode: 'split',
      width: 400,
      height: 400,
      viewBox: '0 0 400 400',
      monacoTheme: 'vs'
    };
  }

  protected applyState(state: SvgEditorState): void {
    this.svgCode = state.svgCode;
    this.viewMode = state.viewMode;
    this.width = state.width;
    this.height = state.height;
    this.viewBox = state.viewBox;

    // Theme is managed globally via subscription
    this.monacoTheme = this.monacoThemeService.currentTheme;

    if (this.codeEditor) {
      this.codeEditor.setValue(state.svgCode);
      this.updateThemeClass();
      this.updatePreview();
    }

    // Defer to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.updateSvgInfo(), 0);
  }

  protected getCurrentState(): SvgEditorState {
    return {
      svgCode: this.codeEditor?.getValue() || this.svgCode,
      viewMode: this.viewMode,
      width: this.width,
      height: this.height,
      viewBox: this.viewBox,
      monacoTheme: this.monacoTheme
    };
  }

  public override onReset(): void {
    super.onReset();
    this.optimizationResult = null;
    this.showOptimization = false;
    this.showExport = false;
  }

  private getDefaultSvg(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="200" cy="200" r="180" fill="url(#grad1)" opacity="0.2"/>

  <!-- Main shape -->
  <path d="M 200 80 L 280 160 L 280 240 L 200 320 L 120 240 L 120 160 Z"
        fill="url(#grad1)"
        stroke="#fff"
        stroke-width="3"/>

  <!-- Inner circle -->
  <circle cx="200" cy="200" r="60" fill="#ffffff" opacity="0.9"/>

  <!-- Text -->
  <text x="200" y="210"
        font-family="Arial, sans-serif"
        font-size="24"
        font-weight="bold"
        fill="#667eea"
        text-anchor="middle">
    SVG
  </text>
</svg>`;
  }

  private initializeEditor(): void {
    if (!this.codeEditorContainer) {
      return;
    }

    // Load state first to get the correct initial value
    this.loadState();

    // Delay editor creation to ensure DOM is ready
    setTimeout(() => {
      if (!this.codeEditorContainer) {
        return;
      }

      this.createEditor();

      // Update preview with loaded content
      this.updatePreview();

      // Note: Don't apply theme here to avoid global Monaco theme interference
    }, 0);
  }

  private async createEditor(): Promise<void> {
    if (!this.codeEditorContainer) {
      return;
    }

    // Load Monaco via AMD
    await loadMonaco();
    const monaco = getMonaco()!;

    this.codeEditor = monaco.editor.create(this.codeEditorContainer.nativeElement, {
      value: this.svgCode,
      language: 'xml',
      theme: this.monacoTheme,
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      padding: { top: 12, bottom: 12 },
      readOnly: false,
      formatOnPaste: true,
      formatOnType: true
    });

    this.codeEditor.onDidChangeModelContent(() => {
      const code = this.codeEditor!.getValue();
      this.svgCode = code;
      this.validateAndUpdate();
      this.saveState();
    });
  }

  private validateAndUpdate(): void {
    const validation = this.svgService.validateSvg(this.svgCode);
    this.isValid = validation.valid;
    this.validationError = validation.error || '';

    if (validation.valid) {
      this.updateSvgInfo();
      this.updatePreview();
    }
  }

  private updateSvgInfo(): void {
    this.svgInfo = this.svgService.parseSvgInfo(this.svgCode);
    this.extractedColors = this.svgService.extractColors(this.svgCode);

    if (this.svgInfo.width) this.width = this.svgInfo.width;
    if (this.svgInfo.height) this.height = this.svgInfo.height;
    if (this.svgInfo.viewBox) this.viewBox = this.svgInfo.viewBox;
  }

  private updatePreview(): void {
    if (this.svgPreview && this.isValid) {
      this.svgPreview.nativeElement.innerHTML = this.svgCode;
    }
  }

  // View mode toggles
  setViewMode(mode: 'visual' | 'code' | 'split'): void {
    const previousMode = this.viewMode;

    // Save current code from editor before view mode changes
    if (this.codeEditor) {
      this.svgCode = this.codeEditor.getValue();
    }

    // If switching away from modes that show the editor, dispose it
    const wasShowingEditor = previousMode === 'code' || previousMode === 'split';
    const willShowEditor = mode === 'code' || mode === 'split';

    if (wasShowingEditor && !willShowEditor && this.codeEditor) {
      this.codeEditor.dispose();
      this.codeEditor = null;
    }

    this.viewMode = mode;
    this.saveState();

    // If switching to a mode that shows the editor, recreate it
    if (!wasShowingEditor && willShowEditor) {
      setTimeout(async () => {
        if (this.codeEditorContainer && !this.codeEditor) {
          await this.createEditor();
        }
      }, 50);
    }

    // Update preview for visual mode
    if (mode === 'visual' || mode === 'split') {
      setTimeout(() => {
        this.updatePreview();
      }, 0);
    }

    // Force editor to resize after view change
    if (willShowEditor) {
      setTimeout(() => {
        if (this.codeEditor) {
          this.codeEditor.layout();
        }
      }, 100);
    }
  }

  // File handling
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.loadFile(input.files[0]);
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
      this.loadFile(event.dataTransfer.files[0]);
    }
  }

  loadFile(file: File): void {
    if (!file.name.toLowerCase().endsWith('.svg')) {
      alert('Please select an SVG file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.svgCode = content;

      if (this.codeEditor) {
        this.codeEditor.setValue(content);
      }

      this.validateAndUpdate();
      this.saveState();
    };
    reader.readAsText(file);
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  // Optimization
  toggleOptimization(): void {
    this.showOptimization = !this.showOptimization;
    if (this.showExport) this.showExport = false;
  }

  optimizeSvg(): void {
    this.optimizationResult = this.svgService.optimizeSvg(this.svgCode, {
      removeComments: this.removeComments,
      removeMetadata: this.removeMetadata,
      removeHidden: this.removeHidden,
      minifyColors: this.minifyColors,
      roundNumbers: this.roundNumbers
    });
  }

  applyOptimization(): void {
    if (this.optimizationResult) {
      const savingsPercent = this.optimizationResult.savingsPercent;
      this.svgCode = this.optimizationResult.optimized;

      if (this.codeEditor) {
        this.codeEditor.setValue(this.optimizationResult.optimized);
      }

      this.validateAndUpdate();
      this.showOptimization = false;
      this.optimizationResult = null;
      this.showNotification(`Optimized! Saved ${savingsPercent}%`);
    }
  }

  // Properties
  updateDimensions(): void {
    const updated = this.svgService.updateDimensions(this.svgCode, this.width, this.height);
    this.svgCode = updated;

    if (this.codeEditor) {
      this.codeEditor.setValue(updated);
    }

    this.validateAndUpdate();
    this.saveState();
  }

  updateViewBox(): void {
    const updated = this.svgService.updateViewBox(this.svgCode, this.viewBox);
    this.svgCode = updated;

    if (this.codeEditor) {
      this.codeEditor.setValue(updated);
    }

    this.validateAndUpdate();
    this.saveState();
  }

  // Formatting
  formatCode(): void {
    const formatted = this.svgService.formatSvg(this.svgCode);
    this.svgCode = formatted;

    if (this.codeEditor) {
      this.codeEditor.setValue(formatted);
    }

    this.saveState();
  }

  minifyCode(): void {
    const result = this.svgService.optimizeSvg(this.svgCode, {
      removeComments: true,
      removeMetadata: true
    });

    this.svgCode = result.optimized;

    if (this.codeEditor) {
      this.codeEditor.setValue(result.optimized);
    }

    this.saveState();
  }

  // Export
  toggleExport(): void {
    this.showExport = !this.showExport;
    if (this.showOptimization) this.showOptimization = false;
  }

  exportSvg(): void {
    switch (this.exportFormat) {
      case 'svg':
        this.downloadSvg();
        break;
      case 'png':
        this.exportAsPng();
        break;
      case 'datauri':
        this.copyDataUri();
        break;
      case 'react':
        this.copyReactComponent();
        break;
      case 'vue':
        this.copyVueComponent();
        break;
    }
  }

  private downloadSvg(): void {
    const blob = new Blob([this.svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private exportAsPng(): void {
    const canvas = document.createElement('canvas');
    canvas.width = this.exportWidth;
    canvas.height = this.exportHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const img = new Image();
    const dataUri = this.svgService.svgToDataUri(this.svgCode);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, this.exportWidth, this.exportHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'exported.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = dataUri;
  }

  private copyDataUri(): void {
    const dataUri = this.svgService.svgToBase64(this.svgCode);
    this.copyToClipboard(dataUri);
    this.showNotification('Data URI copied to clipboard!');
  }

  private copyReactComponent(): void {
    const component = this.svgService.generateReactComponent(this.svgCode, 'SvgIcon');
    this.copyToClipboard(component);
    this.showNotification('React component copied to clipboard!');
  }

  private copyVueComponent(): void {
    // Simplified Vue component generation
    const vueComponent = `<template>
  ${this.svgCode}
</template>

<script>
export default {
  name: 'SvgIcon',
  props: {
    size: { type: Number, default: 24 },
    color: { type: String, default: 'currentColor' }
  }
};
</script>`;

    this.copyToClipboard(vueComponent);
    this.showNotification('Vue component copied to clipboard!');
  }

  // Copy actions
  copySvgCode(): void {
    this.copyToClipboard(this.svgCode);
    this.showNotification('SVG code copied to clipboard!');
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).catch(() => {
      this.showNotification('Failed to copy');
    });
  }

  // Theme toggle removed - now controlled globally via sidebar

  private updateThemeClass(): void {
    // Defer DOM update to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.monacoTheme === 'vs-dark') {
        document.body.classList.add('editor-dark-theme');
      } else {
        document.body.classList.remove('editor-dark-theme');
      }
    }, 0);
  }

  // UI toggles
  toggleProperties(): void {
    this.showProperties = !this.showProperties;
  }

  // Utility
  private showNotification(message: string): void {
    console.log(message);
    alert(message);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
