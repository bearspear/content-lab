/**
 * Plugin Registry Service
 * Central service that manages all feature plugins
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FeaturePlugin, FeaturePluginMetadata, ToolCategory, isFeaturePlugin } from './plugin.interface';

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

  constructor() {
    console.log('[PluginRegistry] Service initialized');
  }

  /**
   * Register a feature plugin
   * @param plugin The plugin to register
   * @throws Error if plugin is invalid
   */
  register(plugin: FeaturePlugin): void {
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

    // Register the plugin
    this.plugins.set(plugin.metadata.id, plugin);

    // Notify subscribers
    this.pluginsSubject.next(Array.from(this.plugins.values()));
  }

  /**
   * Register multiple plugins at once
   * @param plugins Array of plugins to register
   */
  registerMany(plugins: FeaturePlugin[]): void {
    console.log(`[PluginRegistry] Registering ${plugins.length} plugins...`);
    plugins.forEach(plugin => this.register(plugin));
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
  unregister(id: string): boolean {
    const wasRegistered = this.plugins.delete(id);

    if (wasRegistered) {
      console.log(`[PluginRegistry] Unregistered plugin: ${id}`);
      this.pluginsSubject.next(Array.from(this.plugins.values()));
    }

    return wasRegistered;
  }

  /**
   * Clear all registered plugins
   */
  clear(): void {
    console.log('[PluginRegistry] Clearing all plugins');
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
