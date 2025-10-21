/**
 * @content-lab/components
 *
 * Reusable Angular components for Content Lab
 * Import individual components as needed in your Angular projects
 *
 * @example
 * ```typescript
 * import { MarkdownToHtmlComponent, TextEditorComponent } from '@content-lab/components';
 *
 * @Component({
 *   imports: [MarkdownToHtmlComponent, TextEditorComponent],
 *   // ...
 * })
 * ```
 */

// Content & Design Components
export * from './lib/markdown-to-html/markdown-to-html.component';
export * from './lib/text-editor/text-editor.component';
export * from './lib/svg-editor/svg-editor.component';

// Code & Development Components
export * from './lib/js-playground/js-playground.component';
export * from './lib/json-editor/json-editor.component';
export * from './lib/regex-tester/regex-tester.component';
export * from './lib/diff-checker/diff-checker.component';

// Data & Text Components
export * from './lib/csv-editor/csv-editor.component';
export * from './lib/word-counter/word-counter.component';

// Utility Components
export * from './lib/base64-encoder/base64-encoder.component';
export * from './lib/world-clock/world-clock.component';
export * from './lib/flac-player/flac-player.component';

// Visualization Components
export * from './lib/timeline-visualizer/timeline-visualizer.component';
export * from './lib/globe-visualizer/globe-visualizer.component';
export * from './lib/star-map/star-map.component';

// Game Components
export * from './lib/tetris/tetris.component';

// Note: Markdown Converter has sub-components but no main component
// Export sub-components individually if needed

// Re-export models and interfaces that components use (only existing files)
export * from './lib/timeline-visualizer/models/timeline-event.model';
export * from './lib/timeline-visualizer/models/timeline-state.model';
export * from './lib/globe-visualizer/models/globe-state.model';
export * from './lib/globe-visualizer/models/location-pin.model';
// Note: texture-repository.model exports duplicate TextureResolution, already in globe-state.model
export * from './lib/star-map/models/star-map-state.model';
export * from './lib/star-map/models/celestial-object.model';
export * from './lib/star-map/models/sky-highlights.model';
export * from './lib/flac-player/models/cue-data.model';
export * from './lib/word-counter/models/word-counter-state.model';
export * from './lib/world-clock/models/clock-config.model';
export * from './lib/world-clock/models/moon-phase.model';
