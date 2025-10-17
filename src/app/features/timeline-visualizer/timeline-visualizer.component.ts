import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatefulComponent } from '../../core/base/stateful-component.base';
import { StateManagerService } from '../../core/services/state-manager.service';
import { TimelineEvent } from './models/timeline-event.model';
import { TimelineState, DEFAULT_TIMELINE_STATE } from './models/timeline-state.model';

@Component({
  selector: 'app-timeline-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './timeline-visualizer.component.html',
  styleUrl: './timeline-visualizer.component.scss'
})
export class TimelineVisualizerComponent extends StatefulComponent<TimelineState> implements AfterViewInit, OnDestroy {
  @ViewChild('timelineCanvas') timelineCanvas!: ElementRef<SVGSVGElement>;

  protected readonly TOOL_ID = 'timeline-visualizer';

  // State - actual timeline state
  state: TimelineState = { ...DEFAULT_TIMELINE_STATE };

  // Form data for adding new events
  newEvent = {
    date: this.formatDateForInput(new Date()),
    title: '',
    description: '',
    category: '',
    icon: '',
    color: ''
  };

  // Predefined options
  categories = [
    'Work',
    'Personal',
    'Education',
    'Health',
    'Finance',
    'Travel',
    'Milestone',
    'Meeting',
    'Deadline',
    'Other'
  ];

  icons = [
    '📅', '🎯', '🎉', '🎓', '💼', '✈️', '🏆', '💡',
    '📝', '🚀', '⭐', '🔔', '📊', '🎨', '💰', '🏥',
    '🎵', '📚', '🏃', '🍔', '🎮', '📱', '💻', '🏠'
  ];

  colors = [
    { name: 'Purple', value: '#667eea' },
    { name: 'Violet', value: '#764ba2' },
    { name: 'Pink', value: '#f093fb' },
    { name: 'Blue', value: '#4facfe' },
    { name: 'Green', value: '#43e97b' },
    { name: 'Rose', value: '#fa709a' },
    { name: 'Yellow', value: '#fee140' },
    { name: 'Cyan', value: '#30cfd0' },
    { name: 'Orange', value: '#ff9966' },
    { name: 'Red', value: '#ff6b6b' }
  ];

  // Timeline dimensions (responsive)
  canvasWidth = 1600;
  canvasHeight = 800;
  get timelineY(): number {
    return this.canvasHeight / 2;
  }

  // Zoom and pan
  private isDragging = false;
  private dragStartX = 0;
  private panStartX = 0;

  // Calculated timeline bounds
  minDate: Date | null = null;
  maxDate: Date | null = null;
  timelineStartX = 100;
  timelineEndX = this.canvasWidth - 100;

  // Modal state
  showAddEventModal = false;

  constructor(stateManager: StateManagerService) {
    super(stateManager);
  }

  protected override getDefaultState(): TimelineState {
    return { ...DEFAULT_TIMELINE_STATE };
  }

  protected override applyState(state: TimelineState): void {
    this.state = {
      ...state,
      // Convert date strings back to Date objects
      events: state.events.map(e => ({
        ...e,
        date: typeof e.date === 'string' ? new Date(e.date) : e.date
      }))
    };
    this.calculateTimelineBounds();
    this.positionEvents();
  }

  protected override getCurrentState(): TimelineState {
    return {
      ...this.state
    };
  }

  ngAfterViewInit(): void {
    this.updateCanvasSize();
    this.calculateTimelineBounds();
    this.positionEvents();

    // Update canvas size on window resize
    window.addEventListener('resize', () => this.updateCanvasSize());
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    // Note: Can't remove the exact same function reference, but it will be garbage collected
  }

  /**
   * Update canvas size based on container
   */
  private updateCanvasSize(): void {
    if (!this.timelineCanvas) {
      return;
    }

    const container = this.timelineCanvas.nativeElement.parentElement;
    if (container) {
      // Use container dimensions minus some padding
      this.canvasWidth = Math.max(1200, container.clientWidth - 40);
      this.canvasHeight = Math.max(600, container.clientHeight - 40);
      this.timelineStartX = 100;
      this.timelineEndX = this.canvasWidth - 100;
      this.positionEvents();
    }
  }

