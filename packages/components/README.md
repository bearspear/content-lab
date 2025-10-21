# @content-lab/components

Reusable Angular components for Content Lab. Import individual components into your Angular projects just like PrimeNG.

## Features

17 standalone Angular components for content creation, development, and visualization:

### Content & Design
- **MarkdownToHtmlComponent** - Convert markdown to HTML with live preview
- **TextEditorComponent** - Monaco-based code editor with syntax highlighting
- **SvgEditorComponent** - Visual SVG creation and manipulation

### Code & Development
- **JsPlaygroundComponent** - Interactive JavaScript sandbox
- **JsonEditorComponent** - JSON formatting and validation
- **RegexTesterComponent** - Regular expression testing
- **DiffCheckerComponent** - Side-by-side text comparison

### Data & Text
- **CsvEditorComponent** - Spreadsheet-like CSV manipulation
- **WordCounterComponent** - Text analysis and statistics

### Utilities
- **Base64EncoderComponent** - Encode/decode base64 data
- **WorldClockComponent** - Multi-timezone clock display
- **FlacPlayerComponent** - High-fidelity audio player with CUE support

### Visualizations
- **TimelineVisualizerComponent** - Interactive event timeline creator
- **GlobeVisualizerComponent** - 3D globe with location markers
- **StarMapComponent** - Astronomical star chart and planetarium

### Games
- **TetrisComponent** - Classic Tetris game

## Installation

### Option 1: Use Locally (npm link)

From the monorepo root:

```bash
# Link the package locally
cd packages/components
npm link

# In your other Angular project
cd /path/to/your/project
npm link @content-lab/components
```

### Option 2: Install from npm (after publishing)

```bash
npm install @content-lab/components @content-lab/core @content-lab/styles
```

## Usage

### Basic Import

```typescript
import { Component } from '@angular/core';
import { MarkdownToHtmlComponent } from '@content-lab/components';

@Component({
  selector: 'app-my-page',
  standalone: true,
  imports: [MarkdownToHtmlComponent],
  template: `
    <h1>My Markdown Editor</h1>
    <app-markdown-to-html></app-markdown-to-html>
  `
})
export class MyPageComponent { }
```

### Multiple Components

```typescript
import { Component } from '@angular/core';
import {
  TextEditorComponent,
  JsonEditorComponent,
  DiffCheckerComponent
} from '@content-lab/components';

@Component({
  selector: 'app-developer-tools',
  standalone: true,
  imports: [TextEditorComponent, JsonEditorComponent, DiffCheckerComponent],
  template: `
    <h1>Developer Tools</h1>

    <section>
      <h2>Code Editor</h2>
      <app-text-editor></app-text-editor>
    </section>

    <section>
      <h2>JSON Validator</h2>
      <app-json-editor></app-json-editor>
    </section>

    <section>
      <h2>Compare Code</h2>
      <app-diff-checker></app-diff-checker>
    </section>
  `
})
export class DeveloperToolsComponent { }
```

### With Routing

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'markdown',
    loadComponent: () => import('@content-lab/components').then(m => m.MarkdownToHtmlComponent)
  },
  {
    path: 'editor',
    loadComponent: () => import('@content-lab/components').then(m => m.TextEditorComponent)
  },
  {
    path: 'visualize',
    loadComponent: () => import('@content-lab/components').then(m => m.TimelineVisualizerComponent)
  }
];
```

## Component Selectors

All components use the standard `app-*` selector format:

- `<app-markdown-to-html></app-markdown-to-html>`
- `<app-text-editor></app-text-editor>`
- `<app-svg-editor></app-svg-editor>`
- `<app-js-playground></app-js-playground>`
- `<app-json-editor></app-json-editor>`
- `<app-regex-tester></app-regex-tester>`
- `<app-diff-checker></app-diff-checker>`
- `<app-csv-editor></app-csv-editor>`
- `<app-word-counter></app-word-counter>`
- `<app-base64-encoder></app-base64-encoder>`
- `<app-world-clock></app-world-clock>`
- `<app-flac-player></app-flac-player>`
- `<app-timeline-visualizer></app-timeline-visualizer>`
- `<app-globe-visualizer></app-globe-visualizer>`
- `<app-star-map></app-star-map>`
- `<app-tetris></app-tetris>`

## State Persistence

All components automatically save their state to localStorage. Each component has a unique TOOL_ID and manages its own state:

```typescript
// State is automatically saved when user makes changes
// No additional configuration needed!
```

## Dependencies

### Required Peer Dependencies

```json
{
  "@angular/core": "^17.0.0",
  "@angular/common": "^17.0.0",
  "@angular/forms": "^17.0.0",
  "rxjs": "^7.0.0"
}
```

### Included Dependencies

All component-specific dependencies are included:
- Monaco Editor (code editing)
- Three.js (3D visualizations)
- Astronomy Engine (star map calculations)
- Marked (markdown parsing)
- And more...

## Styling

Components use the `@content-lab/styles` package for consistent theming. You can import global styles:

```scss
// In your styles.scss
@import '@content-lab/styles';

