import { Injectable } from '@angular/core';

/**
 * Astronomy calculation service
 * Handles coordinate transformations, time calculations, and astronomical algorithms
 */
@Injectable({
  providedIn: 'root'
})
export class AstronomyService {

  /**
   * Calculate Julian Date from JavaScript Date
   * @param date - JavaScript Date object
   * @returns Julian Date
   */
  getJulianDate(date: Date): number {
    const time = date.getTime();
    const julianDate = (time / 86400000) + 2440587.5;
    return julianDate;
  }

  /**
   * Calculate Greenwich Mean Sidereal Time (GMST)
   * @param date - JavaScript Date object
   * @returns GMST in hours (0-24)
   */
  getGMST(date: Date): number {
    const jd = this.getJulianDate(date);
    const t = (jd - 2451545.0) / 36525.0;

    // Calculate GMST in degrees
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
               0.000387933 * t * t - (t * t * t) / 38710000.0;

    // Normalize to 0-360
    gmst = gmst % 360;
    if (gmst < 0) gmst += 360;

    // Convert to hours
    return gmst / 15.0;
  }

  /**
   * Calculate Local Sidereal Time (LST)
   * @param date - JavaScript Date object
   * @param longitude - Observer's longitude in degrees (positive East)
   * @returns LST in hours (0-24)
   */
  getLocalSiderealTime(date: Date, longitude: number): number {
    const gmst = this.getGMST(date);
    let lst = gmst + (longitude / 15.0);

    // Normalize to 0-24
    lst = lst % 24;
    if (lst < 0) lst += 24;

    return lst;
  }

  /**
   * Convert Equatorial coordinates (RA/Dec) to Horizontal coordinates (Alt/Az)
   * @param ra - Right Ascension in hours (0-24)
   * @param dec - Declination in degrees (-90 to +90)
   * @param lst - Local Sidereal Time in hours (0-24)
   * @param latitude - Observer's latitude in degrees (-90 to +90)
   * @returns Object with altitude and azimuth in degrees
   */
  equatorialToHorizontal(
    ra: number,
    dec: number,
    lst: number,
    latitude: number
  ): { altitude: number; azimuth: number } {
    // Calculate Hour Angle
    let ha = lst - ra;
    if (ha < 0) ha += 24;

    // Convert to radians
    const haRad = ha * 15 * Math.PI / 180;
    const decRad = dec * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;

    // Calculate altitude
    const sinAlt = Math.sin(decRad) * Math.sin(latRad) +
                   Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const altitude = Math.asin(sinAlt) * 180 / Math.PI;

    // Calculate azimuth
    const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) /
                  (Math.cos(latRad) * Math.cos(altitude * Math.PI / 180));
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;

    // Adjust azimuth based on hour angle
    if (Math.sin(haRad) > 0) {
      azimuth = 360 - azimuth;
    }

