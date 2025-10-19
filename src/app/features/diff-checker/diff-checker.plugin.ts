/**
 * Diff Checker Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'diff-checker',
  name: 'Diff Checker',
  description: 'Compare text with inline and side-by-side diff views',
  version: '1.0.0',
  category: ToolCategory.CodeDev,
  route: '/tools/diff-checker',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
  </svg>`,
  dependencies: ['monaco-editor']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./diff-checker.component').then(m => m.DiffCheckerComponent)
};
