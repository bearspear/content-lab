import { Injectable } from '@angular/core';

export interface SvgInfo {
  width: number | null;
  height: number | null;
  viewBox: string | null;
  elementCount: number;
  fileSize: number;
  hasViewBox: boolean;
}

export interface OptimizationResult {
  original: string;
  optimized: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercent: number;
}

@Injectable({
  providedIn: 'root'
})
export class SvgEditorService {

  /**
   * Parse SVG and extract information
   */
  parseSvgInfo(svgCode: string): SvgInfo {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');

      if (!svgElement) {
        throw new Error('Invalid SVG: No <svg> element found');
      }

      const width = svgElement.getAttribute('width');
      const height = svgElement.getAttribute('height');
      const viewBox = svgElement.getAttribute('viewBox');
      const allElements = doc.querySelectorAll('*');

      return {
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        viewBox: viewBox,
        hasViewBox: !!viewBox,
        elementCount: allElements.length,
        fileSize: new Blob([svgCode]).size
      };
    } catch (error) {
      console.error('Error parsing SVG:', error);
      return {
        width: null,
        height: null,
        viewBox: null,
        hasViewBox: false,
        elementCount: 0,
        fileSize: new Blob([svgCode]).size
      };
    }
  }

  /**
   * Basic SVG optimization (simplified version)
   * In production, you'd use SVGO library
   */
  optimizeSvg(svgCode: string, options?: {
    removeComments?: boolean;
    removeMetadata?: boolean;
    removeHidden?: boolean;
    minifyColors?: boolean;
    roundNumbers?: number;
  }): OptimizationResult {
    const opts = {
      removeComments: options?.removeComments ?? true,
      removeMetadata: options?.removeMetadata ?? true,
      removeHidden: options?.removeHidden ?? true,
      minifyColors: options?.minifyColors ?? true,
      roundNumbers: options?.roundNumbers ?? 2
    };

    let optimized = svgCode;

    // Remove XML comments
    if (opts.removeComments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove metadata, title, desc tags
    if (opts.removeMetadata) {
      optimized = optimized.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
      optimized = optimized.replace(/<title[\s\S]*?<\/title>/gi, '');
      optimized = optimized.replace(/<desc[\s\S]*?<\/desc>/gi, '');
    }

    // Remove hidden elements (display:none, visibility:hidden)
    if (opts.removeHidden) {
      optimized = optimized.replace(/<[^>]*display\s*:\s*none[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
      optimized = optimized.replace(/<[^>]*visibility\s*:\s*hidden[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
    }

    // Minify colors (convert #rrggbb to #rgb where possible)
    if (opts.minifyColors) {
      optimized = optimized.replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3');
    }

    // Round numbers
    if (opts.roundNumbers !== undefined) {
      const decimals = opts.roundNumbers;
      optimized = optimized.replace(/(\d+\.\d+)/g, (match) => {
        return parseFloat(match).toFixed(decimals);
      });
    }

    // Remove extra whitespace
    optimized = optimized.replace(/\s+/g, ' ');
    optimized = optimized.replace(/>\s+</g, '><');
    optimized = optimized.trim();

    const originalSize = new Blob([svgCode]).size;
    const optimizedSize = new Blob([optimized]).size;
    const savings = originalSize - optimizedSize;
    const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

    return {
      original: svgCode,
      optimized,
      originalSize,
      optimizedSize,
      savings,
      savingsPercent
    };
  }

  /**
   * Update SVG dimensions
   */
  updateDimensions(svgCode: string, width: number, height: number): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');

      if (svgElement) {
        svgElement.setAttribute('width', width.toString());
        svgElement.setAttribute('height', height.toString());

        const serializer = new XMLSerializer();
        return serializer.serializeToString(doc);
      }
      return svgCode;
    } catch (error) {
      console.error('Error updating dimensions:', error);
      return svgCode;
    }
  }

  /**
   * Update SVG viewBox
   */
  updateViewBox(svgCode: string, viewBox: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');

      if (svgElement) {
        svgElement.setAttribute('viewBox', viewBox);

        const serializer = new XMLSerializer();
        return serializer.serializeToString(doc);
      }
      return svgCode;
    } catch (error) {
      console.error('Error updating viewBox:', error);
      return svgCode;
    }
  }

  /**
   * Convert SVG to Data URI
   */
  svgToDataUri(svgCode: string): string {
    const encoded = encodeURIComponent(svgCode)
      .replace(/'/g, '%27')
      .replace(/"/g, '%22');
    return `data:image/svg+xml,${encoded}`;
  }

  /**
   * Convert SVG to Base64
   */
  svgToBase64(svgCode: string): string {
    const base64 = btoa(unescape(encodeURIComponent(svgCode)));
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Validate SVG code
   */
  validateSvg(svgCode: string): { valid: boolean; error?: string } {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return {
          valid: false,
          error: parserError.textContent || 'Parse error'
        };
      }

      const svgElement = doc.querySelector('svg');
      if (!svgElement) {
        return {
          valid: false,
          error: 'No <svg> element found'
        };
      }

      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Extract colors from SVG
   */
  extractColors(svgCode: string): string[] {
    const colors = new Set<string>();

    // Find hex colors
    const hexMatches = svgCode.match(/#[0-9a-fA-F]{3,6}/g);
    if (hexMatches) {
      hexMatches.forEach(color => colors.add(color.toLowerCase()));
    }

    // Find rgb/rgba colors
    const rgbMatches = svgCode.match(/rgba?\([^)]+\)/g);
    if (rgbMatches) {
      rgbMatches.forEach(color => colors.add(color));
    }

    // Find named colors
    const namedColorMatches = svgCode.match(/\b(red|blue|green|yellow|black|white|gray|grey|orange|purple|pink|brown|cyan|magenta)\b/gi);
    if (namedColorMatches) {
      namedColorMatches.forEach(color => colors.add(color.toLowerCase()));
    }

    return Array.from(colors);
  }

  /**
   * Format SVG code (beautify)
   */
  formatSvg(svgCode: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');

      const serializer = new XMLSerializer();
      let formatted = serializer.serializeToString(doc);

      // Add basic indentation
      let indent = 0;
      formatted = formatted.replace(/(<[^/][^>]*>)/g, (match) => {
        const result = '  '.repeat(indent) + match + '\n';
        if (!match.match(/\/>$/)) {
          indent++;
        }
        return result;
      });

      formatted = formatted.replace(/(<\/[^>]+>)/g, (match) => {
        indent = Math.max(0, indent - 1);
        return '  '.repeat(indent) + match + '\n';
      });

      return formatted.trim();
    } catch (error) {
      console.error('Error formatting SVG:', error);
      return svgCode;
    }
  }

  /**
   * Generate React component from SVG
   */
  generateReactComponent(svgCode: string, componentName: string = 'SvgIcon'): string {
    const info = this.parseSvgInfo(svgCode);
    const viewBox = info.viewBox || `0 0 ${info.width || 24} ${info.height || 24}`;

    // Extract path data (simplified)
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgCode, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');

    if (!svgElement) {
      return '// Invalid SVG';
    }

    // Get inner SVG content
    const innerContent = Array.from(svgElement.children)
      .map(child => {
        const serializer = new XMLSerializer();
        return serializer.serializeToString(child);
      })
      .join('\n      ');

    return `export const ${componentName} = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="${viewBox}"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    ${innerContent.replace(/fill="[^"]*"/g, 'fill={color}')}
  </svg>
);`;
  }
}
