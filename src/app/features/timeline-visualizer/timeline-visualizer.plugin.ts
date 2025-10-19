/**
 * Timeline Visualizer Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'timeline-visualizer',
  name: 'Timeline Visualizer',
  description: 'Create interactive timelines with events and milestones',
  version: '1.0.0',
  category: ToolCategory.Visualizations,
  route: '/tools/timeline-visualizer',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./timeline-visualizer.component').then(m => m.TimelineVisualizerComponent)
};
