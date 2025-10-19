/**
 * Developer Build Configuration
 *
 * Focused on code development and testing tools.
 * Perfect for developers who need coding utilities.
 *
 * Estimated bundle size: ~900 KB
 */

import { FeatureBuildConfig } from './app/core/plugin-system/feature-config.interface';

const config: FeatureBuildConfig = {
  buildName: 'content-lab-developer',
  version: '1.0.0',

  metadata: {
    description: 'Developer-focused build with code and testing tools',
    author: 'Marcus Behringer',
    tags: ['developer', 'code', 'testing']
  },

  // Developer-focused features
  features: {
    // Content & Design - Text editor only
    'markdown-to-html': { enabled: false },
    'markdown-converter': { enabled: false },
    'text-editor': { enabled: true },       // For general editing
    'svg-editor': { enabled: false },

    // Code & Development - ALL enabled
    'js-playground': { enabled: true },     // Core dev tool
    'json-editor': { enabled: true },       // Essential for APIs
    'regex-tester': { enabled: true },      // Testing tool
    'diff-checker': { enabled: true },      // Compare code

    // Data & Text - CSV for data work
    'csv-editor': { enabled: true },        // Data manipulation
    'word-counter': { enabled: false },

    // Utilities - Developer utilities
    'base64-encoder': { enabled: true },    // Encoding/decoding
    'world-clock': { enabled: true },       // Timezone work
    'flac-player': { enabled: false },

    // Visualizations - Disabled
    'timeline-visualizer': { enabled: false },
    'globe-visualizer': { enabled: false },
    'star-map': { enabled: false },

    // Games - For breaks!
    'tetris': { enabled: true }             // Developer downtime
  },

  // Monaco editor configuration (dev-optimized)
  featureConfig: {
    'monaco-editor': {
      themes: ['vs', 'vs-dark', 'hc-black'],  // All themes for dev
      defaultTheme: 'vs-dark'
    }
  }
};

export default config;
