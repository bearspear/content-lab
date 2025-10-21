import { Component } from '@angular/core';
import { StarMapComponent } from '../../../content-lab/src/app/features/star-map/star-map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StarMapComponent],
  template: `<app-star-map></app-star-map>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
