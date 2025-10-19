/**
 * Feature Build Configuration Interfaces
 * Defines the structure for build configuration files
 */

/**
 * Configuration for a single feature
 */
export interface FeatureConfig {
  /** Whether this feature is enabled in the build */
  enabled: boolean;

  /** Optional feature-specific configuration */
  config?: Record<string, any>;
}

/**
 * Main build configuration
 */
export interface FeatureBuildConfig {
  /** Name of this build configuration */
  buildName: string;

  /** Version of this build */
  version: string;

  /** Map of feature IDs to their configuration */
  features: Record<string, FeatureConfig>;

  /** Optional global configuration for all features */
  featureConfig?: Record<string, any>;

  /** Optional build metadata */
  metadata?: {
    description?: string;
    author?: string;
    [key: string]: any;
  };
}
