import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import gsap from 'gsap';

import { StatefulComponent } from '@content-lab/core';
import { StateManagerService } from '@content-lab/core';
import { StarCatalogService } from './services/star-catalog.service';
import { AstronomyService } from './services/astronomy.service';
import { RealTimeTrackerService } from './services/real-time-tracker.service';
import { LocationService } from './services/location.service';
import { PlanetaryEphemerisService } from './services/planetary-ephemeris.service';
import { SkyHighlightsService } from './services/sky-highlights.service';
import { PlanetTrailService } from './services/planet-trail.service';
import { StarMapState, DEFAULT_STAR_MAP_STATE, GeographicCoordinate } from './models/star-map-state.model';
import { Star, Constellation, Planet, getStarColor, getStarSize, getPlanetColor, getPlanetSize } from './models/celestial-object.model';
import { TonightsSkyReport } from './models/sky-highlights.model';

// Search result interface
interface SearchResult {
  type: 'star' | 'planet' | 'constellation';
  name: string;
  typeLabel: string;
  data: Star | Planet | Constellation;
}

@Component({
  selector: 'app-star-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './star-map.component.html',
  styleUrl: './star-map.component.scss'
})
export class StarMapComponent extends StatefulComponent<StarMapState> implements OnInit, AfterViewInit, OnDestroy {
  protected readonly TOOL_ID = 'star-map';

  @ViewChild('rendererContainer', { static: false }) rendererContainer!: ElementRef<HTMLDivElement>;

  state: StarMapState = { ...DEFAULT_STAR_MAP_STATE };

  // Three.js components
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private composer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;

  // Celestial objects
  private starMeshes: THREE.Points[] = [];
  private constellationLines: Line2[] = [];
  private constellationLabels: THREE.Sprite[] = []; // Constellation name labels
  private horizonGroup: THREE.Group | null = null; // Horizon ring and labels
  private planetMeshes: THREE.Points[] = []; // Planet rendering
  private eclipticLine: Line2 | null = null; // Ecliptic path
  private planetTrailLines: Line2[] = []; // Planet orbital trails

  // Selection highlighting
  private selectionMarker: THREE.Group | null = null; // Visual marker for selected object
  private selectionPosition: THREE.Vector3 | null = null; // Position of selected object

  // Hover tooltip
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  hoveredObject: { name: string; type: string; magnitude: number; constellation?: string } | null = null; // Public for template
  tooltipPosition: { x: number; y: number } = { x: 0, y: 0 }; // Public for template

  // Animation
  private animationId: number | null = null;
  private lastFrameTime: number = 0;
  fps: number = 60; // Public for template access

  // Data
  private allStars: Star[] = []; // Full catalog
  stars: Star[] = []; // Filtered stars for display (public for template)
  constellations: Constellation[] = []; // Public for template access

  // Location
  presetLocations: GeographicCoordinate[] = []; // Public for template
  isGeolocating: boolean = false; // Public for template
  showLocationDropdown: boolean = false; // Public for template

  // Rise/Set calculations
  selectedStar: Star | null = null; // Public for template
  riseSetInfo: { rise: Date | null; set: Date | null; transit: Date; isVisible: boolean } | null = null;

  // Planet selection and info
  selectedPlanet: Planet | null = null; // Public for template
  planetRiseSetInfo: { rise: Date | null; set: Date | null; transit: Date; isVisible: boolean } | null = null;

  // Panel collapse state
  isLeftPanelCollapsed: boolean = false; // Public for template
  isRightPanelCollapsed: boolean = false; // Public for template

  // Search functionality
  searchQuery: string = ''; // Public for template
  showSearchResults: boolean = false; // Public for template
  searchResults: SearchResult[] = []; // Public for template
  highlightedResult: SearchResult | null = null; // Public for template

  // Tonight's Sky Highlights
  tonightsSkyReport: TonightsSkyReport | null = null; // Public for template
  showHighlightsPanel: boolean = false; // Public for template

  // Time Animation Controls
  isAnimationPlaying: boolean = false; // Public for template
  animationSpeed: number = 60; // Default: 60x speed (1 minute per second) - Public for template
  private animationIntervalId: any = null;

  constructor(
    stateManager: StateManagerService,
    private starCatalogService: StarCatalogService,
    private astronomyService: AstronomyService,
    private realTimeTracker: RealTimeTrackerService,
    private locationService: LocationService,
    private planetaryService: PlanetaryEphemerisService,
    private skyHighlightsService: SkyHighlightsService,
    private planetTrailService: PlanetTrailService,
    private cdr: ChangeDetectorRef
  ) {
    super(stateManager);
  }

  protected override getDefaultState(): StarMapState {
    return { ...DEFAULT_STAR_MAP_STATE };
  }

  protected override applyState(state: StarMapState): void {
    this.state = { ...state };
    // TODO: Update visualization based on state
  }

  protected override getCurrentState(): StarMapState {
    return { ...this.state };
  }

