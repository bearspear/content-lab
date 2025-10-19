export interface MoonPhase {
  phase: number; // 0-1 (0 = new moon, 0.5 = full moon)
  illumination: number; // 0-100%
  age: number; // days since new moon (0-29.5)
  phaseName: string; // "New Moon", "First Quarter", etc.
  emoji: string; // 🌑, 🌓, 🌕, etc.
  nextFullMoon: Date;
  nextNewMoon: Date;
  daysUntilFullMoon: number;
  daysUntilNewMoon: number;
}

export interface SolarInfo {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLength: number; // in seconds
  goldenHourMorning: { start: Date; end: Date };
  goldenHourEvening: { start: Date; end: Date };
  civilTwilight: { dawn: Date; dusk: Date };
  nauticalTwilight: { dawn: Date; dusk: Date };
  astronomicalTwilight: { dawn: Date; dusk: Date };
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
}
