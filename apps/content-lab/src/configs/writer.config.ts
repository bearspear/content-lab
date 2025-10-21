/**
 * Writer Build Configuration
 *
 * Optimized for content creation and writing.
 * Perfect for bloggers, technical writers, and content creators.
 *
 * Estimated bundle size: ~800 KB
 */

import { FeatureBuildConfig } from '../app/core/plugin-system/feature-config.interface';

const config: FeatureBuildConfig = {
  buildName: 'content-lab-writer',
  version: '1.0.0',

  metadata: {
    description: 'Writer-focused build for content creation',
    author: 'Michael Behringer',
    tags: ['writer', 'content', 'publishing']
  },

  // Writer-focused features
  features: {
    // Content & Design - ALL enabled
    'markdown-to-html': { enabled: true },  // Primary tool
    'markdown-converter': { enabled: false },
    'text-editor': { enabled: true },       // General writing
    'svg-editor': { enabled: true },        // Graphics/diagrams

    // Code & Development - Minimal
    'js-playground': { enabled: false },
    'json-editor': { enabled: false },
    'regex-tester': { enabled: false },
    'diff-checker': { enabled: false },

    // Data & Text - Writing tools
    'csv-editor': { enabled: false },
    'word-counter': { enabled: true },      // Essential for writers

    // Utilities - Minimal
    'base64-encoder': { enabled: false },
    'world-clock': { enabled: true },       // For remote writers
    'flac-player': { enabled: false },

    // Visualizations - Timeline for content planning
    'timeline-visualizer': { enabled: true }, // Content planning
    'globe-visualizer': { enabled: false },
    'star-map': { enabled: false },

    // Games - Disabled
    'tetris': { enabled: false }
  },

  // Monaco editor configuration (writer-optimized)
  featureConfig: {
    'monaco-editor': {
      themes: ['vs', 'vs-dark'],  // Light and dark for writing
      defaultTheme: 'vs'          // Light theme default for reading
    }
  }
};

export default config;
