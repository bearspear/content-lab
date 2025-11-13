/**
 * Text to ASCII Service
 * Handles conversion of text to ASCII art using figlet
 */

import { Injectable } from '@angular/core';
import figlet from 'figlet';
import { FigletFont, TextToAsciiConfig, TextAlignment } from '../models/ascii-art.model';

@Injectable({
  providedIn: 'root'
})
export class TextToAsciiService {

  // Available fonts (subset for initial implementation)
  readonly availableFonts: FigletFont[] = [
    'Standard',
    'Slant',
    'Small',
    'Big',
    'Banner',
    'Block',
    'Bubble',
    'Digital',
    'Ivrit',
    'Larry 3D',
    'Mini',
    'Script',
    'Shadow',
    'Speed',
    'Starwars',
    'Stop'
  ];

  // Mapping of font names to their actual CDN filenames
  private readonly fontFileMapping: Record<string, string> = {
    'Standard': 'Standard',
    'Slant': 'Slant',
    'Small': 'Small',
    'Big': 'Big',
    'Banner': 'Banner3-D',
    'Block': 'Block',
    'Bubble': 'Bubble',
    'Digital': 'Digital',
    'Ivrit': 'Ivrit',
    'Larry 3D': 'Larry 3D',
    'Mini': 'Mini',
    'Script': 'Script',
    'Shadow': 'Shadow',
    'Speed': 'Speed',
    'Starwars': 'Star Wars',
    'Stop': 'Stop'
  };

  private fontsLoaded = new Set<string>();
  private readonly FONT_CDN = 'https://cdn.jsdelivr.net/npm/figlet@1.7.0/fonts/';

  constructor() {
    console.log('[TextToAsciiService] Service initialized');
  }

  /**
   * Load a font from CDN if not already loaded
   */
  private async loadFont(fontName: string): Promise<void> {
    if (this.fontsLoaded.has(fontName)) {
      return;
    }

    try {
      // Get the actual filename from the mapping, or use the font name as-is
      const actualFontName = this.fontFileMapping[fontName] || fontName;
      // Convert to CDN filename format (replace spaces with %20, add .flf extension)
      const fontFileName = actualFontName.replace(/ /g, '%20') + '.flf';
      const response = await fetch(this.FONT_CDN + fontFileName);

      if (!response.ok) {
        throw new Error(`Failed to load font: ${response.statusText}`);
      }

      const fontData = await response.text();
      figlet.parseFont(fontName, fontData);
      this.fontsLoaded.add(fontName);
      console.log(`[TextToAsciiService] Loaded font: ${fontName}`);
    } catch (error) {
      console.error(`[TextToAsciiService] Error loading font ${fontName}:`, error);
      throw error;
    }
  }

  /**
   * Convert text to ASCII art
   */
  async convertToAscii(config: TextToAsciiConfig): Promise<string> {
    // Load font first if needed
    await this.loadFont(config.font);

    return new Promise((resolve, reject) => {
      try {
        figlet.text(
          config.text,
          {
            font: config.font,
            horizontalLayout: config.alignment === TextAlignment.Center ? 'full' : 'default',
            width: config.width
          },
          (err, result) => {
            if (err) {
              console.error('[TextToAsciiService] Error:', err);
              reject(err);
              return;
            }

            if (!result) {
              reject(new Error('No result from figlet'));
              return;
            }

            // Apply alignment if needed
            let finalResult = result;
            if (config.alignment) {
              finalResult = this.applyAlignment(result, config.alignment, config.width);
            }

            resolve(finalResult);
          }
        );
      } catch (error) {
        console.error('[TextToAsciiService] Unexpected error:', error);
        reject(error);
      }
    });
  }

  /**
   * Apply text alignment to ASCII art
   */
  private applyAlignment(text: string, alignment: TextAlignment, width?: number): string {
    if (alignment === TextAlignment.Center || alignment === TextAlignment.Right) {
      const lines = text.split('\n');
      const maxWidth = width || Math.max(...lines.map(line => line.length));

      return lines.map(line => {
        const trimmedLine = line.trimEnd();
        const padding = maxWidth - trimmedLine.length;

        if (alignment === TextAlignment.Center) {
          const leftPadding = Math.floor(padding / 2);
          return ' '.repeat(leftPadding) + trimmedLine;
        } else if (alignment === TextAlignment.Right) {
          return ' '.repeat(padding) + trimmedLine;
        }

        return line;
      }).join('\n');
    }

    return text;
  }

  /**
   * Get a preview of what a font looks like
   */
  async getFontPreview(font: FigletFont, previewText: string = 'ABC'): Promise<string> {
    return this.convertToAscii({ text: previewText, font });
  }

  /**
   * Get all available fonts with previews
   */
  async getAllFontPreviews(previewText: string = 'ABC'): Promise<Map<FigletFont, string>> {
    const previews = new Map<FigletFont, string>();

    for (const font of this.availableFonts) {
      try {
        const preview = await this.getFontPreview(font, previewText);
        previews.set(font, preview);
      } catch (error) {
        console.error(`[TextToAsciiService] Error generating preview for ${font}:`, error);
        previews.set(font, 'Error loading preview');
      }
    }

    return previews;
  }

  /**
   * Validate if a font is available
   */
  isFontAvailable(font: string): font is FigletFont {
    return this.availableFonts.includes(font as FigletFont);
  }
}
