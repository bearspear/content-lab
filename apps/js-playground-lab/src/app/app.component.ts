import { Component } from '@angular/core';
import { JsPlaygroundComponent } from '../../../content-lab/src/app/features/js-playground/js-playground.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsPlaygroundComponent],
  template: `<app-js-playground></app-js-playground>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
