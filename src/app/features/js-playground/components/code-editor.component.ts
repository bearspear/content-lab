import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadMonaco, getMonaco } from './monaco-loader';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #editorContainer class="monaco-editor-container"></div>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
    }

    .monaco-editor-container {
      width: 100%;
      height: 100%;
    }
  `]
})
export class CodeEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() code = '';
  @Input() language: 'html' | 'css' | 'javascript' | 'json' = 'javascript';
  @Input() placeholder = '';
  @Output() codeChange = new EventEmitter<string>();

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;

  private editor: any = null;
  private isUpdatingFromParent = false;

  async ngAfterViewInit(): Promise<void> {
    try {
      await loadMonaco();
      setTimeout(() => this.initEditor(), 100);
    } catch (error) {
      console.error('Failed to load Monaco Editor:', error);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['code'] && this.editor && !this.isUpdatingFromParent) {
      // Only update if the value is actually different from editor content
      const currentValue = this.editor.getValue();
      if (currentValue !== this.code) {
        this.isUpdatingFromParent = true;
        this.editor.setValue(this.code);
        this.isUpdatingFromParent = false;
      }
    }

    if (changes['language'] && this.editor) {
      const monaco = getMonaco();
      if (monaco) {
        const model = this.editor.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, this.language);
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private initEditor(): void {
    const monaco = getMonaco();
    if (!monaco || !this.editorContainer) {
      return;
    }

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.code,
      language: this.language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      roundedSelection: false,
      scrollBeyondLastLine: false,
      readOnly: false,
      cursorStyle: 'line',
      wordWrap: 'off',
      tabSize: 2,
      insertSpaces: true,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalScrollbarSize: 12,
        horizontalScrollbarSize: 12
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      renderLineHighlight: 'line',
      padding: { top: 10, bottom: 10 }
    });

    // Listen for content changes
    this.editor.onDidChangeModelContent(() => {
      if (!this.isUpdatingFromParent && this.editor) {
        const value = this.editor.getValue();
        this.code = value;
        this.codeChange.emit(value);
      }
    });
  }
}