  override ngOnInit(): void {
    console.log('Star Map: ngOnInit called');

    try {
      super.ngOnInit();
      console.log('Star Map: super.ngOnInit completed');

      // Load preset locations
      this.presetLocations = this.locationService.getPresetLocations();
      console.log('Star Map: Loaded preset locations:', this.presetLocations.length);

    // Load star and constellation data
    this.starCatalogService.stars$.subscribe(stars => {
      this.allStars = stars; // Store full catalog
      this.stars = stars.filter(star => star.magnitude <= this.state.maxMagnitude);
      if (this.scene) {
        this.updateStarField();
      }
    });

    this.starCatalogService.constellations$.subscribe(constellations => {
      this.constellations = constellations;
      if (this.scene) {
        this.updateConstellations();
        this.updateConstellationLabels();
      }
    });

    // Subscribe to real-time tracking updates
    this.realTimeTracker.currentTime$.subscribe(time => {
      this.state.observerTime = time;
      if (this.scene && this.state.isRealTimeTracking) {
        this.updateSphereRotation();
        this.updatePlanets(); // Update planet positions as time changes
      }
    });

    this.realTimeTracker.isTracking$.subscribe(isTracking => {
      this.state.isRealTimeTracking = isTracking;
      this.saveState();
    });

    // Subscribe to location changes
    this.locationService.currentLocation$.subscribe(location => {
      this.state.observerLocation = location;
      if (this.scene) {
        this.updateSphereRotation();
        this.updateHorizon(); // Update horizon based on new latitude
      }
      this.saveState();
    });

    // Subscribe to geolocation status
    this.locationService.isGeolocating$.subscribe(isGeolocating => {
      this.isGeolocating = isGeolocating;
    });

      console.log('Star Map: ngOnInit completed successfully');
    } catch (error) {
      console.error('Star Map: Error in ngOnInit:', error);
      throw error;
    }
  }

