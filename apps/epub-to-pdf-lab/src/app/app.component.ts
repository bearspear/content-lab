import { Component } from '@angular/core';
import { EpubToPdfComponent } from '../../../content-lab/src/app/features/epub-to-pdf/epub-to-pdf.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EpubToPdfComponent],
  template: `<app-epub-to-pdf></app-epub-to-pdf>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
