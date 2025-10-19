/**
 * Base64 Encoder Plugin Definition
 * Simple plugin with no external dependencies (uses Monaco which is bundled)
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'base64-encoder',
  name: 'Base64 Encoder',
  description: 'Encode/decode Base64 strings with multiple formats and file support',
  version: '1.0.0',
  category: ToolCategory.Utilities,
  route: '/tools/base64-encoder',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>`,
  dependencies: ['monaco-editor']
};

export const plugin: FeaturePlugin = {
  metadata,

  loadComponent: () => import('./base64-encoder.component')
    .then(m => m.Base64EncoderComponent),

  onActivate: () => {
    console.log('[Base64Encoder] Plugin activated');
  },

  onDeactivate: () => {
    console.log('[Base64Encoder] Plugin deactivated');
  },

  config: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    defaultEncoding: 'utf-8',
    defaultVariant: 'standard'
  }
};
