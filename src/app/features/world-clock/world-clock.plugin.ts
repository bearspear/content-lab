/**
 * World Clock Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'world-clock',
  name: 'World Clock',
  description: 'View time zones and clocks from around the world',
  version: '1.0.0',
  category: ToolCategory.Utilities,
  route: '/tools/world-clock',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" stroke-width="2"/>
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2"/>
  </svg>`
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./world-clock.component').then(m => m.WorldClockComponent)
};
