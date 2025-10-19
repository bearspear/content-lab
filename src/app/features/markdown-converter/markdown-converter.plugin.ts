/**
 * Markdown Converter Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'markdown-converter',
  name: 'Markdown Converter',
  description: 'Convert between Markdown and HTML with advanced options',
  version: '1.0.0',
  category: ToolCategory.ContentDesign,
  route: '/tools/markdown-converter',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>`,
  dependencies: ['marked']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./markdown-converter.component').then(m => m.MarkdownConverterComponent)
};
