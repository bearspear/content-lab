import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorAction } from '../../../core/models';

export interface EditorContentChange {
  content: string;
}

export interface ImageDropEvent {
  file: File;
  cursorPosition: number;
  index: number;
}

export interface MarkdownFileDropEvent {
  file: File;
}

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <textarea #markdownEditor
              class="markdown-editor"
              [class.dragging-image]="isDraggingImage"
              [(ngModel)]="content"
              (input)="onInput()"
              (keydown)="onKeyDown($event)"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              [placeholder]="placeholder"
              spellcheck="true"></textarea>
  `,
  styles: []
})
export class MarkdownEditorComponent implements AfterViewInit {
  @ViewChild('markdownEditor') editorRef!: ElementRef<HTMLTextAreaElement>;

  @Input() content: string = '';
  @Input() placeholder: string = 'Write your markdown here... (Drag and drop images to insert, or .md/.markdown/.txt files to load)';

  @Output() contentChange = new EventEmitter<EditorContentChange>();
  @Output() imageDrop = new EventEmitter<ImageDropEvent>();
  @Output() markdownFileDrop = new EventEmitter<MarkdownFileDropEvent>();

  isDraggingImage: boolean = false;

  ngAfterViewInit(): void {
    // Focus can be set externally if needed
  }

  /**
   * Handle input events
   */
  onInput(): void {
    this.contentChange.emit({ content: this.content });
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          this.handleAction({ type: 'bold' });
          break;
        case 'i':
          event.preventDefault();
          this.handleAction({ type: 'italic' });
          break;
        case 'k':
          event.preventDefault();
          this.handleAction({ type: 'link' });
          break;
      }
    }

    // Handle Tab key for indentation
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertAtCursor('\t');
    }
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Check if the dragged item contains files (images)
    if (event.dataTransfer?.types.includes('Files')) {
      this.isDraggingImage = true;
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingImage = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const cursorPosition = textarea.selectionStart;

    // Process all dropped files
    Array.from(files).forEach((file, index) => {
      // Check if it's a markdown file
      const isMarkdownFile = file.name.endsWith('.md') ||
                            file.name.endsWith('.markdown') ||
                            file.name.endsWith('.txt') ||
                            file.type === 'text/markdown' ||
                            file.type === 'text/plain';

      if (isMarkdownFile) {
        // Emit markdown file drop event
        this.markdownFileDrop.emit({ file });
      } else if (file.type.startsWith('image/')) {
        // Emit image drop event
        this.imageDrop.emit({ file, cursorPosition, index });
      }
    });
  }

  /**
   * Handle editor actions from toolbar
   */
  handleAction(action: EditorAction): void {
    switch (action.type) {
      case 'bold':
        this.wrapSelection('**', '**', 'bold text');
        break;
      case 'italic':
        this.wrapSelection('*', '*', 'italic text');
        break;
      case 'strikethrough':
        this.wrapSelection('~~', '~~', 'strikethrough text');
        break;
      case 'code':
        this.wrapSelection('`', '`', 'code');
        break;
      case 'heading1':
        this.insertHeading(1);
        break;
      case 'heading2':
        this.insertHeading(2);
        break;
      case 'heading3':
        this.insertHeading(3);
        break;
      case 'codeBlock':
        this.insertCodeBlock();
        break;
      case 'blockquote':
        this.insertBlockquote();
        break;
      case 'unorderedList':
        this.insertUnorderedList();
        break;
      case 'orderedList':
        this.insertOrderedList();
        break;
      case 'taskList':
        this.insertTask();
        break;
      case 'link':
        this.insertLink();
        break;
      case 'image':
        this.insertImage();
        break;
      case 'table':
        this.insertTable();
        break;
      case 'horizontalRule':
        this.insertHorizontalRule();
        break;
      case 'math':
        this.insertMath();
        break;
    }
  }

  /**
   * Insert text at cursor position
   */
  insertAtCursor(text: string, selectText: boolean = false): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = this.content.substring(0, start);
    const after = this.content.substring(end);

    this.content = before + text + after;
    this.contentChange.emit({ content: this.content });

    // Update cursor position
    setTimeout(() => {
      if (selectText) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + text.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
      }
      textarea.focus();
    }, 0);
  }

  /**
   * Wrap selected text with prefix and suffix
   */
  private wrapSelection(prefix: string, suffix: string = prefix, placeholder: string = ''): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.content.substring(start, end);
    const textToWrap = selectedText || placeholder;

    const before = this.content.substring(0, start);
    const after = this.content.substring(end);

    this.content = before + prefix + textToWrap + suffix + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      if (!selectedText) {
        // Select the placeholder text
        textarea.selectionStart = start + prefix.length;
        textarea.selectionEnd = start + prefix.length + textToWrap.length;
      } else {
        // Place cursor after the wrapped text
        textarea.selectionStart = textarea.selectionEnd = start + prefix.length + textToWrap.length + suffix.length;
      }
      textarea.focus();
    }, 0);
  }

  /**
   * Insert heading at current line
   */
  private insertHeading(level: number): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && this.content[lineStart - 1] !== '\n') {
      lineStart--;
    }

    const before = this.content.substring(0, lineStart);
    const after = this.content.substring(lineStart);
    const heading = '#'.repeat(level) + ' ';

    this.content = before + heading + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = lineStart + heading.length;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert code block
   */
  private insertCodeBlock(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.content.substring(start, end);

    const codeBlock = '\n```\n' + (selectedText || 'your code here') + '\n```\n';
    const before = this.content.substring(0, start);
    const after = this.content.substring(end);

    this.content = before + codeBlock + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      if (!selectedText) {
        textarea.selectionStart = start + 5; // Position after ```\n
        textarea.selectionEnd = start + 5 + 'your code here'.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + codeBlock.length;
      }
      textarea.focus();
    }, 0);
  }

  /**
   * Insert blockquote
   */
  private insertBlockquote(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;

    // Find the start of the current line
    let lineStart = start;
    while (lineStart > 0 && this.content[lineStart - 1] !== '\n') {
      lineStart--;
    }

    const before = this.content.substring(0, lineStart);
    const after = this.content.substring(lineStart);

    this.content = before + '> ' + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = lineStart + 2;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert unordered list
   */
  private insertUnorderedList(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const listItem = '\n- List item\n';

    const before = this.content.substring(0, start);
    const after = this.content.substring(start);

    this.content = before + listItem + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = start + 3; // After '\n- '
      textarea.selectionEnd = start + 3 + 'List item'.length;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert ordered list
   */
  private insertOrderedList(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const listItem = '\n1. List item\n';

    const before = this.content.substring(0, start);
    const after = this.content.substring(start);

    this.content = before + listItem + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = start + 4; // After '\n1. '
      textarea.selectionEnd = start + 4 + 'List item'.length;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert task list item
   */
  private insertTask(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const task = '\n- [ ] Task item\n';

    const before = this.content.substring(0, start);
    const after = this.content.substring(start);

    this.content = before + task + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = start + 7; // After '\n- [ ] '
      textarea.selectionEnd = start + 7 + 'Task item'.length;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert link
   */
  private insertLink(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.content.substring(start, end);

    const linkText = selectedText || 'link text';
    const link = `[${linkText}](url)`;

    const before = this.content.substring(0, start);
    const after = this.content.substring(end);

    this.content = before + link + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      // Select 'url' for easy replacement
      const urlStart = start + linkText.length + 3; // After '[linkText]('
      textarea.selectionStart = urlStart;
      textarea.selectionEnd = urlStart + 3;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert image
   */
  private insertImage(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const image = '![alt text](image-url)';

    const before = this.content.substring(0, start);
    const after = this.content.substring(start);

    this.content = before + image + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      // Select 'image-url' for easy replacement
      textarea.selectionStart = start + 12; // After '![alt text]('
      textarea.selectionEnd = start + 12 + 9; // 'image-url' length
      textarea.focus();
    }, 0);
  }

  /**
   * Insert table
   */
  private insertTable(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const table = '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n';

    const before = this.content.substring(0, start);
    const after = this.content.substring(start);

    this.content = before + table + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + table.length;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert horizontal rule
   */
  private insertHorizontalRule(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const rule = '\n---\n';

    const before = this.content.substring(0, start);
    const after = this.content.substring(start);

    this.content = before + rule + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + rule.length;
      textarea.focus();
    }, 0);
  }

  /**
   * Insert math equation
   */
  private insertMath(): void {
    const textarea = this.editorRef?.nativeElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = this.content.substring(start, end);

    const mathText = selectedText || 'E = mc^2';
    const math = `$${mathText}$`;

    const before = this.content.substring(0, start);
    const after = this.content.substring(end);

    this.content = before + math + after;
    this.contentChange.emit({ content: this.content });

    setTimeout(() => {
      if (!selectedText) {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1 + mathText.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + math.length;
      }
      textarea.focus();
    }, 0);
  }

  /**
   * Replace entire content (for file loading)
   */
  setContent(newContent: string): void {
    this.content = newContent;
    this.contentChange.emit({ content: this.content });

    // Focus and place cursor at the beginning
    setTimeout(() => {
      const textarea = this.editorRef?.nativeElement;
      if (textarea) {
        textarea.selectionStart = textarea.selectionEnd = 0;
        textarea.focus();
      }
    }, 0);
  }

  /**
   * Insert image markdown at cursor position
   */
  insertImageMarkdown(imageMarkdown: string, cursorPosition: number): void {
    const before = this.content.substring(0, cursorPosition);
    const after = this.content.substring(cursorPosition);

    this.content = before + imageMarkdown + after;
    this.contentChange.emit({ content: this.content });

    // Update cursor position after the inserted image
    setTimeout(() => {
      const textarea = this.editorRef?.nativeElement;
      if (textarea) {
        const newPosition = cursorPosition + imageMarkdown.length;
        textarea.selectionStart = textarea.selectionEnd = newPosition;
        textarea.focus();
      }
    }, 0);
  }
}
