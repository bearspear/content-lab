export interface StarMapState {
  // Observer settings
  observerLocation: GeographicCoordinate;
  observerTime: Date;

  // View settings
  viewMode: 'equatorial' | 'horizontal' | 'ecliptic';
  perspective: 'sky' | 'sphere' | 'planisphere';

  // Display toggles
  showConstellationLines: boolean;
  showConstellationBoundaries: boolean;
  showConstellationLabels: boolean;
  showPlanets: boolean;
  showDeepSkyObjects: boolean;
  showGrid: boolean;
  showHorizon: boolean;
  showEcliptic: boolean;
  showPlanetTrails: boolean;

  // Filters
  minMagnitude: number;
  maxMagnitude: number;

  // Visual settings
  colorScheme: 'dark' | 'twilight' | 'light';
  starSizeScale: number;
  labelDensity: number;

  // Animation & Real-time Tracking
  isAnimating: boolean;
  timeSpeed: number;
  isRealTimeTracking: boolean;
  realTimeUpdateInterval: number;

  // Selection
  selectedObject: CelestialObject | null;
  highlightedConstellation: string | null;
}

export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  name: string;
}

export interface CelestialObject {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'deepsky' | 'constellation';
  position: {
    ra: number;   // Right Ascension (hours)
    dec: number;  // Declination (degrees)
  };
  magnitude?: number;
}

export const DEFAULT_STAR_MAP_STATE: StarMapState = {
  observerLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    elevation: 0,
    timezone: 'America/Los_Angeles',
    name: 'San Francisco, CA'
  },
  observerTime: new Date(),

  viewMode: 'equatorial',
  perspective: 'sphere',

  showConstellationLines: true,
  showConstellationBoundaries: false,
  showConstellationLabels: true,
  showPlanets: true,
  showDeepSkyObjects: false,
  showGrid: false,
  showHorizon: false,
  showEcliptic: true,
  showPlanetTrails: false,

  minMagnitude: 0,
  maxMagnitude: 6.5,

  colorScheme: 'dark',
  starSizeScale: 1.0,
  labelDensity: 1.0,

  isAnimating: false,
  timeSpeed: 1,
  isRealTimeTracking: false,
  realTimeUpdateInterval: 1000,

  selectedObject: null,
  highlightedConstellation: null
};
