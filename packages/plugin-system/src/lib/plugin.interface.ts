/**
 * Plugin System Interfaces
 * Defines the contract that all feature plugins must implement
 */

/**
 * Tool category enumeration
 * Used to group tools in the sidebar
 */
export enum ToolCategory {
  ContentDesign = 'content-design',
  CodeDev = 'code-dev',
  DataText = 'data-text',
  Utilities = 'utilities',
  Visualizations = 'visualizations',
  Games = 'games'
}

/**
 * Metadata describing a feature plugin
 */
export interface FeaturePluginMetadata {
  /** Unique identifier for the plugin (e.g., 'tetris') */
  id: string;

  /** Display name shown in the UI (e.g., 'Tetris Game') */
  name: string;

  /** Short description of the plugin functionality */
  description: string;

  /** Semantic version (e.g., '1.0.0') */
  version: string;

  /** SVG icon as a string */
  icon: string;

  /** Category for organization in the sidebar */
  category: ToolCategory;

  /** Route path (e.g., '/tools/tetris') */
  route: string;

  /** Optional badge text (e.g., 'NEW', 'BETA') */
  badge?: string;

  /** Optional badge CSS class for styling */
  badgeClass?: string;

  /** External dependencies required by this plugin (e.g., ['three', 'monaco-editor']) */
  dependencies?: string[];
}

/**
 * Main plugin interface
 * All feature plugins must implement this contract
 */
export interface FeaturePlugin {
  /** Plugin metadata */
  metadata: FeaturePluginMetadata;

  /** Function to lazy-load the plugin component */
  loadComponent: () => Promise<any>;

  /** Optional lifecycle hook called when plugin is activated */
  onActivate?(): void | Promise<void>;

  /** Optional lifecycle hook called when plugin is deactivated */
  onDeactivate?(): void | Promise<void>;

  /** Optional configuration object for plugin-specific settings */
  config?: Record<string, any>;
}

/**
 * Type guard to check if an object is a valid FeaturePlugin
 */
export function isFeaturePlugin(obj: any): obj is FeaturePlugin {
  return (
    obj &&
    typeof obj === 'object' &&
    'metadata' in obj &&
    'loadComponent' in obj &&
    typeof obj.loadComponent === 'function' &&
    isValidMetadata(obj.metadata)
  );
}

/**
 * Type guard to check if metadata is valid
 */
export function isValidMetadata(metadata: any): metadata is FeaturePluginMetadata {
  return (
    metadata &&
    typeof metadata === 'object' &&
    typeof metadata.id === 'string' &&
    typeof metadata.name === 'string' &&
    typeof metadata.description === 'string' &&
    typeof metadata.version === 'string' &&
    typeof metadata.icon === 'string' &&
    typeof metadata.category === 'string' &&
    typeof metadata.route === 'string'
  );
}
