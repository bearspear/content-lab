import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { StateManagerService, MonacoThemeService } from '../../core/services';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';
import { StatefulComponent } from '../../core/base';
import { DiffCheckerService, DiffStatistics, DiffAlgorithm } from './diff-checker.service';

interface DiffCheckerState {
  originalText: string;
  modifiedText: string;
  viewMode: 'side-by-side' | 'inline';
  algorithm: DiffAlgorithm;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  ignoreComments: boolean;
  language: string;
  monacoTheme: 'vs' | 'vs-dark';
}

@Component({
  selector: 'app-diff-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './diff-checker.component.html',
  styleUrl: './diff-checker.component.scss'
})
export class DiffCheckerComponent extends StatefulComponent<DiffCheckerState> implements AfterViewInit, OnDestroy {
  protected readonly TOOL_ID = 'diff-checker';

  @ViewChild('diffEditorContainer') diffEditorContainer!: ElementRef;
  @ViewChild('originalFileInput') originalFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modifiedFileInput') modifiedFileInput!: ElementRef<HTMLInputElement>;

  diffEditor: monaco.editor.IStandaloneDiffEditor | null = null;
  private themeSubscription: any;

  // State properties
  originalText: string = '';
  modifiedText: string = '';
  viewMode: 'side-by-side' | 'inline' = 'side-by-side';
  algorithm: DiffAlgorithm = 'myers';
  ignoreWhitespace: boolean = false;
  ignoreCase: boolean = false;
  ignoreComments: boolean = false;
  language: string = 'plaintext';
  monacoTheme: 'vs' | 'vs-dark' = 'vs';

  // Statistics
  statistics: DiffStatistics = {
    addedLines: 0,
    deletedLines: 0,
    modifiedLines: 0,
    totalChanges: 0,
    similarity: 100
  };

  // UI state
  showStatistics: boolean = true;
  showOptions: boolean = true;
  isDragOverOriginal: boolean = false;
  isDragOverModified: boolean = false;

