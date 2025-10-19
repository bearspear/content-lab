import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadMonaco, getMonaco } from './monaco-loader';
import { MonacoThemeService } from '../../../core/services/monaco-theme.service';

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
  @Input() theme: 'vs' | 'vs-dark' = 'vs-dark'; // Default to dark theme for code editors
  @Input() componentId?: string; // Unique ID to register theme preference
  @Output() codeChange = new EventEmitter<string>();

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;

  private editor: any = null;
  private isUpdatingFromParent = false;
  private static loadedLibraries = new Set<string>();
  private themeSubscription: any;

  constructor(@Optional() private monacoThemeService?: MonacoThemeService) {}

  /**
   * Load TypeScript definitions for a library to enable autocomplete
   */
  static async loadLibraryDefinitions(libraryId: string): Promise<void> {
    // Only load once per library
    if (this.loadedLibraries.has(libraryId)) {
      return;
    }

    try {
      const monaco = getMonaco();
      if (!monaco) {
        console.error('❌ Monaco not loaded yet - cannot load type definitions');
        return;
      }

      // Fetch the type definition file
      const response = await fetch(`/assets/type-definitions/${libraryId}.d.ts`);
      if (!response.ok) {
        console.error(`❌ Type definitions not found for ${libraryId} (Status: ${response.status})`);
        return;
      }

      const defs = await response.text();

      // Verify the definitions look valid
      if (!defs.includes('declare') && !defs.includes('interface')) {
        console.warn(`⚠️ Type definitions for ${libraryId} may be invalid - no declare/interface found`);
      }

      // Add to Monaco's extra libraries for JavaScript/TypeScript intellisense
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        defs,
        `file:///node_modules/@types/${libraryId}/index.d.ts`
      );

      // Also add for TypeScript language (in case it's used)
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        defs,
        `file:///node_modules/@types/${libraryId}/index.d.ts`
      );

      this.loadedLibraries.add(libraryId);
    } catch (error) {
      console.error(`❌ Failed to load type definitions for ${libraryId}:`, error);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await loadMonaco();

      // Subscribe to global theme changes
      if (this.monacoThemeService) {
        this.themeSubscription = this.monacoThemeService.theme$.subscribe(theme => {
          this.theme = theme;
          const monaco = getMonaco();
          if (monaco && this.editor) {
            monaco.editor.setTheme(theme);
          }
        });
      }

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

    // Theme changes are now handled by subscription to monacoThemeService.theme$
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private initEditor(): void {
    const monaco = getMonaco();
    if (!monaco || !this.editorContainer) {
      return;
    }

    // Configure TypeScript/JavaScript language features for better IntelliSense
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });

    // Use current global theme
    if (this.monacoThemeService) {
      this.theme = this.monacoThemeService.currentTheme;
    }

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.code,
      language: this.language,
      theme: this.theme,
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
      padding: { top: 10, bottom: 10 },
      // Enable IntelliSense features
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      parameterHints: {
        enabled: true
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'matchingDocuments'
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
