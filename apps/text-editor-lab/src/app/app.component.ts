import { Component } from '@angular/core';
import { TextEditorComponent } from '../../../content-lab/src/app/features/text-editor/text-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TextEditorComponent],
  template: `<app-text-editor></app-text-editor>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
