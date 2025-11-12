/**
 * Plugin System Public API
 * Export all public interfaces, services, and utilities
 */

// Interfaces and Types
export {
  FeaturePlugin,
  FeaturePluginMetadata,
  ToolCategory,
  isFeaturePlugin,
  isValidMetadata
} from './plugin.interface';

export {
  FeatureBuildConfig,
  FeatureConfig
} from './feature-config.interface';

// Services
export { PluginRegistryService } from './plugin-registry.service';
export { FeatureLoaderService } from './feature-loader.service';
export { PluginLifecycleService } from './plugin-lifecycle.service';
export { PluginDependencyValidatorService } from './plugin-dependency-validator.service';
export type { DependencyValidationResult } from './plugin-dependency-validator.service';
