import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tools/md-html',
    pathMatch: 'full'
  },
  {
    path: 'tools/md-html',
    loadComponent: () => import('./features/markdown-to-html/markdown-to-html.component')
      .then(m => m.MarkdownToHtmlComponent),
    data: { preload: true } // Preload this frequently used tool
  },
  {
    path: 'tools/text-editor',
    loadComponent: () => import('./features/text-editor/text-editor.component')
      .then(m => m.TextEditorComponent),
    data: { preload: true } // Preload this frequently used tool
  },
  {
    path: 'tools/js-playground',
    loadComponent: () => import('./features/js-playground/js-playground.component')
      .then(m => m.JsPlaygroundComponent)
  },
  {
    path: 'tools/json-editor',
    loadComponent: () => import('./features/json-editor/json-editor.component')
      .then(m => m.JsonEditorComponent)
  },
  {
    path: 'tools/csv-editor',
    loadComponent: () => import('./features/csv-editor/csv-editor.component')
      .then(m => m.CsvEditorComponent)
  },
  {
    path: 'tools/regex-tester',
    loadComponent: () => import('./features/regex-tester/regex-tester.component')
      .then(m => m.RegexTesterComponent)
  },
  {
    path: 'tools/base64-encoder',
    loadComponent: () => import('./features/base64-encoder/base64-encoder.component')
      .then(m => m.Base64EncoderComponent)
  },
  {
    path: 'tools/diff-checker',
    loadComponent: () => import('./features/diff-checker/diff-checker.component')
      .then(m => m.DiffCheckerComponent)
  },
  {
    path: 'tools/svg-editor',
    loadComponent: () => import('./features/svg-editor/svg-editor.component')
      .then(m => m.SvgEditorComponent)
  },
  {
    path: 'tools/timeline-visualizer',
    loadComponent: () => import('./features/timeline-visualizer/timeline-visualizer.component')
      .then(m => m.TimelineVisualizerComponent)
  },
  {
    path: 'tools/word-counter',
    loadComponent: () => import('./features/word-counter/word-counter.component')
      .then(m => m.WordCounterComponent)
  },
  {
    path: 'tools/globe-visualizer',
    loadComponent: () => import('./features/globe-visualizer/globe-visualizer.component')
      .then(m => m.GlobeVisualizerComponent)
  },
  {
    path: 'tools/tetris',
    loadComponent: () => import('./features/tetris/tetris.component')
      .then(m => m.TetrisComponent)
  },
  {
    path: 'tools/world-clock',
    loadComponent: () => import('./features/world-clock/world-clock.component')
      .then(m => m.WorldClockComponent),
    data: { preload: true } // Preload this useful tool
  },
  {
    path: 'tools/star-map',
    loadComponent: () => import('./features/star-map/star-map.component')
      .then(m => m.StarMapComponent)
  },
  {
    path: '**',
    redirectTo: 'tools/md-html'
  }
];
