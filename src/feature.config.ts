/**
 * Default Feature Build Configuration
 * This configuration enables ALL features (full build)
 */

import { FeatureBuildConfig } from './app/core/plugin-system/feature-config.interface';

const config: FeatureBuildConfig = {
  buildName: 'content-lab-full',
  version: '1.0.0',

  metadata: {
    description: 'Full build with all features enabled',
    author: 'Marcus Behringer'
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
