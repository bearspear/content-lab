import { LocationPin, Connection } from './location-pin.model';

export type WorldType = 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'moon';
export type TextureResolution = '2k' | '4k' | '8k';

export interface GlobeState {
  pins: LocationPin[];
  connections: Connection[];

  // View settings
  autoRotate: boolean;
  rotationSpeed: number;
  showAtmosphere: boolean;
  showBorders: boolean;
  showLabels: boolean;
  selectedWorld: WorldType;
  textureVariantId: string;  // ID of the selected texture variant
  textureResolution: TextureResolution;
  textureIndex: number;  // Index within the resolution's texture array (default: 0)

  // Camera state
  cameraPosition?: { x: number; y: number; z: number };
  cameraTarget?: { x: number; y: number; z: number };

  // UI state
  selectedPinId?: string;
  isEditMode: boolean;
}

export const DEFAULT_GLOBE_STATE: GlobeState = {
  pins: [],
  connections: [],
  autoRotate: false,
  rotationSpeed: 0.5,
  showAtmosphere: true,
  showBorders: true,
  showLabels: true,
  selectedWorld: 'earth',
  textureVariantId: 'day',  // Earth uses 'day' variant
  textureResolution: '2k',
  textureIndex: 0,  // First texture in the array
  isEditMode: false
};

