/**
 * Lightweight Build Configuration
 *
 * Minimal feature set for fastest loading and smallest bundle size.
 * Perfect for embedding or quick deployments.
 *
 * Estimated bundle size: ~600-800 KB
 */

import { FeatureBuildConfig } from '../app/core/plugin-system/feature-config.interface';

const config: FeatureBuildConfig = {
  buildName: 'content-lab-lightweight',
  version: '1.0.0',

  metadata: {
    description: 'Lightweight build with essential tools only',
    author: 'Michael Behringer',
    tags: ['minimal', 'essential', 'fast']
  },

  // Only essential features enabled
  features: {
    // Content & Design - Essential
    'markdown-to-html': { enabled: true },  // Core feature
    'markdown-converter': { enabled: false },
    'text-editor': { enabled: true },       // Essential
    'svg-editor': { enabled: false },

    // Code & Development - Disabled for lightweight
    'js-playground': { enabled: false },
    'json-editor': { enabled: false },
    'regex-tester': { enabled: false },
    'diff-checker': { enabled: false },

    // Data & Text - Essential only
    'csv-editor': { enabled: false },
    'word-counter': { enabled: true },      // Lightweight tool

    // Utilities - One essential
    'base64-encoder': { enabled: true },    // Small, useful
    'world-clock': { enabled: false },
    'flac-player': { enabled: false },

    // Visualizations - All disabled
    'timeline-visualizer': { enabled: false },
    'globe-visualizer': { enabled: false },
    'star-map': { enabled: false },

    // Games - Disabled
    'tetris': { enabled: false }
  },

  // Monaco editor configuration (lightweight settings)
  featureConfig: {
    'monaco-editor': {
      themes: ['vs-dark'],  // Only one theme to reduce size
      defaultTheme: 'vs-dark'
    }
  }
};

export default config;
