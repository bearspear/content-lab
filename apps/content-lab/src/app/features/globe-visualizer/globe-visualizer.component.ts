import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { StatefulComponent } from '@content-lab/core';
import { StateManagerService } from '@content-lab/core';
import { GlobeState, DEFAULT_GLOBE_STATE, WorldType, TextureResolution } from './models/globe-state.model';
import { LocationPin, createDefaultPin } from './models/location-pin.model';
import {
  TEXTURE_REPOSITORY,
  TextureVariant,
  getTexturesForWorld,
  getTextureVariant,
  getAvailableResolutions,
  getTexturePath
} from './models/texture-repository.model';

interface WorldConfig {
  type: WorldType;
  name: string;
  texture2k: string;
  texture4k: string; // Path to 4K texture (can be same as 2K initially)
  description: string;
  hasAtmosphere: boolean;
  atmosphereColor: number;
  backgroundColor: number;
}

@Component({
  selector: 'app-globe-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './globe-visualizer.component.html',
  styleUrl: './globe-visualizer.component.scss'
})
export class GlobeVisualizerComponent extends StatefulComponent<GlobeState> implements AfterViewInit, OnDestroy {
  protected readonly TOOL_ID = 'globe-visualizer';

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  state: GlobeState = { ...DEFAULT_GLOBE_STATE };

  // Three.js objects
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globe!: THREE.Mesh;
  private pinMeshes: Map<string, THREE.Mesh> = new Map();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animationId: number | null = null;
  private cursorPreview!: THREE.Mesh;

  // Interaction state
  private isMouseDown = false;
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private rotationVelocity = { x: 0, y: 0 };

  // UI state
  showAddPinModal = false;
  showImportModal = false;
  newPin: Partial<LocationPin> = createDefaultPin();
  importText = '';
  importFormat: 'json' | 'csv' = 'json';
  currentLat: number | null = null;
  currentLong: number | null = null;

  // Predefined options
  categories = ['General', 'Travel', 'Work', 'Historical', 'Nature', 'Urban', 'Other'];
  icons = ['📍', '🏠', '🏢', '🏛️', '🗼', '🏰', '⛰️', '🏖️', '🌋', '🗿', '🎭', '🎨', '📚', '🎓', '✈️', '🚢', '⭐', '🔔', '🎯', '💡'];
  colors = [
    { name: 'Purple', value: '#667eea' },
    { name: 'Violet', value: '#764ba2' },
    { name: 'Blue', value: '#4299e1' },
    { name: 'Green', value: '#48bb78' },
    { name: 'Red', value: '#f56565' },
    { name: 'Orange', value: '#ed8936' },
    { name: 'Pink', value: '#ed64a6' },
    { name: 'Teal', value: '#38b2ac' },
    { name: 'Yellow', value: '#ecc94b' },
    { name: 'Cyan', value: '#0bc5ea' }
  ];

  sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

