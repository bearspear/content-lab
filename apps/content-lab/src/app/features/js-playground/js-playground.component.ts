import { Component, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CodeEditorComponent } from './components/code-editor.component';
import { CodeBridgeService } from '@content-lab/core';
import { StateManagerService, ScriptLoaderService, MonacoThemeService } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components'  // NOTE: update to specific componentreset-button/reset-button.component';
import { StatefulComponent } from '@content-lab/core';
import { LIBRARY_CONFIG, LibraryConfig } from '@content-lab/core';

interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

interface Library extends LibraryConfig {
  enabled: boolean;
}

type LayoutType = 'split-vertical' | 'split-horizontal' | 'three-panel';

interface JsPlaygroundState {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  activeTab: 'html' | 'css' | 'js';
  libraries: Library[];
  layout: LayoutType;
}

@Component({
  selector: 'app-js-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditorComponent, ResetButtonComponent],
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
export class JsPlaygroundComponent extends StatefulComponent<JsPlaygroundState> implements AfterViewInit {
  protected readonly TOOL_ID = 'js-playground';

  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  // Resizer
  private isResizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  // Editor tabs
  activeTab: 'html' | 'css' | 'js' = 'js';

  // Subscriptions
  private codeInsertSubscription?: Subscription;
  private messageListener?: (event: MessageEvent) => void;

  // Code content (defaults)
  htmlCode = '';
  cssCode = '';
  jsCode = '';

  // Console
  consoleLogs: ConsoleLog[] = [];
  showConsole = true;

  // Library panel
  showLibraryPanel = false;

  // Full viewport mode
  isFullViewport = false;
  libraries: Library[] = LIBRARY_CONFIG.map(config => ({
    ...config,
    enabled: false
  }));

  // Layout configuration
  layout: LayoutType = 'split-vertical';
  layouts = [
    { value: 'split-vertical' as LayoutType, label: 'Split Vertical', icon: '⬌' },
    { value: 'split-horizontal' as LayoutType, label: 'Split Horizontal', icon: '⬍' },
    { value: 'three-panel' as LayoutType, label: 'Three Panel', icon: '▦' }
  ];

  // Monaco theme
  monacoTheme: 'vs' | 'vs-dark' = 'vs-dark';

  constructor(
    private codeBridgeService: CodeBridgeService,
    private scriptLoaderService: ScriptLoaderService,
    private ngZone: NgZone,
    private monacoThemeService: MonacoThemeService,
    stateManager: StateManagerService,
    private cdr: ChangeDetectorRef
  ) {
    super(stateManager);
  }

  /**
   * Override ngOnInit to prevent base class from loading state too early
   * State will be loaded after preview iframe initialization in ngAfterViewInit
   */
  override ngOnInit(): void {
    // Subscribe to global theme changes
    this.monacoThemeService.theme$.subscribe(theme => {
      this.monacoTheme = theme;
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Clean up subscription
    if (this.codeInsertSubscription) {
      this.codeInsertSubscription.unsubscribe();
    }
    // Clean up message listener
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }

  protected getDefaultState(): JsPlaygroundState {
    this.loadDefaultCode(); // Populate default code values
    return {
      htmlCode: this.htmlCode,
      cssCode: this.cssCode,
      jsCode: this.jsCode,
      activeTab: 'js',
      libraries: this.libraries.map(lib => ({ ...lib, enabled: false })),
      layout: 'split-vertical'
    };
  }

  protected applyState(state: JsPlaygroundState): void {
    this.htmlCode = state.htmlCode;
    this.cssCode = state.cssCode;
    this.jsCode = state.jsCode;
    this.activeTab = state.activeTab;
    this.layout = state.layout || 'split-vertical';
    // Restore library enabled states while preserving current config
    if (state.libraries) {
      // Merge saved enabled states with current library config
      this.libraries = LIBRARY_CONFIG.map(config => {
        const savedLib = state.libraries.find(lib => lib.id === config.id);
        return {
          ...config,
          enabled: savedLib?.enabled || false
        };
      });
    }
    // Trigger change detection to avoid NG0100 errors
    this.cdr.detectChanges();
  }

  protected getCurrentState(): JsPlaygroundState {
    return {
      htmlCode: this.htmlCode,
      cssCode: this.cssCode,
      jsCode: this.jsCode,
      activeTab: this.activeTab,
      libraries: this.libraries,
      layout: this.layout
    };
  }

  /**
   * Override reset to also reset console and libraries
   */
  public override onReset(): void {
    super.onReset();
    // Reset libraries
    this.libraries.forEach(lib => lib.enabled = false);
    this.consoleLogs = [];
    this.runCode();
  }

  /**
   * Load default code examples
   */
  private loadDefaultCode(): void {
    this.htmlCode = `<div id="app">
  <h1>Hello, World!</h1>
  <p>Edit the code and click "Run" to see the result.</p>
</div>`;

    this.cssCode = `body {
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

    this.jsCode = `// ========================================
// Welcome to JavaScript Playground!
// ========================================
// Click "Libraries" button to enable popular JS libraries
// Check the console to see which libraries are loaded

// ========================================
// Example: Add a button dynamically
// ========================================

const app = document.getElementById('app');
const button = document.createElement('button');
button.textContent = 'Click me!';
button.style.cssText = 'padding: 12px 24px; font-size: 16px; margin-top: 20px; cursor: pointer; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: 600;';

button.onclick = () => {
  console.log('Button clicked!');
  alert('Hello from JavaScript!');
};

app.appendChild(button);
`;
  }

  setActiveTab(tab: 'html' | 'css' | 'js'): void {
    this.activeTab = tab;
    this.saveState();
  }

  runCode(): void {
    this.consoleLogs = [];
    this.updatePreview();
  }

  clearConsole(): void {
    this.consoleLogs = [];
  }

  async downloadHTML(): Promise<void> {
    // Get enabled libraries
    const enabledLibraries = this.getEnabledLibraries();

    // Fetch and embed library contents from CDN/local
    const libraryScripts: string[] = [];
    for (const lib of enabledLibraries) {
      try {
        // Try CDN first
        let response = await fetch(lib.cdnUrl);

        // If CDN fails, try local
        if (!response.ok) {
          const absoluteLocalUrl = lib.localUrl.startsWith('http')
            ? lib.localUrl
            : `${window.location.origin}${lib.localUrl}`;
          response = await fetch(absoluteLocalUrl);
        }

        if (response.ok) {
          const jsContent = await response.text();
          libraryScripts.push(`  <script>
    // ${lib.name} - ${lib.description}
    ${jsContent}
  </script>`);
        } else {
          console.warn(`Failed to fetch ${lib.name}, using external CDN URL`);
          libraryScripts.push(`  <!-- Failed to embed ${lib.name}, using external CDN -->
  <script src="${lib.cdnUrl}"></script>`);
        }
      } catch (error) {
        console.error(`Error fetching ${lib.name}:`, error);
        libraryScripts.push(`  <!-- Error embedding ${lib.name}, using external CDN -->
  <script src="${lib.cdnUrl}"></script>`);
      }
    }

    // Create complete HTML document
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JavaScript Playground Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    ${this.cssCode}
  </style>
${libraryScripts.join('\n')}
</head>
<body>
  ${this.htmlCode}
  <script>
    ${this.jsCode}
  </script>
</body>
</html>`;

    // Create blob and download
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  toggleLibraryPanel(): void {
    this.showLibraryPanel = !this.showLibraryPanel;
  }

  toggleFullViewport(): void {
    this.isFullViewport = !this.isFullViewport;
  }

  setLayout(layout: LayoutType): void {
    this.layout = layout;
    this.saveState();
  }

  async toggleLibrary(library: Library): Promise<void> {
    library.enabled = !library.enabled;

    // Load TypeScript definitions for autocomplete when library is enabled
    if (library.enabled) {
      // Load type definitions for autocomplete
      await CodeEditorComponent.loadLibraryDefinitions(library.id);

      // Insert example code
      const exampleCode = this.getLibraryExample(library.id);
      if (exampleCode) {
        this.jsCode += '\n\n' + exampleCode;
        this.activeTab = 'js'; // Switch to JS tab to show the inserted code
      }
    }

    // Save state when libraries change
    this.saveState();

    // Auto-rerun code when libraries change
    this.runCode();
  }

  private getLibraryExample(libraryId: string): string {
    const examples: { [key: string]: string } = {
      'lodash': `// ========================================
// Lodash Example
// ========================================
const numbers = [1, 2, 3, 4, 5];
const doubled = _.map(numbers, n => n * 2);
console.log('Lodash - doubled:', doubled);

const grouped = _.groupBy(['one', 'two', 'three'], 'length');
console.log('Lodash - grouped by length:', grouped);`,

      'jquery': `// ========================================
// jQuery Example
// ========================================
// Animate button on hover
$('button').hover(
  function() { $(this).css('transform', 'scale(1.05)'); },
  function() { $(this).css('transform', 'scale(1)'); }
);
console.log('jQuery ready! Found', $('button').length, 'buttons');`,

      'moment': `// ========================================
// Moment.js Example
// ========================================
const now = moment().format('MMMM Do YYYY, h:mm:ss a');
console.log('Current time:', now);

const nextWeek = moment().add(7, 'days').format('MMM DD, YYYY');
console.log('One week from now:', nextWeek);`,

      'dayjs': `// ========================================
// Day.js Example
// ========================================
const today = dayjs().format('YYYY-MM-DD');
console.log('Today:', today);

const tomorrow = dayjs().add(1, 'day').format('MMM DD, YYYY');
console.log('Tomorrow:', tomorrow);`,

      'axios': `// ========================================
// Axios Example
// ========================================
axios.get('https://api.github.com/users/github')
  .then(response => {
    console.log('GitHub user:', response.data.name);
    console.log('Public repos:', response.data.public_repos);
  })
  .catch(error => console.error('Axios error:', error));`,

      'chartjs': `// ========================================
// Chart.js Example
// ========================================
// Create a canvas element for the chart
const canvas = document.createElement('canvas');
canvas.id = 'myChart';
canvas.style.maxWidth = '500px';
canvas.style.margin = '20px auto';
document.getElementById('app').appendChild(canvas);

const ctx = canvas.getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
    datasets: [{
      label: 'Sample Data',
      data: [12, 19, 3, 5, 2],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  },
  options: { responsive: true }
});
console.log('Chart.js chart created!');`,

      'highcharts': `// ========================================
// Highcharts Example
// ========================================
const chartDiv = document.createElement('div');
chartDiv.id = 'highcharts-container';
chartDiv.style.margin = '20px auto';
document.getElementById('app').appendChild(chartDiv);

Highcharts.chart('highcharts-container', {
  title: { text: 'Sample Chart' },
  series: [{
    name: 'Data',
    data: [1, 2, 3, 4, 5]
  }]
});
console.log('Highcharts chart created!');`,

      'd3': `// ========================================
// D3.js Example
// ========================================
const data = [30, 86, 168, 281, 303, 365];

d3.select('#app')
  .append('svg')
  .attr('width', 420)
  .attr('height', 200)
  .selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * 70)
  .attr('y', d => 200 - d)
  .attr('width', 65)
  .attr('height', d => d)
  .attr('fill', '#667eea');

console.log('D3.js chart created!');`,

      'gsap': `// ========================================
// GSAP Example
// ========================================
const animBox = document.createElement('div');
animBox.className = 'anim-box';
animBox.style.cssText = 'width: 100px; height: 100px; background: #667eea; margin: 20px;';
document.getElementById('app').appendChild(animBox);

gsap.to('.anim-box', {
  x: 200,
  rotation: 360,
  duration: 2,
  repeat: -1,
  yoyo: true,
  ease: 'power2.inOut'
});
console.log('GSAP animation started!');`,

      'threejs': `// ========================================
// Three.js Example
// ========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 400/300, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(400, 300);
document.getElementById('app').appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x667eea });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
console.log('Three.js 3D cube created!');`,

      'rxjs': `// ========================================
// RxJS Example
// ========================================
const { interval, take, map } = rxjs;

const numbers$ = interval(1000).pipe(
  take(5),
  map(n => n + 1)
);

numbers$.subscribe(
  n => console.log('RxJS emitted:', n)
);
console.log('RxJS observable started (will emit 5 numbers)');`,

      'ramda': `// ========================================
// Ramda Example
// ========================================
const data = [1, 2, 3, 4, 5];

const result = R.pipe(
  R.map(x => x * 2),
  R.filter(x => x > 5),
  R.sum
)(data);

console.log('Ramda pipeline result:', result);
console.log('Original:', data);`
    };

    return examples[libraryId] || '';
  }

  getEnabledLibraries(): Library[] {
    return this.libraries.filter(lib => lib.enabled);
  }

  getLibraryCategories(): string[] {
    return Array.from(new Set(this.libraries.map(lib => lib.category)));
  }

  getLibrariesByCategory(category: string): Library[] {
    return this.libraries.filter(lib => lib.category === category);
  }

  private updatePreview(): void {
    const iframe = this.previewFrame?.nativeElement;
    if (!iframe) return;

    // Get enabled libraries
    const enabledLibraries = this.getEnabledLibraries();

    // Generate library script tags - they need to be in head for proper loading order
    const libraryScriptTags = enabledLibraries
      .map(lib => this.scriptLoaderService.getScriptTagWithFallback(lib))
      .join('\n');

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
  <script>
    // Intercept console methods BEFORE any libraries load
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
  </script>
${libraryScriptTags}
</head>
<body>
  ${this.htmlCode}
  <script>
    // This runs after ALL resources (including external scripts) have loaded
    window.addEventListener('load', function() {
      // Initialize - Check which libraries are loaded
      console.log('🚀 JavaScript Playground initialized!');
      console.log('📚 Available libraries:');
      if (typeof _ !== 'undefined') console.log('  ✓ Lodash (_)');
      if (typeof $ !== 'undefined') console.log('  ✓ jQuery ($)');
      if (typeof moment !== 'undefined') console.log('  ✓ Moment.js (moment)');
      if (typeof dayjs !== 'undefined') console.log('  ✓ Day.js (dayjs)');
      if (typeof axios !== 'undefined') console.log('  ✓ Axios (axios)');
      if (typeof Chart !== 'undefined') console.log('  ✓ Chart.js (Chart)');
      if (typeof Highcharts !== 'undefined') console.log('  ✓ Highcharts (Highcharts)');
      if (typeof d3 !== 'undefined') console.log('  ✓ D3.js (d3)');
      if (typeof gsap !== 'undefined') console.log('  ✓ GSAP (gsap)');
      if (typeof THREE !== 'undefined') console.log('  ✓ Three.js (THREE)');
      if (typeof rxjs !== 'undefined') console.log('  ✓ RxJS (rxjs)');
      if (typeof R !== 'undefined') console.log('  ✓ Ramda (R)');
      console.log('');

      // User code
      try {
        ${this.jsCode}
      } catch (error) {
        console.error('Error: ' + error.message);
      }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    iframe.src = URL.createObjectURL(blob);
  }

  ngAfterViewInit(): void {
    // Load saved state
    this.loadState();

    // Setup resizer
    this.setupResizer();

    // Note: We don't apply the theme here to avoid interfering with other Monaco editors
    // The theme will be applied by individual code-editor components when they initialize

    // Create and store message listener for cleanup
    this.messageListener = (event: MessageEvent) => {
      if (event.data?.type === 'console') {
        // Run inside Angular zone to trigger change detection
        this.ngZone.run(() => {
          this.consoleLogs.push({
            type: event.data.level,
            message: event.data.message,
            timestamp: new Date()
          });
        });
      }
    };

    // Listen for console messages from iframe
    window.addEventListener('message', this.messageListener);

    // Check for and apply any pending code
    let hasPendingCode = false;

    const pendingJs = this.codeBridgeService.getPendingCode('js');
    if (pendingJs) {
      // Add double newline if there's existing code
      if (this.jsCode.trim()) {
        this.jsCode += '\n\n' + pendingJs;
      } else {
        this.jsCode += pendingJs;
      }
      this.activeTab = 'js';
      hasPendingCode = true;
    }

    const pendingHtml = this.codeBridgeService.getPendingCode('html');
    if (pendingHtml) {
      if (this.htmlCode.trim()) {
        this.htmlCode += '\n\n' + pendingHtml;
      } else {
        this.htmlCode += pendingHtml;
      }
      hasPendingCode = true;
    }

    const pendingCss = this.codeBridgeService.getPendingCode('css');
    if (pendingCss) {
      if (this.cssCode.trim()) {
        this.cssCode += '\n\n' + pendingCss;
      } else {
        this.cssCode += pendingCss;
      }
      hasPendingCode = true;
    }

    // Save state if any pending code was inserted
    if (hasPendingCode) {
      this.saveState();
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

      // Save state after code insertion
      this.saveState();
    });

    // Run code on init
    setTimeout(() => this.runCode(), 100);
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

  private setupResizer(): void {
    const resizer = document.querySelector('.resizer') as HTMLElement;
    if (!resizer) return;

    const editorSection = document.querySelector('.editor-section') as HTMLElement;
    const previewSection = document.querySelector('.preview-section') as HTMLElement;
    const container = document.querySelector('.playground-content') as HTMLElement;

    if (!editorSection || !previewSection || !container) return;

    const onMouseDown = (e: MouseEvent) => {
      this.isResizing = true;
      this.startX = e.clientX;
      this.startY = e.clientY;

      if (this.layout === 'split-vertical') {
        this.startWidth = editorSection.offsetWidth;
      } else if (this.layout === 'split-horizontal') {
        this.startHeight = editorSection.offsetHeight;
      }

      document.body.style.cursor = this.layout === 'split-vertical' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isResizing) return;

      if (this.layout === 'split-vertical') {
        const deltaX = e.clientX - this.startX;
        const newWidth = this.startWidth + deltaX;
        const containerWidth = container.offsetWidth;
        const minWidth = 300;
        const maxWidth = containerWidth - minWidth;

        if (newWidth >= minWidth && newWidth <= maxWidth) {
          editorSection.style.width = `${newWidth}px`;
          editorSection.style.flex = 'none';
        }
      } else if (this.layout === 'split-horizontal') {
        const deltaY = e.clientY - this.startY;
        const newHeight = this.startHeight + deltaY;
        const containerHeight = container.offsetHeight;
        const minHeight = 200;
        const maxHeight = containerHeight - minHeight;

        if (newHeight >= minHeight && newHeight <= maxHeight) {
          editorSection.style.height = `${newHeight}px`;
          editorSection.style.flex = 'none';
        }
      }
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    resizer.addEventListener('mousedown', onMouseDown);
  }

}
