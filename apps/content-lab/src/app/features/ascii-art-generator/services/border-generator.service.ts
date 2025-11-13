/**
 * Border Generator Service
 * Generates decorative ASCII borders and boxes around text
 */

import { Injectable } from '@angular/core';
import { BorderConfig } from '../models/ascii-art.model';

export enum BorderStyle {
  Single = 'single',
  Double = 'double',
  Rounded = 'rounded',
  Heavy = 'heavy',
  DoubleSingle = 'double-single',
  Ascii = 'ascii',
  Stars = 'stars',
  Hash = 'hash',
  Equals = 'equals'
}

export interface BorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
}

@Injectable({
  providedIn: 'root'
})
export class BorderGeneratorService {

  private borderCharsets: Record<BorderStyle, BorderChars> = {
    [BorderStyle.Single]: {
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      horizontal: '─',
      vertical: '│'
    },
    [BorderStyle.Double]: {
      topLeft: '╔',
      topRight: '╗',
      bottomLeft: '╚',
      bottomRight: '╝',
      horizontal: '═',
      vertical: '║'
    },
    [BorderStyle.Rounded]: {
      topLeft: '╭',
      topRight: '╮',
      bottomLeft: '╰',
      bottomRight: '╯',
      horizontal: '─',
      vertical: '│'
    },
    [BorderStyle.Heavy]: {
      topLeft: '┏',
      topRight: '┓',
      bottomLeft: '┗',
      bottomRight: '┛',
      horizontal: '━',
      vertical: '┃'
    },
    [BorderStyle.DoubleSingle]: {
      topLeft: '╓',
      topRight: '╖',
      bottomLeft: '╙',
      bottomRight: '╜',
      horizontal: '─',
      vertical: '║'
    },
    [BorderStyle.Ascii]: {
      topLeft: '+',
      topRight: '+',
      bottomLeft: '+',
      bottomRight: '+',
      horizontal: '-',
      vertical: '|'
    },
    [BorderStyle.Stars]: {
      topLeft: '*',
      topRight: '*',
      bottomLeft: '*',
      bottomRight: '*',
      horizontal: '*',
      vertical: '*'
    },
    [BorderStyle.Hash]: {
      topLeft: '#',
      topRight: '#',
      bottomLeft: '#',
      bottomRight: '#',
      horizontal: '#',
      vertical: '#'
    },
    [BorderStyle.Equals]: {
      topLeft: '=',
      topRight: '=',
      bottomLeft: '=',
      bottomRight: '=',
      horizontal: '=',
      vertical: '='
    }
  };

  constructor() {
    console.log('[BorderGeneratorService] Service initialized');
  }

  /**
   * Generate a border around text
   */
  generateBorder(config: BorderConfig): string {
    const style = config.style as BorderStyle;
    const chars = this.borderCharsets[style];
    const padding = config.padding || 1;
    const lines: string[] = [];

    // Split text into lines
    const textLines = config.text.split('\n');

    // Calculate the width of the box
    const maxTextWidth = Math.max(...textLines.map(line => line.length), config.text.length === 0 ? 10 : 0);
    const boxWidth = maxTextWidth + (padding * 2);

    // Top border
    lines.push(chars.topLeft + chars.horizontal.repeat(boxWidth) + chars.topRight);

    // Add empty padding lines if needed
    for (let i = 0; i < padding; i++) {
      lines.push(chars.vertical + ' '.repeat(boxWidth) + chars.vertical);
    }

    // Text lines with padding
    for (const textLine of textLines) {
      const paddedLine = ' '.repeat(padding) + textLine.padEnd(maxTextWidth) + ' '.repeat(padding);
      lines.push(chars.vertical + paddedLine + chars.vertical);
    }

    // If no text, add a placeholder line
    if (textLines.length === 0 || (textLines.length === 1 && textLines[0] === '')) {
      const emptyLine = ' '.repeat(padding) + 'Your text here'.padEnd(maxTextWidth) + ' '.repeat(padding);
      lines.push(chars.vertical + emptyLine + chars.vertical);
    }

    // Add empty padding lines if needed
    for (let i = 0; i < padding; i++) {
      lines.push(chars.vertical + ' '.repeat(boxWidth) + chars.vertical);
    }

    // Bottom border
    lines.push(chars.bottomLeft + chars.horizontal.repeat(boxWidth) + chars.bottomRight);

    return lines.join('\n');
  }

