import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { CustomPreloadStrategy } from './core/services';
import { FeatureLoaderService } from './core/plugin-system';

/**
 * Initialize the plugin system by loading all enabled features
 */
export function initializePluginSystem(featureLoader: FeatureLoaderService) {
  return () => featureLoader.loadFeatures();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withPreloading(CustomPreloadStrategy)
    ),
    // Initialize plugin system on app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializePluginSystem,
      deps: [FeatureLoaderService],
      multi: true
    }
  ]
};