  ngAfterViewInit(): void {
    console.log('Star Map: Initializing Three.js...');
    // Defer to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.initThreeJS();
      this.animate();
      this.cdr.detectChanges();
      console.log('Star Map: Animation started');
    }, 0);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    // Clean up time animation interval
    if (this.animationIntervalId) {
      clearInterval(this.animationIntervalId);
    }
    // Clean up planet trails
    if (this.planetTrailService) {
      this.planetTrailService.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
  }

  /**
   * Initialize Three.js scene with professional rendering pipeline
   */
  private initThreeJS(): void {
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    console.log(`Star Map: Container size: ${width}x${height}`);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Add deep space gradient background
    const bgGeometry = new THREE.SphereGeometry(500, 32, 32);
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        zenithColor: { value: new THREE.Color(0x000000) },
        horizonColor: { value: new THREE.Color(0x0a0a12) }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 zenithColor;
        uniform vec3 horizonColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          gl_FragColor = vec4(mix(horizonColor, zenithColor, max(pow(max(h, 0.0), 0.6), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    this.scene.add(bgMesh);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 150;

    // Renderer with antialiasing
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true
    });
    this.renderer.setSize(width, height);
    // Use full device pixel ratio for sharper rendering
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Post-processing composer
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Bloom pass for star glow (enhanced for better visibility)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      2.5, // strength (increased from 1.5 to 2.5)
      0.6, // radius (increased from 0.4 to 0.6)
      0.6  // threshold (decreased from 0.85 to 0.6 - affects more stars)
    );
    this.composer.addPass(this.bloomPass);

    // Orbit controls with inertial damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.zoomSpeed = 1.2;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 300;

    // Add stars, constellations, planets, and ecliptic
    this.updateStarField();
    this.updateConstellations();
    this.updateConstellationLabels();
    this.updateHorizon();
    this.updatePlanets();
    this.updateEcliptic();

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Handle mouse move for tooltips
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  /**
   * Create and update star field with spectral colors and magnitude scaling
   */
  private updateStarField(): void {
    console.log(`Star Map: Updating star field with ${this.stars.length} stars`);

    // Remove existing star meshes
    this.starMeshes.forEach(mesh => this.scene.remove(mesh));
    this.starMeshes = [];

    if (this.stars.length === 0) {
      console.log('Star Map: No stars to render');
      return;
    }

    // Create star geometry and materials
    const starGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    this.stars.forEach(star => {
      // Convert RA/Dec to Cartesian coordinates
      const phi = (90 - star.dec) * (Math.PI / 180); // Declination to phi
      const theta = star.ra * (Math.PI / 12); // RA (hours) to theta (radians)
      const radius = 100; // Fixed radius for celestial sphere

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);

      // Get star color from spectral class
      const color = new THREE.Color(getStarColor(star.spectralClass));
      colors.push(color.r, color.g, color.b);

      // Calculate star size based on magnitude
      const size = getStarSize(star.magnitude, this.state.starSizeScale);
      sizes.push(size);
    });

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Custom star shader material
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pixelRatio: { value: this.renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Circular star with soft glow (enhanced brightness)
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          // Core + glow using multiple falloffs (increased intensity)
          float core = 1.0 - smoothstep(0.0, 0.15, dist); // Tighter core
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          float alpha = core + glow * 0.6; // Increased glow contribution from 0.3 to 0.6

          if (alpha < 0.01) discard;

          // Brighten the color output
          vec3 brightColor = vColor * 1.5; // Increase color intensity
          gl_FragColor = vec4(brightColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const starMesh = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(starMesh);
    this.starMeshes.push(starMesh);

    console.log(`Rendered ${this.stars.length} stars`);
  }

  /**
   * Create and update constellation lines
   */
  private updateConstellations(): void {
    // Remove existing constellation lines
    this.constellationLines.forEach(line => this.scene.remove(line));
    this.constellationLines = [];

    if (!this.state.showConstellationLines || this.constellations.length === 0) return;

    // Create a map of star IDs to positions
    const starPositions = new Map<string, THREE.Vector3>();
    this.stars.forEach(star => {
      const phi = (90 - star.dec) * (Math.PI / 180);
      const theta = star.ra * (Math.PI / 12);
      const radius = 100;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      starPositions.set(star.id, new THREE.Vector3(x, y, z));
    });

    this.constellations.forEach(constellation => {
      constellation.lines.forEach(([star1Id, star2Id]) => {
        const pos1 = starPositions.get(star1Id);
        const pos2 = starPositions.get(star2Id);

        if (pos1 && pos2) {
          // Use Line2 for proper antialiased fat lines
          const geometry = new LineGeometry();
          geometry.setPositions([
            pos1.x, pos1.y, pos1.z,
            pos2.x, pos2.y, pos2.z
          ]);

          const material = new LineMaterial({
            color: 0x4a90e2, // Blue color to match theme
            linewidth: 2.0, // Increased from 0.5 to 2.0 for better visibility
            transparent: true,
            opacity: 0.7, // Increased from 0.35 to 0.7 for better visibility
            resolution: new THREE.Vector2(
              this.renderer.domElement.width,
              this.renderer.domElement.height
            ),
            alphaToCoverage: false,
            worldUnits: false, // Use pixel units for linewidth
            vertexColors: false,
            dashed: false
          });

          const line = new Line2(geometry, material);
          line.computeLineDistances(); // Required for proper Line2 rendering
          line.renderOrder = 1; // Render after stars
          this.scene.add(line);
          this.constellationLines.push(line);
        }
      });
    });

    if (this.constellationLines.length > 0) {
      console.log(`Rendered ${this.constellationLines.length} constellation lines`);
    }
  }

  /**
   * Create and update constellation name labels
   */
  private updateConstellationLabels(): void {
    // Remove existing constellation labels
    this.constellationLabels.forEach(label => this.scene.remove(label));
    this.constellationLabels = [];

    if (!this.state.showConstellationLabels || this.constellations.length === 0) return;

    this.constellations.forEach(constellation => {
      // Get constellation center position
      const centerRa = constellation.center?.ra || 0;
      const centerDec = constellation.center?.dec || 0;

      // Convert RA/Dec to Cartesian coordinates
      const phi = (90 - centerDec) * (Math.PI / 180);
      const theta = centerRa * (Math.PI / 12);
      const radius = 100;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      // Create canvas for text texture
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw constellation name
        ctx.fillStyle = '#4a90e2'; // Accent blue color
        ctx.font = 'bold 48px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(constellation.name, 128, 64);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.7
        });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Position sprite at constellation center
        sprite.position.set(x, y, z);
        sprite.scale.set(25, 12.5, 1); // Wider scale for text

        this.scene.add(sprite);
        this.constellationLabels.push(sprite);
      }
    });

    if (this.constellationLabels.length > 0) {
      console.log(`Rendered ${this.constellationLabels.length} constellation labels`);
    }
  }

  /**
   * Create and update horizon line with cardinal directions
   */
  private updateHorizon(): void {
    // Remove existing horizon
    if (this.horizonGroup) {
      this.scene.remove(this.horizonGroup);
      this.horizonGroup = null;
    }

    if (!this.state.showGrid) return;

    this.horizonGroup = new THREE.Group();

    // Create horizon ring (circle at altitude = 0°)
    const radius = 100; // Same as star sphere radius
    const segments = 128;
    const horizonGeometry = new THREE.BufferGeometry();
    const horizonPoints: number[] = [];

    // Create circle in XZ plane (Y = 0)
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      horizonPoints.push(x, 0, z);
    }

    horizonGeometry.setAttribute('position', new THREE.Float32BufferAttribute(horizonPoints, 3));

    // Create material with subtle glow
    const horizonMaterial = new THREE.LineBasicMaterial({
      color: 0x4a90e2,
      transparent: true,
      opacity: 0.5,
      linewidth: 2
    });

    const horizonLine = new THREE.Line(horizonGeometry, horizonMaterial);

    // Rotate horizon based on observer latitude
    // At latitude L, the horizon is tilted by (90° - L) from vertical
    const latitudeRad = this.state.observerLocation.latitude * (Math.PI / 180);
    horizonLine.rotation.x = Math.PI / 2 - latitudeRad;

    this.horizonGroup.add(horizonLine);

    // Add cardinal direction labels
    const cardinalDirections = [
      { label: 'N', angle: 0, color: 0xff6b6b },      // North - Red
      { label: 'E', angle: Math.PI / 2, color: 0xffd93d },  // East - Yellow
      { label: 'S', angle: Math.PI, color: 0x6bcf7f },      // South - Green
      { label: 'W', angle: -Math.PI / 2, color: 0x4a90e2 }  // West - Blue
    ];

    cardinalDirections.forEach(({ label, angle, color }) => {
      // Create canvas for text texture
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw text
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.font = 'bold 80px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 64, 64);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite
        const spriteMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0.8
        });
        const sprite = new THREE.Sprite(spriteMaterial);

        // Position sprite at horizon edge
        const labelRadius = radius * 1.1; // Slightly outside the horizon ring
        const x = Math.cos(angle) * labelRadius;
        const z = Math.sin(angle) * labelRadius;

        sprite.position.set(x, 0, z);
        sprite.scale.set(15, 15, 1);

        // Apply same rotation as horizon line
        const labelGroup = new THREE.Group();
        labelGroup.add(sprite);
        labelGroup.rotation.x = Math.PI / 2 - latitudeRad;

        if (this.horizonGroup) {
          this.horizonGroup.add(labelGroup);
        }
      }
    });

    if (this.horizonGroup) {
      this.scene.add(this.horizonGroup);
      console.log('Horizon line and cardinal directions rendered');
    }
  }

  /**
   * Update planets in the scene
   */
  private updatePlanets(): void {
    // Remove existing planet meshes
    this.planetMeshes.forEach(mesh => this.scene.remove(mesh));
    this.planetMeshes = [];

    if (!this.state.showPlanets) return;

    // Get all planet positions including Moon
    const planets = this.planetaryService.getAllPlanetPositions(
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    const moon = this.planetaryService.getMoonPosition(
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    const allCelestialBodies = [...planets, moon];

    // Create geometry for all planets
    const planetGeometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];

    allCelestialBodies.forEach(planet => {
      // Convert RA/Dec to Cartesian coordinates
      const phi = (90 - planet.position.dec) * (Math.PI / 180);
      const theta = planet.position.ra * (Math.PI / 12);
      const radius = 100; // Same as star sphere

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      positions.push(x, y, z);

      // Get planet color
      const color = new THREE.Color(getPlanetColor(planet.name));
      colors.push(color.r, color.g, color.b);

      // Calculate planet size based on magnitude
      const size = getPlanetSize(planet.magnitude, this.state.starSizeScale);
      sizes.push(size);
    });

    if (positions.length === 0) return;

    planetGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    planetGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    planetGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Reuse the star shader material for planets
    const planetMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pixelRatio: { value: this.renderer.getPixelRatio() }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          // Circular planet with soft glow
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);

          // Planets have a more solid core than stars
          float core = 1.0 - smoothstep(0.0, 0.25, dist);
          float glow = 1.0 - smoothstep(0.0, 0.5, dist);
          float alpha = core + glow * 0.4;

          if (alpha < 0.01) discard;

          vec3 brightColor = vColor * 1.8;
          gl_FragColor = vec4(brightColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const planetMesh = new THREE.Points(planetGeometry, planetMaterial);
    this.scene.add(planetMesh);
    this.planetMeshes.push(planetMesh);

    console.log(`Rendered ${allCelestialBodies.length} planets/moon`);
  }

  /**
   * Update ecliptic line in the scene
   */
  private updateEcliptic(): void {
    // Remove existing ecliptic line
    if (this.eclipticLine) {
      this.scene.remove(this.eclipticLine);
      this.eclipticLine = null;
    }

    if (!this.state.showEcliptic) return;

    // Generate points along the ecliptic
    const points: number[] = [];
    const segments = 360; // One point per degree
    const radius = 100;

    for (let i = 0; i <= segments; i++) {
      const eclipticLongitude = (i / segments) * 360;
      const eclipticPoint = this.planetaryService.getEclipticPoint(eclipticLongitude, this.state.observerTime);

      // Convert RA/Dec to Cartesian
      const phi = (90 - eclipticPoint.dec) * (Math.PI / 180);
      const theta = eclipticPoint.ra * (Math.PI / 12);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      points.push(x, y, z);
    }

    // Create Line2 for smooth rendering
    const geometry = new LineGeometry();
    geometry.setPositions(points);

    const material = new LineMaterial({
      color: 0xffd700, // Golden yellow
      linewidth: 1,
      transparent: true,
      opacity: 0.6,
      resolution: new THREE.Vector2(
        this.renderer.domElement.width,
        this.renderer.domElement.height
      ),
      worldUnits: false,
      dashed: true,
      dashSize: 2,
      gapSize: 1
    });

    this.eclipticLine = new Line2(geometry, material);
    this.eclipticLine.computeLineDistances();
    this.scene.add(this.eclipticLine);

    console.log('Ecliptic line rendered');
  }

  /**
   * Update planet trails in the scene
   */
  private updatePlanetTrails(): void {
    // Remove existing trail lines from scene
    this.planetTrailLines.forEach(line => this.scene.remove(line));
    this.planetTrailLines = [];

    if (!this.state.showPlanetTrails) return;

    // Get renderer size for line resolution
    const rendererSize = new THREE.Vector2(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );

    // Create or update trail lines for all enabled planets
    const enabledPlanets = this.planetTrailService.getEnabledPlanetNames();

    enabledPlanets.forEach(planetName => {
      const trailLine = this.planetTrailService.createOrUpdateTrailLine(planetName, rendererSize);
      if (trailLine) {
        this.scene.add(trailLine);
        this.planetTrailLines.push(trailLine);
      }
    });

    if (this.planetTrailLines.length > 0) {
      console.log(`Rendered ${this.planetTrailLines.length} planet trails`);
    }
  }

  /**
   * Record current planet positions to trails
   */
  private recordPlanetTrailPoints(): void {
    if (!this.state.showPlanetTrails) return;

    const planets = this.planetaryService.getAllPlanetPositions(
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    const moon = this.planetaryService.getMoonPosition(
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    const allCelestialBodies = [...planets, moon];

    allCelestialBodies.forEach(planet => {
      // Calculate 3D position
      const phi = (90 - planet.position.dec) * (Math.PI / 180);
      const theta = planet.position.ra * (Math.PI / 12);
      const radius = 100;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const position = new THREE.Vector3(x, y, z);

      // Add trail point
      this.planetTrailService.addTrailPoint(planet.name, position, this.state.observerTime);
    });
  }

  /**
   * Create or update selection marker for a celestial object
   * @param position - 3D position of the object in the scene
   * @param color - Color of the marker (optional)
   */
  private updateSelectionMarker(position: THREE.Vector3, color: number = 0x4affff): void {
    // Remove existing marker
    this.removeSelectionMarker();

    // Store position for camera animation
    this.selectionPosition = position.clone();

    // Create marker group
    this.selectionMarker = new THREE.Group();

    // Create pulsing ring
    const ringGeometry = new THREE.RingGeometry(3, 4, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.lookAt(this.camera.position); // Face the camera
    this.selectionMarker.add(ring);

    // Create outer glow ring
    const glowGeometry = new THREE.RingGeometry(4.5, 5.5, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.lookAt(this.camera.position); // Face the camera
    this.selectionMarker.add(glow);

    // Create crosshair lines
    const linePoints: THREE.Vector3[] = [];
    const lineLength = 8;

    // Horizontal line
    linePoints.push(new THREE.Vector3(-lineLength, 0, 0));
    linePoints.push(new THREE.Vector3(lineLength, 0, 0));

    // Vertical line
    linePoints.push(new THREE.Vector3(0, -lineLength, 0));
    linePoints.push(new THREE.Vector3(0, lineLength, 0));

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      linewidth: 2
    });
    const crosshair = new THREE.LineSegments(lineGeometry, lineMaterial);
    this.selectionMarker.add(crosshair);

    // Position marker at the selected object
    this.selectionMarker.position.copy(position);

    // Add to scene
    this.scene.add(this.selectionMarker);

    // Animate marker with GSAP (pulsing effect)
    gsap.to(this.selectionMarker.scale, {
      x: 1.2,
      y: 1.2,
      z: 1.2,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

    // Animate camera to focus on selection (smooth zoom)
    this.focusCameraOnSelection(position);
  }

  /**
   * Remove selection marker from the scene
   */
  private removeSelectionMarker(): void {
    if (this.selectionMarker) {
      // Kill any ongoing GSAP animations
      gsap.killTweensOf(this.selectionMarker.scale);

      this.scene.remove(this.selectionMarker);
      this.selectionMarker = null;
    }
    this.selectionPosition = null;
  }

  /**
   * Smoothly animate camera to focus on selected object
   * @param targetPosition - Position to focus on
   */
  private focusCameraOnSelection(targetPosition: THREE.Vector3): void {
    // Calculate the direction from the target to the camera
    const direction = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    // Set new camera position (maintain current distance but center on target)
    const distance = this.camera.position.distanceTo(this.controls.target);
    const newCameraPosition = new THREE.Vector3()
      .copy(targetPosition)
      .add(direction.multiplyScalar(distance));

    // Animate camera position and controls target
    gsap.to(this.camera.position, {
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      duration: 1.5,
      ease: "power2.inOut"
    });

    gsap.to(this.controls.target, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        this.controls.update();
      }
    });
  }

  /**
   * Animation loop targeting 60 FPS
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;

    // Calculate FPS
    if (deltaTime > 0) {
      this.fps = 1000 / deltaTime;
    }

    this.lastFrameTime = now;

    // Update controls (for inertial damping)
    this.controls.update();

    // Update selection marker orientation to always face the camera
    if (this.selectionMarker && this.camera) {
      try {
        this.selectionMarker.children.forEach(child => {
          if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
            child.lookAt(this.camera.position);
          }
        });
      } catch (error) {
        console.error('Error updating selection marker orientation:', error);
      }
    }

    // Render scene with post-processing
    this.composer.render();
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    const container = this.rendererContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);

    // Update resolution for Line2 materials
    const resolution = new THREE.Vector2(width, height);
    this.constellationLines.forEach(line => {
      if (line.material instanceof LineMaterial) {
        line.material.resolution = resolution;
      }
    });

    // Update resolution for planet trail lines
    this.planetTrailService.updateResolution(resolution);
  }

  /**
   * Toggle constellation lines
   */
  toggleConstellationLines(): void {
    // Note: ngModel already handles the toggle, we just need to update the view
    this.updateConstellations();
    this.saveState();
  }

  /**
   * Toggle constellation labels
   */
  toggleConstellationLabels(): void {
    // Note: ngModel already handles the toggle, we just need to update the view
    this.updateConstellationLabels();
    this.saveState();
  }

  /**
   * Toggle grid/horizon line
   */
  toggleGrid(): void {
    // Note: ngModel already handles the toggle, we just need to update the view
    this.updateHorizon();
    this.saveState();
  }

  /**
   * Toggle planet trails
   */
  togglePlanetTrails(): void {
    // Note: ngModel already handles the toggle, we just need to update the view
    if (this.state.showPlanetTrails) {
      // Enable trails for all planets
      this.planetTrailService.getAllPlanetNames().forEach(name => {
        this.planetTrailService.enableTrail(name);
      });
    }
    this.updatePlanetTrails();
    this.saveState();
  }

  /**
   * Clear all planet trails
   */
  clearPlanetTrails(): void {
    this.planetTrailService.clearAllTrails();
    this.updatePlanetTrails();
  }

  /**
   * Update magnitude filter
   */
  updateMagnitudeFilter(value: number): void {
    this.state.maxMagnitude = value;
    // Filter from the full catalog, not the current filtered list
    this.stars = this.allStars.filter(star => star.magnitude <= value);
    this.updateStarField();
    this.saveState();
  }

  /**
   * Update star size scale
   */
  updateStarSize(): void {
    this.updateStarField();
    this.saveState();
  }

  /**
   * Toggle real-time tracking
   */
  toggleRealTimeTracking(): void {
    if (this.state.isRealTimeTracking) {
      this.realTimeTracker.stopTracking();
    } else {
      this.realTimeTracker.startTracking(this.state.observerLocation.longitude);
    }
  }

  /**
   * Update sphere rotation based on current observer time and location
   */
  private updateSphereRotation(): void {
    if (!this.scene) return;

    const lst = this.astronomyService.getLocalSiderealTime(
      this.state.observerTime,
      this.state.observerLocation.longitude
    );

    // Rotate the entire scene based on sidereal time
    // This creates the effect of the sky rotating
    const rotationY = -(lst / 24) * 2 * Math.PI;

    // Use GSAP for smooth rotation
    if (this.scene.rotation) {
      gsap.to(this.scene.rotation, {
        y: rotationY,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }

  /**
   * Manually set time (stops real-time tracking)
   */
  setTime(date: Date): void {
    this.realTimeTracker.setTime(date, this.state.observerLocation.longitude);
    this.state.observerTime = date;
    this.updateSphereRotation();
    this.saveState();
  }

  /**
   * Set time to current moment
   */
  setToNow(): void {
    this.setTime(new Date());
  }

  /**
   * Toggle location dropdown
   */
  toggleLocationDropdown(): void {
    this.showLocationDropdown = !this.showLocationDropdown;
  }

  /**
   * Select a preset location
   */
  selectLocation(location: GeographicCoordinate): void {
    this.locationService.setLocation(location);
    this.showLocationDropdown = false;

    // Update tracking if active
    if (this.state.isRealTimeTracking) {
      this.realTimeTracker.stopTracking();
      this.realTimeTracker.startTracking(location.longitude);
    }
  }

  /**
   * Use current device location
   */
  async useCurrentLocation(): Promise<void> {
    try {
      const location = await this.locationService.requestGeolocation();
      this.showLocationDropdown = false;

      // Update tracking if active
      if (this.state.isRealTimeTracking) {
        this.realTimeTracker.stopTracking();
        this.realTimeTracker.startTracking(location.longitude);
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      alert(error instanceof Error ? error.message : 'Failed to get current location');
    }
  }

  /**
   * Select a star to view rise/set information
   */
  selectStar(star: Star): void {
    this.selectedStar = star;
    this.calculateRiseSetInfo(star);

    // Calculate 3D position for the marker
    const phi = (90 - star.dec) * (Math.PI / 180);
    const theta = star.ra * (Math.PI / 12);
    const radius = 100;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const position = new THREE.Vector3(x, y, z);

    // Create selection marker with cyan color for stars
    this.updateSelectionMarker(position, 0x4affff);
  }

  /**
   * Calculate rise/set information for a star
   */
  private calculateRiseSetInfo(star: Star): void {
    const times = this.astronomyService.calculateRiseSetTransit(
      star.ra,
      star.dec,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude,
      this.state.observerTime
    );

    const altitude = this.astronomyService.getAltitude(
      star.ra,
      star.dec,
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    this.riseSetInfo = {
      rise: times.rise,
      set: times.set,
      transit: times.transit,
      isVisible: altitude > 0
    };
  }

  /**
   * Clear star selection
   */
  clearStarSelection(): void {
    this.selectedStar = null;
    this.riseSetInfo = null;
    this.removeSelectionMarker();
  }

  /**
   * Select a planet to view detailed information
   */
  selectPlanet(planet: Planet): void {
    this.selectedPlanet = planet;
    this.calculatePlanetRiseSetInfo(planet);

    // Calculate 3D position for the marker
    const phi = (90 - planet.position.dec) * (Math.PI / 180);
    const theta = planet.position.ra * (Math.PI / 12);
    const radius = 100;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const position = new THREE.Vector3(x, y, z);

    // Create selection marker with purple color for planets
    this.updateSelectionMarker(position, 0xb794f6);
  }

  /**
   * Calculate rise/set information for a planet
   */
  private calculatePlanetRiseSetInfo(planet: Planet): void {
    const times = this.astronomyService.calculateRiseSetTransit(
      planet.position.ra,
      planet.position.dec,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude,
      this.state.observerTime
    );

    const altitude = this.astronomyService.getAltitude(
      planet.position.ra,
      planet.position.dec,
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    this.planetRiseSetInfo = {
      rise: times.rise,
      set: times.set,
      transit: times.transit,
      isVisible: altitude > 0
    };
  }

  /**
   * Clear planet selection
   */
  clearPlanetSelection(): void {
    this.selectedPlanet = null;
    this.planetRiseSetInfo = null;
    this.removeSelectionMarker();
  }

  /**
   * Get formatted time string
   */
  formatTime(date: Date | null): string {
    if (!date) return 'Circumpolar';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Get list of currently visible bright stars
   */
  get visibleStars(): Star[] {
    return this.stars
      .filter(star => {
        const altitude = this.astronomyService.getAltitude(
          star.ra,
          star.dec,
          this.state.observerTime,
          this.state.observerLocation.latitude,
          this.state.observerLocation.longitude
        );
        return altitude > 0;
      })
      .sort((a, b) => a.magnitude - b.magnitude) // Sort by magnitude (lower = brighter)
      .slice(0, 10); // Limit to 10 brightest
  }

  /**
   * Get list of currently visible planets
   */
  get visiblePlanets(): Planet[] {
    const planets = this.planetaryService.getAllPlanetPositions(
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    const moon = this.planetaryService.getMoonPosition(
      this.state.observerTime,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude
    );

    const allCelestialBodies = [...planets, moon];

    return allCelestialBodies
      .filter(planet => {
        const altitude = this.astronomyService.getAltitude(
          planet.position.ra,
          planet.position.dec,
          this.state.observerTime,
          this.state.observerLocation.latitude,
          this.state.observerLocation.longitude
        );
        return altitude > 0;
      })
      .sort((a, b) => a.magnitude - b.magnitude); // Sort by magnitude (lower = brighter)
  }

  /**
   * Toggle left panel collapse state
   */
  toggleLeftPanel(): void {
    this.isLeftPanelCollapsed = !this.isLeftPanelCollapsed;
  }

  /**
   * Toggle right panel collapse state
   */
  toggleRightPanel(): void {
    this.isRightPanelCollapsed = !this.isRightPanelCollapsed;
  }

  /**
   * Handle search input changes
   */
  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search stars (by name or Bayer designation)
    this.allStars
      .filter(star =>
        (star.name && star.name.toLowerCase().includes(query)) ||
        (star.bayer && star.bayer.toLowerCase().includes(query))
      )
      .slice(0, 5) // Limit to 5 results per category
      .forEach(star => {
        results.push({
          type: 'star',
          name: star.name || star.bayer || `Star ${star.id}`,
          typeLabel: `Star (${star.constellation})`,
          data: star
        });
      });

    // Search constellations
    this.constellations
      .filter(constellation =>
        constellation.name.toLowerCase().includes(query) ||
        constellation.id.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .forEach(constellation => {
        results.push({
          type: 'constellation',
          name: constellation.name,
          typeLabel: `Constellation (${constellation.id})`,
          data: constellation
        });
      });

    // Search planets (simulated - we'd need to get current planet positions)
    const planetNames = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Moon'];
    planetNames
      .filter(name => name.toLowerCase().includes(query))
      .forEach(planetName => {
        results.push({
          type: 'planet',
          name: planetName,
          typeLabel: 'Planet',
          data: { name: planetName } as Planet
        });
      });

    this.searchResults = results.slice(0, 10); // Limit total results to 10
    this.highlightedResult = this.searchResults[0] || null;
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.highlightedResult = null;
  }

  /**
   * Handle search blur (with delay to allow click on results)
   */
  onSearchBlur(): void {
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  /**
   * Select a search result
   */
  selectSearchResult(result: SearchResult): void {
    switch (result.type) {
      case 'star':
        this.selectStar(result.data as Star);
        break;
      case 'planet':
        // Get the full planet data from the planetary service
        const planetData = this.planetaryService.getPlanetPosition(
          result.name,
          this.state.observerTime,
          this.state.observerLocation.latitude,
          this.state.observerLocation.longitude
        );
        this.selectPlanet(planetData);
        break;
      case 'constellation':
        // TODO: Implement constellation focus
        console.log('Constellation selected:', result.name);
        break;
    }
    this.clearSearch();
  }

  /**
   * Get icon for search result type
   */
  getResultIcon(type: 'star' | 'planet' | 'constellation'): string {
    switch (type) {
      case 'star':
        return '⭐';
      case 'planet':
        return '🪐';
      case 'constellation':
        return '🌌';
      default:
        return '✨';
    }
  }

  /**
   * Handle mouse move for hover tooltips
   */
  private onMouseMove(event: MouseEvent): void {
    const container = this.rendererContainer.nativeElement;
    const rect = container.getBoundingClientRect();

    // Calculate mouse position in normalized device coordinates (-1 to +1)
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Store absolute position for tooltip
    this.tooltipPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Set raycaster threshold for point picking
    this.raycaster.params.Points = { threshold: 2 };

    // Check for intersections with stars and planets
    const intersectableObjects = [...this.starMeshes, ...this.planetMeshes];
    const intersects = this.raycaster.intersectObjects(intersectableObjects);

    if (intersects.length > 0) {
      const intersection = intersects[0];
      const pointIndex = intersection.index;

      if (pointIndex !== undefined) {
        // Determine if it's a star or planet
        const isStarMesh = this.starMeshes.includes(intersection.object as THREE.Points);

        if (isStarMesh) {
          // It's a star
          const star = this.stars[pointIndex];
          if (star) {
            this.hoveredObject = {
              name: star.name || star.bayer || `Star ${star.id}`,
              type: 'star',
              magnitude: star.magnitude,
              constellation: star.constellation
            };
          }
        } else {
          // It's a planet
          const planets = this.planetaryService.getAllPlanetPositions(
            this.state.observerTime,
            this.state.observerLocation.latitude,
            this.state.observerLocation.longitude
          );
          const moon = this.planetaryService.getMoonPosition(
            this.state.observerTime,
            this.state.observerLocation.latitude,
            this.state.observerLocation.longitude
          );
          const allCelestialBodies = [...planets, moon];

          const planet = allCelestialBodies[pointIndex];
          if (planet) {
            this.hoveredObject = {
              name: planet.name,
              type: 'planet',
              magnitude: planet.magnitude
            };
          }
        }
      }
    } else {
      this.hoveredObject = null;
    }
  }

  /**
   * Generate Tonight's Sky highlights report
   */
  generateTonightsSkyReport(): void {
    if (this.allStars.length === 0) {
      console.warn('Cannot generate Tonight\'s Sky report: star catalog not loaded');
      return;
    }

    this.tonightsSkyReport = this.skyHighlightsService.generateTonightsSkyReport(
      this.allStars,
      this.state.observerLocation.latitude,
      this.state.observerLocation.longitude,
      this.state.observerTime,
      this.state.observerLocation.name
    );

    console.log('Tonight\'s Sky Report generated:', this.tonightsSkyReport);
  }

  /**
   * Toggle Tonight's Highlights panel
   */
  toggleHighlightsPanel(): void {
    this.showHighlightsPanel = !this.showHighlightsPanel;

    // Generate report when opening panel if not already generated
    if (this.showHighlightsPanel && !this.tonightsSkyReport) {
      this.generateTonightsSkyReport();
    }
  }

  /**
   * Select a highlight from the Tonight's Sky panel
   */
  selectHighlight(highlight: any): void {
    if (highlight.type === 'star') {
      // Find the star in the catalog
      const star = this.allStars.find(s =>
        s.name === highlight.objectName ||
        s.bayer === highlight.objectName ||
        `Star ${s.id}` === highlight.objectName
      );
      if (star) {
        this.selectStar(star);
      }
    } else if (highlight.type === 'planet') {
      // Get the planet data
      const planetData = this.planetaryService.getPlanetPosition(
        highlight.objectName,
        this.state.observerTime,
        this.state.observerLocation.latitude,
        this.state.observerLocation.longitude
      );
      this.selectPlanet(planetData);
    }
  }

  /**
   * Step time forward or backward by a specified amount
   * @param amount - Number of units to step (positive = forward, negative = backward)
   * @param unit - Unit of time ('hour' or 'day')
   */
  stepTime(amount: number, unit: 'hour' | 'day'): void {
    // Stop real-time tracking when manually stepping time
    if (this.state.isRealTimeTracking) {
      this.realTimeTracker.stopTracking();
    }

    // Calculate new time
    const newTime = new Date(this.state.observerTime);

    if (unit === 'hour') {
      newTime.setHours(newTime.getHours() + amount);
    } else if (unit === 'day') {
      newTime.setDate(newTime.getDate() + amount);
    }

    this.setTime(newTime);

    // Update planets and trails
    this.updatePlanets();
    this.recordPlanetTrailPoints();
    this.updatePlanetTrails();

    // Refresh highlights if panel is open
    if (this.showHighlightsPanel) {
      this.generateTonightsSkyReport();
    }
  }

  /**
   * Toggle time animation playback
   */
  toggleTimeAnimation(): void {
    if (this.isAnimationPlaying) {
      this.stopTimeAnimation();
    } else {
      this.startTimeAnimation();
    }
  }

  /**
   * Start time animation with current speed setting
   */
  private startTimeAnimation(): void {
    // Stop real-time tracking when starting animation
    if (this.state.isRealTimeTracking) {
      this.realTimeTracker.stopTracking();
    }

    this.isAnimationPlaying = true;

    // Update interval: run every second, advancing time by animationSpeed seconds
    this.animationIntervalId = setInterval(() => {
      const newTime = new Date(this.state.observerTime);
      newTime.setSeconds(newTime.getSeconds() + this.animationSpeed);

      this.state.observerTime = newTime;
      this.updateSphereRotation();
      this.updatePlanets();

      // Record trail points and update trails
      this.recordPlanetTrailPoints();
      this.updatePlanetTrails();

      // Update highlights every 10 iterations to avoid performance issues
      if (this.showHighlightsPanel && Math.random() < 0.1) {
        this.generateTonightsSkyReport();
      }
    }, 1000); // Run every 1 second

    console.log(`Time animation started at ${this.animationSpeed}x speed`);
  }

  /**
   * Stop time animation
   */
  private stopTimeAnimation(): void {
    if (this.animationIntervalId) {
      clearInterval(this.animationIntervalId);
      this.animationIntervalId = null;
    }
    this.isAnimationPlaying = false;
    console.log('Time animation stopped');
  }

  /**
   * Handle animation speed change from dropdown
   */
  onAnimationSpeedChange(): void {
    // If animation is playing, restart with new speed
    if (this.isAnimationPlaying) {
      this.stopTimeAnimation();
      this.startTimeAnimation();
    }
  }
}
