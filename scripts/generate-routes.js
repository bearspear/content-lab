#!/usr/bin/env node

/**
 * Generate app.routes.ts based on feature configuration
 * This ensures only enabled features are imported and bundled
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const configPath = process.argv[2] || 'apps/content-lab/src/feature.config.ts';
const outputPath = process.argv[3] || 'apps/content-lab/src/app/app.routes.ts';

// Resolve paths relative to project root (parent of scripts directory)
const projectRoot = path.resolve(__dirname, '..');

// Feature ID to plugin path mapping
const PLUGIN_PATHS = {
  'markdown-to-html': './features/markdown-to-html/markdown-to-html.plugin',
  'text-editor': './features/text-editor/text-editor.plugin',
  'svg-editor': './features/svg-editor/svg-editor.plugin',
  'js-playground': './features/js-playground/js-playground.plugin',
  'json-editor': './features/json-editor/json-editor.plugin',
  'regex-tester': './features/regex-tester/regex-tester.plugin',
  'diff-checker': './features/diff-checker/diff-checker.plugin',
  'csv-editor': './features/csv-editor/csv-editor.plugin',
  'word-counter': './features/word-counter/word-counter.plugin',
  'base64-encoder': './features/base64-encoder/base64-encoder.plugin',
  'world-clock': './features/world-clock/world-clock.plugin',
  'flac-player': './features/flac-player/flac-player.plugin',
  'timeline-visualizer': './features/timeline-visualizer/timeline-visualizer.plugin',
  'globe-visualizer': './features/globe-visualizer/globe-visualizer.plugin',
  'star-map': './features/star-map/star-map.plugin',
  'tetris': './features/tetris/tetris.plugin',
  'epub-to-pdf': './features/epub-to-pdf/epub-to-pdf.plugin',
  'api-tester': './features/api-tester/api-tester.plugin',
  'web-capture': './features/web-capture/web-capture.plugin'
};

// Read and parse the feature config
function loadFeatureConfig(configFilePath) {
  const absolutePath = path.resolve(projectRoot, configFilePath);
  const content = fs.readFileSync(absolutePath, 'utf8');

  // Find the features object by matching braces
  const featuresStart = content.indexOf('features:');
  if (featuresStart === -1) {
    throw new Error('Could not find features object in config file');
  }

  // Find the opening brace
  const openBraceIndex = content.indexOf('{', featuresStart);
  if (openBraceIndex === -1) {
    throw new Error('Could not find opening brace for features object');
  }

  // Count braces to find the matching closing brace
  let braceCount = 1;
  let closeBraceIndex = openBraceIndex + 1;

  while (braceCount > 0 && closeBraceIndex < content.length) {
    if (content[closeBraceIndex] === '{') {
      braceCount++;
    } else if (content[closeBraceIndex] === '}') {
      braceCount--;
    }
    closeBraceIndex++;
  }

  if (braceCount !== 0) {
    throw new Error('Could not find matching closing brace for features object');
  }

  const featuresText = content.substring(openBraceIndex + 1, closeBraceIndex - 1);
  const enabledFeatures = [];

  // Extract enabled features using regex for both inline and multiline formats
  // Matches: 'feature-id': { enabled: true }
  const featureRegex = /'([^']+)':\s*\{\s*enabled:\s*(true|false)/g;
  let match;

  while ((match = featureRegex.exec(featuresText)) !== null) {
    const featureId = match[1];
    const isEnabled = match[2] === 'true';

    if (isEnabled) {
      enabledFeatures.push(featureId);
    }
  }

  return enabledFeatures;
}

// Generate the routes file
function generateRoutesFile(enabledFeatures, outputFilePath) {
  const absoluteOutputPath = path.resolve(projectRoot, outputFilePath);

  // Generate imports
  const imports = enabledFeatures
    .filter(featureId => PLUGIN_PATHS[featureId])
    .map(featureId => {
      const varName = featureId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) + 'Plugin';
      return `import { plugin as ${varName} } from '${PLUGIN_PATHS[featureId]}';`;
    })
    .join('\n');

  // Generate plugin map entries
  const pluginMapEntries = enabledFeatures
    .filter(featureId => PLUGIN_PATHS[featureId])
    .map(featureId => {
      const varName = featureId.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()) + 'Plugin';
      return `  '${featureId}': ${varName}`;
    })
    .join(',\n');

  const template = `import { Routes } from '@angular/router';
import { FeaturePlugin } from '@content-lab/plugin-system';
import featureConfig from '../feature.config.js';
import type { FeatureConfig } from './core/plugin-system/feature-config.interface';

// Import enabled plugin metadata (generated based on feature configuration)
${imports}

/**
 * Map of enabled plugins by feature ID
 * Only features enabled in feature.config.ts are imported
 */
