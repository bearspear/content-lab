/**
 * Table Generator Service
 * Generates ASCII tables with various border styles
 */

import { Injectable } from '@angular/core';
import { TableBorderStyle, TextAlignment } from '../models/ascii-art.model';

// For backward compatibility, re-export as BorderStyle
export const BorderStyle = TableBorderStyle;

export interface TableBorderChars {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
  horizontal: string;
  vertical: string;
  leftT: string;
  rightT: string;
  topT: string;
  bottomT: string;
  cross: string;
}

// For backward compatibility, re-export as ColumnAlignment
export const ColumnAlignment = TextAlignment;

export interface TableColumn {
  header: string;
  alignment: TextAlignment;
  width?: number; // Auto-calculated if not provided
}

export interface TableConfig {
  columns: TableColumn[];
  data: string[][];
  borderStyle: TableBorderStyle;
  hasHeader: boolean;
  padding: number; // Padding on each side of cell content
}

@Injectable({
  providedIn: 'root'
})
export class TableGeneratorService {

  private borderCharsets: Record<TableBorderStyle, TableBorderChars> = {
    [TableBorderStyle.Single]: {
      topLeft: '┌',
      topRight: '┐',
      bottomLeft: '└',
      bottomRight: '┘',
      horizontal: '─',
      vertical: '│',
      leftT: '├',
      rightT: '┤',
      topT: '┬',
      bottomT: '┴',
      cross: '┼'
    },
    [TableBorderStyle.Double]: {
      topLeft: '╔',
      topRight: '╗',
      bottomLeft: '╚',
      bottomRight: '╝',
      horizontal: '═',
      vertical: '║',
      leftT: '╠',
      rightT: '╣',
      topT: '╦',
      bottomT: '╩',
      cross: '╬'
    },
    [TableBorderStyle.Rounded]: {
      topLeft: '╭',
      topRight: '╮',
      bottomLeft: '╰',
      bottomRight: '╯',
      horizontal: '─',
      vertical: '│',
      leftT: '├',
      rightT: '┤',
      topT: '┬',
      bottomT: '┴',
      cross: '┼'
    },
    [TableBorderStyle.Heavy]: {
      topLeft: '┏',
      topRight: '┓',
      bottomLeft: '┗',
      bottomRight: '┛',
      horizontal: '━',
      vertical: '┃',
      leftT: '┣',
      rightT: '┫',
      topT: '┳',
      bottomT: '┻',
      cross: '╋'
    },
    [TableBorderStyle.Markdown]: {
      topLeft: '|',
      topRight: '|',
      bottomLeft: '|',
      bottomRight: '|',
      horizontal: '-',
      vertical: '|',
      leftT: '|',
      rightT: '|',
      topT: '|',
      bottomT: '|',
      cross: '|'
    },
    [TableBorderStyle.Grid]: {
      topLeft: '+',
      topRight: '+',
      bottomLeft: '+',
      bottomRight: '+',
      horizontal: '-',
      vertical: '|',
      leftT: '+',
      rightT: '+',
      topT: '+',
      bottomT: '+',
      cross: '+'
    },
    [TableBorderStyle.None]: {
      topLeft: ' ',
      topRight: ' ',
      bottomLeft: ' ',
      bottomRight: ' ',
      horizontal: ' ',
      vertical: ' ',
      leftT: ' ',
      rightT: ' ',
      topT: ' ',
      bottomT: ' ',
      cross: ' '
    }
  };

  /**
   * Generate an ASCII table
   */
  generateTable(config: TableConfig): string {
    // Calculate column widths
    const columnWidths = this.calculateColumnWidths(config);

    // Get border characters
    const chars = this.borderCharsets[config.borderStyle];

    // Build table
    const lines: string[] = [];

    // Top border
    if (config.borderStyle !== TableBorderStyle.None) {
      lines.push(this.buildBorderLine(columnWidths, chars, 'top', config.padding));
    }

    // Header row
    if (config.hasHeader) {
      const headerRow = this.buildRow(
        config.columns.map(col => col.header),
        columnWidths,
        config.columns.map(col => col.alignment),
        chars,
        config.padding
      );
      lines.push(headerRow);

      // Header separator
      if (config.borderStyle === TableBorderStyle.Markdown) {
        lines.push(this.buildMarkdownSeparator(columnWidths, config.columns, chars, config.padding));
      } else if (config.borderStyle !== TableBorderStyle.None) {
        lines.push(this.buildBorderLine(columnWidths, chars, 'middle', config.padding));
      }
    }

    // Data rows
    for (const rowData of config.data) {
      const row = this.buildRow(
        rowData,
        columnWidths,
        config.columns.map(col => col.alignment),
        chars,
        config.padding
      );
      lines.push(row);
    }

    // Bottom border
    if (config.borderStyle !== TableBorderStyle.None) {
      lines.push(this.buildBorderLine(columnWidths, chars, 'bottom', config.padding));
    }

    return lines.join('\n');
  }

