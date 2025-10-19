/**
 * JavaScript Playground Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'js-playground',
  name: 'JS Playground',
  description: 'Run JavaScript code with instant console output',
  version: '1.0.0',
  category: ToolCategory.CodeDev,
  route: '/tools/js-playground',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
  </svg>`,
  dependencies: ['monaco-editor']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./js-playground.component').then(m => m.JsPlaygroundComponent)
};
