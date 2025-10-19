export interface SkyHighlight {
  type: 'star' | 'planet' | 'constellation' | 'event';
  title: string;
  description: string;
  priority: number; // 1-5, higher = more interesting
  objectName: string;
  bestViewingTime?: Date;
  currentAltitude?: number;
  icon?: string;
  data?: {
    ra?: number;
    dec?: number;
    magnitude?: number;
    constellation?: string;
    [key: string]: any;
  };
}

export interface TonightsSkyReport {
  date: Date;
  location: string;
  highlights: SkyHighlight[];
  visiblePlanets: string[];
  brightStars: string[];
  prominentConstellations: string[];
  moonPhase: number;
  moonRise: Date | null;
  moonSet: Date | null;
  bestViewingPeriod?: {
    start: Date;
    end: Date;
    reason: string;
  };
}

export interface CelestialEvent {
  type: 'conjunction' | 'opposition' | 'meteor_shower' | 'eclipse' | 'special';
  name: string;
  description: string;
  peakTime: Date;
  duration: number; // Duration in hours
  visibility: 'excellent' | 'good' | 'fair' | 'poor';
}
