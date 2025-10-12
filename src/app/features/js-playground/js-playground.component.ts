import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CodeEditorComponent } from './components/code-editor.component';
import { CodeBridgeService } from '../../core/services/code-bridge.service';
import { StateManagerService } from '../../core/services';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';

interface ConsoleLog {
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

interface Library {
  id: string;
  name: string;
  description: string;
  url: string;
  enabled: boolean;
  category: string;
}

interface JsPlaygroundState {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  activeTab: 'html' | 'css' | 'js';
  libraries: Library[];
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
export class JsPlaygroundComponent implements AfterViewInit, OnDestroy {
  private readonly TOOL_ID = 'js-playground';
  private saveStateTimeout: any;

  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  // Editor tabs
  activeTab: 'html' | 'css' | 'js' = 'js';

  // Subscriptions
  private codeInsertSubscription?: Subscription;

  // Code content (defaults)
  htmlCode = '';
  cssCode = '';
  jsCode = '';

  // Console
  consoleLogs: ConsoleLog[] = [];
  showConsole = true;

  // Library panel
  showLibraryPanel = false;
  libraries: Library[] = [
    {
      id: 'lodash',
      name: 'Lodash',
      description: 'Utility library for arrays, objects, and functions',
      url: '/assets/js-libraries/lodash.min.js',
      enabled: false,
      category: 'Utility'
    },
    {
      id: 'moment',
      name: 'Moment.js',
      description: 'Date and time manipulation library',
      url: '/assets/js-libraries/moment.min.js',
      enabled: false,
      category: 'Date/Time'
    },
    {
      id: 'dayjs',
      name: 'Day.js',
      description: 'Lightweight date library (alternative to Moment)',
      url: '/assets/js-libraries/dayjs.min.js',
      enabled: false,
      category: 'Date/Time'
    },
    {
      id: 'axios',
      name: 'Axios',
      description: 'Promise-based HTTP client',
      url: '/assets/js-libraries/axios.min.js',
      enabled: false,
      category: 'HTTP'
    },
    {
      id: 'chartjs',
      name: 'Chart.js',
      description: 'Simple yet flexible charting library',
      url: '/assets/js-libraries/chart.min.js',
      enabled: false,
      category: 'Charting'
    },
    {
      id: 'highcharts',
      name: 'Highcharts',
      description: 'Interactive JavaScript charts library',
      url: '/assets/js-libraries/highcharts.js',
      enabled: false,
      category: 'Charting'
    },
    {
      id: 'd3',
      name: 'D3.js',
      description: 'Data visualization library',
      url: '/assets/js-libraries/d3.min.js',
      enabled: false,
      category: 'Charting'
    },
    {
      id: 'jquery',
      name: 'jQuery',
      description: 'Fast, small JavaScript library',
      url: '/assets/js-libraries/jquery.min.js',
      enabled: false,
      category: 'Utility'
    },
    {
      id: 'gsap',
      name: 'GSAP',
      description: 'Professional-grade animation library',
      url: '/assets/js-libraries/gsap.min.js',
      enabled: false,
      category: 'Animation'
    },
    {
      id: 'threejs',
      name: 'Three.js',
      description: '3D graphics library',
      url: '/assets/js-libraries/three.min.js',
      enabled: false,
      category: '3D/Graphics'
    },
    {
      id: 'rxjs',
      name: 'RxJS',
      description: 'Reactive extensions library',
      url: '/assets/js-libraries/rxjs.umd.min.js',
      enabled: false,
      category: 'Reactive'
    },
    {
      id: 'ramda',
      name: 'Ramda',
      description: 'Functional programming library',
      url: '/assets/js-libraries/ramda.min.js',
      enabled: false,
      category: 'Functional'
    }
  ];

  constructor(
    private codeBridgeService: CodeBridgeService,
    private stateManager: StateManagerService
  ) {}

  /**
   * Load saved state or initialize with default code
   */
  private loadState(): void {
    const savedState = this.stateManager.loadState<JsPlaygroundState>(this.TOOL_ID);

    if (savedState) {
      this.htmlCode = savedState.htmlCode;
      this.cssCode = savedState.cssCode;
      this.jsCode = savedState.jsCode;
      this.activeTab = savedState.activeTab;
      // Restore library states
      if (savedState.libraries) {
        this.libraries = savedState.libraries;
      }
    } else {
      this.loadDefaultCode();
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
      const state: JsPlaygroundState = {
        htmlCode: this.htmlCode,
        cssCode: this.cssCode,
        jsCode: this.jsCode,
        activeTab: this.activeTab,
        libraries: this.libraries
      };
      this.stateManager.saveState(this.TOOL_ID, state);
    }, 500);
  }

  /**
   * Reset to default state
   */
  onReset(): void {
    this.stateManager.clearState(this.TOOL_ID);
    this.loadDefaultCode();
    // Reset libraries
    this.libraries.forEach(lib => lib.enabled = false);
    this.activeTab = 'js';
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

    // Fetch and embed library contents directly
    const libraryScripts: string[] = [];
    for (const lib of enabledLibraries) {
      try {
        const absoluteUrl = lib.url.startsWith('http')
          ? lib.url
          : `${window.location.origin}${lib.url}`;

        console.log(`Fetching ${lib.name} for download...`);
        const response = await fetch(absoluteUrl);
        if (response.ok) {
          const jsContent = await response.text();
          libraryScripts.push(`  <script>
    // ${lib.name} - ${lib.description}
    ${jsContent}
  </script>`);
          console.log(`✓ Embedded ${lib.name}`);
        } else {
          console.warn(`Failed to fetch ${lib.name}: ${response.status}`);
          // Fallback to external URL with comment
          libraryScripts.push(`  <!-- Failed to embed ${lib.name}, using external URL -->
  <script src="${absoluteUrl}"></script>`);
        }
      } catch (error) {
        console.error(`Error fetching ${lib.name}:`, error);
        // Fallback to external URL
        const absoluteUrl = lib.url.startsWith('http')
          ? lib.url
          : `${window.location.origin}${lib.url}`;
        libraryScripts.push(`  <!-- Error embedding ${lib.name}, using external URL -->
  <script src="${absoluteUrl}"></script>`);
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

    console.log('📥 Download complete! File is now fully standalone.');
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
    // Convert relative URLs to absolute URLs for blob iframe context
    const libraryScripts = enabledLibraries
      .map(lib => {
        const absoluteUrl = lib.url.startsWith('http')
          ? lib.url
          : `${window.location.origin}${lib.url}`;
        return `  <script src="${absoluteUrl}"></script>`;
      })
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
${libraryScripts}
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
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    iframe.src = URL.createObjectURL(blob);
  }

  ngAfterViewInit(): void {
    // Load saved state
    this.loadState();

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

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.codeInsertSubscription) {
      this.codeInsertSubscription.unsubscribe();
    }
    // Clean up save timeout
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
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