// Or import specific partials
@import '@content-lab/styles/variables';
@import '@content-lab/styles/mixins';
```

### Dark/Light Theme Support

Components support both light and dark themes via CSS variables:

```typescript
import { ThemeService } from '@content-lab/core';

@Component({...})
export class MyComponent {
  constructor(private themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
```

## Tree-Shaking

Only the components you import will be included in your bundle. Each component is standalone and independently bundled.

```typescript
// Only MarkdownToHtmlComponent and its dependencies are bundled
import { MarkdownToHtmlComponent } from '@content-lab/components';
```

## TypeScript Support

Full TypeScript support with type definitions included:

```typescript
import {
  MarkdownToHtmlComponent,
  MarkdownState,  // State interface
  TimelineVisualizerComponent,
  TimelineEvent,   // Model interface
  TimelineState
} from '@content-lab/components';
```

## Examples

### Content Creation App

```typescript
import { Component } from '@angular/core';
import {
  MarkdownToHtmlComponent,
  TextEditorComponent,
  WordCounterComponent
} from '@content-lab/components';

@Component({
  selector: 'app-writer',
  standalone: true,
  imports: [MarkdownToHtmlComponent, TextEditorComponent, WordCounterComponent],
  template: `
    <div class="writer-workspace">
      <app-markdown-to-html></app-markdown-to-html>
      <app-word-counter></app-word-counter>
    </div>
  `
})
export class WriterWorkspaceComponent { }
```

### Developer Dashboard

```typescript
import { Component } from '@angular/core';
import {
  JsPlaygroundComponent,
  JsonEditorComponent,
  RegexTesterComponent,
  DiffCheckerComponent
} from '@content-lab/components';

@Component({
  selector: 'app-dev-dashboard',
  standalone: true,
  imports: [JsPlaygroundComponent, JsonEditorComponent, RegexTesterComponent, DiffCheckerComponent],
  template: `
    <mat-tab-group>
      <mat-tab label="JS Playground">
        <app-js-playground></app-js-playground>
      </mat-tab>
      <mat-tab label="JSON">
        <app-json-editor></app-json-editor>
      </mat-tab>
      <mat-tab label="Regex">
        <app-regex-tester></app-regex-tester>
      </mat-tab>
      <mat-tab label="Diff">
        <app-diff-checker></app-diff-checker>
      </mat-tab>
    </mat-tab-group>
  `
})
export class DevDashboardComponent { }
```

### Data Visualization Portal

```typescript
import { Component } from '@angular/core';
import {
  TimelineVisualizerComponent,
  GlobeVisualizerComponent,
  StarMapComponent
} from '@content-lab/components';

@Component({
  selector: 'app-viz-portal',
  standalone: true,
  imports: [TimelineVisualizerComponent, GlobeVisualizerComponent, StarMapComponent],
  template: `
    <div class="visualization-grid">
      <app-timeline-visualizer></app-timeline-visualizer>
      <app-globe-visualizer></app-globe-visualizer>
      <app-star-map></app-star-map>
    </div>
  `
})
export class VizPortalComponent { }
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES2020
- CSS Grid
- CSS Custom Properties
- WebGL (for 3D visualizations)
- Web Audio API (for FLAC player)

## Bundle Sizes

Individual component bundle sizes (approximate):

- **Lightweight** (< 100 KB): Base64Encoder, WordCounter
- **Medium** (100-200 KB): MarkdownToHtml, TextEditor, JsonEditor
- **Heavy** (200+ KB): StarMap, GlobeVisualizer (includes 3D libraries)

## Publishing

To publish this package to npm:

```bash
# From packages/components
npm login
npm publish --access public
```

## Local Development

### Testing in Another Project

1. **Link the package:**
   ```bash
   cd packages/components
   npm link
   ```

2. **Link in your test project:**
   ```bash
   cd /path/to/test-project
   npm link @content-lab/components
   ```

3. **Import and use:**
   ```typescript
   import { MarkdownToHtmlComponent } from '@content-lab/components';
   ```

4. **Unlink when done:**
   ```bash
   cd /path/to/test-project
   npm unlink @content-lab/components

   cd packages/components
   npm unlink
   ```

## License

MIT License - see LICENSE file for details

## Author

Michael Behringer

## Contributing

Contributions are welcome! Please see the main Content Lab repository for contribution guidelines.

## Links

- **Documentation:** [Developer Guide](../../docs/DEVELOPER-GUIDE.md)
- **Repository:** https://github.com/yourusername/content-lab
- **Issues:** https://github.com/yourusername/content-lab/issues

## Changelog

### 1.0.0 (2025-10-20)
- Initial release
- 17 standalone components
- Full TypeScript support
- State persistence
- Theme support
- Tree-shaking enabled
