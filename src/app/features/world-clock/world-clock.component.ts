import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalogClockComponent } from './components/analog-clock.component';
import { ClockConfig, WorldClockState, DEFAULT_CLOCKS, ClockFaceStyle } from './models/clock-config.model';
import { TimezoneService, TimezoneInfo } from './services/timezone.service';
import { MoonPhaseService } from './services/moon-phase.service';
import { SolarService } from './services/solar.service';
import { MoonPhase, SolarInfo, LocationCoordinates } from './models/moon-phase.model';
import { StatefulComponent } from '../../core/base';
import { StateManagerService } from '../../core/services';

@Component({
  selector: 'app-world-clock',
  standalone: true,
  imports: [CommonModule, FormsModule, AnalogClockComponent],
  templateUrl: './world-clock.component.html',
  styleUrl: './world-clock.component.scss'
})
export class WorldClockComponent extends StatefulComponent<WorldClockState> implements OnInit, OnDestroy {
  protected readonly TOOL_ID = 'world-clock';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  clocks: ClockConfig[] = [...DEFAULT_CLOCKS];
  show24Hour = false;
  showTimezoneModal = false;
  showStyleModal = false;
  showSettingsModal = false;
  selectedClockConfig: ClockConfig | null = null;
  timezones: TimezoneInfo[] = [];
  filteredTimezones: TimezoneInfo[] = [];
  searchQuery = '';
  isHeaderCollapsed = false;
  currentTheme: 'light' | 'dark' = 'light';

  // Moon & Solar Data
  moonPhase: MoonPhase | null = null;
  solarInfo: SolarInfo | null = null;
  currentLocation: LocationCoordinates | null = null;
  showMoonPanel = false;
  showSolarPanel = false;
  showLunarCalendar = false;
  currentCalendarMonth: number = new Date().getMonth();
  currentCalendarYear: number = new Date().getFullYear();
  private updateInterval?: number;

  globalSettings = {
    show24Hour: false,
    showSeconds: true,
    theme: 'light' as 'light' | 'dark' | 'auto',
    dateFormat: 'us' as 'us' | 'eu' | 'iso',
    defaultFaceStyle: 'classic' as ClockFaceStyle
  };

  clockStyles = [
    { value: 'classic' as ClockFaceStyle, label: 'Classic', description: 'Traditional analog clock' },
    { value: 'modern' as ClockFaceStyle, label: 'Modern', description: 'Purple gradient design' },
    { value: 'dark' as ClockFaceStyle, label: 'Dark', description: 'Dark mode theme' },
    { value: 'minimal' as ClockFaceStyle, label: 'Minimal', description: 'Clean and simple' }
  ];

  constructor(
    stateManager: StateManagerService,
    private timezoneService: TimezoneService,
    private moonPhaseService: MoonPhaseService,
    private solarService: SolarService
  ) {
    super(stateManager);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.timezones = this.timezoneService.getPopularTimezones();
    this.filteredTimezones = this.timezones;
    this.applyTheme();

    // Initialize moon and solar data
    this.initializeMoonAndSolarData();

    // Update moon/solar data every 10 minutes
    this.updateInterval = window.setInterval(() => {
      this.updateMoonAndSolarData();
    }, 600000);
  }

  override ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  private async initializeMoonAndSolarData(): Promise<void> {
    // Try to get user's location, fallback to default
    try {
      this.currentLocation = await this.solarService.getUserLocation();
    } catch (error) {
      this.currentLocation = this.solarService.getDefaultLocation();
    }

    this.updateMoonAndSolarData();
  }

  private updateMoonAndSolarData(): void {
    // Update moon phase
    this.moonPhase = this.moonPhaseService.getMoonPhase();

    // Update solar info if we have a location
    if (this.currentLocation) {
      this.solarInfo = this.solarService.getSolarInfo(this.currentLocation);
    }
  }

  toggleMoonPanel(): void {
    this.showMoonPanel = !this.showMoonPanel;
  }

  toggleSolarPanel(): void {
    this.showSolarPanel = !this.showSolarPanel;
  }

  toggleLunarCalendar(): void {
    this.showLunarCalendar = !this.showLunarCalendar;
  }

  getMonthlyPhases(): Array<{ date: Date; phase: MoonPhase }> {
    return this.moonPhaseService.getMonthlyPhases(this.currentCalendarYear, this.currentCalendarMonth);
  }

  previousMonth(): void {
    if (this.currentCalendarMonth === 0) {
      this.currentCalendarMonth = 11;
      this.currentCalendarYear--;
    } else {
      this.currentCalendarMonth--;
    }
  }

  nextMonth(): void {
    if (this.currentCalendarMonth === 11) {
      this.currentCalendarMonth = 0;
      this.currentCalendarYear++;
    } else {
      this.currentCalendarMonth++;
    }
  }

