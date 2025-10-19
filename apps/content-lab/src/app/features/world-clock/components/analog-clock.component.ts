import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockConfig } from '../models/clock-config.model';
import { TimezoneService } from '../services/timezone.service';

@Component({
  selector: 'app-analog-clock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clock-container" [attr.data-style]="config.faceStyle">
      <!-- Clock Header -->
      <div class="clock-header">
        <span class="timezone-label">{{ timezoneAbbr }}</span>
      </div>

      <!-- Analog Clock Face (SVG) -->
      <svg class="clock-face" viewBox="0 0 200 200" [attr.data-style]="config.faceStyle">
        <!-- Clock background circle -->
        <circle cx="100" cy="100" r="98" class="clock-bg" />
        <circle cx="100" cy="100" r="94" class="clock-border" />

        <!-- Hour markers -->
        <g class="hour-markers">
          <line *ngFor="let i of hours"
                [attr.x1]="100"
                [attr.y1]="10"
                [attr.x2]="100"
                [attr.y2]="20"
                [attr.transform]="'rotate(' + (i * 30) + ' 100 100)'"
                class="hour-marker" />
        </g>

        <!-- Minute markers -->
        <g class="minute-markers">
          <line *ngFor="let i of minutes"
                [attr.x1]="100"
                [attr.y1]="10"
                [attr.x2]="100"
                [attr.y2]="15"
                [attr.transform]="'rotate(' + (i * 6) + ' 100 100)'"
                class="minute-marker" />
        </g>

        <!-- Hour numbers -->
        <text x="100" y="35" class="hour-number" text-anchor="middle">12</text>
        <text x="165" y="107" class="hour-number" text-anchor="middle">3</text>
        <text x="100" y="180" class="hour-number" text-anchor="middle">6</text>
        <text x="35" y="107" class="hour-number" text-anchor="middle">9</text>

        <!-- Clock hands -->
        <g class="clock-hands">
          <!-- Hour hand -->
          <line x1="100" y1="100"
                [attr.x2]="100"
                [attr.y2]="55"
                [attr.transform]="'rotate(' + hourRotation + ' 100 100)'"
                class="hour-hand" />

          <!-- Minute hand -->
          <line x1="100" y1="100"
                [attr.x2]="100"
                [attr.y2]="35"
                [attr.transform]="'rotate(' + minuteRotation + ' 100 100)'"
                class="minute-hand" />

          <!-- Second hand -->
          <line *ngIf="config.showSeconds"
                x1="100" y1="100"
                [attr.x2]="100"
                [attr.y2]="25"
                [attr.transform]="'rotate(' + secondRotation + ' 100 100)'"
                class="second-hand" />

          <!-- Center dot -->
          <circle cx="100" cy="100" r="5" class="center-dot" />
        </g>
      </svg>

      <!-- Digital Time Display -->
      <div class="clock-info">
        <div class="digital-time">{{ digitalTime }}</div>
        <div class="utc-offset">{{ utcOffset }}</div>
        <div class="city-name">{{ config.city }}</div>
        <div class="date-display">{{ dateDisplay }}</div>
      </div>

      <!-- Actions -->
      <div class="clock-actions">
        <button class="action-btn" *ngIf="!config.isFixed" title="Configure timezone" (click)="onTimezoneClick()">
          ⚙️
        </button>
        <button class="action-btn style-btn" title="Change clock style" (click)="onStyleClick()">
          🎨
        </button>
      </div>
    </div>
  `,
  styles: [`
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .clock-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    /* Dark style */
    .clock-container[data-style="dark"] {
      background: #1a202c;
    }

    .clock-container[data-style="dark"] .timezone-label {
      color: #e2e8f0;
    }

    .clock-container[data-style="dark"] .digital-time {
      color: #e2e8f0;
    }

    .clock-container[data-style="dark"] .city-name {
      color: #cbd5e0;
    }

    /* Minimal style */
    .clock-container[data-style="minimal"] {
      background: transparent;
      border: 1px solid #e2e8f0;
      box-shadow: none;
    }

    .clock-container[data-style="minimal"]:hover {
      border-color: #cbd5e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    /* Modern style */
    .clock-container[data-style="modern"] {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .clock-container[data-style="modern"] .timezone-label,
    .clock-container[data-style="modern"] .digital-time,
    .clock-container[data-style="modern"] .city-name,
    .clock-container[data-style="modern"] .date-display {
      color: white;
    }

    .clock-container[data-style="modern"] .utc-offset {
      color: rgba(255, 255, 255, 0.8);
    }

    .clock-header {
      margin-bottom: 0.5rem;
    }

    .timezone-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
    }

    .clock-face {
      width: 200px;
      height: 200px;
      margin: 0.5rem 0;
    }

    .clock-bg {
      fill: #f7fafc;
    }

    .clock-border {
      fill: none;
      stroke: #cbd5e0;
      stroke-width: 2;
    }

    .hour-marker {
      stroke: #2d3748;
      stroke-width: 3;
      stroke-linecap: round;
    }

    .minute-marker {
      stroke: #a0aec0;
      stroke-width: 1;
    }

    .hour-number {
      font-size: 16px;
      font-weight: 600;
      fill: #2d3748;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .hour-hand {
      stroke: #2d3748;
      stroke-width: 6;
      stroke-linecap: round;
      transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .minute-hand {
      stroke: #4a5568;
      stroke-width: 4;
      stroke-linecap: round;
      transition: transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .second-hand {
      stroke: #e53e3e;
      stroke-width: 2;
      stroke-linecap: round;
      transition: transform 0.1s linear;
    }

    .center-dot {
      fill: #2d3748;
    }

    /* Dark face style */
    svg[data-style="dark"] .clock-bg {
      fill: #2d3748;
    }

    svg[data-style="dark"] .clock-border {
      stroke: #4a5568;
    }

    svg[data-style="dark"] .hour-marker {
      stroke: #e2e8f0;
    }

    svg[data-style="dark"] .minute-marker {
      stroke: #718096;
    }

    svg[data-style="dark"] .hour-number {
      fill: #e2e8f0;
    }

    svg[data-style="dark"] .hour-hand {
      stroke: #f7fafc;
    }

    svg[data-style="dark"] .minute-hand {
      stroke: #e2e8f0;
    }

    svg[data-style="dark"] .second-hand {
      stroke: #fc8181;
    }

    svg[data-style="dark"] .center-dot {
      fill: #f7fafc;
    }

    /* Minimal face style */
    svg[data-style="minimal"] .clock-bg {
      fill: transparent;
    }

    svg[data-style="minimal"] .clock-border {
      stroke: #cbd5e0;
      stroke-width: 1;
    }

    svg[data-style="minimal"] .minute-marker {
      display: none;
    }

    svg[data-style="minimal"] .hour-hand {
      stroke-width: 4;
    }

    svg[data-style="minimal"] .minute-hand {
      stroke-width: 2;
    }

    /* Modern face style */
    svg[data-style="modern"] .clock-bg {
      fill: rgba(255, 255, 255, 0.2);
    }

    svg[data-style="modern"] .clock-border {
      stroke: rgba(255, 255, 255, 0.4);
    }

    svg[data-style="modern"] .hour-marker {
      stroke: rgba(255, 255, 255, 0.9);
    }

    svg[data-style="modern"] .minute-marker {
      stroke: rgba(255, 255, 255, 0.5);
    }

    svg[data-style="modern"] .hour-number {
      fill: white;
    }

    svg[data-style="modern"] .hour-hand {
      stroke: white;
    }

    svg[data-style="modern"] .minute-hand {
      stroke: rgba(255, 255, 255, 0.9);
    }

    svg[data-style="modern"] .second-hand {
      stroke: #ffd700;
    }

    svg[data-style="modern"] .center-dot {
      fill: white;
    }

    .clock-info {
      text-align: center;
      margin-top: 1rem;
      width: 100%;
    }

    .digital-time {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 0.25rem;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    }

    .utc-offset {
      font-size: 0.9rem;
      color: #718096;
      margin-bottom: 0.25rem;
    }

    .city-name {
      font-size: 0.95rem;
      color: #4a5568;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .date-display {
      font-size: 0.85rem;
      color: #a0aec0;
    }

    .clock-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .action-btn {
      background: none;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #f7fafc;
      border-color: #cbd5e0;
    }

    @media (max-width: 768px) {
      .clock-container {
        padding: 1rem;
      }

      .clock-face {
        width: 160px;
        height: 160px;
      }

      .digital-time {
        font-size: 1.25rem;
      }
    }
  `]
})
export class AnalogClockComponent implements OnInit, OnDestroy {
  @Input() config!: ClockConfig;
  @Output() timezoneClick = new EventEmitter<ClockConfig>();
  @Output() styleClick = new EventEmitter<ClockConfig>();

  currentTime!: Date;
  hourRotation = 0;
  minuteRotation = 0;
  secondRotation = 0;
  digitalTime = '';
  utcOffset = '';
  dateDisplay = '';
  timezoneAbbr = '';

  hours = Array.from({ length: 12 }, (_, i) => i);
  minutes = Array.from({ length: 60 }, (_, i) => i);

  private intervalId?: number;

  constructor(private timezoneService: TimezoneService) {}

  ngOnInit(): void {
    this.updateTime();
    // Update every second for smooth second hand movement
    this.intervalId = window.setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTime(): void {
    this.currentTime = this.timezoneService.getTimeInTimezone(this.config.timezone);

    // Calculate hand rotations
    const hours = this.currentTime.getHours();
    const minutes = this.currentTime.getMinutes();
    const seconds = this.currentTime.getSeconds();
    const milliseconds = this.currentTime.getMilliseconds();

    // Hour hand: 30 degrees per hour + 0.5 degrees per minute
    this.hourRotation = ((hours % 12) * 30) + (minutes * 0.5);

    // Minute hand: 6 degrees per minute + 0.1 degrees per second
    this.minuteRotation = (minutes * 6) + (seconds * 0.1);

    // Second hand: 6 degrees per second (smooth sweep with milliseconds)
    this.secondRotation = (seconds * 6) + (milliseconds * 0.006);

    // Format digital time
    this.digitalTime = this.timezoneService.formatTime(
      this.currentTime,
      this.config.show24Hour,
      this.config.showSeconds
    );

    // Get UTC offset
    this.utcOffset = this.timezoneService.getUTCOffset(this.config.timezone);

    // Format date
    this.dateDisplay = this.timezoneService.formatDate(this.currentTime);

    // Get timezone abbreviation
    this.timezoneAbbr = this.config.city.includes('(')
      ? this.config.city.split('(')[1].replace(')', '').split(',')[0]
      : this.timezoneService.getTimezoneAbbreviation(this.config.timezone);
  }

  onTimezoneClick(): void {
    this.timezoneClick.emit(this.config);
  }

  onStyleClick(): void {
    this.styleClick.emit(this.config);
  }
}
