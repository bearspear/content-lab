import { Component } from '@angular/core';
import { DiffCheckerComponent } from '../../../content-lab/src/app/features/diff-checker/diff-checker.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DiffCheckerComponent],
  template: `<app-diff-checker></app-diff-checker>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