  // World configurations (ordered by distance from the Sun)
  worlds: WorldConfig[] = [
    {
      type: 'sun',
      name: 'Sun',
      texture2k: '/assets/textures/sun.jpg',
      texture4k: '/assets/textures/sun.jpg',
      description: 'Our Star',
      hasAtmosphere: true,
      atmosphereColor: 0xffaa00,
      backgroundColor: 0x000000
    },
    {
      type: 'mercury',
      name: 'Mercury',
      texture2k: '/assets/textures/mercury.jpg',
      texture4k: '/assets/textures/mercury.jpg', // TODO: Replace with 4K when available
      description: 'Closest to the Sun',
      hasAtmosphere: false,
      atmosphereColor: 0x888888,
      backgroundColor: 0x000000
    },
    {
      type: 'venus',
      name: 'Venus',
      texture2k: '/assets/textures/venus.jpg',
      texture4k: '/assets/textures/venus.jpg', // TODO: Replace with 4K when available
      description: 'Earth\'s Sister Planet',
      hasAtmosphere: true,
      atmosphereColor: 0xffcc66,
      backgroundColor: 0x1a1510
    },
    {
      type: 'earth',
      name: 'Earth',
      texture2k: '/assets/textures/earth-day.jpg',
      texture4k: '/assets/textures/earth-day.jpg', // TODO: Replace with 4K when available
      description: 'The Blue Planet',
      hasAtmosphere: true,
      atmosphereColor: 0x4499ff,
      backgroundColor: 0x000814
    },
    {
      type: 'mars',
      name: 'Mars',
      texture2k: '/assets/textures/mars.jpg',
      texture4k: '/assets/textures/mars.jpg', // TODO: Replace with 4K when available
      description: 'The Red Planet',
      hasAtmosphere: false,
      atmosphereColor: 0xff8844,
      backgroundColor: 0x0a0505
    },
    {
      type: 'jupiter',
      name: 'Jupiter',
      texture2k: '/assets/textures/jupiter.jpg',
      texture4k: '/assets/textures/jupiter.jpg', // TODO: Replace with 4K when available
      description: 'The Gas Giant',
      hasAtmosphere: true,
      atmosphereColor: 0xd4a574,
      backgroundColor: 0x0d0a05
    },
    {
      type: 'saturn',
      name: 'Saturn',
      texture2k: '/assets/textures/saturn.jpg',
      texture4k: '/assets/textures/saturn.jpg', // TODO: Replace with 4K when available
      description: 'The Ringed Planet',
      hasAtmosphere: true,
      atmosphereColor: 0xf4d47f,
      backgroundColor: 0x0e0c06
    },
    {
      type: 'uranus',
      name: 'Uranus',
      texture2k: '/assets/textures/uranus.jpg',
      texture4k: '/assets/textures/uranus.jpg', // TODO: Replace with 4K when available
      description: 'The Ice Giant',
      hasAtmosphere: true,
      atmosphereColor: 0x4fd0e7,
      backgroundColor: 0x050a0d
    },
    {
      type: 'neptune',
      name: 'Neptune',
      texture2k: '/assets/textures/neptune.jpg',
      texture4k: '/assets/textures/neptune.jpg', // TODO: Replace with 4K when available
      description: 'The Deep Blue Giant',
      hasAtmosphere: true,
      atmosphereColor: 0x4466ee,
      backgroundColor: 0x05060d
    },
    {
      type: 'pluto',
      name: 'Pluto',
      texture2k: '/assets/textures/pluto.jpg',
      texture4k: '/assets/textures/pluto.jpg', // TODO: Replace with 4K when available
      description: 'The Dwarf Planet',
      hasAtmosphere: false,
      atmosphereColor: 0x999999,
      backgroundColor: 0x000000
    },
    {
      type: 'moon',
      name: 'Moon',
      texture2k: '/assets/textures/moon.jpg',
      texture4k: '/assets/textures/moon.jpg', // TODO: Replace with 4K when available
      description: 'Earth\'s Natural Satellite',
      hasAtmosphere: false,
      atmosphereColor: 0xcccccc,
      backgroundColor: 0x000000
    }
  ];

  constructor(
    stateManager: StateManagerService,
    private ngZone: NgZone
  ) {
    super(stateManager);
  }

  protected override getDefaultState(): GlobeState {
    return { ...DEFAULT_GLOBE_STATE };
  }

  protected override applyState(state: GlobeState): void {
    // Migration: Ensure textureVariantId exists and is correct for each world
    if (!state.textureVariantId) {
      // Set appropriate variant based on world
      state.textureVariantId = state.selectedWorld === 'earth' ? 'day' : 'realistic';
    }
    // Migration: Ensure textureResolution exists
    if (!state.textureResolution) {
      state.textureResolution = '2k';
    }
    // Migration: Ensure textureIndex exists
    if (state.textureIndex === undefined) {
      state.textureIndex = 0;
    }

    this.state = { ...state };
    if (this.scene) {
      this.rebuildPins();
    }
  }

  protected override getCurrentState(): GlobeState {
    return { ...this.state };
  }

  /**
   * Get current world configuration
   */
  get currentWorld(): WorldConfig {
    return this.worlds.find(w => w.type === this.state.selectedWorld) || this.worlds[0];
  }

