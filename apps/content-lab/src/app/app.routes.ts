import { Routes } from '@angular/router';
import { FeaturePlugin } from '@content-lab/plugin-system';
import featureConfig from '../feature.config.js';

// Import all plugin metadata for route generation
import { plugin as markdownToHtmlPlugin } from './features/markdown-to-html/markdown-to-html.plugin';
// markdown-converter has no main component - only subcomponents
// import { plugin as markdownConverterPlugin } from './features/markdown-converter/markdown-converter.plugin';
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

/**
 * Map of all available plugins by feature ID
 */
const allPlugins: Record<string, FeaturePlugin> = {
  'markdown-to-html': markdownToHtmlPlugin,
  // 'markdown-converter': markdownConverterPlugin, // Disabled - no main component
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
  'tetris': tetrisPlugin
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
    .filter(([_, config]) => config.enabled)
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
