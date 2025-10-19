import { Injectable } from '@angular/core';
import { SkyHighlight, TonightsSkyReport } from '../models/sky-highlights.model';
import { Star, Planet } from '../models/celestial-object.model';
import { AstronomyService } from './astronomy.service';
import { PlanetaryEphemerisService } from './planetary-ephemeris.service';

/**
 * Service for generating automated "Tonight's Sky" highlights and summaries
 * Identifies interesting celestial objects and events visible at the current location/time
 */
@Injectable({
  providedIn: 'root'
})
export class SkyHighlightsService {

  /**
   * Well-known bright stars with descriptions
   */
  private readonly NOTABLE_STARS: { [key: string]: { description: string; facts: string } } = {
    'Sirius': {
      description: 'Brightest star in the night sky',
      facts: 'Known as the "Dog Star" in Canis Major'
    },
    'Canopus': {
      description: 'Second brightest star, southern hemisphere',
      facts: 'Named after the navigator in Greek mythology'
    },
    'Arcturus': {
      description: 'Brightest star in northern celestial hemisphere',
      facts: 'Orange giant star in Boötes'
    },
    'Vega': {
      description: 'One of the brightest stars visible',
      facts: 'Part of the Summer Triangle asterism'
    },
    'Capella': {
      description: 'Brightest star in Auriga',
      facts: 'Actually a binary star system'
    },
    'Rigel': {
      description: 'Blue supergiant in Orion',
      facts: 'Forms the foot of Orion the Hunter'
    },
    'Betelgeuse': {
      description: 'Red supergiant in Orion',
      facts: 'May explode as a supernova in the near future'
    },
    'Procyon': {
      description: 'Brightest star in Canis Minor',
      facts: 'Part of the Winter Triangle asterism'
    },
    'Altair': {
      description: 'Brightest star in Aquila',
      facts: 'Part of the Summer Triangle'
    },
    'Aldebaran': {
      description: 'Orange giant representing the eye of Taurus',
      facts: 'Part of the V-shaped Hyades cluster'
    },
    'Antares': {
      description: 'Red supergiant in Scorpius',
      facts: 'Name means "rival of Mars" due to its reddish color'
    },
    'Spica': {
      description: 'Brightest star in Virgo',
      facts: 'Blue giant star, one of the 20 brightest stars'
    },
    'Pollux': {
      description: 'Brightest star in Gemini',
      facts: 'Orange giant with confirmed exoplanet'
    },
    'Fomalhaut': {
      description: 'Brightest star in Piscis Austrinus',
      facts: 'Has a debris disk with a planet'
    },
    'Deneb': {
      description: 'One of the most luminous stars known',
      facts: 'Part of the Summer Triangle, tail of Cygnus'
    },
    'Regulus': {
      description: 'Brightest star in Leo',
      facts: 'Marks the heart of the Lion'
    }
  };

  /**
   * Planet descriptions and interesting facts
   */
  private readonly PLANET_INFO: { [key: string]: { description: string; facts: string } } = {
    'Mercury': {
      description: 'Innermost planet',
      facts: 'Difficult to observe due to proximity to Sun'
    },
    'Venus': {
      description: 'Brightest planet, "Morning/Evening Star"',
      facts: 'Can cast shadows when at its brightest'
    },
    'Mars': {
      description: 'The Red Planet',
      facts: 'Color comes from iron oxide (rust) on surface'
    },
    'Jupiter': {
      description: 'Largest planet in solar system',
      facts: 'Visible moons can be seen with binoculars'
    },
    'Saturn': {
      description: 'Ringed gas giant',
      facts: 'Rings visible in small telescopes'
    },
    'Uranus': {
      description: 'Ice giant with unusual tilt',
      facts: 'Rotates on its side, faint but visible to naked eye'
    },
    'Neptune': {
      description: 'Outermost major planet',
      facts: 'Requires telescope to see, deep blue color'
    }
  };

  constructor(
    private astronomyService: AstronomyService,
    private planetaryService: PlanetaryEphemerisService
  ) {}

