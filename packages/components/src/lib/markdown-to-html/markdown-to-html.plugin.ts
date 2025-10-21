/**
 * Markdown to HTML Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '@content-lab/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'markdown-to-html',
  name: 'Markdown to HTML',
  description: 'Convert Markdown to HTML with live preview',
  version: '1.0.0',
  category: ToolCategory.ContentDesign,
  route: '/tools/md-html',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
  </svg>`,
  dependencies: ['monaco-editor', 'marked']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./markdown-to-html.component').then(m => m.MarkdownToHtmlComponent)
};
