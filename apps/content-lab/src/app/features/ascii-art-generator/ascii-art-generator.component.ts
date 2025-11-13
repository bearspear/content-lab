/**
 * ASCII Art Generator Component
 * Main component for generating ASCII art, charts, and tables
 */

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextToAsciiService } from './services/text-to-ascii.service';
import { ImageToAsciiService } from './services/image-to-ascii.service';
import { TableGeneratorService, TableColumn } from './services/table-generator.service';
import { ChartGeneratorService } from './services/chart-generator.service';
import { BorderGeneratorService, BorderStyle } from './services/border-generator.service';
import { ToastService } from './services/toast.service';
import { ToastComponent } from './components/toast.component';
import {
  AsciiArtMode,
  FigletFont,
  TextAlignment,
  TextToAsciiConfig,
  ImageToAsciiConfig,
  TableBorderStyle,
  SavedAsciiArt,
  ChartType,
  ChartConfig,
  ChartSeries,
  ChartDataPoint
} from './models/ascii-art.model';

@Component({
  selector: 'app-ascii-art-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './ascii-art-generator.component.html',
  styleUrl: './ascii-art-generator.component.scss'
})
export class AsciiArtGeneratorComponent implements OnInit, OnDestroy {
  // Expose enums to template
  AsciiArtMode = AsciiArtMode;
  TextAlignment = TextAlignment;
  TableBorderStyle = TableBorderStyle;
  ChartType = ChartType;
  BorderStyle = BorderStyle;

  // Current mode
  currentMode: AsciiArtMode = AsciiArtMode.Text;

  // Text-to-ASCII inputs
  inputText: string = 'Hello';
  selectedFont: FigletFont = 'Standard';
  selectedAlignment: TextAlignment = TextAlignment.Left;

  // Image-to-ASCII inputs
  uploadedImageUrl: string = '';
  uploadedImageFile: File | null = null;
  selectedCharacterSet: string = 'simple';
  imageWidth: number = 80;
  imageHeight: number | undefined = undefined;
  invertImage: boolean = false;

  // Table inputs
  tableData: string = '';
  tableHeaders: string[] = ['Column 1', 'Column 2', 'Column 3'];
  tableRows: string[][] = [
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
  ];
  selectedBorderStyle: TableBorderStyle = TableBorderStyle.Single;
  tableHasHeader: boolean = true;
  tablePadding: number = 1;
  dataInputMode: 'manual' | 'csv' | 'json' = 'manual';

  // Chart inputs
  selectedChartType: ChartType = ChartType.Bar;
  chartData: string = '';
  chartTitle: string = 'My Chart';
  chartXLabel: string = 'X Axis';
  chartYLabel: string = 'Y Axis';
  chartWidth: number = 60;
  chartHeight: number = 20;
  chartShowLegend: boolean = true;
  chartDataInputMode: 'manual' | 'csv' | 'json' = 'csv';
  chartManualData: ChartDataPoint[] = [
    { x: 'Jan', y: 10 },
    { x: 'Feb', y: 20 },
    { x: 'Mar', y: 15 },
    { x: 'Apr', y: 25 },
    { x: 'May', y: 30 }
  ];

  // Output
  asciiOutput: string = '';
  isGenerating: boolean = false;
  errorMessage: string = '';

  // Available fonts
  availableFonts: FigletFont[] = [];

  // Available character sets for image-to-ASCII
  availableCharacterSets: Record<string, { chars: string, description: string }> = {};

  // Available border styles
  availableBorderStyles: TableBorderStyle[] = [
    TableBorderStyle.Single,
    TableBorderStyle.Double,
    TableBorderStyle.Rounded,
    TableBorderStyle.Heavy,
    TableBorderStyle.Markdown,
    TableBorderStyle.Grid,
    TableBorderStyle.None
  ];

  // Available chart types
  availableChartTypes: ChartType[] = [
    ChartType.Bar,
    ChartType.Line,
    ChartType.Scatter,
    ChartType.Pie,
    ChartType.Histogram
  ];

