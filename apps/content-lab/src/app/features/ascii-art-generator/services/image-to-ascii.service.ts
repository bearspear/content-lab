/**
 * Image to ASCII Service
 * Converts images to ASCII art using brightness mapping
 */

import { Injectable } from '@angular/core';
import { ImageToAsciiConfig } from '../models/ascii-art.model';

@Injectable({
  providedIn: 'root'
})
export class ImageToAsciiService {

  // Character sets for different detail levels
  readonly characterSets = {
    simple: ' .:-=+*#%@',
    detailed: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
    blocks: ' ░▒▓█',
    binary: ' █',
    numbers: ' 123456789',
    custom: ' .:-=+*#%@'
  };

  constructor() {
    console.log('[ImageToAsciiService] Service initialized');
  }

  /**
   * Convert an image to ASCII art
   */
  async convertToAscii(config: ImageToAsciiConfig): Promise<string> {
    try {
      // Load the image
      const img = await this.loadImage(config.imageUrl);

      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Calculate dimensions
      const targetWidth = config.width || 80;
      const aspectRatio = img.height / img.width;
      const targetHeight = config.height || Math.floor(targetWidth * aspectRatio * 0.5); // 0.5 for character aspect ratio

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);

      // Get character set
      const charSet = config.characterSet || this.characterSets.simple;

      // Convert to ASCII
      const ascii = this.pixelsToAscii(imageData, charSet, config.invert || false);

      console.log('[ImageToAsciiService] Conversion complete');
      return ascii;
    } catch (error) {
      console.error('[ImageToAsciiService] Error converting image:', error);
      throw error;
    }
  }

  /**
   * Load an image from URL or data URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Enable CORS for external images
      img.crossOrigin = 'anonymous';

      img.onload = () => resolve(img);
      img.onerror = (error) => reject(new Error('Failed to load image'));

      img.src = url;
    });
  }

  /**
   * Convert pixel data to ASCII characters
   */
  private pixelsToAscii(
    imageData: ImageData,
    charSet: string,
    invert: boolean
  ): string {
    const { width, height, data } = imageData;
    const lines: string[] = [];

    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];
        const a = data[offset + 3];

        // Calculate brightness (0-255)
        const brightness = this.calculateBrightness(r, g, b, a);

        // Map brightness to character
        const char = this.brightnessToChar(brightness, charSet, invert);
        line += char;
      }
      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Calculate brightness from RGB values
   * Uses luminosity method: 0.299*R + 0.587*G + 0.114*B
   */
  private calculateBrightness(r: number, g: number, b: number, a: number): number {
    // Account for alpha channel
    const alpha = a / 255;

    // Luminosity formula (weighted for human perception)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) * alpha;

    return brightness;
  }

  /**
   * Map brightness value to ASCII character
   */
  private brightnessToChar(brightness: number, charSet: string, invert: boolean): string {
    // Normalize brightness to 0-1
    let normalized = brightness / 255;

    // Invert if requested
    if (invert) {
      normalized = 1 - normalized;
    }

    // Map to character set index
    const index = Math.floor(normalized * (charSet.length - 1));
    const clampedIndex = Math.max(0, Math.min(charSet.length - 1, index));

    return charSet[clampedIndex];
  }

  /**
   * Process uploaded file and convert to data URL
   */
  async processUploadedFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image must be less than 5MB'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Get available character sets with previews
   */
  getCharacterSetPreviews(): Record<string, { chars: string, description: string }> {
    return {
      simple: {
        chars: this.characterSets.simple,
        description: 'Simple (10 chars) - Good balance'
      },
      detailed: {
        chars: this.characterSets.detailed,
        description: 'Detailed (70 chars) - Maximum detail'
      },
      blocks: {
        chars: this.characterSets.blocks,
        description: 'Blocks (4 chars) - Clean look'
      },
      binary: {
        chars: this.characterSets.binary,
        description: 'Binary (2 chars) - High contrast'
      },
      numbers: {
        chars: this.characterSets.numbers,
        description: 'Numbers (9 chars) - Unique style'
      }
    };
  }

  /**
   * Set custom character set
   */
  setCustomCharacterSet(chars: string): void {
    if (chars.length < 2) {
      throw new Error('Character set must have at least 2 characters');
    }
    this.characterSets.custom = chars;
  }
}
