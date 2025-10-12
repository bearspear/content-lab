import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as monaco from 'monaco-editor';
import { StateManagerService } from '../../core/services';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';

interface TextEditorState {
  content: string;
  showLineNumbers: boolean;
  showWhitespace: boolean;
  fontSize: number;
  wordWrap: boolean;
}

@Component({
  selector: 'app-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss'
})
export class TextEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly TOOL_ID = 'text-editor';
  private saveStateTimeout: any;

  @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

  editor: monaco.editor.IStandaloneCodeEditor | null = null;

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

  // Find/Replace
  showFindReplace: boolean = false;

  constructor(private stateManager: StateManagerService) {}

  ngOnInit(): void {
    // State will be loaded after editor initialization in ngAfterViewInit
  }

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnDestroy(): void {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }
    if (this.editor) {
      this.editor.dispose();
    }
  }

  /**
   * Load saved state after editor initialization
   */
  private loadState(): void {
    const savedState = this.stateManager.loadState<TextEditorState>(this.TOOL_ID);

    if (savedState && this.editor) {
      // Apply saved settings
      this.showLineNumbers = savedState.showLineNumbers;
      this.showWhitespace = savedState.showWhitespace;
      this.fontSize = savedState.fontSize;
      this.wordWrap = savedState.wordWrap;

      // Update editor options
      this.editor.updateOptions({
        lineNumbers: this.showLineNumbers ? 'on' : 'off',
        renderWhitespace: this.showWhitespace ? 'all' : 'none',
        fontSize: this.fontSize,
        wordWrap: this.wordWrap ? 'on' : 'off'
      });

      // Set saved content
      this.editor.setValue(savedState.content);
    } else {
      this.loadDefaultContent();
    }
  }

  /**
   * Save current state (debounced)
   */
  saveState(): void {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }

    this.saveStateTimeout = setTimeout(() => {
      if (!this.editor) return;

      const state: TextEditorState = {
        content: this.editor.getValue(),
        showLineNumbers: this.showLineNumbers,
        showWhitespace: this.showWhitespace,
        fontSize: this.fontSize,
        wordWrap: this.wordWrap
      };
      this.stateManager.saveState(this.TOOL_ID, state);
    }, 500); // Debounce saves by 500ms
  }

  /**
   * Reset to default state
   */
  onReset(): void {
    this.stateManager.clearState(this.TOOL_ID);

    // Reset settings to defaults
    this.showLineNumbers = true;
    this.showWhitespace = false;
    this.fontSize = 14;
    this.wordWrap = false;

    if (this.editor) {
      // Update editor options
      this.editor.updateOptions({
        lineNumbers: 'on',
        renderWhitespace: 'none',
        fontSize: 14,
        wordWrap: 'off'
      });

      // Clear content
      this.editor.setValue('');
    }
  }

  /**
   * Load default content
   */
  private loadDefaultContent(): void {
    // Editor starts with empty content by default
    if (this.editor) {
      this.editor.setValue('');
    }
  }

  private initializeEditor(): void {
    if (!this.editorContainer) {
      return;
    }

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: '',
      language: 'plaintext',
      theme: 'vs',
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

  toggleTheme(): void {
    if (this.editor) {
      // Check if current theme is dark
      const isDark = document.body.classList.contains('editor-dark-theme');

      if (isDark) {
        monaco.editor.setTheme('vs');
        document.body.classList.remove('editor-dark-theme');
      } else {
        monaco.editor.setTheme('vs-dark');
        document.body.classList.add('editor-dark-theme');
      }
    }
  }
}
