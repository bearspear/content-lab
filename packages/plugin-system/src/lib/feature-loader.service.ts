/**
 * Feature Loader Service
 * Responsible for loading feature plugins based on configuration
 */

import { Injectable } from '@angular/core';
import { PluginRegistryService } from './plugin-registry.service';
import { FeatureBuildConfig, FeatureConfig } from './feature-config.interface';
import featureConfig from '../../../../apps/content-lab/src/feature.config.js';

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

    console.log(`[FeatureLoader] Loading ${enabledFeatures.length} enabled features from configuration...`);
    console.log(`[FeatureLoader] Build: ${featureConfig.buildName} v${featureConfig.version}`);

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
        console.error(`[FeatureLoader] Failed to load feature: ${featureId}`, error);
        results.failed.push({ id: featureId, error: errorMsg });
      }
    }

    // Log summary
    console.log(`[FeatureLoader] Load complete:`);
    console.log(`  ✓ Loaded: ${results.loaded.length} features`);
    if (results.failed.length > 0) {
      console.warn(`  ✗ Failed: ${results.failed.length} features`);
      results.failed.forEach(({ id, error }) => {
        console.warn(`    - ${id}: ${error}`);
      });
    }
  }

  /**
   * Dynamically import and register a feature plugin
   * @param featureId The feature ID to load
   */
  private async loadFeaturePlugin(featureId: string): Promise<void> {
    // Map feature IDs to their plugin module paths
    const pluginPaths: Record<string, string> = {
      // Content & Design
      'markdown-to-html': '../features/markdown-to-html/markdown-to-html.plugin',
      'markdown-converter': '../features/markdown-converter/markdown-converter.plugin',
      'text-editor': '../features/text-editor/text-editor.plugin',
      'svg-editor': '../features/svg-editor/svg-editor.plugin',

      // Code & Development
      'js-playground': '../features/js-playground/js-playground.plugin',
      'json-editor': '../features/json-editor/json-editor.plugin',
      'regex-tester': '../features/regex-tester/regex-tester.plugin',
      'diff-checker': '../features/diff-checker/diff-checker.plugin',

      // Data & Text
      'csv-editor': '../features/csv-editor/csv-editor.plugin',
      'word-counter': '../features/word-counter/word-counter.plugin',

      // Utilities
      'base64-encoder': '../features/base64-encoder/base64-encoder.plugin',
      'world-clock': '../features/world-clock/world-clock.plugin',
      'flac-player': '../features/flac-player/flac-player.plugin',

      // Visualizations
      'timeline-visualizer': '../features/timeline-visualizer/timeline-visualizer.plugin',
      'globe-visualizer': '../features/globe-visualizer/globe-visualizer.plugin',
      'star-map': '../features/star-map/star-map.plugin',

      // Games
      'tetris': '../features/tetris/tetris.plugin'
    };

    const pluginPath = pluginPaths[featureId];
    if (!pluginPath) {
      throw new Error(`Unknown feature ID: ${featureId}`);
    }

    try {
      // Dynamically import the plugin module
      const pluginModule = await import(/* @vite-ignore */ pluginPath);

      // The module should export a 'plugin' object
      if (!pluginModule.plugin) {
        throw new Error(`Plugin module does not export 'plugin' object`);
      }

      // Register the plugin
      this.pluginRegistry.register(pluginModule.plugin);

      console.log(`[FeatureLoader] ✓ Loaded: ${featureId}`);
    } catch (error) {
      // If the plugin file doesn't exist yet (Phase 1 work), that's okay
      // We'll create them in the next phase
      if (error instanceof Error && error.message.includes('Cannot find module')) {
        console.warn(`[FeatureLoader] Plugin file not found for '${featureId}' - will be created in Phase 1`);
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
