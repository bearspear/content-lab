import { Injectable } from '@angular/core';
import { MoonPhase } from '../models/moon-phase.model';

@Injectable({
  providedIn: 'root'
})
export class MoonPhaseService {
  // Synodic month duration in days (new moon to new moon)
  private readonly SYNODIC_MONTH = 29.53058867;

  // Known new moon reference date (January 6, 2000)
  private readonly KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z');

  constructor() {}

  /**
   * Calculate moon phase for a given date
   */
  getMoonPhase(date: Date = new Date()): MoonPhase {
    const daysSinceReference = this.getDaysSince(this.KNOWN_NEW_MOON, date);
    const currentCycle = daysSinceReference % this.SYNODIC_MONTH;
    const phase = currentCycle / this.SYNODIC_MONTH;

    const illumination = this.calculateIllumination(phase);
    const phaseName = this.getPhaseName(phase);
    const emoji = this.getPhaseEmoji(phase);

    const nextFullMoon = this.getNextFullMoon(date);
    const nextNewMoon = this.getNextNewMoon(date);

    return {
      phase,
      illumination,
      age: currentCycle,
      phaseName,
      emoji,
      nextFullMoon,
      nextNewMoon,
      daysUntilFullMoon: this.getDaysSince(date, nextFullMoon),
      daysUntilNewMoon: this.getDaysSince(date, nextNewMoon)
    };
  }

  /**
   * Calculate illumination percentage based on phase
   */
  private calculateIllumination(phase: number): number {
    // Illumination is 0% at new moon (phase = 0 or 1)
    // and 100% at full moon (phase = 0.5)
    const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    return Math.round(illumination * 1000) / 10; // Round to 1 decimal
  }

  /**
   * Get phase name based on phase value
   */
  private getPhaseName(phase: number): string {
    if (phase < 0.03 || phase > 0.97) return 'New Moon';
    if (phase < 0.22) return 'Waxing Crescent';
    if (phase < 0.28) return 'First Quarter';
    if (phase < 0.47) return 'Waxing Gibbous';
    if (phase < 0.53) return 'Full Moon';
    if (phase < 0.72) return 'Waning Gibbous';
    if (phase < 0.78) return 'Last Quarter';
    return 'Waning Crescent';
  }

  /**
   * Get emoji representation of moon phase
   */
  private getPhaseEmoji(phase: number): string {
    if (phase < 0.03 || phase > 0.97) return '🌑'; // New Moon
    if (phase < 0.22) return '🌒'; // Waxing Crescent
    if (phase < 0.28) return '🌓'; // First Quarter
    if (phase < 0.47) return '🌔'; // Waxing Gibbous
    if (phase < 0.53) return '🌕'; // Full Moon
    if (phase < 0.72) return '🌖'; // Waning Gibbous
    if (phase < 0.78) return '🌗'; // Last Quarter
    return '🌘'; // Waning Crescent
  }

  /**
   * Calculate next full moon date
   */
  private getNextFullMoon(date: Date): Date {
    const currentPhase = this.getMoonPhaseValue(date);
    let daysUntilFull: number;

    if (currentPhase < 0.5) {
      // Before full moon in current cycle
      daysUntilFull = (0.5 - currentPhase) * this.SYNODIC_MONTH;
    } else {
      // After full moon, get next cycle's full moon
      daysUntilFull = (1 - currentPhase + 0.5) * this.SYNODIC_MONTH;
    }

    return this.addDays(date, daysUntilFull);
  }

  /**
   * Calculate next new moon date
   */
  private getNextNewMoon(date: Date): Date {
    const currentPhase = this.getMoonPhaseValue(date);
    const daysUntilNew = (1 - currentPhase) * this.SYNODIC_MONTH;
    return this.addDays(date, daysUntilNew);
  }

  /**
   * Get moon phase value (0-1) for a date
   */
  private getMoonPhaseValue(date: Date): number {
    const daysSinceReference = this.getDaysSince(this.KNOWN_NEW_MOON, date);
    const currentCycle = daysSinceReference % this.SYNODIC_MONTH;
    return currentCycle / this.SYNODIC_MONTH;
  }

  /**
   * Calculate days between two dates
   */
  private getDaysSince(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60 * 24);
  }

  /**
   * Add days to a date
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
    return result;
  }

  /**
   * Get moon phases for a full month (for calendar view)
   */
  getMonthlyPhases(year: number, month: number): Array<{ date: Date; phase: MoonPhase }> {
    const phases: Array<{ date: Date; phase: MoonPhase }> = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      phases.push({
        date,
        phase: this.getMoonPhase(date)
      });
    }

    return phases;
  }
}
