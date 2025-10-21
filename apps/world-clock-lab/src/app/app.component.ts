import { Component } from '@angular/core';
import { WorldClockComponent } from '../../../content-lab/src/app/features/world-clock/world-clock.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WorldClockComponent],
  template: `<app-world-clock></app-world-clock>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
