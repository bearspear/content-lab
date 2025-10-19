import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { AstronomyService } from './astronomy.service';

/**
 * Real-time tracking service
 * Handles automatic synchronization with current time for live sky viewing
 */
@Injectable({
  providedIn: 'root'
})
export class RealTimeTrackerService {
  private isTrackingSubject = new BehaviorSubject<boolean>(false);
  private currentTimeSubject = new BehaviorSubject<Date>(new Date());
  private siderealTimeSubject = new BehaviorSubject<number>(0);

  private updateSubscription?: Subscription;
  private updateInterval = 1000; // Update every second

  public isTracking$ = this.isTrackingSubject.asObservable();
  public currentTime$ = this.currentTimeSubject.asObservable();
  public siderealTime$ = this.siderealTimeSubject.asObservable();

  constructor(private astronomyService: AstronomyService) {}

  /**
   * Start real-time tracking
   * Updates observer time and celestial positions every second
   * @param longitude - Observer's longitude for LST calculation
   */
  startTracking(longitude: number): void {
    if (this.isTrackingSubject.value) {
      return; // Already tracking
    }

    this.isTrackingSubject.next(true);

    // Update immediately
    this.updateTime(longitude);

    // Set up interval for continuous updates
    this.updateSubscription = interval(this.updateInterval).subscribe(() => {
      this.updateTime(longitude);
    });

    console.log('Real-time tracking started');
  }

  /**
   * Stop real-time tracking
   */
  stopTracking(): void {
    if (!this.isTrackingSubject.value) {
      return; // Already stopped
    }

    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
      this.updateSubscription = undefined;
    }

    this.isTrackingSubject.next(false);
    console.log('Real-time tracking stopped');
  }

  /**
   * Toggle tracking on/off
   * @param longitude - Observer's longitude
   */
  toggleTracking(longitude: number): void {
    if (this.isTrackingSubject.value) {
      this.stopTracking();
    } else {
      this.startTracking(longitude);
    }
  }

  /**
   * Update current time and calculate sidereal time
   * @param longitude - Observer's longitude
   */
  private updateTime(longitude: number): void {
    const now = new Date();
    this.currentTimeSubject.next(now);

    const lst = this.astronomyService.getLocalSiderealTime(now, longitude);
    this.siderealTimeSubject.next(lst);
  }

  /**
   * Manually set the time (for time controls)
   * This will stop real-time tracking
   * @param date - New date/time
   * @param longitude - Observer's longitude
   */
  setTime(date: Date, longitude: number): void {
    // Stop tracking when manually setting time
    if (this.isTrackingSubject.value) {
      this.stopTracking();
    }

    this.currentTimeSubject.next(date);
    const lst = this.astronomyService.getLocalSiderealTime(date, longitude);
    this.siderealTimeSubject.next(lst);
  }

  /**
   * Get current tracking state
   */
  isTracking(): boolean {
    return this.isTrackingSubject.value;
  }

  /**
   * Get current time
   */
  getCurrentTime(): Date {
    return this.currentTimeSubject.value;
  }

  /**
   * Get current sidereal time
   */
  getSiderealTime(): number {
    return this.siderealTimeSubject.value;
  }

  /**
   * Clean up on service destroy
   */
  ngOnDestroy(): void {
    this.stopTracking();
  }
}