  /**
   * Generate a banner-style border (decorative top and bottom)
   */
  generateBanner(text: string, style: BorderStyle = BorderStyle.Stars, width: number = 60): string {
    const chars = this.borderCharsets[style];
    const lines: string[] = [];

    // Top border
    lines.push(chars.horizontal.repeat(width));

    // Add text centered
    const textLines = text.split('\n');
    for (const line of textLines) {
      const padding = Math.max(0, Math.floor((width - line.length) / 2));
      const centeredLine = ' '.repeat(padding) + line;
      lines.push(centeredLine);
    }

    // Bottom border
    lines.push(chars.horizontal.repeat(width));

    return lines.join('\n');
  }

  /**
   * Generate a comment-style border
   */
  generateComment(text: string, commentStyle: 'slash' | 'hash' | 'semicolon' = 'slash'): string {
    const commentChar = commentStyle === 'slash' ? '//' : commentStyle === 'hash' ? '#' : ';';
    const lines: string[] = [];

    const textLines = text.split('\n');
    const maxWidth = Math.max(...textLines.map(l => l.length));

    // Top border
    lines.push(commentChar + ' ' + '='.repeat(maxWidth + 2));

    // Text lines
    for (const line of textLines) {
      lines.push(commentChar + ' ' + line);
    }

    // Bottom border
    lines.push(commentChar + ' ' + '='.repeat(maxWidth + 2));

    return lines.join('\n');
  }

  /**
   * Generate a titled box
   */
  generateTitledBox(title: string, content: string, style: BorderStyle = BorderStyle.Single, padding: number = 1): string {
    const chars = this.borderCharsets[style];
    const lines: string[] = [];

    // Split content into lines
    const contentLines = content.split('\n');

    // Calculate widths
    const maxContentWidth = Math.max(...contentLines.map(line => line.length), title.length + 4);
    const boxWidth = maxContentWidth + (padding * 2);

    // Top border with title
    const titleText = ` ${title} `;
    const titleStartPos = 2;
    const leftBorderLength = titleStartPos;
    const rightBorderLength = boxWidth - titleStartPos - titleText.length;

    lines.push(
      chars.topLeft +
      chars.horizontal.repeat(leftBorderLength) +
      titleText +
      chars.horizontal.repeat(Math.max(0, rightBorderLength)) +
      chars.topRight
    );

    // Add padding
    for (let i = 0; i < padding; i++) {
      lines.push(chars.vertical + ' '.repeat(boxWidth) + chars.vertical);
    }

    // Content lines
    for (const line of contentLines) {
      const paddedLine = ' '.repeat(padding) + line.padEnd(maxContentWidth) + ' '.repeat(padding);
      lines.push(chars.vertical + paddedLine + chars.vertical);
    }

    // Add padding
    for (let i = 0; i < padding; i++) {
      lines.push(chars.vertical + ' '.repeat(boxWidth) + chars.vertical);
    }

    // Bottom border
    lines.push(chars.bottomLeft + chars.horizontal.repeat(boxWidth) + chars.bottomRight);

    return lines.join('\n');
  }

  /**
   * Generate a simple frame around text
   */
  generateFrame(text: string, frameChar: string = '*'): string {
    const lines: string[] = [];
    const textLines = text.split('\n');
    const maxWidth = Math.max(...textLines.map(l => l.length));

    // Top
    lines.push(frameChar.repeat(maxWidth + 4));

    // Content
    for (const line of textLines) {
      lines.push(frameChar + ' ' + line.padEnd(maxWidth) + ' ' + frameChar);
    }

    // Bottom
    lines.push(frameChar.repeat(maxWidth + 4));

    return lines.join('\n');
  }

  /**
   * Get all available border styles
   */
  getAvailableStyles(): BorderStyle[] {
    return Object.values(BorderStyle);
  }

  /**
   * Get preview of a border style
   */
  getStylePreview(style: BorderStyle): string {
    const chars = this.borderCharsets[style];
    return `${chars.topLeft}${chars.horizontal.repeat(3)}${chars.topRight}\n${chars.vertical}   ${chars.vertical}\n${chars.bottomLeft}${chars.horizontal.repeat(3)}${chars.bottomRight}`;
  }
}
