import { Component } from '@angular/core';
import { MarkdownToHtmlComponent } from '../../../content-lab/src/app/features/markdown-to-html/markdown-to-html.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownToHtmlComponent],
  template: `<app-markdown-to-html></app-markdown-to-html>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