  /**
   * Generate Tonight's Sky report for given location and time
   * @param stars - Array of stars from catalog
   * @param observerLatitude - Observer latitude in degrees
   * @param observerLongitude - Observer longitude in degrees
   * @param observerTime - Observation time
   * @param locationName - Name of location
   * @returns Complete Tonight's Sky report
   */
  generateTonightsSkyReport(
    stars: Star[],
    observerLatitude: number,
    observerLongitude: number,
    observerTime: Date,
    locationName: string
  ): TonightsSkyReport {
    const highlights: SkyHighlight[] = [];

    // Get visible planets
    const planets = this.planetaryService.getAllPlanetPositions(
      observerTime,
      observerLatitude,
      observerLongitude
    );
    const moon = this.planetaryService.getMoonPosition(
      observerTime,
      observerLatitude,
      observerLongitude
    );

    // Identify visible planets (above horizon)
    const visiblePlanets = planets.filter(planet => {
      const alt = this.astronomyService.getAltitude(
        planet.position.ra,
        planet.position.dec,
        observerTime,
        observerLatitude,
        observerLongitude
      );
      return alt > 0;
    });

    // Add planet highlights
    visiblePlanets.forEach(planet => {
      const riseSetTransit = this.astronomyService.calculateRiseSetTransit(
        planet.position.ra,
        planet.position.dec,
        observerLatitude,
        observerLongitude,
        observerTime
      );

      const planetInfo = this.PLANET_INFO[planet.name];
      const currentAlt = this.astronomyService.getAltitude(
        planet.position.ra,
        planet.position.dec,
        observerTime,
        observerLatitude,
        observerLongitude
      );

      // Calculate priority based on magnitude and altitude
      let priority = 3;
      if (planet.magnitude < -2) priority = 5; // Very bright
      else if (planet.magnitude < 0) priority = 4;

      if (currentAlt > 45) priority = Math.min(5, priority + 1); // High in sky

      highlights.push({
        type: 'planet',
        title: `${planet.name} is visible`,
        description: planetInfo ? `${planetInfo.description}. ${planetInfo.facts}` : `Currently visible in the night sky`,
        priority,
        objectName: planet.name,
        bestViewingTime: riseSetTransit.transit,
        currentAltitude: currentAlt,
        icon: '🪐',
        data: {
          ra: planet.position.ra,
          dec: planet.position.dec,
          magnitude: planet.magnitude,
          phase: planet.phase,
          angularSize: planet.angularSize
        }
      });
    });

    // Identify bright visible stars
    const brightStars = stars
      .filter(star => star.magnitude < 1.5) // Bright stars only
      .filter(star => {
        const alt = this.astronomyService.getAltitude(
          star.ra,
          star.dec,
          observerTime,
          observerLatitude,
          observerLongitude
        );
        return alt > 0;
      })
      .sort((a, b) => a.magnitude - b.magnitude) // Sort by brightness
      .slice(0, 10); // Top 10 brightest

    // Add notable star highlights
    brightStars.forEach((star, index) => {
      const starName = star.name || star.bayer || `Star ${star.id}`;
      const notableInfo = this.NOTABLE_STARS[starName];

      if (notableInfo) {
        const riseSetTransit = this.astronomyService.calculateRiseSetTransit(
          star.ra,
          star.dec,
          observerLatitude,
          observerLongitude,
          observerTime
        );

        const currentAlt = this.astronomyService.getAltitude(
          star.ra,
          star.dec,
          observerTime,
          observerLatitude,
          observerLongitude
        );

        // Priority based on brightness and position
        let priority = 3;
        if (star.magnitude < 0) priority = 4;
        if (star.magnitude < -1) priority = 5;
        if (currentAlt > 60) priority = Math.min(5, priority + 1);

        highlights.push({
          type: 'star',
          title: `${starName} - ${notableInfo.description}`,
          description: notableInfo.facts,
          priority,
          objectName: starName,
          bestViewingTime: riseSetTransit.transit,
          currentAltitude: currentAlt,
          icon: '⭐',
          data: {
            ra: star.ra,
            dec: star.dec,
            magnitude: star.magnitude,
            constellation: star.constellation,
            spectralClass: star.spectralClass
          }
        });
      }
    });

    // Add Moon highlight
    const moonAlt = this.astronomyService.getAltitude(
      moon.position.ra,
      moon.position.dec,
      observerTime,
      observerLatitude,
      observerLongitude
    );

    const moonRiseSetTransit = this.astronomyService.calculateRiseSetTransit(
      moon.position.ra,
      moon.position.dec,
      observerLatitude,
      observerLongitude,
      observerTime
    );

    if (moonAlt > 0) {
      const phaseDescription = this.getMoonPhaseDescription(moon.phase);
      highlights.push({
        type: 'planet',
        title: `Moon - ${phaseDescription}`,
        description: `Currently ${(moon.phase * 100).toFixed(0)}% illuminated`,
        priority: moon.phase > 0.3 && moon.phase < 0.7 ? 4 : 3,
        objectName: 'Moon',
        bestViewingTime: moonRiseSetTransit.transit,
        currentAltitude: moonAlt,
        icon: this.getMoonIcon(moon.phase),
        data: {
          ra: moon.position.ra,
          dec: moon.position.dec,
          magnitude: moon.magnitude,
          phase: moon.phase
        }
      });
    }

    // Sort highlights by priority (highest first)
    highlights.sort((a, b) => b.priority - a.priority);

    // Determine best viewing period (astronomical twilight)
    const bestViewingPeriod = this.calculateBestViewingPeriod(observerTime);

    return {
      date: observerTime,
      location: locationName,
      highlights: highlights.slice(0, 8), // Top 8 highlights
      visiblePlanets: visiblePlanets.map(p => p.name),
      brightStars: brightStars.map(s => s.name || s.bayer || `Star ${s.id}`).slice(0, 5),
      prominentConstellations: this.getProminentConstellations(brightStars),
      moonPhase: moon.phase,
      moonRise: moonRiseSetTransit.rise,
      moonSet: moonRiseSetTransit.set,
      bestViewingPeriod
    };
  }

