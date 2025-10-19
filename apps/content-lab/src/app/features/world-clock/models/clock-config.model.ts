export type ClockFaceStyle = 'classic' | 'modern' | 'dark' | 'minimal';
export type DateFormat = 'us' | 'eu' | 'iso';

export interface ClockConfig {
  id: string;
  position: number; // 1-6
  timezone: string; // IANA timezone (e.g., "America/New_York")
  city: string; // Display name
  isFixed: boolean; // true for UTC and Local
  showDigital: boolean;
  show24Hour: boolean;
  showSeconds: boolean;
  faceStyle: ClockFaceStyle;
}

export interface WorldClockState {
  clocks: ClockConfig[];
  globalSettings: {
    show24Hour: boolean;
    showSeconds: boolean;
    theme: 'light' | 'dark' | 'auto';
    dateFormat: DateFormat;
    defaultFaceStyle: ClockFaceStyle;
  };
}

export const DEFAULT_CLOCKS: ClockConfig[] = [
  {
    id: 'utc',
    position: 1,
    timezone: 'UTC',
    city: 'Coordinated Universal Time',
    isFixed: true,
    showDigital: true,
    show24Hour: true,
    showSeconds: true,
    faceStyle: 'classic'
  },
  {
    id: 'local',
    position: 2,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    city: 'Local Time',
    isFixed: true,
    showDigital: true,
    show24Hour: false,
    showSeconds: true,
    faceStyle: 'classic'
  },
  {
    id: 'mst',
    position: 3,
    timezone: 'America/Denver',
    city: 'Denver, CO (MST)',
    isFixed: false,
    showDigital: true,
    show24Hour: false,
    showSeconds: true,
    faceStyle: 'classic'
  },
  {
    id: 'cst',
    position: 4,
    timezone: 'America/Chicago',
    city: 'Chicago, IL (CST)',
    isFixed: false,
    showDigital: true,
    show24Hour: false,
    showSeconds: true,
    faceStyle: 'classic'
  },
  {
    id: 'est',
    position: 5,
    timezone: 'America/New_York',
    city: 'New York, NY (EST)',
    isFixed: false,
    showDigital: true,
    show24Hour: false,
    showSeconds: true,
    faceStyle: 'classic'
  },
  {
    id: 'cet',
    position: 6,
    timezone: 'Europe/Berlin',
    city: 'Berlin, DE (CET)',
    isFixed: false,
    showDigital: true,
    show24Hour: true,
    showSeconds: true,
    faceStyle: 'classic'
  }
];
