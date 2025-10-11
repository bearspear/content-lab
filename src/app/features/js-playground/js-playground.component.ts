import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CodeEditorComponent } from './components/code-editor.component';
import { CodeBridgeService } from '../../core/services/code-bridge.service';

interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-js-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditorComponent],
  templateUrl: './js-playground.component.html',
  styleUrl: './js-playground.component.scss',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      min-height: 0;
    }
  `]
})
export class JsPlaygroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  // Editor tabs
  activeTab: 'html' | 'css' | 'js' = 'js';

  // Subscriptions
  private codeInsertSubscription?: Subscription;

  // Code content
  htmlCode = `<div id="app">
  <h1>Hello, World!</h1>
  <p>Edit the code and click "Run" to see the result.</p>
</div>`;

  cssCode = `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

#app {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

h1 {
  margin: 0 0 16px 0;
  font-size: 2.5rem;
}

p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}`;

  jsCode = `// Try some JavaScript!
console.log('Welcome to JS Playground!');

// Example: Add a button dynamically
const app = document.getElementById('app');
const button = document.createElement('button');
button.textContent = 'Click me!';
button.style.cssText = 'padding: 12px 24px; font-size: 16px; margin-top: 20px; cursor: pointer; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600;';

button.onclick = () => {
  console.log('Button clicked!');
  alert('Hello from JavaScript!');
};

app.appendChild(button);`;

  // Console
  consoleLogs: ConsoleLog[] = [];
  showConsole = true;

  constructor(private codeBridgeService: CodeBridgeService) {}

  setActiveTab(tab: 'html' | 'css' | 'js'): void {
    this.activeTab = tab;
  }

  runCode(): void {
    this.consoleLogs = [];
    this.updatePreview();
  }

  clearConsole(): void {
    this.consoleLogs = [];
  }

  clearActivePanel(): void {
    if (confirm(`Are you sure you want to clear the ${this.activeTab.toUpperCase()} code?`)) {
      if (this.activeTab === 'html') {
        this.htmlCode = '';
      } else if (this.activeTab === 'css') {
        this.cssCode = '';
      } else if (this.activeTab === 'js') {
        this.jsCode = '';
      }
    }
  }

  private updatePreview(): void {
    const iframe = this.previewFrame?.nativeElement;
    if (!iframe) return;

    // Create the HTML document with console interception
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    ${this.cssCode}
  </style>
</head>
<body>
  ${this.htmlCode}
  <script>
    // Intercept console methods
    (function() {
      const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };

      function sendToParent(type, args) {
        const message = Array.from(args).map(arg => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');

        window.parent.postMessage({
          type: 'console',
          level: type,
          message: message
        }, '*');
      }

      console.log = function(...args) {
        originalConsole.log.apply(console, args);
        sendToParent('log', args);
      };

      console.error = function(...args) {
        originalConsole.error.apply(console, args);
        sendToParent('error', args);
      };

      console.warn = function(...args) {
        originalConsole.warn.apply(console, args);
        sendToParent('warn', args);
      };

      console.info = function(...args) {
        originalConsole.info.apply(console, args);
        sendToParent('info', args);
      };

      // Catch errors
      window.onerror = function(message, source, lineno, colno, error) {
        sendToParent('error', [message + ' (Line: ' + lineno + ')']);
        return false;
      };
    })();

    // User code
    try {
      ${this.jsCode}
    } catch (error) {
      console.error('Error: ' + error.message);
    }
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    iframe.src = URL.createObjectURL(blob);
  }

  ngAfterViewInit(): void {
    // Listen for console messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'console') {
        this.consoleLogs.push({
          type: event.data.level,
          message: event.data.message,
          timestamp: new Date()
        });
      }
    });

    // Check for and apply any pending code
    const pendingJs = this.codeBridgeService.getPendingCode('js');
    if (pendingJs) {
      // Add double newline if there's existing code
      if (this.jsCode.trim()) {
        this.jsCode += '\n\n' + pendingJs;
      } else {
        this.jsCode += pendingJs;
      }
      this.activeTab = 'js';
    }

    const pendingHtml = this.codeBridgeService.getPendingCode('html');
    if (pendingHtml) {
      if (this.htmlCode.trim()) {
        this.htmlCode += '\n\n' + pendingHtml;
      } else {
        this.htmlCode += pendingHtml;
      }
    }

    const pendingCss = this.codeBridgeService.getPendingCode('css');
    if (pendingCss) {
      if (this.cssCode.trim()) {
        this.cssCode += '\n\n' + pendingCss;
      } else {
        this.cssCode += pendingCss;
      }
    }

    // Subscribe to code insertion events from CodeBridgeService
    this.codeInsertSubscription = this.codeBridgeService.insertCode$.subscribe((event) => {
      if (event.targetTab === 'js') {
        // Add double newline if there's existing code
        if (this.jsCode.trim()) {
          this.jsCode += '\n\n' + event.code;
        } else {
          this.jsCode += event.code;
        }
        // Switch to JS tab to show the inserted code
        this.activeTab = 'js';
      } else if (event.targetTab === 'html') {
        if (this.htmlCode.trim()) {
          this.htmlCode += '\n\n' + event.code;
        } else {
          this.htmlCode += event.code;
        }
        this.activeTab = 'html';
      } else if (event.targetTab === 'css') {
        if (this.cssCode.trim()) {
          this.cssCode += '\n\n' + event.code;
        } else {
          this.cssCode += event.code;
        }
        this.activeTab = 'css';
      }
    });

    // Run code on init
    setTimeout(() => this.runCode(), 100);
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.codeInsertSubscription) {
      this.codeInsertSubscription.unsubscribe();
    }
  }

  getConsoleIcon(type: string): string {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '▶';
    }
  }
}
