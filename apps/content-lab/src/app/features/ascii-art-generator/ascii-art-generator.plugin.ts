/**
 * ASCII Art Generator Plugin
 * Comprehensive tool for creating ASCII art, charts, graphs, and tables
 */

import { FeaturePlugin, ToolCategory } from '@content-lab/plugin-system';

export const plugin: FeaturePlugin = {
  metadata: {
    id: 'ascii-art-generator',
    name: 'ASCII Art Generator',
    description: 'Create ASCII art, charts, graphs, and tables with multiple styles and export options',
    version: '1.0.0',
    category: ToolCategory.Visualizations,
    route: '/tools/ascii-art-generator',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"></polyline>
      <line x1="9" y1="20" x2="15" y2="20"></line>
      <line x1="12" y1="4" x2="12" y2="20"></line>
      <path d="M8 12h8"></path>
      <path d="M10 16h4"></path>
    </svg>`,
    dependencies: ['figlet'],
    badge: 'NEW',
    badgeClass: 'badge-new'
  },

  loadComponent: () => import('./ascii-art-generator.component')
    .then(m => m.AsciiArtGeneratorComponent),

  onInitialize: async () => {
    console.log('[ASCII Art Generator] Initializing plugin...');
    // Preload figlet fonts
    console.log('[ASCII Art Generator] Plugin initialized');
  },

  onActivate: () => {
    console.log('[ASCII Art Generator] Plugin activated');
  },

  onDeactivate: () => {
    console.log('[ASCII Art Generator] Plugin deactivated');
  },

  config: {
    defaultFont: 'Standard',
    defaultChartWidth: 60,
    defaultChartHeight: 20,
    maxHistoryItems: 50
  }
};
