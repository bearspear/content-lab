import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="reset-btn"
      (click)="onReset()"
      title="Reset to default state"
      aria-label="Reset to default state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>Reset</span>
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
  @Output() reset = new EventEmitter<void>();

  onReset(): void {
    if (confirm('Are you sure you want to reset to default state? This will clear all current content.')) {
      this.reset.emit();
    }
  }
}