const allPlugins: Record<string, FeaturePlugin> = {
${pluginMapEntries}
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

  console.log(\`[Routes] Generating routes for \${enabledFeatures.length} enabled features\`);

  // Generate route for each enabled plugin
  for (const featureId of enabledFeatures) {
    const plugin = allPlugins[featureId];

    if (!plugin) {
      console.warn(\`[Routes] Plugin not found for feature: \${featureId}\`);
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
`;

  fs.writeFileSync(absoluteOutputPath, template, 'utf8');
  console.log(`✅ Generated ${absoluteOutputPath} with ${enabledFeatures.length} enabled features`);
}

// Generate the feature loader service file
function generateFeatureLoaderFile(enabledFeatures, loaderPath) {
  const absoluteLoaderPath = path.resolve(projectRoot, loaderPath);

  const pluginPathEntries = enabledFeatures
    .filter(featureId => PLUGIN_PATHS[featureId])
    .map(featureId => `      '${featureId}': '../features/${featureId}/${featureId}.plugin'`)
    .join(',\n');

  const template = `/**
 * Feature Loader Service
 * Responsible for loading feature plugins based on configuration
 * AUTO-GENERATED - DO NOT EDIT MANUALLY
 */

import { Injectable } from '@angular/core';
import { PluginRegistryService } from './plugin-registry.service';
import { FeatureBuildConfig, FeatureConfig } from './feature-config.interface';
import featureConfig from '../../../feature.config.js';

@Injectable({
  providedIn: 'root'
})
export class FeatureLoaderService {
  constructor(private pluginRegistry: PluginRegistryService) {}

  /**
   * Load all enabled features from configuration
   * This method should be called during app initialization
   */
  async loadFeatures(): Promise<void> {
    const enabledFeatures = Object.entries(featureConfig.features)
      .filter(([_, config]) => (config as FeatureConfig).enabled)
      .map(([featureId, _]) => featureId);

    console.log(\`[FeatureLoader] Loading \${enabledFeatures.length} enabled features from configuration...\`);
    console.log(\`[FeatureLoader] Build: \${featureConfig.buildName} v\${featureConfig.version}\`);

    const results = {
      loaded: [] as string[],
      failed: [] as { id: string; error: string }[]
    };

    // Load each enabled feature
    for (const featureId of enabledFeatures) {
      try {
        await this.loadFeaturePlugin(featureId);
        results.loaded.push(featureId);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(\`[FeatureLoader] Failed to load feature: \${featureId}\`, error);
        results.failed.push({ id: featureId, error: errorMsg });
      }
    }

    // Log summary
    console.log(\`[FeatureLoader] Load complete:\`);
    console.log(\`  ✓ Loaded: \${results.loaded.length} features\`);
    if (results.failed.length > 0) {
      console.warn(\`  ✗ Failed: \${results.failed.length} features\`);
      results.failed.forEach(({ id, error }) => {
        console.warn(\`    - \${id}: \${error}\`);
      });
    }
  }

  /**
   * Dynamically import and register a feature plugin
   * Only enabled plugins are included in this mapping
   * @param featureId The feature ID to load
   */
  private async loadFeaturePlugin(featureId: string): Promise<void> {
    // Map feature IDs to their plugin module paths (only enabled features)
    const pluginPaths: Record<string, string> = {
${pluginPathEntries}
    };

    const pluginPath = pluginPaths[featureId];
    if (!pluginPath) {
      throw new Error(\`Unknown feature ID: \${featureId}\`);
    }

    try {
      // Dynamically import the plugin module
      const pluginModule = await import(/* @vite-ignore */ pluginPath);

      // The module should export a 'plugin' object
      if (!pluginModule.plugin) {
        throw new Error(\`Plugin module does not export 'plugin' object\`);
      }

      // Register the plugin
      this.pluginRegistry.register(pluginModule.plugin);

      console.log(\`[FeatureLoader] ✓ Loaded: \${featureId}\`);
    } catch (error) {
      // If the plugin file doesn't exist yet (Phase 1 work), that's okay
      // We'll create them in the next phase
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.warn(\`[FeatureLoader] Plugin file not found for '\${featureId}' - will be created in Phase 1\`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get the current build configuration
   */
  getBuildConfig() {
    return featureConfig;
  }

  /**
   * Get list of enabled feature IDs
   */
  getEnabledFeatures(): string[] {
    return Object.entries(featureConfig.features)
      .filter(([_, config]) => (config as FeatureConfig).enabled)
      .map(([featureId, _]) => featureId);
  }

  /**
   * Check if a specific feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    return featureConfig.features[featureId]?.enabled ?? false;
  }

  /**
   * Get configuration for a specific feature
   */
  getFeatureConfig(featureId: string): Record<string, any> | undefined {
    return featureConfig.features[featureId]?.config;
  }
}
`;

  fs.writeFileSync(absoluteLoaderPath, template, 'utf8');
  console.log(`✅ Generated ${absoluteLoaderPath} with ${enabledFeatures.length} enabled features`);
}

// Main execution
try {
  const enabledFeatures = loadFeatureConfig(configPath);
  console.log(`Found ${enabledFeatures.length} enabled features:`, enabledFeatures.join(', '));
  generateRoutesFile(enabledFeatures, outputPath);
  generateFeatureLoaderFile(enabledFeatures, 'apps/content-lab/src/app/core/plugin-system/feature-loader.service.ts');
} catch (error) {
  console.error('Error generating routes:', error.message);
  process.exit(1);
}