  /**
   * Get available texture variants for current world
   */
  get availableTextureVariants(): TextureVariant[] {
    const collection = getTexturesForWorld(this.state.selectedWorld);
    return collection?.variants || [];
  }

  /**
   * Get current texture variant
   */
  get currentTextureVariant(): TextureVariant | undefined {
    return getTextureVariant(this.state.selectedWorld, this.state.textureVariantId);
  }

  /**
   * Get available resolutions for current texture variant
   */
  get availableResolutions(): TextureResolution[] {
    return getAvailableResolutions(this.state.selectedWorld, this.state.textureVariantId);
  }

  /**
   * Get all available texture options with labels (resolution + human name)
   * Returns array of {value: "2k-0", label: "2K - Realistic Surface"}
   */
  get availableTextureOptions(): Array<{value: string, label: string}> {
    const variant = getTextureVariant(this.state.selectedWorld, this.state.textureVariantId);
    if (!variant) return [];

    const options: Array<{value: string, label: string}> = [];

    // Iterate through each resolution
    const resolutions: TextureResolution[] = ['2k', '4k', '8k'];
    resolutions.forEach(res => {
      const textureFiles = variant.resolutions[res];
      if (textureFiles && textureFiles.length > 0) {
        textureFiles.forEach((file, index) => {
          options.push({
            value: `${res}-${index}`,
            label: `${res.toUpperCase()} - ${file.humanName}`
          });
        });
      }
    });

    return options;
  }

  /**
   * Get current selected texture value for dropdown
   */
  get currentTextureValue(): string {
    return `${this.state.textureResolution}-${this.state.textureIndex}`;
  }

  /**
   * Get current texture path based on variant, resolution, and index
   */
  get currentTexture(): string {
    const path = getTexturePath(
      this.state.selectedWorld,
      this.state.textureVariantId,
      this.state.textureResolution,
      this.state.textureIndex
    );
    if (path) return path;

    // Fallback to first 2K texture if current not available
    const fallback2k = getTexturePath(this.state.selectedWorld, this.state.textureVariantId, '2k', 0);
    if (fallback2k) return fallback2k;

    // Ultimate fallback
    return '/assets/textures/hash/dec752db.jpg';
  }

  /**
   * Get pins for the current world only
   */
  get currentWorldPins(): LocationPin[] {
    return this.state.pins.filter(pin => pin.world === this.state.selectedWorld);
  }

  ngAfterViewInit(): void {
    // Run outside Angular zone for better performance
    this.ngZone.runOutsideAngular(() => {
      // Delay initialization to ensure canvas is rendered
      setTimeout(() => {
        this.initThreeJS();
        this.animate();
      }, 0);
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  /**
   * Initialize Three.js scene, camera, renderer, and globe
   */
  private initThreeJS(): void {
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.error('Canvas element not found');
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    console.log('Initializing Three.js canvas:', width, 'x', height);

    // Scene with transparent background
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to show CSS background

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);

    // Create globe
    this.createGlobe();

    // Create cursor preview dot
    this.createCursorPreview();

    // Rebuild pins from state
    this.rebuildPins();

    // Event listeners
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    canvas.addEventListener('wheel', this.onWheel.bind(this));
    canvas.addEventListener('dblclick', this.onDoubleClick.bind(this));
    window.addEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Create the globe sphere for the selected world
   */
  private createGlobe(): void {
    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Load texture for selected world with current quality setting
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      this.currentTexture,
      // onLoad callback
      () => {
        console.log(`${this.currentWorld.name} ${this.state.textureResolution.toUpperCase()} texture loaded successfully (Variant: ${this.state.textureVariantId})`);
      },
      // onProgress callback
      undefined,
      // onError callback
      (error) => {
        console.error(`Error loading ${this.currentWorld.name} texture:`, error);
        // Fallback to simple color if texture fails
        this.createFallbackGlobe();
      }
    );

    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5,
      bumpScale: 0.05
    });

    this.globe = new THREE.Mesh(geometry, material);
    this.scene.add(this.globe);

    // Add atmosphere glow if enabled and world has atmosphere
    if (this.state.showAtmosphere && this.currentWorld.hasAtmosphere) {
      this.addAtmosphere();
    }
  }

