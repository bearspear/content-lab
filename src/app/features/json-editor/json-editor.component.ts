import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeEditorComponent } from '../js-playground/components/code-editor.component';
import { CodeBridgeService } from '../../core/services/code-bridge.service';
import { StateManagerService } from '../../core/services';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';
import { StatefulComponent } from '../../core/base';

interface ValidationError {
  line: number;
  column: number;
  message: string;
}

interface JsonEditorState {
  jsonContent: string;
  showStats: boolean;
  monacoTheme: 'vs' | 'vs-dark';
}

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [CommonModule, CodeEditorComponent, ResetButtonComponent],
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.scss',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
    }
  `]
})
export class JsonEditorComponent extends StatefulComponent<JsonEditorState> {
  protected readonly TOOL_ID = 'json-editor';

  @ViewChild(CodeEditorComponent) editorComponent!: CodeEditorComponent;

  jsonContent = '';
  isValid = true;
  validationErrors: ValidationError[] = [];
  showStats = false;
  isDragging = false;
  monacoTheme: 'vs' | 'vs-dark' = 'vs-dark';
  stats = {
    characters: 0,
    lines: 0,
    size: '0 B'
  };

  constructor(
    private codeBridgeService: CodeBridgeService,
    stateManager: StateManagerService
  ) {
    super(stateManager);
  }

  sampleTemplates = [
    {
      name: 'User Profile',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
      content: `{
  "id": 1,
  "username": "johndoe",
  "email": "john.doe@example.com",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    }
  },
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  },
  "roles": ["user", "admin"],
  "createdAt": "2024-01-15T10:30:00Z"
}`
    },
    {
      name: 'API Response',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
      content: `{
  "status": "success",
  "code": 200,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice Johnson",
        "active": true
      },
      {
        "id": 2,
        "name": "Bob Smith",
        "active": false
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  },
  "metadata": {
    "timestamp": "2024-10-10T12:00:00Z",
    "version": "1.0.0"
  }
}`
    },
    {
      name: 'Configuration',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
      content: `{
  "app": {
    "name": "MyApplication",
    "version": "2.1.0",
    "environment": "production"
  },
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": true,
    "maxConnections": 100
  },
  "database": {
    "host": "db.example.com",
    "port": 5432,
    "name": "mydb",
    "pool": {
      "min": 2,
      "max": 10
    }
  },
  "features": {
    "authentication": true,
    "logging": true,
    "monitoring": true
  }
}`
    },
    {
      name: 'Package.json',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
      content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample Node.js project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "build": "webpack --mode production"
  },
  "keywords": ["nodejs", "javascript"],
  "author": "John Doe",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "webpack": "^5.75.0"
  }
}`
    }
  ];

  /**
   * Returns the default state for this component
   */
  protected getDefaultState(): JsonEditorState {
    return {
      jsonContent: this.sampleTemplates[0].content,
      showStats: false,
      monacoTheme: 'vs-dark'
    };
  }

  /**
   * Applies loaded state to component properties
   */
  protected applyState(state: JsonEditorState): void {
    this.jsonContent = state.jsonContent;
    this.showStats = state.showStats;
    this.monacoTheme = state.monacoTheme || 'vs-dark';
    this.validateJSON();
    this.updateStats();
  }

  /**
   * Returns current state to be saved
   */
  protected getCurrentState(): JsonEditorState {
    return {
      jsonContent: this.jsonContent,
      showStats: this.showStats,
      monacoTheme: this.monacoTheme
    };
  }

  /**
   * Override reset to also reset validation state
   */
  public override onReset(): void {
    super.onReset();
    this.isValid = true;
    this.validationErrors = [];
  }

  onContentChange(content: string): void {
    this.jsonContent = content;
    this.validateJSON();
    this.updateStats();
    this.saveState();
  }

  validateJSON(): void {
    this.validationErrors = [];

    if (!this.jsonContent.trim()) {
      this.isValid = true;
      return;
    }

    try {
      JSON.parse(this.jsonContent);
      this.isValid = true;
    } catch (error: any) {
      this.isValid = false;

      // Parse error message to extract line and column
      const match = error.message.match(/position (\d+)/);
      if (match) {
        const position = parseInt(match[1]);
        const lines = this.jsonContent.substring(0, position).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;

        this.validationErrors.push({
          line,
          column,
          message: error.message
        });
      } else {
        this.validationErrors.push({
          line: 1,
          column: 1,
          message: error.message
        });
      }
    }
  }

  beautifyJSON(): void {
    try {
      const parsed = JSON.parse(this.jsonContent);
      this.jsonContent = JSON.stringify(parsed, null, 2);
      this.isValid = true;
      this.validationErrors = [];
      this.updateStats();
      this.saveState();
    } catch (error: any) {
      // Validation will show the error
      this.validateJSON();
    }
  }

  minifyJSON(): void {
    try {
      const parsed = JSON.parse(this.jsonContent);
      this.jsonContent = JSON.stringify(parsed);
      this.isValid = true;
      this.validationErrors = [];
      this.updateStats();
      this.saveState();
    } catch (error: any) {
      // Validation will show the error
      this.validateJSON();
    }
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.jsonContent).then(() => {
      // Show temporary success message
      const button = document.querySelector('.copy-btn');
      if (button) {
        button.textContent = 'Copied!';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  }

  clearEditor(): void {
    if (confirm('Are you sure you want to clear the editor?')) {
      this.jsonContent = '';
      this.isValid = true;
      this.validationErrors = [];
      this.updateStats();
    }
  }

  loadTemplate(template: any): void {
    this.jsonContent = template.content;
    this.validateJSON();
    this.updateStats();
    this.saveState();
  }

  private updateStats(): void {
    this.stats.characters = this.jsonContent.length;
    this.stats.lines = this.jsonContent.split('\n').length;

    const bytes = new Blob([this.jsonContent]).size;
    if (bytes < 1024) {
      this.stats.size = bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      this.stats.size = (bytes / 1024).toFixed(2) + ' KB';
    } else {
      this.stats.size = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  toggleStats(): void {
    this.showStats = !this.showStats;
    this.saveState();
  }

  toggleTheme(): void {
    this.monacoTheme = this.monacoTheme === 'vs' ? 'vs-dark' : 'vs';
    this.saveState();
  }

  insertToJsPlayground(): void {
    if (!this.isValid) {
      alert('Please fix JSON errors before inserting into JavaScript Playground');
      return;
    }

    if (!this.jsonContent.trim()) {
      alert('JSON content is empty');
      return;
    }

    try {
      const varName = this.codeBridgeService.insertJsonAsJsConstant(this.jsonContent);

      // Show temporary success message
      const successMsg = document.createElement('div');
      successMsg.className = 'insert-success-toast';
      successMsg.textContent = `✓ Inserted as ${varName}`;
      document.body.appendChild(successMsg);

      setTimeout(() => {
        successMsg.remove();
      }, 3000);
    } catch (error: any) {
      alert(error.message || 'Failed to insert JSON into JavaScript Playground');
    }
  }

  // Drag and Drop handlers
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

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if it's a JSON file
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        this.loadJsonFile(file);
      } else {
        alert('Please drop a valid JSON file (.json)');
      }
    }
  }

  private loadJsonFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.jsonContent = content;
      this.validateJSON();
      this.updateStats();
    };

    reader.onerror = () => {
      alert('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);
  }
}
