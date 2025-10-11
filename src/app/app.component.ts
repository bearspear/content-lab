import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdConverterComponent } from './md-converter/md-converter.component';
import { JsPlaygroundComponent } from './features/js-playground/js-playground.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MdConverterComponent, JsPlaygroundComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dev-tools';
  activeTool = 'md-html';
  isSidebarCollapsed = false;

  onToolSelected(toolId: string): void {
    this.activeTool = toolId;
  }

  onSidebarToggled(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}
