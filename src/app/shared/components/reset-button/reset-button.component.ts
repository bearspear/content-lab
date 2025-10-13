import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable reset button component with configurable confirmation
 *
 * @example
 * ```html
 * <!-- With confirmation (default) -->
 * <app-reset-button (reset)="onReset()"></app-reset-button>
 *
 * <!-- Custom confirmation message -->
 * <app-reset-button
 *   (reset)="onReset()"
 *   confirmMessage="Reset the editor? All your code will be lost.">
 * </app-reset-button>
 *
 * <!-- Without confirmation -->
 * <app-reset-button
 *   (reset)="onReset()"
 *   [requireConfirmation]="false">
 * </app-reset-button>
 *
 * <!-- Custom button text -->
 * <app-reset-button
 *   (reset)="onReset()"
 *   buttonText="Clear All">
 * </app-reset-button>
 * ```
 */
@Component({
  selector: 'app-reset-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="reset-btn"
      (click)="onReset()"
      [title]="title"
      [attr.aria-label]="title">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>{{ buttonText }}</span>
    </button>
  `,
  styles: [`
    .reset-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #f8f9fa;
      color: #495057;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      svg {
        width: 18px;
        height: 18px;
        stroke-width: 2.5;
      }

      &:hover {
        background-color: #e9ecef;
        border-color: #adb5bd;
        color: #212529;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
        background-color: #dee2e6;
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
        border-color: #4299e1;
      }
    }
  `]
})
export class ResetButtonComponent {
  /**
   * Emits when reset is confirmed (or when confirmation is disabled)
   */
  @Output() reset = new EventEmitter<void>();

  /**
   * Whether to show confirmation dialog before resetting
   * @default true
   */
  @Input() requireConfirmation = true;

  /**
   * Custom confirmation message to display
   * @default 'Are you sure you want to reset to default state? This will clear all current content.'
   */
  @Input() confirmMessage = 'Are you sure you want to reset to default state? This will clear all current content.';

  /**
   * Custom button text
   * @default 'Reset'
   */
  @Input() buttonText = 'Reset';

  /**
   * Custom tooltip/title text
   * @default 'Reset to default state'
   */
  @Input() title = 'Reset to default state';

  /**
   * Handles reset button click with optional confirmation
   */
  onReset(): void {
    if (this.requireConfirmation) {
      if (confirm(this.confirmMessage)) {
        this.reset.emit();
      }
    } else {
      this.reset.emit();
    }
  }
}
