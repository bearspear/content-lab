import { Component } from '@angular/core';
import { Base64EncoderComponent } from '../../../content-lab/src/app/features/base64-encoder/base64-encoder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Base64EncoderComponent],
  template: `<app-base64-encoder></app-base64-encoder>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