  /**
   * Calculate optimal column widths
   */
  private calculateColumnWidths(config: TableConfig): number[] {
    const widths: number[] = [];

    for (let i = 0; i < config.columns.length; i++) {
      const column = config.columns[i];

      // Start with custom width if provided
      let maxWidth = column.width || 0;

      // Check header width
      if (config.hasHeader) {
        maxWidth = Math.max(maxWidth, column.header.length);
      }

      // Check data widths
      for (const row of config.data) {
        if (row[i]) {
          maxWidth = Math.max(maxWidth, row[i].length);
        }
      }

      widths.push(maxWidth);
    }

    return widths;
  }

  /**
   * Build a border line (top, middle, or bottom)
   */
  private buildBorderLine(
    columnWidths: number[],
    chars: TableBorderChars,
    position: 'top' | 'middle' | 'bottom',
    padding: number
  ): string {
    const parts: string[] = [];

    // Left corner
    if (position === 'top') {
      parts.push(chars.topLeft);
    } else if (position === 'middle') {
      parts.push(chars.leftT);
    } else {
      parts.push(chars.bottomLeft);
    }

    // Column separators
    for (let i = 0; i < columnWidths.length; i++) {
      const width = columnWidths[i] + (padding * 2);
      parts.push(chars.horizontal.repeat(width));

      if (i < columnWidths.length - 1) {
        if (position === 'top') {
          parts.push(chars.topT);
        } else if (position === 'middle') {
          parts.push(chars.cross);
        } else {
          parts.push(chars.bottomT);
        }
      }
    }

    // Right corner
    if (position === 'top') {
      parts.push(chars.topRight);
    } else if (position === 'middle') {
      parts.push(chars.rightT);
    } else {
      parts.push(chars.bottomRight);
    }

    return parts.join('');
  }

  /**
   * Build markdown-style separator
   */
  private buildMarkdownSeparator(
    columnWidths: number[],
    columns: TableColumn[],
    chars: TableBorderChars,
    padding: number
  ): string {
    const parts: string[] = [];
    parts.push(chars.vertical);

    for (let i = 0; i < columnWidths.length; i++) {
      const width = columnWidths[i] + (padding * 2);
      const alignment = columns[i].alignment;

      let separator = '';
      if (alignment === ColumnAlignment.Left) {
        separator = ':' + chars.horizontal.repeat(width - 1);
      } else if (alignment === ColumnAlignment.Right) {
        separator = chars.horizontal.repeat(width - 1) + ':';
      } else { // Center
        separator = ':' + chars.horizontal.repeat(width - 2) + ':';
      }

      parts.push(separator);
      parts.push(chars.vertical);
    }

    return parts.join('');
  }

  /**
   * Build a data row
   */
  private buildRow(
    rowData: string[],
    columnWidths: number[],
    alignments: TextAlignment[],
    chars: TableBorderChars,
    padding: number
  ): string {
    const parts: string[] = [];
    const paddingStr = ' '.repeat(padding);

    parts.push(chars.vertical);

    for (let i = 0; i < columnWidths.length; i++) {
      const cellData = rowData[i] || '';
      const width = columnWidths[i];
      const alignment = alignments[i];

      const aligned = this.alignText(cellData, width, alignment);
      parts.push(paddingStr + aligned + paddingStr);
      parts.push(chars.vertical);
    }

    return parts.join('');
  }

  /**
   * Align text within a cell
   */
  private alignText(text: string, width: number, alignment: TextAlignment): string {
    const textLength = text.length;

    if (textLength >= width) {
      return text.substring(0, width);
    }

    const padding = width - textLength;

    if (alignment === TextAlignment.Left) {
      return text + ' '.repeat(padding);
    } else if (alignment === TextAlignment.Right) {
      return ' '.repeat(padding) + text;
    } else { // Center
      const leftPadding = Math.floor(padding / 2);
      const rightPadding = padding - leftPadding;
      return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
    }
  }

  /**
   * Parse CSV data into table data
   */
  parseCSV(csvText: string): { headers: string[], data: string[][] } {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      return { headers: [], data: [] };
    }

    const headers = this.parseCSVLine(lines[0]);
    const data: string[][] = [];

    for (let i = 1; i < lines.length; i++) {
      data.push(this.parseCSVLine(lines[i]));
    }

    return { headers, data };
  }

  /**
   * Parse a single CSV line
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Parse JSON data into table data
   */
  parseJSON(jsonText: string): { headers: string[], data: string[][] } {
    try {
      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        return { headers: [], data: [] };
      }

      // Extract headers from first object
      const headers = Object.keys(parsed[0]);

      // Extract data
      const data: string[][] = parsed.map(obj => {
        return headers.map(header => String(obj[header] ?? ''));
      });

      return { headers, data };
    } catch (error) {
      console.error('[TableGenerator] Error parsing JSON:', error);
      return { headers: [], data: [] };
    }
  }
}
