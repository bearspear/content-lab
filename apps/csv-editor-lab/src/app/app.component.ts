import { Component } from '@angular/core';
import { CsvEditorComponent } from '../../../content-lab/src/app/features/csv-editor/csv-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CsvEditorComponent],
  template: `<app-csv-editor></app-csv-editor>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