  // Border inputs
  borderText: string = 'Hello World!';
  selectedDecorativeBorderStyle: BorderStyle = BorderStyle.Single;
  borderPadding: number = 1;
  borderType: 'box' | 'banner' | 'titled' | 'comment' = 'box';
  borderTitle: string = 'Title';
  borderCommentStyle: 'slash' | 'hash' | 'semicolon' = 'slash';

  // Available decorative border styles
  availableDecorativeBorderStyles: BorderStyle[] = [];

  // History
  history: SavedAsciiArt[] = [];
  maxHistoryItems = 10;

  constructor(
    private textToAsciiService: TextToAsciiService,
    private imageToAsciiService: ImageToAsciiService,
    private tableGeneratorService: TableGeneratorService,
    private chartGeneratorService: ChartGeneratorService,
    private borderGeneratorService: BorderGeneratorService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    console.log('[AsciiArtGenerator] Component initialized');
    this.availableFonts = this.textToAsciiService.availableFonts;
    this.availableCharacterSets = this.imageToAsciiService.getCharacterSetPreviews();
    this.availableDecorativeBorderStyles = this.borderGeneratorService.getAvailableStyles();

    // Load history from localStorage
    this.loadHistory();

    // Set default chart data
    this.setDefaultChartData();

    // Generate initial output
    this.generateAsciiArt();
  }

  ngOnDestroy(): void {
    // Save history to localStorage
    this.saveHistory();
  }

  /**
   * Keyboard shortcuts
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl+C / Cmd+C - Copy (only if output exists and not in input field)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c' && this.asciiOutput) {
      const target = event.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        this.copyToClipboard();
      }
    }

    // Ctrl+S / Cmd+S - Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (this.asciiOutput) {
        this.downloadAsText();
      }
    }

    // Ctrl+K / Cmd+K - Clear
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.clear();
    }
  }

  /**
   * Main generation method - routes to appropriate generator
   */
  async generateAsciiArt(): Promise<void> {
    this.errorMessage = '';

    switch (this.currentMode) {
      case AsciiArtMode.Text:
        await this.generateTextAscii();
        break;
      case AsciiArtMode.Image:
        await this.generateImageAscii();
        break;
      case AsciiArtMode.Chart:
        await this.generateChart();
        break;
      case AsciiArtMode.Table:
        await this.generateTable();
        break;
      case AsciiArtMode.Border:
        await this.generateBorder();
        break;
    }
  }

