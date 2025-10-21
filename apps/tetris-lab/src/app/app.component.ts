import { Component } from '@angular/core';
import { TetrisComponent } from '../../../content-lab/src/app/features/tetris/tetris.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TetrisComponent],
  template: `<app-tetris></app-tetris>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class AppComponent {}
