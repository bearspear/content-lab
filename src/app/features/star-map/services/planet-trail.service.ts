import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

/**
 * Planet trail configuration
 */
export interface PlanetTrailConfig {
  maxPoints: number; // Maximum number of points to store
  color: number; // Trail color
  opacity: number; // Trail opacity
  linewidth: number; // Trail line width in pixels
}

/**
 * Planet trail data point
 */
interface TrailPoint {
  position: THREE.Vector3;
  timestamp: Date;
}

/**
 * Service for managing and rendering planet orbital trails
 * Stores historical positions and creates visual trails in 3D space
 */
@Injectable({
  providedIn: 'root'
})
export class PlanetTrailService {

  /**
   * Default trail configurations for each planet
   */
  private readonly DEFAULT_CONFIGS: { [key: string]: PlanetTrailConfig } = {
    'Mercury': { maxPoints: 100, color: 0x97979f, opacity: 0.5, linewidth: 1.5 },
    'Venus': { maxPoints: 150, color: 0xffd700, opacity: 0.6, linewidth: 2.0 },
    'Mars': { maxPoints: 200, color: 0xff6b6b, opacity: 0.6, linewidth: 1.8 },
    'Jupiter': { maxPoints: 300, color: 0xffa500, opacity: 0.7, linewidth: 2.5 },
    'Saturn': { maxPoints: 300, color: 0xdaa520, opacity: 0.7, linewidth: 2.3 },
    'Uranus': { maxPoints: 400, color: 0x4fc3f7, opacity: 0.6, linewidth: 1.8 },
    'Neptune': { maxPoints: 400, color: 0x5e7ce2, opacity: 0.6, linewidth: 1.8 },
    'Moon': { maxPoints: 80, color: 0xc0c0c0, opacity: 0.5, linewidth: 1.5 }
  };

  /**
   * Storage for planet trail points
   * Key: planet name, Value: array of trail points
   */
  private trailPoints: Map<string, TrailPoint[]> = new Map();

  /**
   * Storage for rendered trail lines
   * Key: planet name, Value: Line2 object
   */
  private trailLines: Map<string, Line2> = new Map();

  /**
   * Enabled state for each planet trail
   */
  private enabledTrails: Set<string> = new Set();

  constructor() {
    // Initialize trail point arrays for each planet
    Object.keys(this.DEFAULT_CONFIGS).forEach(planetName => {
      this.trailPoints.set(planetName, []);
    });
  }

  /**
   * Add a new position point to a planet's trail
   * @param planetName - Name of the planet
   * @param position - 3D position vector
   * @param timestamp - Time of this position
   */
  addTrailPoint(planetName: string, position: THREE.Vector3, timestamp: Date): void {
    if (!this.enabledTrails.has(planetName)) return;

    const points = this.trailPoints.get(planetName);
    if (!points) {
      this.trailPoints.set(planetName, []);
      return;
    }

    // Add new point
    points.push({
      position: position.clone(),
      timestamp: new Date(timestamp)
    });

    // Limit trail length
    const config = this.DEFAULT_CONFIGS[planetName];
    if (config && points.length > config.maxPoints) {
      points.shift(); // Remove oldest point
    }
  }

  /**
   * Create or update the trail line for a planet
   * @param planetName - Name of the planet
   * @param rendererSize - Size of the renderer for line resolution
   * @returns Line2 object or null if not enough points
   */
  createOrUpdateTrailLine(planetName: string, rendererSize: THREE.Vector2): Line2 | null {
    const points = this.trailPoints.get(planetName);
    const config = this.DEFAULT_CONFIGS[planetName];

    if (!points || points.length < 2 || !config) {
      return null;
    }

    // Extract positions into flat array for LineGeometry
    const positions: number[] = [];
    points.forEach(point => {
      positions.push(point.position.x, point.position.y, point.position.z);
    });

    // Create or update line
    let line = this.trailLines.get(planetName);

    if (line) {
      // Update existing line geometry
      const geometry = line.geometry as LineGeometry;
      geometry.setPositions(positions);
      geometry.computeBoundingSphere();
    } else {
      // Create new line
      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const material = new LineMaterial({
        color: config.color,
        linewidth: config.linewidth,
        transparent: true,
        opacity: config.opacity,
        resolution: rendererSize,
        worldUnits: false,
        vertexColors: false,
        dashed: false,
        alphaToCoverage: false
      });

      line = new Line2(geometry, material);
      line.computeLineDistances();
      line.renderOrder = 2; // Render after constellation lines
      this.trailLines.set(planetName, line);
    }

    return line;
  }

  /**
   * Enable trail for a specific planet
   * @param planetName - Name of the planet
   */
  enableTrail(planetName: string): void {
    this.enabledTrails.add(planetName);
  }

  /**
   * Disable trail for a specific planet
   * @param planetName - Name of the planet
   */
  disableTrail(planetName: string): void {
    this.enabledTrails.delete(planetName);
  }

  /**
   * Check if trail is enabled for a planet
   * @param planetName - Name of the planet
   * @returns True if trail is enabled
   */
  isTrailEnabled(planetName: string): boolean {
    return this.enabledTrails.has(planetName);
  }

  /**
   * Toggle trail for a specific planet
   * @param planetName - Name of the planet
   * @returns New enabled state
   */
  toggleTrail(planetName: string): boolean {
    if (this.enabledTrails.has(planetName)) {
      this.disableTrail(planetName);
      return false;
    } else {
      this.enableTrail(planetName);
      return true;
    }
  }

  /**
   * Clear all trail points for a specific planet
   * @param planetName - Name of the planet
   */
  clearTrail(planetName: string): void {
    const points = this.trailPoints.get(planetName);
    if (points) {
      points.length = 0;
    }
  }

  /**
   * Clear all trail points for all planets
   */
  clearAllTrails(): void {
    this.trailPoints.forEach(points => points.length = 0);
  }

  /**
   * Get the current trail line for a planet
   * @param planetName - Name of the planet
   * @returns Line2 object or null
   */
  getTrailLine(planetName: string): Line2 | null {
    return this.trailLines.get(planetName) || null;
  }

  /**
   * Get all active trail lines
   * @returns Array of Line2 objects
   */
  getAllTrailLines(): Line2[] {
    return Array.from(this.trailLines.values());
  }

  /**
   * Update line material resolution (call when renderer size changes)
   * @param rendererSize - New renderer size
   */
  updateResolution(rendererSize: THREE.Vector2): void {
    this.trailLines.forEach(line => {
      if (line.material instanceof LineMaterial) {
        line.material.resolution = rendererSize;
      }
    });
  }

  /**
   * Get enabled planet names
   * @returns Array of planet names with enabled trails
   */
  getEnabledPlanetNames(): string[] {
    return Array.from(this.enabledTrails);
  }

  /**
   * Get all available planet names
   * @returns Array of all planet names
   */
  getAllPlanetNames(): string[] {
    return Object.keys(this.DEFAULT_CONFIGS);
  }

  /**
   * Dispose of all trail resources
   */
  dispose(): void {
    this.trailLines.forEach(line => {
      line.geometry.dispose();
      if (line.material instanceof LineMaterial) {
        line.material.dispose();
      }
    });
    this.trailLines.clear();
    this.trailPoints.clear();
    this.enabledTrails.clear();
  }
}