  // Available languages for syntax highlighting
  availableLanguages = [
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'shell', label: 'Shell' }
  ];

  // Algorithm options
  algorithmOptions: { value: DiffAlgorithm; label: string }[] = [
    { value: 'myers', label: 'Myers (Balanced)' },
    { value: 'patience', label: 'Patience (Better for code)' },
    { value: 'histogram', label: 'Histogram (Fastest)' },
    { value: 'minimal', label: 'Minimal (Smallest change set)' }
  ];

  constructor(
    stateManager: StateManagerService,
    private monacoThemeService: MonacoThemeService,
    private diffService: DiffCheckerService
  ) {
    super(stateManager);
  }

  override ngOnInit(): void {
    // Subscribe to global theme changes
    this.themeSubscription = this.monacoThemeService.theme$.subscribe(theme => {
      this.monacoTheme = theme;
      if (this.diffEditor) {
        monaco.editor.setTheme(theme);
        this.updateThemeClass();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeDiffEditor();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.diffEditor) {
      this.diffEditor.dispose();
    }
  }

  protected getDefaultState(): DiffCheckerState {
    return {
      originalText: '',
      modifiedText: '',
      viewMode: 'side-by-side',
      algorithm: 'myers',
      ignoreWhitespace: false,
      ignoreCase: false,
      ignoreComments: false,
      language: 'plaintext',
      monacoTheme: 'vs'
    };
  }

  protected applyState(state: DiffCheckerState): void {
    this.viewMode = state.viewMode;
    this.algorithm = state.algorithm;
    this.ignoreWhitespace = state.ignoreWhitespace;
    this.ignoreCase = state.ignoreCase;
    this.ignoreComments = state.ignoreComments;
    this.language = state.language;

    // Theme is managed globally via subscription
    this.monacoTheme = this.monacoThemeService.currentTheme;

    if (this.diffEditor) {
      this.updateEditorContent(state.originalText, state.modifiedText);
      this.updateEditorOptions();
      this.updateThemeClass();
    }
  }

  protected getCurrentState(): DiffCheckerState {
    const original = this.diffEditor?.getOriginalEditor().getValue() || '';
    const modified = this.diffEditor?.getModifiedEditor().getValue() || '';

    return {
      originalText: original,
      modifiedText: modified,
      viewMode: this.viewMode,
      algorithm: this.algorithm,
      ignoreWhitespace: this.ignoreWhitespace,
      ignoreCase: this.ignoreCase,
      ignoreComments: this.ignoreComments,
      language: this.language,
      monacoTheme: this.monacoTheme
    };
  }

  private initializeDiffEditor(): void {
    if (!this.diffEditorContainer) {
      return;
    }

    const originalModel = monaco.editor.createModel('', this.language);
    const modifiedModel = monaco.editor.createModel('', this.language);

    this.diffEditor = monaco.editor.createDiffEditor(this.diffEditorContainer.nativeElement, {
      theme: this.monacoTheme,
      automaticLayout: true,
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'off',
      padding: { top: 12, bottom: 12 },
      readOnly: false,
      renderSideBySide: this.viewMode === 'side-by-side',
      ignoreTrimWhitespace: this.ignoreWhitespace,
      renderWhitespace: 'all',
      diffWordWrap: 'off',
      enableSplitViewResizing: true,
      renderIndicators: true,
      originalEditable: true
    });

    this.diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel
    });

    // Listen for content changes
    this.diffEditor.getOriginalEditor().onDidChangeModelContent(() => {
      this.updateStatistics();
      this.saveState();
    });

    this.diffEditor.getModifiedEditor().onDidChangeModelContent(() => {
      this.updateStatistics();
      this.saveState();
    });

    this.loadState();
    this.updateStatistics();

    // Note: Don't apply theme here to avoid global Monaco theme interference
  }

  private updateEditorContent(original: string, modified: string): void {
    if (!this.diffEditor) return;

    const originalModel = this.diffEditor.getOriginalEditor().getModel();
    const modifiedModel = this.diffEditor.getModifiedEditor().getModel();

    if (originalModel) {
      originalModel.setValue(original);
    }
    if (modifiedModel) {
      modifiedModel.setValue(modified);
    }

    this.updateStatistics();
  }

  private updateEditorOptions(): void {
    if (!this.diffEditor) return;

    this.diffEditor.updateOptions({
      renderSideBySide: this.viewMode === 'side-by-side',
      ignoreTrimWhitespace: this.ignoreWhitespace
    });

    // Update language
    const originalModel = this.diffEditor.getOriginalEditor().getModel();
    const modifiedModel = this.diffEditor.getModifiedEditor().getModel();

    if (originalModel) {
      monaco.editor.setModelLanguage(originalModel, this.language);
    }
    if (modifiedModel) {
      monaco.editor.setModelLanguage(modifiedModel, this.language);
    }
  }

  private updateStatistics(): void {
    if (!this.diffEditor) return;

    const original = this.diffEditor.getOriginalEditor().getValue();
    const modified = this.diffEditor.getModifiedEditor().getValue();

    this.statistics = this.diffService.calculateStatistics(
      original,
      modified,
      {
        ignoreWhitespace: this.ignoreWhitespace,
        ignoreCase: this.ignoreCase
      }
    );
  }

  // View mode toggles
  setViewMode(mode: 'side-by-side' | 'inline'): void {
    this.viewMode = mode;
    this.updateEditorOptions();
    this.saveState();
  }

  // Algorithm selection
  setAlgorithm(algorithm: DiffAlgorithm): void {
    this.algorithm = algorithm;
    this.saveState();
  }

  // Ignore options
  toggleIgnoreWhitespace(): void {
    this.ignoreWhitespace = !this.ignoreWhitespace;
    this.updateEditorOptions();
    this.updateStatistics();
    this.saveState();
  }

  toggleIgnoreCase(): void {
    this.ignoreCase = !this.ignoreCase;
    this.updateStatistics();
    this.saveState();
  }

  toggleIgnoreComments(): void {
    this.ignoreComments = !this.ignoreComments;
    this.saveState();
  }

  // Language selection
  setLanguage(language: string): void {
    this.language = language;
    this.updateEditorOptions();
    this.saveState();
  }

  // File handling
  onOriginalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.loadFile(input.files[0], 'original');
    }
  }

  onModifiedFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.loadFile(input.files[0], 'modified');
    }
  }

  loadFile(file: File, target: 'original' | 'modified'): void {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File too large. Maximum size is 10MB.');
      return;
    }

    // Auto-detect language from file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension) {
      this.autoDetectLanguage(extension);
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;

      if (this.diffEditor) {
        if (target === 'original') {
          const model = this.diffEditor.getOriginalEditor().getModel();
          if (model) model.setValue(content);
        } else {
          const model = this.diffEditor.getModifiedEditor().getModel();
          if (model) model.setValue(content);
        }
      }
    };
    reader.readAsText(file);
  }

  private autoDetectLanguage(extension: string): void {
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cs': 'csharp',
      'cpp': 'cpp',
      'c': 'cpp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell'
    };

    const detectedLanguage = languageMap[extension];
    if (detectedLanguage) {
      this.language = detectedLanguage;
      this.updateEditorOptions();
    }
  }

  // Drag and drop
  onDragOver(event: DragEvent, target: 'original' | 'modified'): void {
    event.preventDefault();
    event.stopPropagation();
    if (target === 'original') {
      this.isDragOverOriginal = true;
    } else {
      this.isDragOverModified = true;
    }
  }

  onDragLeave(event: DragEvent, target: 'original' | 'modified'): void {
    event.preventDefault();
    event.stopPropagation();
    if (target === 'original') {
      this.isDragOverOriginal = false;
    } else {
      this.isDragOverModified = false;
    }
  }

  onDrop(event: DragEvent, target: 'original' | 'modified'): void {
    event.preventDefault();
    event.stopPropagation();

    if (target === 'original') {
      this.isDragOverOriginal = false;
    } else {
      this.isDragOverModified = false;
    }

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.loadFile(event.dataTransfer.files[0], target);
    }
  }

  openFileDialog(target: 'original' | 'modified'): void {
    if (target === 'original') {
      this.originalFileInput.nativeElement.click();
    } else {
      this.modifiedFileInput.nativeElement.click();
    }
  }

  // Actions
  swapSides(): void {
    if (!this.diffEditor) return;

    const originalContent = this.diffEditor.getOriginalEditor().getValue();
    const modifiedContent = this.diffEditor.getModifiedEditor().getValue();

    const originalModel = this.diffEditor.getOriginalEditor().getModel();
    const modifiedModel = this.diffEditor.getModifiedEditor().getModel();

    if (originalModel) originalModel.setValue(modifiedContent);
    if (modifiedModel) modifiedModel.setValue(originalContent);

    this.saveState();
  }

  clearBothSides(): void {
    if (!this.diffEditor) return;
    if (!confirm('Clear both sides?')) return;

    const originalModel = this.diffEditor.getOriginalEditor().getModel();
    const modifiedModel = this.diffEditor.getModifiedEditor().getModel();

    if (originalModel) originalModel.setValue('');
    if (modifiedModel) modifiedModel.setValue('');

    this.saveState();
  }

  // Copy actions
  copyDiff(): void {
    const diff = this.diffService.generateUnifiedDiff(
      this.diffEditor?.getOriginalEditor().getValue() || '',
      this.diffEditor?.getModifiedEditor().getValue() || ''
    );
    this.copyToClipboard(diff);
  }

  copyOriginal(): void {
    const content = this.diffEditor?.getOriginalEditor().getValue() || '';
    this.copyToClipboard(content);
  }

  copyModified(): void {
    const content = this.diffEditor?.getModifiedEditor().getValue() || '';
    this.copyToClipboard(content);
  }

  private copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard!');
    }).catch(() => {
      this.showNotification('Failed to copy');
    });
  }

  // Export actions
  exportAsPatch(): void {
    const patch = this.diffService.generateUnifiedDiff(
      this.diffEditor?.getOriginalEditor().getValue() || '',
      this.diffEditor?.getModifiedEditor().getValue() || ''
    );
    this.downloadFile(patch, 'diff.patch', 'text/plain');
  }

  exportAsHTML(): void {
    const html = this.diffService.exportAsHTML(
      this.diffEditor?.getOriginalEditor().getValue() || '',
      this.diffEditor?.getModifiedEditor().getValue() || ''
    );
    this.downloadFile(html, 'diff.html', 'text/html');
  }

  exportAsMarkdown(): void {
    const markdown = this.diffService.exportAsMarkdown(
      this.diffEditor?.getOriginalEditor().getValue() || '',
      this.diffEditor?.getModifiedEditor().getValue() || '',
      this.statistics
    );
    this.downloadFile(markdown, 'diff.md', 'text/markdown');
  }

  exportAsJSON(): void {
    const json = this.diffService.exportAsJSON(
      this.diffEditor?.getOriginalEditor().getValue() || '',
      this.diffEditor?.getModifiedEditor().getValue() || '',
      this.statistics
    );
    this.downloadFile(json, 'diff.json', 'application/json');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Theme toggle removed - now controlled globally via sidebar

  private updateThemeClass(): void {
    if (this.monacoTheme === 'vs-dark') {
      document.body.classList.add('editor-dark-theme');
    } else {
      document.body.classList.remove('editor-dark-theme');
    }
  }

  // UI toggles
  toggleStatistics(): void {
    this.showStatistics = !this.showStatistics;
  }

  toggleOptions(): void {
    this.showOptions = !this.showOptions;
  }

  // Utility
  private showNotification(message: string): void {
    // Simple notification - could be replaced with a toast component
    console.log(message);
    alert(message);
  }
}