  getMonthName(): string {
    const date = new Date(this.currentCalendarYear, this.currentCalendarMonth);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getCalendarDays(): Array<{ date: Date | null; phase: MoonPhase | null; isToday: boolean }> {
    const firstDay = new Date(this.currentCalendarYear, this.currentCalendarMonth, 1);
    const lastDay = new Date(this.currentCalendarYear, this.currentCalendarMonth + 1, 0);
    const startDay = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: Array<{ date: Date | null; phase: MoonPhase | null; isToday: boolean }> = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, phase: null, isToday: false });
    }

    // Add actual days of the month
    const monthlyPhases = this.getMonthlyPhases();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentCalendarYear, this.currentCalendarMonth, day);
      date.setHours(0, 0, 0, 0);
      const phaseData = monthlyPhases.find(p =>
        p.date.getDate() === day &&
        p.date.getMonth() === this.currentCalendarMonth &&
        p.date.getFullYear() === this.currentCalendarYear
      );
      days.push({
        date: date,
        phase: phaseData ? phaseData.phase : null,
        isToday: date.getTime() === today.getTime()
      });
    }

    return days;
  }

  protected getDefaultState(): WorldClockState {
    return {
      clocks: [...DEFAULT_CLOCKS],
      globalSettings: {
        show24Hour: false,
        showSeconds: true,
        theme: 'light',
        dateFormat: 'us',
        defaultFaceStyle: 'classic'
      }
    };
  }

  protected applyState(state: WorldClockState): void {
    // Ensure all clocks have faceStyle property (for backward compatibility)
    this.clocks = state.clocks.map(clock => ({
      ...clock,
      faceStyle: clock.faceStyle || 'classic'
    }));
    this.show24Hour = state.globalSettings.show24Hour;
    // Load global settings
    this.globalSettings = {
      ...this.globalSettings,
      ...state.globalSettings
    };
  }

  protected getCurrentState(): WorldClockState {
    return {
      clocks: this.clocks,
      globalSettings: this.globalSettings
    };
  }

  toggle24Hour(): void {
    this.show24Hour = !this.show24Hour;
    // Update all clocks
    this.clocks = this.clocks.map(clock => ({
      ...clock,
      show24Hour: this.show24Hour
    }));
    this.saveState();
  }

  toggleHeader(): void {
    this.isHeaderCollapsed = !this.isHeaderCollapsed;
  }

  openTimezoneModal(clock: ClockConfig): void {
    if (!clock.isFixed) {
      this.selectedClockConfig = clock;
      this.showTimezoneModal = true;
      this.searchQuery = '';
      this.filteredTimezones = this.timezones;
    }
  }

  closeTimezoneModal(): void {
    this.showTimezoneModal = false;
    this.selectedClockConfig = null;
    this.searchQuery = '';
  }

  selectTimezone(timezone: TimezoneInfo): void {
    if (this.selectedClockConfig) {
      const clockIndex = this.clocks.findIndex(c => c.id === this.selectedClockConfig!.id);
      if (clockIndex !== -1) {
        this.clocks[clockIndex] = {
          ...this.clocks[clockIndex],
          timezone: timezone.name,
          city: timezone.displayName
        };
        this.saveState();
      }
    }
    this.closeTimezoneModal();
  }

  searchTimezones(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredTimezones = this.timezones;
    } else {
      this.filteredTimezones = this.timezoneService.searchTimezones(this.searchQuery);
    }
  }

  getClocksByRow(row: number): ClockConfig[] {
    const startIndex = (row - 1) * 3;
    return this.clocks.slice(startIndex, startIndex + 3);
  }

  openStyleModal(clock: ClockConfig): void {
    this.selectedClockConfig = clock;
    this.showStyleModal = true;
  }

  closeStyleModal(): void {
    this.showStyleModal = false;
    this.selectedClockConfig = null;
  }

  selectClockStyle(style: ClockFaceStyle): void {
    if (this.selectedClockConfig) {
      const clockIndex = this.clocks.findIndex(c => c.id === this.selectedClockConfig!.id);
      if (clockIndex !== -1) {
        this.clocks[clockIndex] = {
          ...this.clocks[clockIndex],
          faceStyle: style
        };
        this.saveState();
      }
    }
    this.closeStyleModal();
  }

  openSettingsModal(): void {
    this.showSettingsModal = true;
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
  }

  saveSettings(): void {
    this.applyTheme();
    this.saveState();
  }

  applyTheme(): void {
    if (this.globalSettings.theme === 'auto') {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    } else {
      this.currentTheme = this.globalSettings.theme as 'light' | 'dark';
    }
  }

  exportConfiguration(): void {
    const state = this.getCurrentState();
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `world-clock-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importConfiguration(): void {
    this.fileInput.nativeElement.click();
  }

  handleFileImport(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const state = JSON.parse(content) as WorldClockState;
          // Validate the imported state has required properties
          if (state.clocks && state.globalSettings) {
            this.applyState(state);
            this.saveState();
            this.closeSettingsModal();
            alert('Configuration imported successfully!');
          } else {
            alert('Invalid configuration file format.');
          }
        } catch (error) {
          console.error('Error importing configuration:', error);
          alert('Error importing configuration. Please check the file format.');
        }
      };
      reader.readAsText(file);
      // Reset the input so the same file can be selected again
      input.value = '';
    }
  }

  formatDayLength(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}
