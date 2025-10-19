import { Injectable } from '@angular/core';
import * as Astronomy from 'astronomy-engine';
import { Planet } from '../models/celestial-object.model';

@Injectable({
  providedIn: 'root'
})
export class PlanetaryEphemerisService {

  /**
   * List of major planets (excluding Earth)
   */
  private readonly PLANETS: string[] = [
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune'
  ];

  constructor() {}

  /**
   * Calculate positions for all major planets at given time
   * @param date - Date and time for calculations
   * @param observerLatitude - Observer latitude in degrees
   * @param observerLongitude - Observer longitude in degrees
   * @returns Array of Planet objects with positions
   */
  getAllPlanetPositions(date: Date, observerLatitude: number, observerLongitude: number): Planet[] {
    return this.PLANETS.map(planetName => this.getPlanetPosition(planetName, date, observerLatitude, observerLongitude));
  }

  /**
   * Calculate position for a specific planet
   * @param planetName - Name of the planet
   * @param date - Date and time for calculation
   * @param observerLatitude - Observer latitude in degrees
   * @param observerLongitude - Observer longitude in degrees
   * @returns Planet object with position and properties
   */
  getPlanetPosition(planetName: string, date: Date, observerLatitude: number, observerLongitude: number): Planet {
    // Create observer object
    const observer = new Astronomy.Observer(observerLatitude, observerLongitude, 0);

    // Get equatorial coordinates (RA/Dec)
    // astronomy-engine expects proper case body names
    const bodyName = planetName as Astronomy.Body;
    const equator = Astronomy.Equator(bodyName, date, observer, true, true);

    // Get horizontal coordinates (Alt/Az) for magnitude calculation
    const horizontal = Astronomy.Horizon(date, observer, equator.ra, equator.dec, 'normal');

    // Calculate illumination (for magnitude)
    const illum = Astronomy.Illumination(bodyName, date);

    // Calculate distance from Earth
    const vector = Astronomy.GeoVector(bodyName, date, true);
    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

    // Calculate elongation (for phase)
    const elongation = Astronomy.Elongation(bodyName, date);

    // Approximate phase (0-1, where 0.5 is half illuminated)
    // For inner planets, phase varies significantly
    // For outer planets, phase is always near 1.0 (fully illuminated)
    const phase = illum.phase_fraction;

    return {
      name: planetName,
      position: {
        ra: equator.ra,
        dec: equator.dec,
        distance: distance
      },
      magnitude: illum.mag,
      phase: phase,
      angularSize: this.calculateAngularSize(planetName, distance)
    };
  }

  /**
   * Get Moon position and phase
   * @param date - Date and time for calculation
   * @param observerLatitude - Observer latitude in degrees
   * @param observerLongitude - Observer longitude in degrees
   * @returns Planet object representing the Moon
   */
  getMoonPosition(date: Date, observerLatitude: number, observerLongitude: number): Planet {
    const observer = new Astronomy.Observer(observerLatitude, observerLongitude, 0);

    // Get equatorial coordinates
    const equator = Astronomy.Equator(Astronomy.Body.Moon, date, observer, true, true);

    // Get illumination for phase and magnitude
    const illum = Astronomy.Illumination(Astronomy.Body.Moon, date);

    // Calculate distance
    const vector = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

    // Angular size (Moon varies from ~29-33 arcmin)
    const angularSize = this.calculateAngularSize('Moon', distance);

    return {
      name: 'Moon',
      position: {
        ra: equator.ra,
        dec: equator.dec,
        distance: distance
      },
      magnitude: illum.mag,
      phase: illum.phase_fraction,
      angularSize: angularSize
    };
  }

  /**
   * Get Sun position
   * @param date - Date and time for calculation
   * @param observerLatitude - Observer latitude in degrees
   * @param observerLongitude - Observer longitude in degrees
   * @returns Planet object representing the Sun
   */
  getSunPosition(date: Date, observerLatitude: number, observerLongitude: number): Planet {
    const observer = new Astronomy.Observer(observerLatitude, observerLongitude, 0);

    // Get equatorial coordinates
    const equator = Astronomy.Equator(Astronomy.Body.Sun, date, observer, true, true);

    // Sun's distance from Earth
    const vector = Astronomy.GeoVector(Astronomy.Body.Sun, date, true);
    const distance = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);

    return {
      name: 'Sun',
      position: {
        ra: equator.ra,
        dec: equator.dec,
        distance: distance
      },
      magnitude: -26.7, // Sun's apparent magnitude
      phase: 1.0, // Always fully illuminated from our perspective
      angularSize: 1920 // ~32 arcmin in arcseconds
    };
  }

  /**
   * Calculate angular size of a celestial body
   * @param bodyName - Name of the body
   * @param distance - Distance in AU
   * @returns Angular size in arcseconds
   */
  private calculateAngularSize(bodyName: string, distance: number): number {
    // Physical diameters in km (approximate)
    const diameters: { [key: string]: number } = {
      'Mercury': 4879,
      'Venus': 12104,
      'Mars': 6779,
      'Jupiter': 139820,
      'Saturn': 116460,
      'Uranus': 50724,
      'Neptune': 49244,
      'Moon': 3474,
      'Sun': 1392700
    };

    const diameter = diameters[bodyName] || 0;
    if (diameter === 0) return 0;

    // Convert distance from AU to km
    const distanceKm = distance * 149597870.7;

    // Calculate angular size: 2 * arctan(diameter / (2 * distance))
    // For small angles, this simplifies to: diameter / distance (in radians)
    const angularSizeRad = diameter / distanceKm;

    // Convert to arcseconds (radians * 206265)
    return angularSizeRad * 206265;
  }

  /**
   * Get ecliptic coordinates for a point on the ecliptic
   * @param longitude - Ecliptic longitude in degrees (0-360)
   * @param date - Date for calculation
   * @returns Equatorial coordinates (RA/Dec)
   */
  getEclipticPoint(longitude: number, date: Date): { ra: number; dec: number } {
    // Manual conversion from ecliptic to equatorial coordinates
    // For a point on the ecliptic plane (latitude = 0)

    // Obliquity of the ecliptic (angle between equatorial and ecliptic planes)
    // Using J2000 epoch value: 23.439281 degrees
    const obliquity = 23.439281;
    const obliquityRad = obliquity * (Math.PI / 180);

    // Convert longitude to radians
    const longitudeRad = longitude * (Math.PI / 180);

    // Calculate declination
    // δ = arcsin(sin(λ) × sin(ε))
    const dec = Math.asin(Math.sin(longitudeRad) * Math.sin(obliquityRad));

    // Calculate right ascension
    // α = arctan2(sin(λ) × cos(ε), cos(λ))
    const raRad = Math.atan2(
      Math.sin(longitudeRad) * Math.cos(obliquityRad),
      Math.cos(longitudeRad)
    );

    // Convert from radians to hours (RA) and degrees (Dec)
    let ra = raRad * (12 / Math.PI); // Convert radians to hours (24h = 2π radians)
    if (ra < 0) ra += 24; // Ensure RA is in range [0, 24)

    const decDegrees = dec * (180 / Math.PI); // Convert radians to degrees

    return {
      ra: ra,
      dec: decDegrees
    };
  }
}
