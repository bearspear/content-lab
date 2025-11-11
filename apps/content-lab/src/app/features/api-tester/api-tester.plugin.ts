import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '@content-lab/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'api-tester',
  name: 'API Endpoint Tester',
  description: 'Full-featured HTTP API testing tool with request builder, response viewer, and command import support',
  version: '1.0.0',
  category: ToolCategory.CodeDev,
  route: '/tools/api-tester',
  badge: 'NEW',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12h18M3 6h18M3 18h18"/>
    <circle cx="7" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>`,
  dependencies: []
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./api-tester.component').then(m => m.ApiTesterComponent)
};
