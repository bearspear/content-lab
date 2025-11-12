/**
 * Plugin Lifecycle Service
 * Manages plugin lifecycle hooks by listening to router events
 *
 * Phase 4: Advanced Features - Lifecycle Hook Implementation
 *
 * Responsibilities:
 * - Subscribe to Angular router navigation events
 * - Track currently active plugin
 * - Invoke onDeactivate when leaving a plugin route
 * - Invoke onActivate when entering a plugin route
 * - Call onInitialize during plugin registration
 * - Call onDestroy during plugin cleanup
 */

import { Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PluginRegistryService } from './plugin-registry.service';

@Injectable({
  providedIn: 'root'
})
export class PluginLifecycleService implements OnDestroy {
  private routerSubscription?: Subscription;
  private currentPluginId: string | null = null;

  constructor(
    private router: Router,
    private pluginRegistry: PluginRegistryService
  ) {
    this.initializeLifecycleManagement();
  }

  /**
   * Initialize lifecycle management by subscribing to router events
   */
  private initializeLifecycleManagement(): void {
    this.routerSubscription = this.router.events
      .pipe(
        // Only interested in successful navigation events
        filter(event => event instanceof NavigationEnd),
        // Extract the activated route's plugin ID from route data
        map(() => this.extractPluginIdFromRoute())
      )
      .subscribe(pluginId => {
        this.handlePluginTransition(pluginId);
      });

    console.log('[PluginLifecycle] Lifecycle management initialized');
  }

  /**
   * Extract plugin ID from the current activated route's data
   */
  private extractPluginIdFromRoute(): string | null {
    let route = this.router.routerState.root;

    // Traverse the route tree to find the deepest activated route with plugin data
    while (route.firstChild) {
      route = route.firstChild;
    }

    // Route data contains pluginId set in app.routes.ts
    return route.snapshot.data['pluginId'] || null;
  }

  /**
   * Handle transition between plugins
   * @param newPluginId The plugin being navigated to (or null if no plugin route)
   */
  private async handlePluginTransition(newPluginId: string | null): Promise<void> {
    // If navigating to the same plugin, do nothing
    if (newPluginId === this.currentPluginId) {
      return;
    }

    // Deactivate current plugin if one is active
    if (this.currentPluginId) {
      await this.deactivatePlugin(this.currentPluginId);
    }

    // Activate new plugin if navigating to a plugin route
    if (newPluginId) {
      await this.activatePlugin(newPluginId);
    }

    // Update current plugin tracker
    this.currentPluginId = newPluginId;
  }

  /**
   * Activate a plugin by calling its onActivate lifecycle hook
   * @param pluginId The plugin to activate
   */
  private async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.pluginRegistry.getById(pluginId);

    if (!plugin) {
      console.warn(`[PluginLifecycle] Cannot activate unknown plugin: ${pluginId}`);
      return;
    }

    if (plugin.onActivate) {
      try {
        console.log(`[PluginLifecycle] Activating plugin: ${pluginId}`);
        await plugin.onActivate();
        console.log(`[PluginLifecycle] ✓ Plugin activated: ${pluginId}`);
      } catch (error) {
        console.error(`[PluginLifecycle] Error activating plugin ${pluginId}:`, error);
      }
    }
  }

  /**
   * Deactivate a plugin by calling its onDeactivate lifecycle hook
   * @param pluginId The plugin to deactivate
   */
  private async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.pluginRegistry.getById(pluginId);

    if (!plugin) {
      console.warn(`[PluginLifecycle] Cannot deactivate unknown plugin: ${pluginId}`);
      return;
    }

    if (plugin.onDeactivate) {
      try {
        console.log(`[PluginLifecycle] Deactivating plugin: ${pluginId}`);
        await plugin.onDeactivate();
        console.log(`[PluginLifecycle] ✓ Plugin deactivated: ${pluginId}`);
      } catch (error) {
        console.error(`[PluginLifecycle] Error deactivating plugin ${pluginId}:`, error);
      }
    }
  }

  /**
   * Get the currently active plugin ID
   */
  getCurrentPluginId(): string | null {
    return this.currentPluginId;
  }

  /**
   * Cleanup on service destruction
   */
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    // Deactivate current plugin on app shutdown
    if (this.currentPluginId) {
      this.deactivatePlugin(this.currentPluginId);
    }

    console.log('[PluginLifecycle] Lifecycle management destroyed');
  }
}