  /**
   * Open add event modal
   */
  openAddEventModal(): void {
    this.showAddEventModal = true;
  }

  /**
   * Close add event modal
   */
  closeAddEventModal(): void {
    this.showAddEventModal = false;
    // Reset form
    this.newEvent = {
      date: this.formatDateForInput(new Date()),
      title: '',
      description: '',
      category: '',
      icon: '',
      color: ''
    };
  }

  /**
   * Add a new event to the timeline
   */
  addEvent(): void {
    // Validate inputs
    if (!this.newEvent.title?.trim()) {
      alert('Please enter a title for the event');
      return;
    }

    if (!this.newEvent.date) {
      alert('Please select a date for the event');
      return;
    }

    const event: TimelineEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date(this.newEvent.date),
      title: this.newEvent.title.trim(),
      description: this.newEvent.description?.trim() || undefined,
      category: this.newEvent.category || undefined,
      icon: this.newEvent.icon || undefined,
      color: this.newEvent.color || this.generateRandomColor()
    };

    this.state.events.push(event);
    this.calculateTimelineBounds();
    this.positionEvents();
    this.saveState();

    // Close modal and reset form
    this.closeAddEventModal();
  }

  /**
   * Delete an event
   */
  deleteEvent(eventId: string): void {
    this.state.events = this.state.events.filter(e => e.id !== eventId);
    this.calculateTimelineBounds();
    this.positionEvents();
    this.saveState();
  }

  /**
   * Calculate the min and max dates from events
   */
  private calculateTimelineBounds(): void {
    if (this.state.events.length === 0) {
      this.minDate = null;
      this.maxDate = null;
      return;
    }

    const dates = this.state.events.map(e => e.date.getTime());
    this.minDate = new Date(Math.min(...dates));
    this.maxDate = new Date(Math.max(...dates));

    // Add padding (10% on each side)
    const timeRange = this.maxDate.getTime() - this.minDate.getTime();
    const padding = timeRange * 0.1;
    this.minDate = new Date(this.minDate.getTime() - padding);
    this.maxDate = new Date(this.maxDate.getTime() + padding);
  }

  /**
   * Position events along the timeline
   */
  private positionEvents(): void {
    if (!this.minDate || !this.maxDate) {
      return;
    }

    const timeRange = this.maxDate.getTime() - this.minDate.getTime();
    const spaceRange = this.timelineEndX - this.timelineStartX;

    // Sort events by date
    const sortedEvents = [...this.state.events].sort((a, b) => a.date.getTime() - b.date.getTime());

    // Alternate between top and bottom
    sortedEvents.forEach((event, index) => {
      const normalizedTime = (event.date.getTime() - this.minDate!.getTime()) / timeRange;
      event.x = this.timelineStartX + (normalizedTime * spaceRange * this.state.zoom) + this.state.panX;
      event.position = index % 2 === 0 ? 'top' : 'bottom';
      event.y = event.position === 'top' ? this.timelineY - 80 : this.timelineY + 80;
    });
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    this.state.zoom = Math.min(this.state.zoom * 1.2, 10);
    this.positionEvents();
    this.saveState();
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    this.state.zoom = Math.max(this.state.zoom / 1.2, 0.1);
    this.positionEvents();
    this.saveState();
  }

  /**
   * Reset zoom
   */
  resetZoom(): void {
    this.state.zoom = 1.0;
    this.state.panX = 0;
    this.positionEvents();
    this.saveState();
  }

  /**
   * Reset timeline (clear all events)
   */
  resetTimeline(): void {
    if (this.state.events.length === 0) {
      return;
    }

    if (confirm('Are you sure you want to clear all events? This action cannot be undone.')) {
      this.state.events = [];
      this.state.zoom = 1.0;
      this.state.panX = 0;
      this.calculateTimelineBounds();
      this.positionEvents();
      this.saveState();
    }
  }

  /**
   * Mouse down - start dragging
   */
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.panStartX = this.state.panX;
  }

  /**
   * Mouse move - pan timeline
   */
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    const deltaX = event.clientX - this.dragStartX;
    this.state.panX = this.panStartX + deltaX;
    this.positionEvents();
  }

  /**
   * Mouse up - stop dragging
   */
  onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.saveState();
    }
  }

  /**
   * Mouse wheel - zoom
   */
  onWheel(event: WheelEvent): void {
    event.preventDefault();

    if (event.deltaY < 0) {
      this.zoomIn();
    } else {
      this.zoomOut();
    }
  }

  /**
   * Export timeline to PNG
   */
  exportToPng(): void {
    if (!this.timelineCanvas) {
      return;
    }

    const svgElement = this.timelineCanvas.nativeElement;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.download = 'timeline.png';
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });
    };

    img.src = url;
  }

  /**
   * Format date for input field
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Generate random color for event
   */
  private generateRandomColor(): string {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#4facfe',
      '#43e97b', '#fa709a', '#fee140', '#30cfd0'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Generate time ticks for the timeline
   */
  getTimeTicks(): Array<{ x: number; label: string }> {
    if (!this.minDate || !this.maxDate) {
      return [];
    }

    const ticks: Array<{ x: number; label: string }> = [];
    const timeRange = this.maxDate.getTime() - this.minDate.getTime();
    const spaceRange = this.timelineEndX - this.timelineStartX;

    // Generate ticks for each day
    const dayInMs = 24 * 60 * 60 * 1000;
    const numDays = Math.ceil(timeRange / dayInMs);
    const tickInterval = Math.max(1, Math.floor(numDays / 10)); // Show ~10 ticks

    for (let i = 0; i <= numDays; i += tickInterval) {
      const tickDate = new Date(this.minDate.getTime() + i * dayInMs);
      const normalizedTime = (tickDate.getTime() - this.minDate.getTime()) / timeRange;
      const x = this.timelineStartX + (normalizedTime * spaceRange * this.state.zoom) + this.state.panX;

      ticks.push({
        x,
        label: tickDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }

    return ticks;
  }

  /**
   * Generate subticks for finer granularity
   */
  getTimeSubticks(): Array<{ x: number; label: string }> {
    if (!this.minDate || !this.maxDate) {
      return [];
    }

    const subticks: Array<{ x: number; label: string }> = [];
    const timeRange = this.maxDate.getTime() - this.minDate.getTime();
    const spaceRange = this.timelineEndX - this.timelineStartX;

    // Calculate pixels per day to determine if we should show subticks
    const dayInMs = 24 * 60 * 60 * 1000;
    const numDays = Math.ceil(timeRange / dayInMs);
    const tickInterval = Math.max(1, Math.floor(numDays / 10));

    // Calculate pixel spacing between main ticks
    const pixelsPerTick = (spaceRange * this.state.zoom) / (numDays / tickInterval);

    // Only show subticks if there's enough space (more than 80 pixels between main ticks)
    if (pixelsPerTick < 80) {
      return subticks;
    }

    // Generate hourly subticks between day ticks
    const hourInMs = 60 * 60 * 1000;
    const numHours = Math.ceil(timeRange / hourInMs);

    // Show subticks every N hours based on available space
    let subtickInterval = 6; // Default: every 6 hours
    if (pixelsPerTick > 200) {
      subtickInterval = 3; // More space: every 3 hours
    }
    if (pixelsPerTick > 400) {
      subtickInterval = 1; // Lots of space: every hour
    }

    for (let i = 0; i <= numHours; i += subtickInterval) {
      const subtickDate = new Date(this.minDate.getTime() + i * hourInMs);

      // Skip subticks that fall on main tick positions (midnight)
      if (subtickDate.getHours() === 0) {
        continue;
      }

      const normalizedTime = (subtickDate.getTime() - this.minDate.getTime()) / timeRange;
      const x = this.timelineStartX + (normalizedTime * spaceRange * this.state.zoom) + this.state.panX;

      // Format hour label (e.g., "6am", "12pm", "6pm")
      const hours = subtickDate.getHours();
      const ampm = hours >= 12 ? 'pm' : 'am';
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;
      const label = `${displayHour}${ampm}`;

      subticks.push({ x, label });
    }

    return subticks;
  }
}
