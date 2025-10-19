/**
 * SVG Editor Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'svg-editor',
  name: 'SVG Editor',
  description: 'Edit and preview SVG code with live rendering',
  version: '1.0.0',
  category: ToolCategory.ContentDesign,
  route: '/tools/svg-editor',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>`,
  dependencies: ['monaco-editor']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./svg-editor.component').then(m => m.SvgEditorComponent)
};
