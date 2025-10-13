import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DisplayOptions {
  centerContent: boolean;
  hidePlaintext: boolean;
  hideMarkdown: boolean;
  hideImages: boolean;
}

@Component({
  selector: 'app-display-options',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="display-options">
      <button class="options-button" (click)="toggleDropdown()" [class.active]="isOpen">
        <svg class="options-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span>Display Options</span>
        <span class="selected-count" *ngIf="getSelectedCount() > 0">{{ getSelectedCount() }}</span>
        <svg class="chevron" [class.rotated]="isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div class="dropdown-menu" *ngIf="isOpen">
        <label class="option-item">
          <input type="checkbox"
                 [checked]="options.centerContent"
                 (change)="toggleOption('centerContent')">
          <span class="option-label">Center Content</span>
          <span class="option-description">Center content with 900px max-width</span>
        </label>

        <label class="option-item">
          <input type="checkbox"
                 [checked]="options.hidePlaintext"
                 (change)="toggleOption('hidePlaintext')">
          <span class="option-label">Hide Plaintext</span>
          <span class="option-description">Hide plaintext code blocks</span>
        </label>

        <label class="option-item">
          <input type="checkbox"
                 [checked]="options.hideMarkdown"
                 (change)="toggleOption('hideMarkdown')">
          <span class="option-label">Hide Markdown</span>
          <span class="option-description">Hide markdown code blocks</span>
        </label>

        <label class="option-item">
          <input type="checkbox"
                 [checked]="options.hideImages"
                 (change)="toggleOption('hideImages')">
          <span class="option-label">Hide Images</span>
          <span class="option-description">Hide all images in preview</span>
        </label>
      </div>
    </div>
  `,
  styles: [`
    .display-options {
      position: relative;
      display: inline-block;
    }

    .options-button {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #ffffff;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      font-size: 0.95rem;
      font-weight: 600;
      color: #2d3748;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .options-button:hover {
      border-color: #4299e1;
      background-color: #f7fafc;
    }

    .options-button.active {
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .options-icon {
      width: 20px;
      height: 20px;
      color: #4299e1;
    }

    .selected-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      background-color: #4299e1;
      color: white;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .chevron {
      width: 16px;
      height: 16px;
      color: #718096;
      transition: transform 0.2s;
    }

    .chevron.rotated {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      min-width: 300px;
      padding: 8px;
      z-index: 1000;
      animation: slideDown 0.2s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .option-item {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      gap: 4px 12px;
      padding: 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .option-item:hover {
      background-color: #f7fafc;
    }

    .option-item input[type="checkbox"] {
      grid-row: 1 / 3;
      margin: 0;
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #4299e1;
    }

    .option-label {
      grid-column: 2;
      font-weight: 600;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .option-description {
      grid-column: 2;
      font-size: 0.85rem;
      color: #718096;
    }
  `]
})
export class DisplayOptionsComponent {
  @Input() options: DisplayOptions = {
    centerContent: true,
    hidePlaintext: false,
    hideMarkdown: false,
    hideImages: false
  };
  @Output() optionsChange = new EventEmitter<DisplayOptions>();

  isOpen = false;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  toggleOption(optionKey: keyof DisplayOptions): void {
    this.options = {
      ...this.options,
      [optionKey]: !this.options[optionKey]
    };
    this.optionsChange.emit(this.options);
  }

  getSelectedCount(): number {
    return Object.values(this.options).filter(v => v === true).length;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.display-options');
    if (!clickedInside && this.isOpen) {
      this.isOpen = false;
    }
  }
}
