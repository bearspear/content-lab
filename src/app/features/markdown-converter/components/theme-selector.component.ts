import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Theme } from '../../../core/models';
import { ThemeService } from '../../../core/services';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector">
      <label for="theme-select">
        <svg class="theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        Theme:
      </label>
      <select id="theme-select"
              [value]="selectedTheme"
              (change)="onThemeChange($event)"
              class="theme-dropdown">
        <option *ngFor="let theme of themes" [value]="theme.value">
          {{ theme.name }}
        </option>
      </select>
    </div>
  `,
  styles: []
})
export class ThemeSelectorComponent implements OnInit {
  @Input() selectedTheme: string = 'claude';
  @Output() themeChange = new EventEmitter<string>();

  themes: Theme[] = [];

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themes = this.themeService.getThemes();
  }

  onThemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newTheme = select.value;
    this.themeChange.emit(newTheme);
  }
}