  /**
   * Generate text-to-ASCII art
   */
  async generateTextAscii(): Promise<void> {
    if (!this.inputText.trim()) {
      this.asciiOutput = '';
      return;
    }

    this.isGenerating = true;

    try {
      const config: TextToAsciiConfig = {
        text: this.inputText,
        font: this.selectedFont,
        alignment: this.selectedAlignment
      };

      this.asciiOutput = await this.textToAsciiService.convertToAscii(config);

      // Add to history
      this.addToHistory({
        id: Date.now().toString(),
        mode: AsciiArtMode.Text,
        output: this.asciiOutput,
        config,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AsciiArtGenerator] Error generating ASCII art:', error);
      this.errorMessage = 'Error generating ASCII art. Please try again.';
      this.asciiOutput = '';
      this.toastService.error('Failed to generate ASCII art. Please try a different font.');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate image-to-ASCII art
   */
  async generateImageAscii(): Promise<void> {
    if (!this.uploadedImageUrl) {
      this.asciiOutput = 'Please upload an image to convert';
      return;
    }

    this.isGenerating = true;

    try {
      const charSet = this.imageToAsciiService.characterSets[
        this.selectedCharacterSet as keyof typeof this.imageToAsciiService.characterSets
      ];

      const config: ImageToAsciiConfig = {
        imageUrl: this.uploadedImageUrl,
        width: this.imageWidth,
        height: this.imageHeight,
        characterSet: charSet,
        invert: this.invertImage
      };

      this.asciiOutput = await this.imageToAsciiService.convertToAscii(config);

      // Add to history
      this.addToHistory({
        id: Date.now().toString(),
        mode: AsciiArtMode.Image,
        output: this.asciiOutput,
        config,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AsciiArtGenerator] Error generating image ASCII:', error);
      this.errorMessage = 'Error converting image to ASCII. Please try again.';
      this.asciiOutput = '';
      this.toastService.error('Failed to convert image to ASCII. Please try a different image.');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate table
   */
  async generateTable(): Promise<void> {
    this.isGenerating = true;

    try {
      // Process data based on input mode
      let headers: string[] = this.tableHeaders;
      let data: string[][] = this.tableRows;

      if (this.dataInputMode === 'csv') {
        const parsed = this.tableGeneratorService.parseCSV(this.tableData);
        headers = parsed.headers;
        data = parsed.data;
      } else if (this.dataInputMode === 'json') {
        const parsed = this.tableGeneratorService.parseJSON(this.tableData);
        headers = parsed.headers;
        data = parsed.data;
      }

      // Build columns configuration
      const columns: TableColumn[] = headers.map(header => ({
        header,
        alignment: TextAlignment.Left,
        width: undefined // Auto-calculate
      }));

      // Generate table
      this.asciiOutput = this.tableGeneratorService.generateTable({
        columns,
        data,
        borderStyle: this.selectedBorderStyle,
        hasHeader: this.tableHasHeader,
        padding: this.tablePadding
      });

      // Add to history
      this.addToHistory({
        id: Date.now().toString(),
        mode: AsciiArtMode.Table,
        output: this.asciiOutput,
        config: {
          borderStyle: this.selectedBorderStyle,
          hasHeader: this.tableHasHeader,
          padding: this.tablePadding,
          dataInputMode: this.dataInputMode
        } as any,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AsciiArtGenerator] Error generating table:', error);
      this.errorMessage = 'Error generating table. Please check your data.';
      this.asciiOutput = '';
      this.toastService.error('Failed to generate table. Please check your data format.');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Change the current mode
   */
  changeMode(mode: AsciiArtMode): void {
    this.currentMode = mode;
    this.generateAsciiArt();
  }

  /**
   * Copy output to clipboard
   */
  async copyToClipboard(): Promise<void> {
    if (!this.asciiOutput) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.asciiOutput);
      console.log('[AsciiArtGenerator] Copied to clipboard');
      this.toastService.success('Copied to clipboard!');
    } catch (error) {
      console.error('[AsciiArtGenerator] Failed to copy:', error);
      this.toastService.error('Failed to copy to clipboard');
    }
  }

  /**
   * Download ASCII art as text file
   */
  downloadAsText(): void {
    if (!this.asciiOutput) {
      return;
    }

    const blob = new Blob([this.asciiOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ascii-art-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    this.toastService.success('Downloaded ASCII art!');
  }

  /**
   * Clear all inputs and outputs
   */
  clear(): void {
    this.inputText = '';
    this.asciiOutput = '';
    this.errorMessage = '';
  }

  /**
   * Handle font change
   */
  onFontChange(): void {
    this.generateAsciiArt();
  }

  /**
   * Handle alignment change
   */
  onAlignmentChange(): void {
    this.generateAsciiArt();
  }

  /**
   * Handle text input change (with debounce in template)
   */
  onTextChange(): void {
    this.generateAsciiArt();
  }

  /**
   * History management
   */
  private addToHistory(item: SavedAsciiArt): void {
    this.history.unshift(item);
    if (this.history.length > this.maxHistoryItems) {
      this.history.pop();
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem('ascii-art-history', JSON.stringify(this.history));
    } catch (error) {
      console.error('[AsciiArtGenerator] Failed to save history:', error);
    }
  }

  private loadHistory(): void {
    try {
      const saved = localStorage.getItem('ascii-art-history');
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (error) {
      console.error('[AsciiArtGenerator] Failed to load history:', error);
      this.history = [];
    }
  }

  loadFromHistory(item: SavedAsciiArt): void {
    if (item.mode === AsciiArtMode.Text && item.config) {
      const config = item.config as TextToAsciiConfig;
      this.inputText = config.text;
      this.selectedFont = config.font;
      this.selectedAlignment = config.alignment || TextAlignment.Left;
      this.generateAsciiArt();
      this.toastService.info('Loaded from history');
    }
  }

  clearHistory(): void {
    this.history = [];
    this.saveHistory();
    this.toastService.info('History cleared');
  }

  /**
   * Image-specific handlers
   */
  async onImageFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      this.uploadedImageFile = file;
      this.uploadedImageUrl = await this.imageToAsciiService.processUploadedFile(file);
      this.toastService.success('Image loaded successfully!');

      // Generate ASCII art automatically
      await this.generateAsciiArt();
    } catch (error: any) {
      console.error('[AsciiArtGenerator] Error uploading image:', error);
      this.errorMessage = error.message || 'Error uploading image';
      this.toastService.error(error.message || 'Failed to upload image');
      this.uploadedImageUrl = '';
      this.uploadedImageFile = null;
    }
  }

  onImageWidthChange(): void {
    if (this.currentMode === AsciiArtMode.Image && this.uploadedImageUrl) {
      this.generateAsciiArt();
    }
  }

  onImageHeightChange(): void {
    if (this.currentMode === AsciiArtMode.Image && this.uploadedImageUrl) {
      this.generateAsciiArt();
    }
  }

  onCharacterSetChange(): void {
    if (this.currentMode === AsciiArtMode.Image && this.uploadedImageUrl) {
      this.generateAsciiArt();
    }
  }

  onInvertImageChange(): void {
    if (this.currentMode === AsciiArtMode.Image && this.uploadedImageUrl) {
      this.generateAsciiArt();
    }
  }

  clearImage(): void {
    this.uploadedImageUrl = '';
    this.uploadedImageFile = null;
    this.asciiOutput = '';
    this.errorMessage = '';
  }

  /**
   * Generate chart
   */
  async generateChart(): Promise<void> {
    this.isGenerating = true;

    try {
      // Parse data based on input mode
      let series: ChartSeries[] = [];

      if (this.chartDataInputMode === 'manual') {
        series = [{
          name: 'Data',
          data: this.chartManualData
        }];
      } else if (this.chartDataInputMode === 'csv') {
        series = this.chartGeneratorService.parseCSVForChart(this.chartData);
      } else if (this.chartDataInputMode === 'json') {
        series = this.chartGeneratorService.parseJSONForChart(this.chartData);
      }

      if (series.length === 0 || series[0].data.length === 0) {
        this.asciiOutput = 'No chart data provided. Please add data in CSV or JSON format.';
        return;
      }

      // Build chart configuration
      const config: ChartConfig = {
        type: this.selectedChartType,
        series,
        width: this.chartWidth,
        height: this.chartHeight,
        title: this.chartTitle,
        xLabel: this.chartXLabel,
        yLabel: this.chartYLabel,
        showLegend: this.chartShowLegend
      };

      // Generate chart
      this.asciiOutput = this.chartGeneratorService.generateChart(config);

      // Add to history
      this.addToHistory({
        id: Date.now().toString(),
        mode: AsciiArtMode.Chart,
        output: this.asciiOutput,
        config,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AsciiArtGenerator] Error generating chart:', error);
      this.errorMessage = 'Error generating chart. Please check your data.';
      this.asciiOutput = '';
      this.toastService.error('Failed to generate chart. Please check your data format.');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Set default chart data based on chart type
   */
  private setDefaultChartData(): void {
    if (this.chartDataInputMode === 'csv') {
      this.chartData = 'Month,Sales\nJan,10\nFeb,20\nMar,15\nApr,25\nMay,30';
    } else if (this.chartDataInputMode === 'json') {
      this.chartData = JSON.stringify([
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 15 },
        { x: 'Apr', y: 25 },
        { x: 'May', y: 30 }
      ], null, 2);
    }
  }

  /**
   * Chart-specific handlers
   */
  onChartTypeChange(): void {
    if (this.currentMode === AsciiArtMode.Chart) {
      this.generateAsciiArt();
    }
  }

  onChartDataChange(): void {
    if (this.currentMode === AsciiArtMode.Chart) {
      this.generateAsciiArt();
    }
  }

  onChartDataInputModeChange(): void {
    if (this.currentMode === AsciiArtMode.Chart) {
      this.setDefaultChartData();
      this.generateAsciiArt();
    }
  }

  onChartConfigChange(): void {
    if (this.currentMode === AsciiArtMode.Chart) {
      this.generateAsciiArt();
    }
  }

  /**
   * Generate border
   */
  async generateBorder(): Promise<void> {
    this.isGenerating = true;

    try {
      let output = '';

      switch (this.borderType) {
        case 'box':
          output = this.borderGeneratorService.generateBorder({
            text: this.borderText,
            style: this.selectedDecorativeBorderStyle,
            padding: this.borderPadding
          });
          break;
        case 'banner':
          output = this.borderGeneratorService.generateBanner(
            this.borderText,
            this.selectedDecorativeBorderStyle,
            60
          );
          break;
        case 'titled':
          output = this.borderGeneratorService.generateTitledBox(
            this.borderTitle,
            this.borderText,
            this.selectedDecorativeBorderStyle,
            this.borderPadding
          );
          break;
        case 'comment':
          output = this.borderGeneratorService.generateComment(
            this.borderText,
            this.borderCommentStyle
          );
          break;
      }

      this.asciiOutput = output;

      // Add to history
      this.addToHistory({
        id: Date.now().toString(),
        mode: AsciiArtMode.Border,
        output: this.asciiOutput,
        config: {
          text: this.borderText,
          style: this.selectedDecorativeBorderStyle,
          padding: this.borderPadding
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[AsciiArtGenerator] Error generating border:', error);
      this.errorMessage = 'Error generating border. Please try again.';
      this.asciiOutput = '';
      this.toastService.error('Failed to generate border.');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Border-specific handlers
   */
  onBorderTextChange(): void {
    if (this.currentMode === AsciiArtMode.Border) {
      this.generateAsciiArt();
    }
  }

  onBorderStyleChange(): void {
    if (this.currentMode === AsciiArtMode.Border) {
      this.generateAsciiArt();
    }
  }

  onBorderTypeChange(): void {
    if (this.currentMode === AsciiArtMode.Border) {
      this.generateAsciiArt();
    }
  }

  onBorderConfigChange(): void {
    if (this.currentMode === AsciiArtMode.Border) {
      this.generateAsciiArt();
    }
  }

  /**
   * Table-specific handlers
   */
  onTableBorderStyleChange(): void {
    if (this.currentMode === AsciiArtMode.Table) {
      this.generateAsciiArt();
    }
  }

  onTableDataChange(): void {
    if (this.currentMode === AsciiArtMode.Table) {
      this.generateAsciiArt();
    }
  }

  onDataInputModeChange(): void {
    if (this.currentMode === AsciiArtMode.Table) {
      // Reset table data when switching modes
      if (this.dataInputMode === 'manual') {
        this.tableHeaders = ['Column 1', 'Column 2', 'Column 3'];
        this.tableRows = [
          ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
          ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
        ];
      } else if (this.dataInputMode === 'csv') {
        this.tableData = 'Name,Age,City\nJohn,25,NYC\nJane,30,LA';
      } else if (this.dataInputMode === 'json') {
        this.tableData = JSON.stringify([
          { Name: 'John', Age: 25, City: 'NYC' },
          { Name: 'Jane', Age: 30, City: 'LA' }
        ], null, 2);
      }
      this.generateAsciiArt();
    }
  }
}