    return { altitude, azimuth };
  }

  /**
   * Convert Horizontal coordinates (Alt/Az) to Cartesian coordinates for Three.js
   * Uses astronomy convention: altitude measured from horizon, azimuth from north
   * @param altitude - Altitude in degrees (0-90)
   * @param azimuth - Azimuth in degrees (0-360, 0=North, 90=East)
   * @param radius - Sphere radius
   * @returns 3D Cartesian coordinates
   */
  horizontalToCartesian(
    altitude: number,
    azimuth: number,
    radius: number
  ): { x: number; y: number; z: number } {
    const altRad = altitude * Math.PI / 180;
    const azRad = azimuth * Math.PI / 180;

    // Convert to Three.js coordinates
    // In Three.js: +Y is up, +X is right, +Z is forward
    const x = radius * Math.cos(altRad) * Math.sin(azRad);
    const y = radius * Math.sin(altRad);
    const z = radius * Math.cos(altRad) * Math.cos(azRad);

    return { x, y, z };
  }

  /**
   * Convert Equatorial to Cartesian (for current implementation compatibility)
   * @param ra - Right Ascension in hours
   * @param dec - Declination in degrees
   * @param radius - Sphere radius
   * @returns 3D Cartesian coordinates
   */
  equatorialToCartesian(
    ra: number,
    dec: number,
    radius: number
  ): { x: number; y: number; z: number } {
    const phi = (90 - dec) * (Math.PI / 180);
    const theta = ra * (Math.PI / 12);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return { x, y, z };
  }

  /**
   * Calculate rise, set, and transit times for a celestial object
   * @param ra - Right Ascension in hours
   * @param dec - Declination in degrees
   * @param latitude - Observer's latitude in degrees
   * @param longitude - Observer's longitude in degrees
   * @param date - Date for calculation
   * @returns Rise, set, and transit times (null if circumpolar or never rises)
   */
  calculateRiseSetTransit(
    ra: number,
    dec: number,
    latitude: number,
    longitude: number,
    date: Date
  ): { rise: Date | null; set: Date | null; transit: Date } {
    const decRad = dec * Math.PI / 180;
    const latRad = latitude * Math.PI / 180;

    // Calculate hour angle at horizon (accounting for atmospheric refraction)
    const cosH = (-0.01454) - (Math.sin(latRad) * Math.sin(decRad)) /
                  (Math.cos(latRad) * Math.cos(decRad));

    // Check if object is circumpolar or never rises
    if (cosH > 1) {
      // Never rises
      const lst = this.getLocalSiderealTime(date, longitude);
      const transitTime = this.lstToDate(date, ra, longitude);
      return { rise: null, set: null, transit: transitTime };
    }
    if (cosH < -1) {
      // Circumpolar (always visible)
      const lst = this.getLocalSiderealTime(date, longitude);
      const transitTime = this.lstToDate(date, ra, longitude);
      return { rise: null, set: null, transit: transitTime };
    }

    // Calculate hour angle
    const h = Math.acos(cosH) * 180 / Math.PI;
    const hHours = h / 15.0;

    // Calculate transit, rise, and set times
    const transit = this.lstToDate(date, ra, longitude);
    const rise = this.lstToDate(date, ra - hHours, longitude);
    const set = this.lstToDate(date, ra + hHours, longitude);

    return { rise, set, transit };
  }

  /**
   * Convert LST to Date/Time
   * @param date - Reference date
   * @param lst - Local Sidereal Time in hours
   * @param longitude - Observer's longitude
   * @returns Date object
   */
  private lstToDate(date: Date, lst: number, longitude: number): Date {
    const gmst = lst - (longitude / 15.0);
    const jd = this.getJulianDate(date);
    const jd0 = Math.floor(jd - 0.5) + 0.5;

    // Approximate time from GMST
    const t = (gmst - this.getGMST(new Date(date.setHours(0, 0, 0, 0)))) / 24.0;

    const resultDate = new Date(date);
    resultDate.setHours(0, 0, 0, 0);
    resultDate.setTime(resultDate.getTime() + t * 86400000);

    return resultDate;
  }

  /**
   * Check if a star is visible from given location
   * @param dec - Declination in degrees
   * @param latitude - Observer's latitude in degrees
   * @returns true if star can be visible, false if never rises
   */
  isStarVisible(dec: number, latitude: number): boolean {
    // A star is visible if its declination is greater than (latitude - 90)
    return dec > (latitude - 90);
  }

  /**
   * Calculate altitude of object at given time
   * @param ra - Right Ascension in hours
   * @param dec - Declination in degrees
   * @param date - Date/time
   * @param latitude - Observer's latitude
   * @param longitude - Observer's longitude
   * @returns Altitude in degrees
   */
  getAltitude(
    ra: number,
    dec: number,
    date: Date,
    latitude: number,
    longitude: number
  ): number {
    const lst = this.getLocalSiderealTime(date, longitude);
    const { altitude } = this.equatorialToHorizontal(ra, dec, lst, latitude);
    return altitude;
  }
}
