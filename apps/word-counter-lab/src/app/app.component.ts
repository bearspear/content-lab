import { Component } from '@angular/core';
import { WordCounterComponent } from '../../../content-lab/src/app/features/word-counter/word-counter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WordCounterComponent],
  template: `<app-word-counter></app-word-counter>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
