/**
 * JSON Editor Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'json-editor',
  name: 'JSON Editor',
  description: 'Format, validate, and edit JSON with Monaco editor',
  version: '1.0.0',
  category: ToolCategory.CodeDev,
  route: '/tools/json-editor',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
  </svg>`,
  dependencies: ['monaco-editor']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./json-editor.component').then(m => m.JsonEditorComponent)
};
