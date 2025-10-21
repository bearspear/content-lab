import { Component } from '@angular/core';
import { TimelineVisualizerComponent } from '../../../content-lab/src/app/features/timeline-visualizer/timeline-visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TimelineVisualizerComponent],
  template: `<app-timeline-visualizer></app-timeline-visualizer>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
