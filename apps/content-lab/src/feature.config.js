/**
 * Feature Configuration
 * Controls which features are enabled in the application
 */

export default {
  features: {
    'markdown-to-html': { enabled: true },
    'text-editor': { enabled: true },
    'svg-editor': { enabled: true },
    'js-playground': { enabled: true },
    'json-editor': { enabled: true },
    'regex-tester': { enabled: true },
    'diff-checker': { enabled: true },
    'csv-editor': { enabled: true },
    'word-counter': { enabled: true },
    'base64-encoder': { enabled: true },
    'world-clock': { enabled: true },
    'flac-player': { enabled: true },
    'timeline-visualizer': { enabled: true },
    'globe-visualizer': { enabled: true },
    'star-map': { enabled: true },
    'tetris': { enabled: true },
    'epub-to-pdf': { enabled: true },
    'api-tester': { enabled: true },
    'prompt-builder': { enabled: true },
    // TODO: web-capture disabled temporarily - needs plugin file creation
    // Backend APIs functional, but frontend components incomplete
    // See: apps/server/src/api/routes/web-capture.routes.js (backend working)
    // See: apps/content-lab/src/app/features/web-capture/components/ (frontend incomplete)
    // To enable: Create web-capture.plugin.ts following standard plugin pattern
    'web-capture': { enabled: false }
  }
};
