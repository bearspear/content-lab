export type ExportFormat = 'html' | 'pdf' | 'markdown' | 'asciidoc' | 'plaintext' | 'json' | 'yaml' | 'epub';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  theme?: string;
  centerContent?: boolean;
  stylePlaintextCode?: boolean;
  hideMarkdownCode?: boolean;
  hideImages?: boolean;
}

export interface JsonExportContent {
  meta: {
    generatedAt: string;
    theme: string;
    converter: string;
  };
  title: string;
  content: any[];
}
