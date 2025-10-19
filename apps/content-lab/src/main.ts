import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Buffer } from 'buffer';

// Make Buffer available globally for music-metadata-browser
(window as any).Buffer = Buffer;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
