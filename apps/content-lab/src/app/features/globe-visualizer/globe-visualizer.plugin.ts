/**
 * Globe Visualizer Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'globe-visualizer',
  name: 'Globe Visualizer',
  description: '3D interactive globe with location markers and animations',
  version: '1.0.0',
  category: ToolCategory.Visualizations,
  route: '/tools/globe-visualizer',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" stroke-width="2"/>
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>`,
  dependencies: ['three']
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./globe-visualizer.component').then(m => m.GlobeVisualizerComponent)
};