  /**
   * Create fallback globe with simple color if texture fails to load
   */
  private createFallbackGlobe(): void {
    if (this.globe) {
      // Use different fallback colors based on world
      let fallbackColor = 0x2563eb; // Blue for Earth
      switch (this.currentWorld.type) {
        case 'sun':
          fallbackColor = 0xfdb813; // Yellow-orange for Sun
          break;
        case 'mercury':
          fallbackColor = 0x8c7853; // Gray-brown for Mercury
          break;
        case 'venus':
          fallbackColor = 0xe8cda2; // Pale yellow for Venus
          break;
        case 'earth':
          fallbackColor = 0x2563eb; // Blue for Earth
          break;
        case 'mars':
          fallbackColor = 0xcc6633; // Red/orange for Mars
          break;
        case 'jupiter':
          fallbackColor = 0xc88b3a; // Orange-brown for Jupiter
          break;
        case 'saturn':
          fallbackColor = 0xfad5a5; // Pale gold for Saturn
          break;
        case 'uranus':
          fallbackColor = 0x4fd0e7; // Cyan for Uranus
          break;
        case 'neptune':
          fallbackColor = 0x4466ee; // Deep blue for Neptune
          break;
        case 'pluto':
          fallbackColor = 0x999999; // Gray for Pluto
          break;
        case 'moon':
          fallbackColor = 0x999999; // Gray for Moon
          break;
      }

      const material = new THREE.MeshPhongMaterial({
        color: fallbackColor,
        shininess: 5
      });
      this.globe.material = material;
    }
  }

  /**
   * Add atmospheric glow effect
   */
  private addAtmosphere(): void {
    const atmosphereGeometry = new THREE.SphereGeometry(1.05, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: this.currentWorld.atmosphereColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.globe.add(atmosphere);
  }


  /**
   * Create cursor preview dot that follows the mouse
   */
  private createCursorPreview(): void {
    const geometry = new THREE.SphereGeometry(0.015, 16, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5
    });
    this.cursorPreview = new THREE.Mesh(geometry, material);
    this.cursorPreview.visible = false;
    // Add to globe so it rotates with the globe, just like pins
    this.globe.add(this.cursorPreview);
  }

  /**
   * Convert latitude/longitude to 3D position on sphere
   */
  private latLongToVector3(lat: number, long: number, radius: number = 1): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Create pin mesh at location - classic map pin style
   */
  private createPinMesh(pin: LocationPin): THREE.Mesh {
    // Scale factors based on size - made smaller overall
    const baseScale = 0.3; // Overall smaller pins
    const scale = pin.size === 'small' ? 0.7 : pin.size === 'large' ? 1.3 : 1.0;
    const headRadius = 0.04 * scale * baseScale;
    const stickHeight = 0.12 * scale * baseScale;
    const stickRadius = 0.008 * scale * baseScale;

    // Create pin group
    const pinGroup = new THREE.Group();
    const color = new THREE.Color(pin.color || '#667eea');

    // 1. Create the round head (sphere)
    const headGeometry = new THREE.SphereGeometry(headRadius, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.3
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = stickHeight;
    pinGroup.add(head);

    // 2. Create the stick/shaft (cylinder)
    const stickGeometry = new THREE.CylinderGeometry(stickRadius, stickRadius * 0.5, stickHeight, 8);
    const stickMaterial = new THREE.MeshStandardMaterial({
      color: color.clone().multiplyScalar(0.8), // Slightly darker
      metalness: 0.5,
      roughness: 0.3
    });
    const stick = new THREE.Mesh(stickGeometry, stickMaterial);
    stick.position.y = stickHeight / 2;
    pinGroup.add(stick);

    // 3. Create the pointed tip (cone)
    const tipGeometry = new THREE.ConeGeometry(stickRadius * 0.5, headRadius * 0.8, 8);
    const tipMaterial = new THREE.MeshStandardMaterial({
      color: color.clone().multiplyScalar(0.7), // Even darker
      metalness: 0.6,
      roughness: 0.2
    });
    const tip = new THREE.Mesh(tipGeometry, tipMaterial);
    tip.position.y = -headRadius * 0.4;
    pinGroup.add(tip);

    // 4. Add a small highlight/shine sphere on top
    const shineGeometry = new THREE.SphereGeometry(headRadius * 0.3, 16, 16);
    const shineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6
    });
    const shine = new THREE.Mesh(shineGeometry, shineMaterial);
    shine.position.set(headRadius * 0.3, stickHeight + headRadius * 0.3, headRadius * 0.3);
    pinGroup.add(shine);

