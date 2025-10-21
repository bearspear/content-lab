import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

/**
 * Custom preloading strategy that intelligently preloads routes
 * based on route data configuration and network conditions.
 *
 * Features:
 * - Respects route.data.preload flag
 * - Delays preloading to avoid competing with initial load
 * - Can be extended for network-aware preloading
 */
@Injectable({
  providedIn: 'root'
})
export class CustomPreloadStrategy implements PreloadingStrategy {
  // Delay before starting to preload (in ms)
  private readonly PRELOAD_DELAY = 2000;

  // Track which routes have been preloaded
  private preloadedRoutes = new Set<string>();

  /**
   * Determine whether to preload a route
   */
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route should be preloaded based on data
    if (route.data && route.data['preload'] === true) {
      const routePath = route.path || 'unknown';

      // Skip if already preloaded
      if (this.preloadedRoutes.has(routePath)) {
        return of(null);
      }

      console.log(`[Preload] Scheduling preload for route: ${routePath}`);

      // Mark as preloaded
      this.preloadedRoutes.add(routePath);

      // Delay preloading to avoid competing with initial load
      return timer(this.PRELOAD_DELAY).pipe(
        mergeMap(() => {
          console.log(`[Preload] Preloading route: ${routePath}`);
          return load();
        })
      );
    }

    // Don't preload this route
    return of(null);
  }

  /**
   * Manually trigger preload for a specific route path
   * Useful for preloading routes when user hovers or expands categories
   */
  triggerPreload(routePath: string): void {
    // This method can be used to manually trigger preloading
    // Implementation would require router access to find and load the route
    console.log(`[Preload] Manual preload requested for: ${routePath}`);
  }

  /**
   * Check if route has been preloaded
   */
  isPreloaded(routePath: string): boolean {
    return this.preloadedRoutes.has(routePath);
  }

  /**
   * Clear preload tracking (useful for testing)
   */
  reset(): void {
    this.preloadedRoutes.clear();
  }
}
