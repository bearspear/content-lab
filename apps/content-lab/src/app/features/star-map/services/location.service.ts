import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GeographicCoordinate } from '../models/star-map-state.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private currentLocationSubject = new BehaviorSubject<GeographicCoordinate>(this.getDefaultLocation());
  public currentLocation$ = this.currentLocationSubject.asObservable();

  private isGeolocatingSubject = new BehaviorSubject<boolean>(false);
  public isGeolocating$ = this.isGeolocatingSubject.asObservable();

  /**
   * Preset locations for quick selection
   */
  private readonly PRESET_LOCATIONS: GeographicCoordinate[] = [
    {
      name: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      elevation: 16,
      timezone: 'America/Los_Angeles'
    },
    {
      name: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      elevation: 10,
      timezone: 'America/New_York'
    },
    {
      name: 'London, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      elevation: 11,
      timezone: 'Europe/London'
    },
    {
      name: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      elevation: 40,
      timezone: 'Asia/Tokyo'
    },
    {
      name: 'Sydney, Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      elevation: 58,
      timezone: 'Australia/Sydney'
    },
    {
      name: 'Paris, France',
      latitude: 48.8566,
      longitude: 2.3522,
      elevation: 35,
      timezone: 'Europe/Paris'
    },
    {
      name: 'Berlin, Germany',
      latitude: 52.5200,
      longitude: 13.4050,
      elevation: 34,
      timezone: 'Europe/Berlin'
    },
    {
      name: 'Dubai, UAE',
      latitude: 25.2048,
      longitude: 55.2708,
      elevation: 5,
      timezone: 'Asia/Dubai'
    },
    {
      name: 'Cape Town, South Africa',
      latitude: -33.9249,
      longitude: 18.4241,
      elevation: 1,
      timezone: 'Africa/Johannesburg'
    },
    {
      name: 'Rio de Janeiro, Brazil',
      latitude: -22.9068,
      longitude: -43.1729,
      elevation: 2,
      timezone: 'America/Sao_Paulo'
    },
    {
      name: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      elevation: 15,
      timezone: 'Asia/Singapore'
    },
    {
      name: 'Los Angeles, CA',
      latitude: 34.0522,
      longitude: -118.2437,
      elevation: 71,
      timezone: 'America/Los_Angeles'
    },
    {
      name: 'Chicago, IL',
      latitude: 41.8781,
      longitude: -87.6298,
      elevation: 179,
      timezone: 'America/Chicago'
    },
    {
      name: 'Mexico City, Mexico',
      latitude: 19.4326,
      longitude: -99.1332,
      elevation: 2240,
      timezone: 'America/Mexico_City'
    },
    {
      name: 'Moscow, Russia',
      latitude: 55.7558,
      longitude: 37.6173,
      elevation: 156,
      timezone: 'Europe/Moscow'
    }
  ];

  constructor() {}

  /**
   * Get list of preset locations
   */
  getPresetLocations(): GeographicCoordinate[] {
    return [...this.PRESET_LOCATIONS];
  }

  /**
   * Get current location
   */
  getCurrentLocation(): GeographicCoordinate {
    return this.currentLocationSubject.value;
  }

  /**
   * Set location manually
   */
  setLocation(location: GeographicCoordinate): void {
    this.currentLocationSubject.next(location);
  }

  /**
   * Get user's current location using browser geolocation API
   */
  requestGeolocation(): Promise<GeographicCoordinate> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      this.isGeolocatingSubject.next(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: GeographicCoordinate = {
            name: 'Current Location',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            elevation: position.coords.altitude || 0,
            timezone: this.getTimezoneFromCoordinates(position.coords.latitude, position.coords.longitude)
          };

          // Try to get a more descriptive name using reverse geocoding
          try {
            const name = await this.reverseGeocode(location.latitude, location.longitude);
            location.name = name || 'Current Location';
          } catch (error) {
            console.warn('Could not get location name:', error);
          }

          this.currentLocationSubject.next(location);
          this.isGeolocatingSubject.next(false);
          resolve(location);
        },
        (error) => {
          this.isGeolocatingSubject.next(false);
          let errorMessage = 'Unable to retrieve location';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Estimate timezone from coordinates (simplified version)
   * In production, you'd want to use a proper timezone library or API
   */
  private getTimezoneFromCoordinates(latitude: number, longitude: number): string {
    // Rough approximation based on longitude
    // This is a simplified approach - in production use a library like timezone-js or an API
    const offset = Math.round(longitude / 15);
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Reverse geocode coordinates to get a location name
   * Uses OpenStreetMap Nominatim API (free, no API key required)
   */
  private async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
        {
          headers: {
            'User-Agent': 'StarMapApp/1.0' // OSM requires a user agent
          }
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Try to get city, town, or village name
      const address = data.address;
      const name = address.city || address.town || address.village || address.county || address.state;

      if (name) {
        const country = address.country;
        return country ? `${name}, ${country}` : name;
      }

      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Get default location (San Francisco)
   */
  private getDefaultLocation(): GeographicCoordinate {
    return {
      name: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      elevation: 16,
      timezone: 'America/Los_Angeles'
    };
  }

  /**
   * Find nearest preset location to given coordinates
   */
  findNearestPreset(latitude: number, longitude: number): GeographicCoordinate {
    let nearest = this.PRESET_LOCATIONS[0];
    let minDistance = this.calculateDistance(latitude, longitude, nearest.latitude, nearest.longitude);

    for (const location of this.PRESET_LOCATIONS) {
      const distance = this.calculateDistance(latitude, longitude, location.latitude, location.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }

    return nearest;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