    // Position and orient the entire pin group
    const position = this.latLongToVector3(pin.latitude, pin.longitude, 1);
    pinGroup.position.copy(position);

    // Orient pin to point outward from globe center
    // We want the pin's Y-axis to point away from the center
    const upDirection = position.clone().normalize();
    pinGroup.lookAt(position.clone().add(upDirection));

    // Offset above surface
    const normalizedPos = position.clone().normalize();
    const offset = normalizedPos.multiplyScalar(0.02);
    pinGroup.position.add(offset);

    pinGroup.userData = { pinId: pin.id };

    // Make pins children of globe so they rotate with it
    this.globe.add(pinGroup);

    console.log(`Created pin at lat:${pin.latitude}, long:${pin.longitude}`);

    return pinGroup as any; // Cast to Mesh for compatibility
  }

  /**
   * Rebuild all pin meshes from state (only for current world)
   */
  private rebuildPins(): void {
    if (!this.globe) {
      console.warn('Globe not initialized yet, skipping pin rebuild');
      return;
    }

    // Remove existing pins from globe
    this.pinMeshes.forEach((group: any) => {
      this.globe.remove(group);
      // Dispose of all geometries and materials in the group
      group.children.forEach((child: THREE.Mesh) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.pinMeshes.clear();

    // Create new pins (only for current world)
    const worldPins = this.currentWorldPins;
    console.log(`Rebuilding ${worldPins.length} pins for ${this.currentWorld.name}`);
    worldPins.forEach(pin => {
      const pinGroup = this.createPinMesh(pin);
      this.pinMeshes.set(pin.id, pinGroup);
      console.log(`Pin ${pin.id} added to globe, total children:`, this.globe.children.length);
    });
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    // Auto-rotate
    if (this.state.autoRotate) {
      this.globe.rotation.y += this.state.rotationSpeed * 0.001;
    }

    // Apply momentum
    if (!this.isDragging && (Math.abs(this.rotationVelocity.x) > 0.001 || Math.abs(this.rotationVelocity.y) > 0.001)) {
      this.globe.rotation.y += this.rotationVelocity.x;
      this.globe.rotation.x += this.rotationVelocity.y;
      this.rotationVelocity.x *= 0.95;
      this.rotationVelocity.y *= 0.95;
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Mouse event handlers
   */
  private onMouseDown(event: MouseEvent): void {
    this.isMouseDown = true;
    this.isDragging = false;
    this.previousMousePosition = { x: event.clientX, y: event.clientY };
    this.rotationVelocity = { x: 0, y: 0 };
  }

  private onMouseMove(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position in normalized device coordinates
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update cursor preview and lat/long display
    this.updateCursorPreview();

    // Only rotate if mouse button is actually pressed
    if (!this.isMouseDown) return;

    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    // Consider it dragging if moved more than 3 pixels
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      this.isDragging = true;

      this.globe.rotation.y += deltaX * 0.005;
      this.globe.rotation.x += deltaY * 0.005;

      // Limit vertical rotation
      this.globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.globe.rotation.x));

      this.rotationVelocity.x = deltaX * 0.005;
      this.rotationVelocity.y = deltaY * 0.005;
    }

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  private onMouseUp(): void {
    this.isMouseDown = false;
    // Small delay before resetting isDragging to allow click handler to check it
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    const zoomSpeed = 0.001;
    const newZ = this.camera.position.z + event.deltaY * zoomSpeed;
    this.camera.position.z = Math.max(1.5, Math.min(5, newZ));
  }

  private onDoubleClick(event: MouseEvent): void {
    console.log('Double-click detected, edit mode:', this.state.isEditMode);

    // Only add pin on double-click if in edit mode
    if (!this.state.isEditMode) {
      console.log('Not in edit mode');
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position in normalized device coordinates
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    console.log('Mouse coords:', this.mouse.x, this.mouse.y);

    // Raycast to globe
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.globe, true);

    console.log('Intersects:', intersects.length);

    if (intersects.length > 0) {
      // Get intersection point in world space
      const worldPoint = intersects[0].point;
      console.log('Intersection point (world):', worldPoint);

      // Transform to globe's local space (account for globe rotation)
      const localPoint = this.globe.worldToLocal(worldPoint.clone());
      console.log('Intersection point (local):', localPoint);

      // Convert 3D point to lat/long in local space (inverse of latLongToVector3)
      const radius = Math.sqrt(localPoint.x ** 2 + localPoint.y ** 2 + localPoint.z ** 2);
      const lat = 90 - Math.acos(localPoint.y / radius) * (180 / Math.PI);
      const long = Math.atan2(localPoint.z, -localPoint.x) * (180 / Math.PI) - 180;

      console.log('Calculated lat/long:', lat, long);

      this.ngZone.run(() => {
        this.newPin.latitude = Math.round(lat * 10000) / 10000;
        this.newPin.longitude = Math.round(long * 10000) / 10000;
        this.showAddPinModal = true;
      });
    } else {
      console.log('No intersection with globe');
    }
  }

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Update cursor preview position based on mouse raycasting
   */
  private updateCursorPreview(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.globe, false);

    if (intersects.length > 0) {
      // Get intersection point in world space
      const worldPoint = intersects[0].point;

      // Transform to globe's local space (account for globe rotation)
      const localPoint = this.globe.worldToLocal(worldPoint.clone());

      // Convert 3D point to lat/long in local space
      const radius = Math.sqrt(localPoint.x ** 2 + localPoint.y ** 2 + localPoint.z ** 2);
      const lat = 90 - Math.acos(localPoint.y / radius) * (180 / Math.PI);
      const long = Math.atan2(localPoint.z, -localPoint.x) * (180 / Math.PI) - 180;

      // Update coordinates display
      this.ngZone.run(() => {
        this.currentLat = Math.round(lat * 100) / 100;
        this.currentLong = Math.round(long * 100) / 100;
      });

      // Position cursor preview in local space using the same conversion as pins
      const cursorPosition = this.latLongToVector3(lat, long, 1.02);
      this.cursorPreview.position.copy(cursorPosition);

      // Scale cursor based on camera distance - smaller when zoomed in
      const cameraDistance = this.camera.position.length();
      const scale = Math.pow(cameraDistance / 3, 1.5); // Gets smaller as you zoom in
      this.cursorPreview.scale.setScalar(scale);

      this.cursorPreview.visible = true;
    } else {
      this.cursorPreview.visible = false;
      this.ngZone.run(() => {
        this.currentLat = null;
        this.currentLong = null;
      });
    }
  }

  /**
   * UI Actions
   */
  toggleAutoRotate(): void {
    this.ngZone.run(() => {
      this.state.autoRotate = !this.state.autoRotate;
      this.saveState();
    });
  }

  toggleEditMode(): void {
    this.ngZone.run(() => {
      this.state.isEditMode = !this.state.isEditMode;
      console.log('Edit mode toggled:', this.state.isEditMode);
      this.saveState();
    });
  }

  /**
   * Switch texture variant
   */
  switchTextureVariant(variantId: string): void {
    this.ngZone.run(() => {
      this.state.textureVariantId = variantId;

      // Check if current resolution is available for new variant
      const availableResolutions = getAvailableResolutions(this.state.selectedWorld, variantId);
      if (!availableResolutions.includes(this.state.textureResolution)) {
        // Fall back to highest available resolution
        this.state.textureResolution = availableResolutions[availableResolutions.length - 1] || '2k';
      }

      // Reset to first texture in the variant
      this.state.textureIndex = 0;

      console.log(`Texture variant changed to ${variantId}`);
      this.reloadGlobe();
    });
  }

  /**
   * Change texture resolution and index
   * @param value Format: "2k-0" (resolution-index)
   */
  changeTextureResolution(value: string): void {
    this.ngZone.run(() => {
      const parts = value.split('-');
      if (parts.length === 2) {
        this.state.textureResolution = parts[0] as TextureResolution;
        this.state.textureIndex = parseInt(parts[1], 10);
        console.log(`Texture changed to ${this.state.textureResolution.toUpperCase()} (index ${this.state.textureIndex})`);
        this.reloadGlobe();
      }
    });
  }

  /**
   * Cycle to next available resolution
   */
  cycleTextureResolution(): void {
    this.ngZone.run(() => {
      const available = this.availableResolutions;
      if (available.length === 0) return;

      const currentIndex = available.indexOf(this.state.textureResolution);
      const nextIndex = (currentIndex + 1) % available.length;
      this.state.textureResolution = available[nextIndex];

      console.log(`Texture resolution cycled to ${this.state.textureResolution.toUpperCase()}`);
      this.reloadGlobe();
    });
  }

  /**
   * Reload globe with new texture
   */
  private reloadGlobe(): void {
    if (this.globe && this.scene) {
      // Remove old globe
      this.scene.remove(this.globe);

      // Dispose of resources
      if (this.globe.geometry) this.globe.geometry.dispose();
      if (this.globe.material) {
        if (Array.isArray(this.globe.material)) {
          this.globe.material.forEach(m => m.dispose());
        } else {
          this.globe.material.dispose();
        }
      }

      // Dispose of children (atmosphere)
      this.globe.children.forEach((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      // Recreate globe with new texture
      this.createGlobe();

      // Recreate cursor preview
      this.createCursorPreview();

      // Rebuild pins
      this.rebuildPins();
    }

    this.saveState();
  }

  resetCamera(): void {
    if (this.camera && this.globe) {
      this.camera.position.set(0, 0, 3);
      this.globe.rotation.set(0, 0, 0);
    }
  }

  openAddPinModal(): void {
    this.ngZone.run(() => {
      this.newPin = createDefaultPin();
      this.showAddPinModal = true;
    });
  }

  closeAddPinModal(): void {
    this.ngZone.run(() => {
      this.showAddPinModal = false;
      this.newPin = createDefaultPin();
    });
  }

  addPin(): void {
    if (!this.newPin.title || this.newPin.latitude === undefined || this.newPin.longitude === undefined) {
      alert('Please fill in required fields (Title, Latitude, Longitude)');
      return;
    }

    this.ngZone.run(() => {
      const pin: LocationPin = {
        id: Date.now().toString(),
        title: this.newPin.title!,
        latitude: this.newPin.latitude!,
        longitude: this.newPin.longitude!,
        world: this.state.selectedWorld, // Associate pin with current world
        description: this.newPin.description,
        category: this.newPin.category,
        color: this.newPin.color,
        icon: this.newPin.icon,
        size: this.newPin.size || 'medium',
        date: this.newPin.date
      };

      console.log('Adding pin to', this.currentWorld.name, ':', pin);
      this.state.pins.push(pin);
      console.log('Total pins in state:', this.state.pins.length);

      this.rebuildPins();
      this.saveState();
      this.closeAddPinModal();
    });
  }

  deletePin(pinId: string): void {
    this.ngZone.run(() => {
      this.state.pins = this.state.pins.filter(p => p.id !== pinId);
      this.rebuildPins();
      this.saveState();
    });
  }

  openImportModal(): void {
    this.ngZone.run(() => {
      this.importText = '';
      this.showImportModal = true;
    });
  }

  closeImportModal(): void {
    this.ngZone.run(() => {
      this.showImportModal = false;
      this.importText = '';
    });
  }

  importData(): void {
    try {
      let importedPins: LocationPin[] = [];

      if (this.importFormat === 'json') {
        const data = JSON.parse(this.importText);
        importedPins = Array.isArray(data) ? data : [data];
      } else if (this.importFormat === 'csv') {
        // Simple CSV parsing: title,latitude,longitude,description,category,color,icon
        const lines = this.importText.split('\n').filter(line => line.trim());
        const hasHeader = lines[0].toLowerCase().includes('title') || lines[0].toLowerCase().includes('latitude');

        lines.slice(hasHeader ? 1 : 0).forEach(line => {
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 3) {
            importedPins.push({
              id: Date.now().toString() + Math.random(),
              title: parts[0],
              latitude: parseFloat(parts[1]),
              longitude: parseFloat(parts[2]),
              world: this.state.selectedWorld, // Default to current world
              description: parts[3] || '',
              category: parts[4] || 'General',
              color: parts[5] || '#667eea',
              icon: parts[6] || '📍',
              size: 'medium'
            });
          }
        });
      }

      // Validate and add pins
      importedPins.forEach(pin => {
        if (pin.title && typeof pin.latitude === 'number' && typeof pin.longitude === 'number') {
          if (!pin.id) pin.id = Date.now().toString() + Math.random();
          if (!pin.color) pin.color = '#667eea';
          if (!pin.icon) pin.icon = '📍';
          if (!pin.size) pin.size = 'medium';
          // Default to current world if not specified
          if (!pin.world) pin.world = this.state.selectedWorld;
          this.state.pins.push(pin);
        }
      });

      this.ngZone.run(() => {
        this.rebuildPins();
        this.saveState();
        this.closeImportModal();
        alert(`Successfully imported ${importedPins.length} pins!`);
      });
    } catch (error) {
      this.ngZone.run(() => {
        alert('Error importing data. Please check the format and try again.');
        console.error('Import error:', error);
      });
    }
  }

  exportData(): void {
    const dataStr = JSON.stringify(this.currentWorldPins, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${this.currentWorld.name.toLowerCase()}-pins-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  clearAllPins(): void {
    if (confirm(`Are you sure you want to delete all pins on ${this.currentWorld.name}?`)) {
      this.ngZone.run(() => {
        // Remove only pins from current world
        this.state.pins = this.state.pins.filter(pin => pin.world !== this.state.selectedWorld);
        this.rebuildPins();
        this.saveState();
      });
    }
  }

  /**
   * Switch to a different world
   */
  switchWorld(worldType: WorldType): void {
    console.log('Switching to:', worldType, 'Current:', this.state.selectedWorld);

    if (this.state.selectedWorld === worldType) {
      console.log('Already on this world, skipping');
      return; // Already on this world
    }

    this.ngZone.run(() => {
      this.state.selectedWorld = worldType;

      // Set appropriate texture variant for the new world
      this.state.textureVariantId = worldType === 'earth' ? 'day' : 'realistic';

      // Reset to first available resolution and texture index
      const availableResolutions = getAvailableResolutions(this.state.selectedWorld, this.state.textureVariantId);
      this.state.textureResolution = availableResolutions[0] || '2k';
      this.state.textureIndex = 0;

      // Scene background stays transparent for CSS background

      // Recreate the globe with new texture
      if (this.globe && this.scene) {
        // Remove old globe and its children (including atmosphere)
        this.scene.remove(this.globe);

        // Dispose of geometries and materials
        if (this.globe.geometry) {
          this.globe.geometry.dispose();
        }
        if (this.globe.material) {
          if (Array.isArray(this.globe.material)) {
            this.globe.material.forEach(m => m.dispose());
          } else {
            this.globe.material.dispose();
          }
        }

        // Dispose of children (like atmosphere)
        this.globe.children.forEach((child: any) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m: any) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });

        // Create new globe
        this.createGlobe();

        // Recreate cursor preview and attach to new globe
        this.createCursorPreview();

        // Rebuild pins on new globe
        this.rebuildPins();
      }

      this.saveState();
      console.log(`Switched to ${this.currentWorld.name}`);
    });
  }
}
