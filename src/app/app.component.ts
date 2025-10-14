import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdConverterComponent } from './md-converter/md-converter.component';
import { JsPlaygroundComponent } from './features/js-playground/js-playground.component';
import { JsonEditorComponent } from './features/json-editor/json-editor.component';
import { TextEditorComponent } from './features/text-editor/text-editor.component';
import { CsvEditorComponent } from './features/csv-editor/csv-editor.component';
import { RegexTesterComponent } from './features/regex-tester/regex-tester.component';
import { TetrisComponent } from './features/tetris/tetris.component';
import { Base64EncoderComponent } from './features/base64-encoder/base64-encoder.component';
import { DiffCheckerComponent } from './features/diff-checker/diff-checker.component';
import { SvgEditorComponent } from './features/svg-editor/svg-editor.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MdConverterComponent, JsPlaygroundComponent, JsonEditorComponent, TextEditorComponent, CsvEditorComponent, RegexTesterComponent, TetrisComponent, Base64EncoderComponent, DiffCheckerComponent, SvgEditorComponent, SidebarComponent],
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
