import { Component } from '@angular/core';
import { JsonEditorComponent } from '../../../content-lab/src/app/features/json-editor/json-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JsonEditorComponent],
  template: `<app-json-editor></app-json-editor>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
