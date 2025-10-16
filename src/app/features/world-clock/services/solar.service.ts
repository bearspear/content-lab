import { Injectable } from '@angular/core';
import { SolarInfo, LocationCoordinates } from '../models/moon-phase.model';
import * as SunCalc from 'suncalc';

@Injectable({
  providedIn: 'root'
})
export class SolarService {
  constructor() {}

  /**
   * Calculate solar information for a location and date using SunCalc library
   */
  getSolarInfo(location: LocationCoordinates, date: Date = new Date()): SolarInfo {
    const times = SunCalc.getTimes(date, location.latitude, location.longitude);

    return {
      sunrise: times.sunrise,
      sunset: times.sunset,
      solarNoon: times.solarNoon,
      dayLength: (times.sunset.getTime() - times.sunrise.getTime()) / 1000,
      goldenHourMorning: {
        start: times.goldenHour,
        end: times.sunriseEnd
      },
      goldenHourEvening: {
        start: times.sunsetStart,
        end: times.goldenHourEnd
      },
      civilTwilight: {
        dawn: times.dawn,
        dusk: times.dusk
      },
      nauticalTwilight: {
        dawn: times.nauticalDawn,
        dusk: times.nauticalDusk
      },
      astronomicalTwilight: {
        dawn: times.nightEnd,
        dusk: times.night
      }
    };
  }

  /**
   * Get default location (can be overridden with user's location)
   */
  getDefaultLocation(): LocationCoordinates {
    return {
      latitude: 39.7392, // Denver, CO
      longitude: -104.9903,
      name: 'Denver, CO'
    };
  }

  /**
   * Get user's geolocation
   */
  async getUserLocation(): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: 'Current Location'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve(this.getDefaultLocation());
        }
      );
    });
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return `${hours}h ${minutes}m ${secs}s`;
  }
}
