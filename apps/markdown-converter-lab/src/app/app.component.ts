import { Component } from '@angular/core';
import { MarkdownConverterComponent } from '../../../content-lab/src/app/features/markdown-converter/markdown-converter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownConverterComponent],
  template: `<app-markdown-converter></app-markdown-converter>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
