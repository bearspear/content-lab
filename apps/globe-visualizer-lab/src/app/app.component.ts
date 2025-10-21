import { Component } from '@angular/core';
import { GlobeVisualizerComponent } from '../../../content-lab/src/app/features/globe-visualizer/globe-visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GlobeVisualizerComponent],
  template: `<app-globe-visualizer></app-globe-visualizer>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