  /**
   * Get moon phase description
   */
  private getMoonPhaseDescription(phase: number): string {
    if (phase < 0.05) return 'New Moon';
    if (phase < 0.25) return 'Waxing Crescent';
    if (phase < 0.30) return 'First Quarter';
    if (phase < 0.45) return 'Waxing Gibbous';
    if (phase < 0.55) return 'Full Moon';
    if (phase < 0.70) return 'Waning Gibbous';
    if (phase < 0.75) return 'Last Quarter';
    if (phase < 0.95) return 'Waning Crescent';
    return 'New Moon';
  }

  /**
   * Get appropriate moon icon based on phase
   */
  private getMoonIcon(phase: number): string {
    if (phase < 0.05) return '🌑'; // New
    if (phase < 0.25) return '🌒'; // Waxing Crescent
    if (phase < 0.30) return '🌓'; // First Quarter
    if (phase < 0.45) return '🌔'; // Waxing Gibbous
    if (phase < 0.55) return '🌕'; // Full
    if (phase < 0.70) return '🌖'; // Waning Gibbous
    if (phase < 0.75) return '🌗'; // Last Quarter
    if (phase < 0.95) return '🌘'; // Waning Crescent
    return '🌑'; // New
  }

  /**
   * Calculate best viewing period (typically between astronomical twilight)
   */
  private calculateBestViewingPeriod(date: Date): { start: Date; end: Date; reason: string } {
    // Simplified: Best viewing is typically 9 PM to 2 AM local time
    const start = new Date(date);
    start.setHours(21, 0, 0, 0);

    const end = new Date(date);
    end.setHours(26, 0, 0, 0); // 2 AM next day

    return {
      start,
      end,
      reason: 'Dark sky with minimal light pollution'
    };
  }

  /**
   * Get prominent constellations based on visible bright stars
   */
  private getProminentConstellations(stars: Star[]): string[] {
    const constellationCounts = new Map<string, number>();

    stars.forEach(star => {
      const count = constellationCounts.get(star.constellation) || 0;
      constellationCounts.set(star.constellation, count + 1);
    });

    // Get top 5 constellations by number of bright stars
    return Array.from(constellationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([constellation]) => constellation);
  }

  /**
   * Get quick summary string for display
   */
  getQuickSummary(report: TonightsSkyReport): string {
    const planetCount = report.visiblePlanets.length;
    const starCount = report.brightStars.length;

    let summary = `Tonight: `;

    if (planetCount > 0) {
      summary += `${planetCount} planet${planetCount > 1 ? 's' : ''} visible`;
    }

    if (starCount > 0) {
      if (planetCount > 0) summary += ', ';
      summary += `${starCount} bright star${starCount > 1 ? 's' : ''}`;
    }

    return summary;
  }
}
