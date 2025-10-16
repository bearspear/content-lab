import { WorldType } from './globe-state.model';

export type TextureResolution = '2k' | '4k' | '8k';

/**
 * Represents a single texture file with content-based addressing
 */
export interface TextureFile {
  hash: string;           // MD5 hash of the file content
  humanName: string;      // Human-friendly name (e.g., "Realistic Surface", "Enhanced Colors")
  path: string;           // Path to the texture file
  size?: string;          // Optional file size for display (e.g., "4.4MB")
}

/**
 * Represents a variant of textures for a celestial body
 * Each resolution can have multiple texture options
 */
export interface TextureVariant {
  id: string;
  name: string;
  description: string;
  resolutions: {
    '2k'?: TextureFile[];   // Array of available 2K textures
    '4k'?: TextureFile[];   // Array of available 4K textures
    '8k'?: TextureFile[];   // Array of available 8K textures
  };
}

export interface PlanetTextureCollection {
  world: WorldType;
  variants: TextureVariant[];
}

/**
 * Comprehensive texture repository for all celestial bodies
 * Supports multiple texture variants per planet at different resolutions
 * Content-addressed storage prevents duplicate textures
 */
export const TEXTURE_REPOSITORY: PlanetTextureCollection[] = [
  {
    world: 'sun',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Photorealistic solar surface',
        resolutions: {
          '2k': [{
            hash: '7ce3a845bb3ca672ddd6660fd477de1f',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/7ce3a845.jpg',
            size: '803KB'
          }],
          '8k': [{
            hash: '09a52beab6f825b7dcd20835e7f95b19',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/09a52bea.jpg',
            size: '3.5MB'
          }]
        }
      }
    ]
  },
  {
    world: 'mercury',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Photorealistic surface texture',
        resolutions: {
          '2k': [{
            hash: '6e2825332ce2838939ae17f230412466',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/6e282533.jpg',
            size: '852KB'
          }],
          '8k': [{
            hash: '05a75c74da22211353a8dd64c4ad6172',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/05a75c74.jpg',
            size: '14MB'
          }]
        }
      }
    ]
  },
  {
    world: 'venus',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Cloud-covered surface',
        resolutions: {
          '2k': [
            {
              hash: 'f3fc899218b29c879af0976bbd78bd25',
              humanName: 'Cloud Surface',
              path: '/assets/textures/hash/f3fc8992.jpg',
              size: '864KB'
            },
            {
              hash: 'cb5877bec89f723cec7d30742fcf105d',
              humanName: 'Atmosphere View',
              path: '/assets/textures/hash/cb5877be.jpg',
              size: '224K'
            }
          ],
          '4k': [{
            hash: '7d3bef348a66ccfa3c7ebea7394c3f53',
            humanName: 'Atmosphere View',
            path: '/assets/textures/hash/7d3bef34.jpg',
            size: '1.5M'
          }],
          '8k': [{
            hash: '814a29210ee5cf9a88ed2ec6417baaa0',
            humanName: 'Cloud Surface',
            path: '/assets/textures/hash/814a2921.jpg',
            size: '12MB'
          }]
        }
      }
    ]
  },
  {
    world: 'earth',
    variants: [
      {
        id: 'day',
        name: 'Day View',
        description: 'Daytime Earth with clouds',
        resolutions: {
          '2k': [
            {
              hash: 'dec752db496ed21b417dc7018bdbad50',
              humanName: 'Day View',
              path: '/assets/textures/hash/dec752db.jpg',
              size: '2.4MB'
            },
            {
              hash: '73d343be0ade106aedd0fb5942db72ba',
              humanName: 'Night Lights',
              path: '/assets/textures/hash/73d343be.jpg',
              size: '249K'
            }
          ],
          '8k': [{
            hash: '45ae6884f17efcd6ad13d7071f3bb2b8',
            humanName: 'Day View',
            path: '/assets/textures/hash/45ae6884.jpg',
            size: '4.4MB'
          }]
        }
      }
    ]
  },
  {
    world: 'mars',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Red planet surface',
        resolutions: {
          '2k': [{
            hash: 'b30dc37a707e6b4fc18da6de15997b95',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/b30dc37a.jpg',
            size: '733KB'
          }],
          '8k': [{
            hash: 'b1404cfbacc5e3e4c08fd7ae1472d807',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/b1404cfb.jpg',
            size: '8.0MB'
          }]
        }
      }
    ]
  },
  {
    world: 'jupiter',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Gas giant with bands and storms',
        resolutions: {
          '2k': [{
            hash: 'bac68e493761c440a887576dd39409c3',
            humanName: 'Realistic Bands',
            path: '/assets/textures/hash/bac68e49.jpg',
            size: '487KB'
          }],
          '8k': [{
            hash: 'c147e262013b259c840c2a72c8cf18d4',
            humanName: 'Realistic Bands',
            path: '/assets/textures/hash/c147e262.jpg',
            size: '2.9MB'
          }]
        }
      }
    ]
  },
  {
    world: 'saturn',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Ringed planet surface',
        resolutions: {
          '2k': [{
            hash: 'e758b798d7d9622429374b804940e77f',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/e758b798.jpg',
            size: '195KB'
          }],
          '8k': [{
            hash: '278f00b03257d7d35c7701f85d2d38e4',
            humanName: 'Realistic Surface',
            path: '/assets/textures/hash/278f00b0.jpg',
            size: '1.0MB'
          }]
        }
      }
    ]
  },
  {
    world: 'uranus',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Ice giant appearance',
        resolutions: {
          '2k': [{
            hash: '0465fbad731bbca3d6c88d36ee524a1c',
            humanName: 'Ice Giant',
            path: '/assets/textures/hash/0465fbad.jpg',
            size: '76KB'
          }]
          // 8K not available
        }
      }
    ]
  },
  {
    world: 'neptune',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Deep blue gas giant',
        resolutions: {
          '2k': [{
            hash: '17c1bff0c64a6a511e7ae707b660bf0f',
            humanName: 'Deep Blue',
            path: '/assets/textures/hash/17c1bff0.jpg',
            size: '236KB'
          }]
          // 8K not available
        }
      }
    ]
  },
  {
    world: 'pluto',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Dwarf planet surface',
        resolutions: {
          '2k': [
            {
              hash: '3c49a8535e231d0c15f70a780b3eed04',
              humanName: 'Dwarf Planet Surface',
              path: '/assets/textures/hash/3c49a853.jpg',
              size: '16KB'
            },
            {
              hash: 'dddd9c5c1152ecb672842bf67037eab7',
              humanName: 'High Quality Surface',
              path: '/assets/textures/hash/dddd9c5c.jpg',
              size: '173K'
            }
          ]
          // 8K not available
        }
      }
    ]
  },
  {
    world: 'moon',
    variants: [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Lunar surface with craters',
        resolutions: {
          '2k': [{
            hash: '833cdd47d60b5ada5141b5558f1b0f0f',
            humanName: 'Lunar Surface',
            path: '/assets/textures/hash/833cdd47.jpg',
            size: '1.0MB'
          }],
          '8k': [{
            hash: 'c5d7b31c3a2485e00cb8a3c16c91bb07',
            humanName: 'Lunar Surface',
            path: '/assets/textures/hash/c5d7b31c.jpg',
            size: '14MB'
          }]
        }
      }
    ]
  }
];

