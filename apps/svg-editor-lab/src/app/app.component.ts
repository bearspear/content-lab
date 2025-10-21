import { Component } from '@angular/core';
import { SvgEditorComponent } from '../../../content-lab/src/app/features/svg-editor/svg-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SvgEditorComponent],
  template: `<app-svg-editor></app-svg-editor>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
