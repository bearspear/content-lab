import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Star, Constellation } from '../models/celestial-object.model';

@Injectable({
  providedIn: 'root'
})
export class StarCatalogService {
  private starsSubject = new BehaviorSubject<Star[]>([]);
  private constellationsSubject = new BehaviorSubject<Constellation[]>([]);

  public stars$ = this.starsSubject.asObservable();
  public constellations$ = this.constellationsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStars();
    this.loadConstellations();
  }

  /**
   * Load star catalog from JSON file
   */
  private loadStars(): void {
    this.http.get<Star[]>('/assets/data/stars.json')
      .subscribe({
        next: (stars) => {
          this.starsSubject.next(stars);
          console.log(`Loaded ${stars.length} stars`);
        },
        error: (error) => {
          console.error('Error loading star catalog:', error);
        }
      });
  }

  /**
   * Load constellation data from JSON file
   */
  private loadConstellations(): void {
    this.http.get<Constellation[]>('/assets/data/constellations.json')
      .subscribe({
        next: (constellations) => {
          this.constellationsSubject.next(constellations);
          console.log(`Loaded ${constellations.length} constellations`);
        },
        error: (error) => {
          console.error('Error loading constellations:', error);
        }
      });
  }

  /**
   * Get stars filtered by magnitude
   * @param maxMagnitude - Maximum magnitude to display (higher = dimmer)
   */
  getStarsByMagnitude(maxMagnitude: number): Observable<Star[]> {
    return this.stars$.pipe(
      map(stars => stars.filter(star => star.magnitude <= maxMagnitude))
    );
  }

  /**
   * Get star by ID
   * @param id - Star ID
   */
  getStarById(id: string): Observable<Star | undefined> {
    return this.stars$.pipe(
      map(stars => stars.find(star => star.id === id))
    );
  }

  /**
   * Get constellation by ID
   * @param id - Constellation ID (3-letter code)
   */
  getConstellationById(id: string): Observable<Constellation | undefined> {
    return this.constellations$.pipe(
      map(constellations => constellations.find(c => c.id === id))
    );
  }

  /**
   * Search stars by name
   * @param query - Search query
   */
  searchStars(query: string): Observable<Star[]> {
    const lowerQuery = query.toLowerCase();
    return this.stars$.pipe(
      map(stars => stars.filter(star =>
        star.name?.toLowerCase().includes(lowerQuery) ||
        star.bayer?.toLowerCase().includes(lowerQuery)
      ))
    );
  }
}
