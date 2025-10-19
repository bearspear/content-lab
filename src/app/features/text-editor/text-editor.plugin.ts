/**
 * Text Editor Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'text-editor',
  name: 'Text Editor',
  description: 'Rich text editor with syntax highlighting and multiple languages',
  version: '1.0.0',
  category: ToolCategory.ContentDesign,
  route: '/tools/text-editor',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>`,
  dependencies: ['monaco-editor']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./text-editor.component').then(m => m.TextEditorComponent)
};
