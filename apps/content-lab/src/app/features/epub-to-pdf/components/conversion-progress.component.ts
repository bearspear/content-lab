import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobStatusResponse } from '@content-lab/core';

@Component({
  selector: 'app-conversion-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <h2>🔄 Converting EPUB to PDF</h2>

      <div class="progress-bar-container">
        <div class="progress-bar" [style.width.%]="jobStatus.progress"></div>
      </div>

      <div class="progress-info">
        <div class="current-step">
          <span class="step-icon">⚡</span>
          <span class="step-text">{{ jobStatus.currentStep }}</span>
        </div>
        <div class="progress-percentage">{{ jobStatus.progress }}%</div>
      </div>

      <div class="steps-list">
        <div
          *ngFor="let step of jobStatus.steps"
          class="step-item"
          [class.completed]="step.status === 'completed'"
          [class.in-progress]="step.status === 'in_progress'"
          [class.failed]="step.status === 'failed'"
        >
          <div class="step-status">
            <span *ngIf="step.status === 'completed'">✓</span>
            <span *ngIf="step.status === 'in_progress'">⏳</span>
            <span *ngIf="step.status === 'failed'">✗</span>
            <span *ngIf="step.status === 'pending'">○</span>
          </div>
          <div class="step-name">{{ step.name }}</div>
          <div class="step-time" *ngIf="step.time">{{ step.time.toFixed(1) }}s</div>
        </div>
      </div>

      <div class="elapsed-time" *ngIf="jobStatus.elapsedTime">
        Total time: {{ jobStatus.elapsedTime }}s
      </div>
    </div>
  `,
  styles: [`
    .progress-container { padding: 40px 20px; text-align: center; }
    h2 { margin: 0 0 32px 0; font-size: 1.8rem; }
    .progress-bar-container { background: #e2e8f0; border-radius: 999px; height: 12px; overflow: hidden; margin-bottom: 16px; }
    .progress-bar { background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); height: 100%; transition: width 0.3s; }
    .progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
    .current-step { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 600; }
    .step-icon { font-size: 1.3rem; }
    .progress-percentage { font-size: 1.5rem; font-weight: 700; color: #667eea; }
    .steps-list { max-width: 500px; margin: 0 auto; }
    .step-item { display: grid; grid-template-columns: 40px 1fr auto; gap: 12px; padding: 12px; align-items: center; }
    .step-status { font-size: 1.2rem; }
    .step-name { text-align: left; }
    .step-time { color: #718096; font-size: 0.9rem; }
    .step-item.completed { color: #48bb78; }
    .step-item.in-progress { color: #667eea; font-weight: 600; }
    .step-item.failed { color: #f56565; }
    .elapsed-time { margin-top: 24px; font-size: 0.9rem; color: #718096; }
  `]
})
export class ConversionProgressComponent {
  @Input() jobStatus!: JobStatusResponse;
}