/**
 * Get texture collection for a specific world
 */
export function getTexturesForWorld(world: WorldType): PlanetTextureCollection | undefined {
  return TEXTURE_REPOSITORY.find(collection => collection.world === world);
}

/**
 * Get specific texture variant for a world
 */
export function getTextureVariant(world: WorldType, variantId: string): TextureVariant | undefined {
  const collection = getTexturesForWorld(world);
  return collection?.variants.find(v => v.id === variantId);
}

/**
 * Get available resolutions for a specific texture variant
 */
export function getAvailableResolutions(world: WorldType, variantId: string): TextureResolution[] {
  const variant = getTextureVariant(world, variantId);
  if (!variant) return [];

  const resolutions: TextureResolution[] = [];
  if (variant.resolutions['2k'] && variant.resolutions['2k'].length > 0) resolutions.push('2k');
  if (variant.resolutions['4k'] && variant.resolutions['4k'].length > 0) resolutions.push('4k');
  if (variant.resolutions['8k'] && variant.resolutions['8k'].length > 0) resolutions.push('8k');

  return resolutions;
}

/**
 * Get texture path for a specific world, variant, resolution, and texture index
 * @param textureIndex - Index of the texture in the array (default: 0 for first texture)
 */
export function getTexturePath(
  world: WorldType,
  variantId: string,
  resolution: TextureResolution,
  textureIndex: number = 0
): string | undefined {
  const variant = getTextureVariant(world, variantId);
  const textureArray = variant?.resolutions[resolution];
  return textureArray && textureArray[textureIndex] ? textureArray[textureIndex].path : undefined;
}

/**
 * Get all texture files for a specific resolution
 */
export function getTextureFiles(
  world: WorldType,
  variantId: string,
  resolution: TextureResolution
): TextureFile[] {
  const variant = getTextureVariant(world, variantId);
  return variant?.resolutions[resolution] || [];
}
