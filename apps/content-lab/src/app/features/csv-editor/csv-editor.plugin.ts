/**
 * CSV Editor Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '@content-lab/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'csv-editor',
  name: 'CSV Editor',
  description: 'Edit CSV data with table view and validation',
  version: '1.0.0',
  category: ToolCategory.DataText,
  route: '/tools/csv-editor',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
  </svg>`
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./csv-editor.component').then(m => m.CsvEditorComponent)
};
