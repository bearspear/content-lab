import { Component } from '@angular/core';
import { RegexTesterComponent } from '../../../content-lab/src/app/features/regex-tester/regex-tester.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RegexTesterComponent],
  template: `<app-regex-tester></app-regex-tester>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
