import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversionPreset } from '@content-lab/core';

@Component({
  selector: 'app-preset-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preset-selector">
      <h3>🎨 Quick Presets</h3>
      <div class="presets-grid">
        <div
          *ngFor="let preset of presets"
          class="preset-card"
          [class.selected]="selectedPreset?.id === preset.id"
          (click)="selectPreset(preset)"
        >
          <div class="preset-icon">{{ preset.icon }}</div>
          <div class="preset-name">{{ preset.name }}</div>
          <div class="preset-description">{{ preset.description }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preset-selector { margin-bottom: 24px; }
    h3 { margin: 0 0 16px 0; }
    .presets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
    .preset-card { background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s; text-align: center; }
    .preset-card:hover { border-color: #667eea; background: #edf2f7; }
    .preset-card.selected { border-color: #667eea; background: #e6f3ff; }
    .preset-icon { font-size: 2rem; margin-bottom: 8px; }
    .preset-name { font-weight: 600; color: #2d3748; margin-bottom: 4px; }
    .preset-description { font-size: 0.85rem; color: #718096; }
  `]
})
export class PresetSelectorComponent {
  @Input() presets: ConversionPreset[] = [];
  @Input() selectedPreset: ConversionPreset | null = null;
  @Output() presetSelected = new EventEmitter<ConversionPreset>();

  selectPreset(preset: ConversionPreset): void {
    this.presetSelected.emit(preset);
  }
}
