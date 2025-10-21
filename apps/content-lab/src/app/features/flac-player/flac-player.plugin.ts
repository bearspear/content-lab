/**
 * FLAC Player Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '@content-lab/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'flac-player',
  name: 'FLAC Player',
  description: 'Professional audio player with CUE sheet support and waveform visualization',
  version: '1.0.0',
  category: ToolCategory.Utilities,
  route: '/tools/flac-player',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
  </svg>`,
  badge: 'NEW',
  badgeClass: 'new'
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./flac-player.component').then(m => m.FlacPlayerComponent)
};
