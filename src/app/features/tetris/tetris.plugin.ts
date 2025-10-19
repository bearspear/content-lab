/**
 * Tetris Game Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '../../core/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'tetris',
  name: 'Tetris Game',
  description: 'Classic block puzzle game with keyboard controls',
  version: '1.0.0',
  category: ToolCategory.Games,
  route: '/tools/tetris',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v7h7V4zM20 4h-7v7h7V4zM11 13H4v7h7v-7zM20 13h-7v7h7v-7z" />
  </svg>`
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./tetris.component').then(m => m.TetrisComponent)
};
