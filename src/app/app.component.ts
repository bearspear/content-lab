import { Component } from '@angular/core';
import { MdConverterComponent } from './md-converter/md-converter.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MdConverterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'md-html-converter';
}
