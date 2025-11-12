/**
 * Plugin Registry Service
 * Central service that manages all feature plugins
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FeaturePlugin, FeaturePluginMetadata, ToolCategory, isFeaturePlugin } from './plugin.interface';
import { PluginDependencyValidatorService } from './plugin-dependency-validator.service';

@Injectable({
  providedIn: 'root'
})
export class PluginRegistryService {
  /** Internal map of registered plugins */
  private plugins = new Map<string, FeaturePlugin>();

  /** Subject that emits the current list of plugins */
  private pluginsSubject = new BehaviorSubject<FeaturePlugin[]>([]);

  /** Observable of registered plugins */
  public plugins$: Observable<FeaturePlugin[]> = this.pluginsSubject.asObservable();

  constructor(private dependencyValidator: PluginDependencyValidatorService) {
    console.log('[PluginRegistry] Service initialized');
  }

  /**
   * Register a feature plugin
   * @param plugin The plugin to register
   * @throws Error if plugin is invalid
   */
  async register(plugin: FeaturePlugin): Promise<void> {
    // Validate plugin
    if (!isFeaturePlugin(plugin)) {
      throw new Error(`Invalid plugin: Plugin does not conform to FeaturePlugin interface`);
    }

    // Check for duplicate registration
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(`[PluginRegistry] Plugin '${plugin.metadata.id}' is already registered`);
      return;
    }

    console.log(
      `[PluginRegistry] Registering plugin: ${plugin.metadata.name} (${plugin.metadata.version})`
    );

    // Validate dependencies (Phase 4)
    const validationResult = this.dependencyValidator.validateDependencies(plugin.metadata);
    if (!validationResult.valid) {
      console.warn(
        `[PluginRegistry] Plugin '${plugin.metadata.id}' has missing dependencies:`,
        validationResult.missingDependencies,
        '\nPlugin will be registered but may not function correctly.'
      );
      // Continue registration even with missing dependencies
      // This allows the plugin to load and potentially show a helpful error message
    }

    // Register the plugin
    this.plugins.set(plugin.metadata.id, plugin);

    // Call onInitialize lifecycle hook (Phase 4)
    if (plugin.onInitialize) {
      try {
        console.log(`[PluginRegistry] Initializing plugin: ${plugin.metadata.id}`);
        await plugin.onInitialize();
        console.log(`[PluginRegistry] ✓ Plugin initialized: ${plugin.metadata.id}`);
      } catch (error) {
        console.error(`[PluginRegistry] Error initializing plugin ${plugin.metadata.id}:`, error);
        // Continue registration even if initialization fails
      }
    }

    // Notify subscribers
    this.pluginsSubject.next(Array.from(this.plugins.values()));
  }

  /**
   * Register multiple plugins at once
   * @param plugins Array of plugins to register
   */
  async registerMany(plugins: FeaturePlugin[]): Promise<void> {
    console.log(`[PluginRegistry] Registering ${plugins.length} plugins...`);
    // Register plugins sequentially to ensure proper initialization
    for (const plugin of plugins) {
      await this.register(plugin);
    }
  }

  /**
   * Get all registered plugins
   * @returns Array of all registered plugins
   */
  getAll(): FeaturePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category
   * @param category The category to filter by
   * @returns Array of plugins in the specified category
   */
  getByCategory(category: ToolCategory | string): FeaturePlugin[] {
    return this.getAll().filter(p => p.metadata.category === category);
  }

  /**
   * Get plugin by ID
   * @param id The plugin ID
   * @returns The plugin, or undefined if not found
   */
  getById(id: string): FeaturePlugin | undefined {
    return this.plugins.get(id);
  }

  /**
   * Check if a plugin is registered
   * @param id The plugin ID
   * @returns True if the plugin is registered
   */
  has(id: string): boolean {
    return this.plugins.has(id);
  }

  /**
   * Unregister a plugin
   * @param id The plugin ID to unregister
   * @returns True if plugin was unregistered, false if it wasn't registered
   */
  async unregister(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);

    if (!plugin) {
      return false;
    }

    // Call onDestroy lifecycle hook (Phase 4)
    if (plugin.onDestroy) {
      try {
        console.log(`[PluginRegistry] Destroying plugin: ${id}`);
        await plugin.onDestroy();
        console.log(`[PluginRegistry] ✓ Plugin destroyed: ${id}`);
      } catch (error) {
        console.error(`[PluginRegistry] Error destroying plugin ${id}:`, error);
        // Continue unregistration even if destruction fails
      }
    }

    const wasRegistered = this.plugins.delete(id);

    if (wasRegistered) {
      console.log(`[PluginRegistry] Unregistered plugin: ${id}`);
      this.pluginsSubject.next(Array.from(this.plugins.values()));
    }

    return wasRegistered;
  }

  /**
   * Clear all registered plugins
   * Calls onDestroy on all plugins before clearing (Phase 4)
   */
  async clear(): Promise<void> {
    console.log('[PluginRegistry] Clearing all plugins');

    // Call onDestroy on all plugins
    const pluginIds = Array.from(this.plugins.keys());
    for (const id of pluginIds) {
      await this.unregister(id);
    }

    // Ensure map is cleared even if unregister had issues
    this.plugins.clear();
    this.pluginsSubject.next([]);
  }

  /**
   * Get count of registered plugins
   * @returns Number of registered plugins
   */
  getCount(): number {
    return this.plugins.size;
  }

  /**
   * Get all unique categories from registered plugins
   * @returns Array of unique category values
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.getAll().forEach(plugin => categories.add(plugin.metadata.category));
    return Array.from(categories);
  }

  /**
   * Get metadata for all registered plugins
   * @returns Array of plugin metadata
   */
  getAllMetadata(): FeaturePluginMetadata[] {
    return this.getAll().map(plugin => plugin.metadata);
  }

  /**
   * Search plugins by name or description
   * @param query Search query
   * @returns Array of matching plugins
   */
  search(query: string): FeaturePlugin[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(plugin =>
      plugin.metadata.name.toLowerCase().includes(lowerQuery) ||
      plugin.metadata.description.toLowerCase().includes(lowerQuery) ||
      plugin.metadata.id.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get plugins with specific dependencies
   * @param dependency Dependency name to search for
   * @returns Array of plugins that depend on the specified package
   */
  getByDependency(dependency: string): FeaturePlugin[] {
    return this.getAll().filter(plugin =>
      plugin.metadata.dependencies?.includes(dependency)
    );
  }
}
