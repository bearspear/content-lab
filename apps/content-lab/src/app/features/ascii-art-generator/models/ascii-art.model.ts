/**
 * ASCII Art Generator Models
 * Data structures for ASCII art generation
 */

/**
 * ASCII Art generation modes
 */
export enum AsciiArtMode {
  Text = 'text',
  Image = 'image',
  Chart = 'chart',
  Table = 'table',
  Border = 'border'
}

/**
 * Chart types for data visualization
 */
export enum ChartType {
  Bar = 'bar',
  Line = 'line',
  Scatter = 'scatter',
  Pie = 'pie',
  Histogram = 'histogram',
  Function = 'function'
}

/**
 * Table border styles
 */
export enum TableBorderStyle {
  Single = 'single',
  Double = 'double',
  Rounded = 'rounded',
  Heavy = 'heavy',
  Markdown = 'markdown',
  Grid = 'grid',
  None = 'none'
}

/**
 * Text alignment options
 */
export enum TextAlignment {
  Left = 'left',
  Center = 'center',
  Right = 'right'
}

/**
 * Figlet font names (initial set)
 */
export type FigletFont =
  | 'Standard'
  | 'Slant'
  | 'Small'
  | 'Big'
  | 'Banner'
  | 'Block'
  | 'Bubble'
  | 'Digital'
  | 'Ivrit'
  | 'Larry 3D'
  | 'Mini'
  | 'Script'
  | 'Shadow'
  | 'Speed'
  | 'Starwars'
  | 'Stop';

/**
 * Text-to-ASCII configuration
 */
export interface TextToAsciiConfig {
  text: string;
  font: FigletFont;
  alignment?: TextAlignment;
  width?: number;
}

/**
 * Image-to-ASCII configuration
 */
export interface ImageToAsciiConfig {
  imageUrl: string;
  width?: number;
  height?: number;
  characterSet?: string;
  invert?: boolean;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  x: number | string;
  y: number;
  label?: string;
}

/**
 * Chart series (for multi-series charts)
 */
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type: ChartType;
  series: ChartSeries[];
  width?: number;
  height?: number;
  title?: string;
  xLabel?: string;
  yLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
}

/**
 * Table column definition
 */
export interface TableColumn {
  name: string;
  align?: TextAlignment;
  width?: number;
}

/**
 * Table configuration
 */
export interface TableConfig {
  columns: TableColumn[];
  rows: string[][];
  borderStyle: TableBorderStyle;
  headerRow?: boolean;
  alignHeaders?: boolean;
}

/**
 * Border/template configuration
 */
export interface BorderConfig {
  text: string;
  style: string; // BorderStyle from border-generator.service.ts
  padding?: number;
}

/**
 * ASCII Art output result
 */
export interface AsciiArtResult {
  mode: AsciiArtMode;
  output: string;
  config: TextToAsciiConfig | ImageToAsciiConfig | ChartConfig | TableConfig | BorderConfig;
  timestamp: Date;
}

/**
 * Saved ASCII art (for history)
 */
export interface SavedAsciiArt extends AsciiArtResult {
  id: string;
  name?: string;
  isFavorite?: boolean;
}

/**
 * Export format options
 */
export enum ExportFormat {
  Text = 'text',
  HTML = 'html',
  Markdown = 'markdown',
  Image = 'image'
}

/**
 * Function plot configuration
 */
export interface FunctionPlotConfig {
  expression: string;
  xMin: number;
  xMax: number;
  width?: number;
  height?: number;
  showAxes?: boolean;
  showGrid?: boolean;
}
