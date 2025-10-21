import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withPreloading } from '@angular/router';
import { routes } from './app.routes';
import { CustomPreloadStrategy } from '@content-lab/core';

/**
 * Note: Plugin system infrastructure exists in @content-lab/plugin-system
 * but is not currently used. Features are loaded via Angular routing instead.
 * Plugin system can be activated in a future phase when plugin files are created.
 */

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(
      routes,
      withPreloading(CustomPreloadStrategy)
    )
  ]
};
