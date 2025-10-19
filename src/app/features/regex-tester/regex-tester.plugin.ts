/**
 * Regex Tester Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'regex-tester',
  name: 'Regex Tester',
  description: 'Test regular expressions with highlighting and match details',
  version: '1.0.0',
  category: ToolCategory.CodeDev,
  route: '/tools/regex-tester',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>`
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./regex-tester.component').then(m => m.RegexTesterComponent)
};
