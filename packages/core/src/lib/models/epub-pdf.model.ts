/**
 * EPUB to PDF Models
 * Shared TypeScript interfaces for EPUB to PDF conversion
 */

export interface EpubPdfMetadata {
  title: string;
  author: string[];
  publisher?: string;
  language: string;
  isbn?: string;
  publicationDate?: string;
  description?: string;
  cover?: string;
  rights?: string;
  identifier?: string;
}

export interface EpubPdfStructure {
  format: string;
  chapterCount: number;
  wordCount?: number;
  imageCount: number;
  hasTableOfContents: boolean;
  hasCover: boolean;
}

export interface EpubPdfTocItem {
  id: string;
  label: string;
  href: string;
  level: number;
  children?: EpubPdfTocItem[];
}

export interface SpineItem {
  id: string;
  href: string;
  mediaType: string;
  linear?: boolean;
  properties?: string[];
}

export interface EpubResources {
  images: Array<{ id: string; href: string; mediaType: string }>;
  fonts: Array<{ id: string; href: string; mediaType: string }>;
  stylesheets: Array<{ id: string; href: string; mediaType: string }>;
}

export interface ParsedEpubData {
  metadata: EpubPdfMetadata;
  structure: EpubPdfStructure;
  tableOfContents: EpubPdfTocItem[];
  spine: SpineItem[];
  resources: EpubResources;
}

export interface PageSettings {
  size: 'A4' | 'Letter' | 'Legal' | 'A5' | 'Custom';
  customWidth?: number;
  customHeight?: number;
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  unit: 'mm' | 'in' | 'pt';
}

export interface Typography {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textAlign: 'left' | 'justify' | 'center';
  hyphenation: boolean;
  paragraphSpacing: number;
  indentFirstLine: boolean;
}

export interface LayoutOptions {
  columns: 1 | 2;
  columnGap?: number;
  chapterPageBreaks: boolean;
  includeImages: boolean;
  imageQuality: 'low' | 'medium' | 'high' | 'original';
  imageMaxWidth: number;
  preserveCss: boolean;
}

export interface HeaderFooterOptions {
  includeHeader: boolean;
  headerContent: 'title' | 'chapter' | 'custom' | 'none';
  headerCustomText?: string;
  headerAlignment: 'left' | 'center' | 'right';
  includeFooter: boolean;
  footerContent: 'pageNumber' | 'author' | 'custom' | 'pageAndAuthor';
  footerCustomText?: string;
  footerAlignment: 'left' | 'center' | 'right';
  startPageNumber: number;
}

export interface TocOptions {
  generateBookmarks: boolean;
  includePrintedToc: boolean;
  tocDepth: 1 | 2 | 3 | 4 | 5 | 6;
  tocPageNumbers: boolean;
  tocTitle: string;
}

export interface QualitySettings {
  dpi: 72 | 150 | 300 | 600;
  compression: 'none' | 'low' | 'medium' | 'high';
  embedFonts: boolean;
  fontSubsetting: boolean;
  pdfVersion: '1.4' | '1.5' | '1.6' | '1.7' | '2.0';
  pdfA: boolean;
  colorSpace: 'RGB' | 'CMYK' | 'Grayscale';
}

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
}

export interface PdfConversionOptions {
  pageSettings: PageSettings;
  typography: Typography;
  layout: LayoutOptions;
  headerFooter: HeaderFooterOptions;
  tableOfContents: TocOptions;
  quality: QualitySettings;
  metadata?: PdfMetadata;
}

export type JobStatus =
  | 'pending'
  | 'parsing'
  | 'extracting'
  | 'rendering'
  | 'optimizing'
  | 'completed'
  | 'failed';

export interface JobStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  time?: number;
  error?: string;
}

export interface ConversionJob {
  id: string;
  fileId: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  totalPages?: number;
  processedPages?: number;
  startedAt: Date | string;
  completedAt?: Date | string;
  error?: string;
  outputPath?: string;
  steps: JobStep[];
  elapsedTime?: number;
}

export interface ConversionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  options: PdfConversionOptions;
}

// API Response Types

export interface UploadResponse {
  success: boolean;
  fileId: string;
  filename: string;
  size: number;
  uploadedAt: Date | string;
}

export interface ParseResponse {
  success: boolean;
  metadata: EpubPdfMetadata;
  structure: EpubPdfStructure;
  tableOfContents: EpubPdfTocItem[];
  spine: SpineItem[];
  resources: EpubResources;
}

export interface ConvertResponse {
  success: boolean;
  jobId: string;
  status: string;
  message: string;
}

export interface JobStatusResponse {
  success: boolean;
  id: string;
  fileId: string;
  status: JobStatus;
  progress: number;
  currentStep: string;
  totalPages?: number;
  processedPages?: number;
  startedAt: Date | string;
  completedAt?: Date | string;
  error?: string;
  steps: JobStep[];
  elapsedTime?: number;
}

export interface PresetsResponse {
  success: boolean;
  presets: ConversionPreset[];
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}
