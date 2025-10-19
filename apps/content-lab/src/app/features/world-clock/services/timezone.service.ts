import { Injectable } from '@angular/core';

export interface TimezoneInfo {
  name: string; // IANA timezone name
  displayName: string; // User-friendly name
  offset: string; // UTC offset (e.g., "UTC-5")
  category: string; // Region category
}

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  /**
   * Popular timezones organized by region
   */
  private readonly popularTimezones: TimezoneInfo[] = [
    // Americas
    { name: 'America/Los_Angeles', displayName: 'Los Angeles, CA (PST)', offset: 'UTC-8', category: 'Americas' },
    { name: 'America/Denver', displayName: 'Denver, CO (MST)', offset: 'UTC-7', category: 'Americas' },
    { name: 'America/Phoenix', displayName: 'Phoenix, AZ (MST)', offset: 'UTC-7', category: 'Americas' },
    { name: 'America/Chicago', displayName: 'Chicago, IL (CST)', offset: 'UTC-6', category: 'Americas' },
    { name: 'America/New_York', displayName: 'New York, NY (EST)', offset: 'UTC-5', category: 'Americas' },
    { name: 'America/Toronto', displayName: 'Toronto, ON (EST)', offset: 'UTC-5', category: 'Americas' },
    { name: 'America/Mexico_City', displayName: 'Mexico City (CST)', offset: 'UTC-6', category: 'Americas' },
    { name: 'America/Sao_Paulo', displayName: 'São Paulo (BRT)', offset: 'UTC-3', category: 'Americas' },
    { name: 'America/Buenos_Aires', displayName: 'Buenos Aires (ART)', offset: 'UTC-3', category: 'Americas' },

    // Europe
    { name: 'Europe/London', displayName: 'London (GMT)', offset: 'UTC+0', category: 'Europe' },
    { name: 'Europe/Paris', displayName: 'Paris (CET)', offset: 'UTC+1', category: 'Europe' },
    { name: 'Europe/Berlin', displayName: 'Berlin (CET)', offset: 'UTC+1', category: 'Europe' },
    { name: 'Europe/Rome', displayName: 'Rome (CET)', offset: 'UTC+1', category: 'Europe' },
    { name: 'Europe/Madrid', displayName: 'Madrid (CET)', offset: 'UTC+1', category: 'Europe' },
    { name: 'Europe/Athens', displayName: 'Athens (EET)', offset: 'UTC+2', category: 'Europe' },
    { name: 'Europe/Moscow', displayName: 'Moscow (MSK)', offset: 'UTC+3', category: 'Europe' },

    // Asia
    { name: 'Asia/Dubai', displayName: 'Dubai (GST)', offset: 'UTC+4', category: 'Asia' },
    { name: 'Asia/Kolkata', displayName: 'Mumbai (IST)', offset: 'UTC+5:30', category: 'Asia' },
    { name: 'Asia/Bangkok', displayName: 'Bangkok (ICT)', offset: 'UTC+7', category: 'Asia' },
    { name: 'Asia/Singapore', displayName: 'Singapore (SGT)', offset: 'UTC+8', category: 'Asia' },
    { name: 'Asia/Hong_Kong', displayName: 'Hong Kong (HKT)', offset: 'UTC+8', category: 'Asia' },
    { name: 'Asia/Shanghai', displayName: 'Shanghai (CST)', offset: 'UTC+8', category: 'Asia' },
    { name: 'Asia/Tokyo', displayName: 'Tokyo (JST)', offset: 'UTC+9', category: 'Asia' },
    { name: 'Asia/Seoul', displayName: 'Seoul (KST)', offset: 'UTC+9', category: 'Asia' },

    // Oceania
    { name: 'Australia/Perth', displayName: 'Perth (AWST)', offset: 'UTC+8', category: 'Oceania' },
    { name: 'Australia/Sydney', displayName: 'Sydney (AEST)', offset: 'UTC+10', category: 'Oceania' },
    { name: 'Australia/Melbourne', displayName: 'Melbourne (AEST)', offset: 'UTC+10', category: 'Oceania' },
    { name: 'Pacific/Auckland', displayName: 'Auckland (NZST)', offset: 'UTC+12', category: 'Oceania' },

    // Africa
    { name: 'Africa/Cairo', displayName: 'Cairo (EET)', offset: 'UTC+2', category: 'Africa' },
    { name: 'Africa/Johannesburg', displayName: 'Johannesburg (SAST)', offset: 'UTC+2', category: 'Africa' },
    { name: 'Africa/Lagos', displayName: 'Lagos (WAT)', offset: 'UTC+1', category: 'Africa' },
    { name: 'Africa/Nairobi', displayName: 'Nairobi (EAT)', offset: 'UTC+3', category: 'Africa' }
  ];

  /**
   * Get all popular timezones
   */
  getPopularTimezones(): TimezoneInfo[] {
    return this.popularTimezones;
  }

  /**
   * Get timezones by category
   */
  getTimezonesByCategory(category: string): TimezoneInfo[] {
    return this.popularTimezones.filter(tz => tz.category === category);
  }

  /**
   * Search timezones by query
   */
  searchTimezones(query: string): TimezoneInfo[] {
    const lowerQuery = query.toLowerCase();
    return this.popularTimezones.filter(tz =>
      tz.displayName.toLowerCase().includes(lowerQuery) ||
      tz.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get current time in a specific timezone
   */
  getTimeInTimezone(timezone: string): Date {
    const now = new Date();
    // Convert to timezone using Intl API
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';

    const year = parseInt(getValue('year'));
    const month = parseInt(getValue('month')) - 1; // JS months are 0-indexed
    const day = parseInt(getValue('day'));
    const hour = parseInt(getValue('hour'));
    const minute = parseInt(getValue('minute'));
    const second = parseInt(getValue('second'));

    // Create a date object representing the time in that timezone
    return new Date(year, month, day, hour, minute, second);
  }

  /**
   * Get UTC offset for a timezone
   */
  getUTCOffset(timezone: string): string {
    const now = new Date();

    // Get the offset in minutes
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));

    const offsetMs = tzDate.getTime() - localDate.getTime();
    const offsetHours = Math.floor(Math.abs(offsetMs) / (1000 * 60 * 60));
    const offsetMinutes = Math.floor((Math.abs(offsetMs) % (1000 * 60 * 60)) / (1000 * 60));

    const sign = offsetMs >= 0 ? '+' : '-';
    const hoursStr = offsetHours.toString().padStart(2, '0');
    const minutesStr = offsetMinutes > 0 ? `:${offsetMinutes.toString().padStart(2, '0')}` : '';

    return `UTC${sign}${hoursStr}${minutesStr}`;
  }

  /**
   * Format time for display
   */
  formatTime(date: Date, show24Hour: boolean, showSeconds: boolean): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (show24Hour) {
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return showSeconds ? `${timeStr}:${seconds.toString().padStart(2, '0')}` : timeStr;
    } else {
      const hours12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const timeStr = `${hours12}:${minutes.toString().padStart(2, '0')}`;
      const withSeconds = showSeconds ? `${timeStr}:${seconds.toString().padStart(2, '0')}` : timeStr;
      return `${withSeconds} ${ampm}`;
    }
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Get timezone abbreviation (e.g., "EST", "PST")
   */
  getTimezoneAbbreviation(timezone: string): string {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      timeZoneName: 'short'
    };

    const formatted = new Intl.DateTimeFormat('en-US', options).format(now);
    const parts = formatted.split(' ');
    return parts[parts.length - 1]; // Get the last part which is usually the abbreviation
  }
}
