import { Component } from '@angular/core';
import { FlacPlayerComponent } from '../../../content-lab/src/app/features/flac-player/flac-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlacPlayerComponent],
  template: `<app-flac-player></app-flac-player>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
