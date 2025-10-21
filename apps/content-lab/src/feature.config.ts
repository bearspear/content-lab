/**
 * Full Feature Build Configuration
 *
 * Complete build with ALL features enabled.
 * Best for local development and full-featured deployments.
 *
 * Estimated bundle size: ~1.04 MB
 *
 * Other available configs:
 * - configs/lightweight.config.ts (~600-800 KB)
 * - configs/developer.config.ts (~900 KB)
 * - configs/writer.config.ts (~800 KB)
 */

import { FeatureBuildConfig } from './app/core/plugin-system/feature-config.interface';

const config: FeatureBuildConfig = {
  buildName: 'content-lab-full',
  version: '1.0.0',

  metadata: {
    description: 'Full build with all features enabled',
    author: 'Michael Behringer',
    tags: ['full', 'complete', 'all-features']
  },

  // All features enabled by default
  features: {
    // Content & Design
    'markdown-to-html': { enabled: true },
    'markdown-converter': { enabled: false }, // No main component file - has subcomponents only
    'text-editor': { enabled: true },
    'svg-editor': { enabled: true },

    // Code & Development
    'js-playground': { enabled: true },
    'json-editor': { enabled: true },
    'regex-tester': { enabled: true },
    'diff-checker': { enabled: true },

    // Data & Text
    'csv-editor': { enabled: true },
    'word-counter': { enabled: true },

    // Utilities
    'base64-encoder': { enabled: true },
    'world-clock': { enabled: true },
    'flac-player': { enabled: true },

    // Visualizations
    'timeline-visualizer': { enabled: true },
    'globe-visualizer': { enabled: true },
    'star-map': { enabled: true },

    // Games
    'tetris': { enabled: true }
  },

  // Optional: Global configuration for features
  featureConfig: {
    // Monaco editor configuration
    'monaco-editor': {
      themes: ['vs', 'vs-dark', 'hc-black'],
      defaultTheme: 'vs-dark'
    }
  }
};

export default config;
