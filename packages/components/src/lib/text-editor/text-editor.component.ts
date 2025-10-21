import { Component, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { StateManagerService, MonacoThemeService } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components'  // NOTE: update to specific componentreset-button/reset-button.component';
import { StatefulComponent } from '@content-lab/core';

interface TextEditorState {
  content: string;
  showLineNumbers: boolean;
  showWhitespace: boolean;
  fontSize: number;
  wordWrap: boolean;
  monacoTheme: 'vs' | 'vs-dark';
  language: string;
}

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent extends StatefulComponent<TextEditorState> implements AfterViewInit {
  protected readonly TOOL_ID = 'text-editor';

  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

  editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private themeSubscription: any;

  // Statistics
  characterCount: number = 0;
  wordCount: number = 0;
  lineCount: number = 1;
  selectedText: string = '';

  // Editor options
  showLineNumbers: boolean = true;
  showWhitespace: boolean = false;
  fontSize: number = 14;
  wordWrap: boolean = false;
  monacoTheme: 'vs' | 'vs-dark' = 'vs';
  language: string = 'plaintext';

  // Language options for syntax highlighting
  languageOptions = [
    { value: 'plaintext', label: 'Plain Text' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'html', label: 'HTML' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'css', label: 'CSS' },
    { value: 'python', label: 'Python' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'typescript', label: 'TypeScript' }
  ];

  // Find/Replace
  showFindReplace: boolean = false;

  constructor(
    stateManager: StateManagerService,
    private monacoThemeService: MonacoThemeService,
    private cdr: ChangeDetectorRef
  ) {
    super(stateManager);
  }

  /**
   * Override ngOnInit to prevent base class from loading state too early
   * State will be loaded after editor initialization in ngAfterViewInit
   */
  override ngOnInit(): void {
    // Subscribe to global theme changes
    this.themeSubscription = this.monacoThemeService.theme$.subscribe(theme => {
      this.monacoTheme = theme;
      if (this.editor) {
        monaco.editor.setTheme(theme);
        this.updateThemeClass();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.editor) {
      this.editor.dispose();
    }
  }

  protected getDefaultState(): TextEditorState {
    return {
      content: '',
      showLineNumbers: true,
      showWhitespace: false,
      fontSize: 14,
      wordWrap: false,
      monacoTheme: 'vs',
      language: 'plaintext'
    };
  }

  protected applyState(state: TextEditorState): void {
    this.showLineNumbers = state.showLineNumbers;
    this.showWhitespace = state.showWhitespace;
    this.fontSize = state.fontSize;
    this.wordWrap = state.wordWrap;
    this.language = state.language || 'plaintext';

    // Theme is managed globally via subscription
    this.monacoTheme = this.monacoThemeService.currentTheme;

    if (this.editor) {
      // Update editor options
      this.editor.updateOptions({
        lineNumbers: this.showLineNumbers ? 'on' : 'off',
        renderWhitespace: this.showWhitespace ? 'all' : 'none',
        fontSize: this.fontSize,
        wordWrap: this.wordWrap ? 'on' : 'off'
      });

      // Update body class for theme-specific styling
      this.updateThemeClass();

      // Update language model
      const model = this.editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, this.language);
      }

      // Set content
      this.editor.setValue(state.content);
    }

    // Trigger change detection to avoid NG0100 errors
    this.cdr.detectChanges();
  }

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

  protected getCurrentState(): TextEditorState {
    return {
      content: this.editor?.getValue() || '',
      showLineNumbers: this.showLineNumbers,
      showWhitespace: this.showWhitespace,
      fontSize: this.fontSize,
      wordWrap: this.wordWrap,
      monacoTheme: this.monacoTheme,
      language: this.language
    };
  }

  /**
   * Override reset to clear editor properly
   */
  public override onReset(): void {
    super.onReset();
    // applyState will be called by super.onReset()
  }

  private initializeEditor(): void {
    if (!this.editorContainer) {
      return;
    }

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: '',
      language: this.language,
      theme: this.monacoTheme,
      automaticLayout: true,
      fontSize: this.fontSize,
      lineNumbers: this.showLineNumbers ? 'on' : 'off',
      renderWhitespace: this.showWhitespace ? 'all' : 'none',
      wordWrap: this.wordWrap ? 'on' : 'off',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      folding: false,
      glyphMargin: false,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 4,
      renderLineHighlight: 'all',
      contextmenu: true,
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      tabSize: 2,
      insertSpaces: true,
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true,
      trimAutoWhitespace: true,
      padding: {
        top: 16,
        bottom: 16
      },
      find: {
        seedSearchStringFromSelection: 'selection',
        autoFindInSelection: 'never'
      }
    });

    // Update statistics on content change
    this.editor.onDidChangeModelContent(() => {
      this.updateStatistics();
      this.saveState();
    });

    // Update selected text on selection change
    this.editor.onDidChangeCursorSelection(() => {
      const selection = this.editor?.getSelection();
      if (selection && this.editor) {
        this.selectedText = this.editor.getModel()?.getValueInRange(selection) || '';
      }
    });

    this.updateStatistics();

    // Load saved state after editor is initialized
    this.loadState();

    // Note: Don't apply theme here to avoid global Monaco theme interference
  }

  private updateStatistics(): void {
    if (!this.editor) return;

    const model = this.editor.getModel();
    if (!model) return;

    const content = model.getValue();

    // Character count (including spaces)
    this.characterCount = content.length;

    // Line count
    this.lineCount = model.getLineCount();

    // Word count
    if (content.trim().length === 0) {
      this.wordCount = 0;
    } else {
      // Split by whitespace and filter out empty strings
      const words = content.trim().split(/\s+/).filter(word => word.length > 0);
      this.wordCount = words.length;
    }
  }

  // Toolbar actions
  toggleLineNumbers(): void {
    this.showLineNumbers = !this.showLineNumbers;
    if (this.editor) {
      this.editor.updateOptions({
        lineNumbers: this.showLineNumbers ? 'on' : 'off'
      });
    }
    this.saveState();
  }

  toggleWhitespace(): void {
    this.showWhitespace = !this.showWhitespace;
    if (this.editor) {
      this.editor.updateOptions({
        renderWhitespace: this.showWhitespace ? 'all' : 'none'
      });
    }
    this.saveState();
  }

  toggleWordWrap(): void {
    this.wordWrap = !this.wordWrap;
    if (this.editor) {
      this.editor.updateOptions({
        wordWrap: this.wordWrap ? 'on' : 'off'
      });
    }
    this.saveState();
  }

  increaseFontSize(): void {
    if (this.fontSize < 40) {
      this.fontSize++;
      if (this.editor) {
        this.editor.updateOptions({ fontSize: this.fontSize });
      }
      this.saveState();
    }
  }

  decreaseFontSize(): void {
    if (this.fontSize > 8) {
      this.fontSize--;
      if (this.editor) {
        this.editor.updateOptions({ fontSize: this.fontSize });
      }
      this.saveState();
    }
  }

  resetFontSize(): void {
    this.fontSize = 14;
    if (this.editor) {
      this.editor.updateOptions({ fontSize: this.fontSize });
    }
    this.saveState();
  }

  // Find and Replace
  openFindReplace(): void {
    if (this.editor) {
      this.editor.trigger('keyboard', 'actions.find', {});
    }
  }

  openFind(): void {
    if (this.editor) {
      this.editor.trigger('keyboard', 'actions.find', {});
    }
  }

  // File operations
  newFile(): void {
    if (confirm('Create a new file? This will clear the current content.')) {
      if (this.editor) {
        this.editor.setValue('');
      }
    }
  }

  openFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.json,.xml,.html,.css,.js,.ts,.py,.java,.c,.cpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.log,*';

    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          if (this.editor) {
            this.editor.setValue(event.target.result);
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }

  saveFile(): void {
    if (!this.editor) return;

    const content = this.editor.getValue();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyAll(): void {
    if (this.editor) {
      const content = this.editor.getValue();
      navigator.clipboard.writeText(content).then(() => {
        alert('Content copied to clipboard!');
      });
    }
  }

  selectAll(): void {
    if (this.editor) {
      const model = this.editor.getModel();
      if (model) {
        const fullRange = model.getFullModelRange();
        this.editor.setSelection(fullRange);
        this.editor.focus();
      }
    }
  }

  clearContent(): void {
    if (confirm('Clear all content?')) {
      if (this.editor) {
        this.editor.setValue('');
      }
    }
  }

  undo(): void {
    if (this.editor) {
      this.editor.trigger('keyboard', 'undo', {});
    }
  }

  redo(): void {
    if (this.editor) {
      this.editor.trigger('keyboard', 'redo', {});
    }
  }

  formatDocument(): void {
    if (this.editor) {
      this.editor.trigger('editor', 'editor.action.formatDocument', {});
    }
  }

  insertTab(): void {
    if (this.editor) {
      this.editor.trigger('keyboard', 'tab', {});
    }
  }

  goToLine(): void {
    if (this.editor) {
      this.editor.trigger('keyboard', 'editor.action.gotoLine', {});
    }
  }

  // Theme toggle removed - now controlled globally via sidebar

  setLanguage(language: string): void {
    this.language = language;
    if (this.editor) {
      const model = this.editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
      this.saveState();
    }
  }
}
