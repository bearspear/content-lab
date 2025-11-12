import { Routes } from '@angular/router';
import { FeaturePlugin } from '@content-lab/plugin-system';
import featureConfig from '../feature.config.js';
import type { FeatureConfig } from './core/plugin-system/feature-config.interface';

/**
 * PLUGIN REGISTRATION REQUIREMENTS
 *
 * When adding a new plugin, you MUST register it in 3 places:
 * 1. Add import statement below (line ~7-24)
 * 2. Add to allPlugins map (line ~30-48)
 * 3. Add to pluginPaths in feature-loader.service.ts
 *
 * VALIDATION: Run `npm run validate:plugins` to verify registration
 * GUIDE: See docs/PLUGIN_DEVELOPMENT_GUIDE.md for detailed instructions
 *
 * Missing any of these steps will cause "orphaned plugins" that are enabled
 * but not accessible. The validation script will catch this before build/start.
 */

// Import enabled plugin metadata (generated based on feature configuration)
import { plugin as markdownToHtmlPlugin } from './features/markdown-to-html/markdown-to-html.plugin';
import { plugin as textEditorPlugin } from './features/text-editor/text-editor.plugin';
import { plugin as svgEditorPlugin } from './features/svg-editor/svg-editor.plugin';
import { plugin as jsPlaygroundPlugin } from './features/js-playground/js-playground.plugin';
import { plugin as jsonEditorPlugin } from './features/json-editor/json-editor.plugin';
import { plugin as regexTesterPlugin } from './features/regex-tester/regex-tester.plugin';
import { plugin as diffCheckerPlugin } from './features/diff-checker/diff-checker.plugin';
import { plugin as csvEditorPlugin } from './features/csv-editor/csv-editor.plugin';
import { plugin as wordCounterPlugin } from './features/word-counter/word-counter.plugin';
import { plugin as base64EncoderPlugin } from './features/base64-encoder/base64-encoder.plugin';
import { plugin as worldClockPlugin } from './features/world-clock/world-clock.plugin';
import { plugin as flacPlayerPlugin } from './features/flac-player/flac-player.plugin';
import { plugin as timelineVisualizerPlugin } from './features/timeline-visualizer/timeline-visualizer.plugin';
import { plugin as globeVisualizerPlugin } from './features/globe-visualizer/globe-visualizer.plugin';
import { plugin as starMapPlugin } from './features/star-map/star-map.plugin';
import { plugin as tetrisPlugin } from './features/tetris/tetris.plugin';
import { plugin as apiTesterPlugin } from './features/api-tester/api-tester.plugin';
import { plugin as epubToPdfPlugin } from './features/epub-to-pdf/epub-to-pdf.plugin';

/**
 * Map of enabled plugins by feature ID
 * Only features enabled in feature.config.ts are imported
 *
 * ⚠️  IMPORTANT: When adding a plugin, add it here AND in feature-loader.service.ts
 * Run `npm run validate:plugins` to verify all registrations are correct
 */
const allPlugins: Record<string, FeaturePlugin> = {
  'markdown-to-html': markdownToHtmlPlugin,
  'text-editor': textEditorPlugin,
  'svg-editor': svgEditorPlugin,
  'js-playground': jsPlaygroundPlugin,
  'json-editor': jsonEditorPlugin,
  'regex-tester': regexTesterPlugin,
  'diff-checker': diffCheckerPlugin,
  'csv-editor': csvEditorPlugin,
  'word-counter': wordCounterPlugin,
  'base64-encoder': base64EncoderPlugin,
  'world-clock': worldClockPlugin,
  'flac-player': flacPlayerPlugin,
  'timeline-visualizer': timelineVisualizerPlugin,
  'globe-visualizer': globeVisualizerPlugin,
  'star-map': starMapPlugin,
  'tetris': tetrisPlugin,
  'api-tester': apiTesterPlugin,
  'epub-to-pdf': epubToPdfPlugin
};

/**
 * Features that should be preloaded for better UX
 */
const preloadFeatures = new Set([
  'markdown-to-html',
  'text-editor',
  'world-clock'
]);

/**
 * Dynamically generate routes from enabled plugins
 */
function generateRoutes(): Routes {
  const pluginRoutes: Routes = [];

  // Get enabled features from configuration
  const enabledFeatures = Object.entries(featureConfig.features)
    .filter(([_, config]: [string, FeatureConfig]) => config.enabled)
    .map(([featureId, _]) => featureId);

  console.log(`[Routes] Generating routes for ${enabledFeatures.length} enabled features`);

  // Generate route for each enabled plugin
  for (const featureId of enabledFeatures) {
    const plugin = allPlugins[featureId];

    if (!plugin) {
      console.warn(`[Routes] Plugin not found for feature: ${featureId}`);
      continue;
    }

    // Remove leading slash if present to avoid double slashes
    const path = plugin.metadata.route.startsWith('/')
      ? plugin.metadata.route.substring(1)
      : plugin.metadata.route;

    pluginRoutes.push({
      path: path,
      loadComponent: plugin.loadComponent,
      data: {
        preload: preloadFeatures.has(featureId),
        pluginId: featureId,
        pluginName: plugin.metadata.name
      }
    });
  }

  return [
    // Default redirect to first enabled feature (or markdown-to-html as fallback)
    {
      path: '',
      redirectTo: pluginRoutes.length > 0
        ? pluginRoutes[0].path
        : 'tools/md-html',
      pathMatch: 'full'
    },
    // All plugin routes
    ...pluginRoutes,
    // Web Capture Gallery (additional route)
    {
      path: 'tools/web-capture/gallery',
      loadComponent: () => import('./features/web-capture/components/capture-gallery/capture-gallery.component').then(m => m.CaptureGalleryComponent),
      data: {
        pluginId: 'web-capture-gallery',
        pluginName: 'Capture Gallery'
      }
    },
    // Web Capture Viewer (additional route with parameter)
    {
      path: 'tools/web-capture/view/:id',
      loadComponent: () => import('./features/web-capture/components/capture-viewer/capture-viewer.component').then(m => m.CaptureViewerComponent),
      data: {
        pluginId: 'web-capture-viewer',
        pluginName: 'Capture Viewer'
      }
    },
    // Catch-all redirect
    {
      path: '**',
      redirectTo: pluginRoutes.length > 0
        ? pluginRoutes[0].path
        : 'tools/md-html'
    }
  ];
}

export const routes: Routes = generateRoutes();
