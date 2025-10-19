export interface Star {
  id: string;
  ra: number;              // Right Ascension (hours, 0-24)
  dec: number;             // Declination (degrees, -90 to +90)
  magnitude: number;       // Apparent magnitude (lower = brighter)
  spectralClass: string;   // O, B, A, F, G, K, M
  name?: string;           // Common name (e.g., "Sirius")
  bayer?: string;          // Bayer designation (e.g., "α CMa")
  flamsteed?: number;      // Flamsteed number
  constellation: string;   // Constellation abbreviation (e.g., "CMa")
}

export interface Constellation {
  id: string;              // 3-letter IAU code (e.g., "ORI")
  name: string;            // Full name (e.g., "Orion")
  abbreviation: string;    // Short form
  lines: string[][];       // Star ID pairs for stick figure [[star1_id, star2_id], ...]
  boundaries?: number[][]; // RA/Dec boundary points
  center: { ra: number; dec: number };
  mythology?: string;      // Story/description
}

export interface Planet {
  name: string;
  position: { ra: number; dec: number; distance: number };
  magnitude: number;
  phase: number;           // 0-1 (for inner planets)
  angularSize: number;     // Apparent size in arcseconds
}

/**
 * Spectral class to RGB color mapping
 * Based on actual star colors
 */
export const SPECTRAL_COLORS: { [key: string]: number } = {
  'O': 0x9bb0ff, // Blue-white
  'B': 0xaabfff, // Blue-white
  'A': 0xcad7ff, // White
  'F': 0xf8f7ff, // Yellow-white
  'G': 0xfff4ea, // Yellow
  'K': 0xffd2a1, // Orange
  'M': 0xffcc6f  // Red-orange
};

/**
 * Get star color from spectral class
 * @param spectralClass - Single letter (O, B, A, F, G, K, M)
 * @returns Hex color number
 */
export function getStarColor(spectralClass: string): number {
  const type = spectralClass.charAt(0).toUpperCase();
  return SPECTRAL_COLORS[type] || 0xffffff; // Default to white
}

/**
 * Calculate star size based on magnitude
 * Uses logarithmic scaling (brighter = larger)
 * @param magnitude - Apparent magnitude (lower = brighter)
 * @param scale - Scale factor (default: 1.0)
 * @returns Size multiplier
 */
export function getStarSize(magnitude: number, scale: number = 1.0): number {
  // Brighter stars (lower magnitude) should be larger
  // Increased base multiplier for better visibility
  const baseSize = Math.pow(2.512, -magnitude / 2.5) * 2.5; // Increased from implicit 1.0 to 2.5
  return Math.max(0.3, Math.min(baseSize, 8.0)) * scale; // Increased min from 0.1 to 0.3, max from 3.0 to 8.0
}

/**
 * Planet colors based on actual appearance
 */
export const PLANET_COLORS: { [key: string]: number } = {
  'Mercury': 0xa0a0a0,  // Gray
  'Venus': 0xfff4e6,    // Creamy white
  'Mars': 0xff6b4a,     // Red-orange
  'Jupiter': 0xffd8a1,  // Tan
  'Saturn': 0xfae5b8,   // Pale yellow
  'Uranus': 0xaff4ff,   // Cyan
  'Neptune': 0x4a6fff,  // Blue
  'Moon': 0xc8c8c8      // Silver-gray
};

/**
 * Get planet color
 * @param planetName - Name of the planet
 * @returns Hex color number
 */
export function getPlanetColor(planetName: string): number {
  return PLANET_COLORS[planetName] || 0xffffff;
}

/**
 * Calculate planet size based on magnitude
 * @param magnitude - Apparent magnitude
 * @param scale - Scale factor (default: 1.0)
 * @returns Size multiplier
 */
export function getPlanetSize(magnitude: number, scale: number = 1.0): number {
  // Planets are brighter than stars, use larger base size
  const baseSize = Math.pow(2.512, -magnitude / 2.5) * 3.5;
  return Math.max(0.8, Math.min(baseSize, 12.0)) * scale;
}
