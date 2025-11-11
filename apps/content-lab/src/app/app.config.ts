import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { CustomPreloadStrategy } from '@content-lab/core';
import { FeatureLoaderService } from '@content-lab/plugin-system';

/**
 * Initialize feature loader to register all enabled plugins
 */
function initializeFeatures(featureLoader: FeatureLoaderService) {
  return () => featureLoader.loadFeatures();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withPreloading(CustomPreloadStrategy)
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeFeatures,
      deps: [FeatureLoaderService],
      multi: true
    }
  ]
};
