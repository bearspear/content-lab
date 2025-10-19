import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateManagerService } from '../../core/services';
import { ResetButtonComponent } from '../../shared/components/reset-button/reset-button.component';
import { StatefulComponent } from '../../core/base';

declare const Papa: any;

interface CellData {
  value: string;
  isEditing: boolean;
}

interface CsvEditorState {
  headers: string[];
  rows: CellData[][];
  csvInput: string;
  delimiter: string;
  hasHeader: boolean;
  showImportDialog: boolean;
  tableName: string;
}

@Component({
  selector: 'app-csv-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './csv-editor.component.html',
  styleUrls: ['./csv-editor.component.scss']
})
export class CsvEditorComponent extends StatefulComponent<CsvEditorState> {
  protected readonly TOOL_ID = 'csv-editor';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Data
  headers: string[] = [];
  rows: CellData[][] = [];
  csvInput = '';
  delimiter = ',';
  hasHeader = true;

  // UI State
  showImportDialog = true;
  exportFormat: 'csv' | 'json' | 'sql' | 'markdown' = 'csv';
  exportOutput = '';
  showExportDialog = false;
  tableName = 'table_data';
  sortColumn: number | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isDragging = false;

  // Stats
  rowCount = 0;
  columnCount = 0;

  constructor(stateManager: StateManagerService) {
    super(stateManager);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadPapaParse();
  }

  protected getDefaultState(): CsvEditorState {
    return {
      headers: [],
      rows: [],
      csvInput: '',
      delimiter: ',',
      hasHeader: true,
      showImportDialog: true,
      tableName: 'table_data'
    };
  }

  protected applyState(state: CsvEditorState): void {
    this.headers = state.headers;
    this.rows = state.rows;
    this.csvInput = state.csvInput;
    this.delimiter = state.delimiter;
    this.hasHeader = state.hasHeader;
    this.showImportDialog = state.showImportDialog;
    this.tableName = state.tableName;
    this.rowCount = this.rows.length;
    this.columnCount = this.headers.length;
  }

  protected getCurrentState(): CsvEditorState {
    return {
      headers: this.headers,
      rows: this.rows,
      csvInput: this.csvInput,
      delimiter: this.delimiter,
      hasHeader: this.hasHeader,
      showImportDialog: this.showImportDialog,
      tableName: this.tableName
    };
  }

  /**
   * Override reset to clear data
   */
  public override onReset(): void {
    super.onReset();
    this.rowCount = 0;
    this.columnCount = 0;
  }

  private loadPapaParse(): void {
    if (typeof Papa !== 'undefined') {
      return;
    }

    const script = document.createElement('script');
    script.src = '/assets/js-libraries/papaparse.min.js';
    script.onload = () => {
      // PapaParse loaded successfully
    };
    script.onerror = () => {
      console.error('❌ Failed to load PapaParse');
    };
    document.head.appendChild(script);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.readFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check file type
      const validExtensions = ['.csv', '.tsv', '.txt'];
      const fileName = file.name.toLowerCase();
      const isValid = validExtensions.some(ext => fileName.endsWith(ext));

      if (!isValid) {
        alert('Please drop a CSV, TSV, or TXT file');
        return;
      }

      this.readFile(file);
    }
  }

  private readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.csvInput = e.target?.result as string;
      this.parseCSV();
    };
    reader.readAsText(file);
  }

  parseCSV(): void {
    if (!this.csvInput.trim()) {
      alert('Please enter CSV data');
      return;
    }

    if (typeof Papa === 'undefined') {
      alert('PapaParse library is still loading. Please try again in a moment.');
      return;
    }

    const config: any = {
      delimiter: this.delimiter,
      skipEmptyLines: true,
      header: false
    };

    const result = Papa.parse(this.csvInput.trim(), config);

    if (result.errors.length > 0) {
      console.error('Parse errors:', result.errors);
      alert('Error parsing CSV: ' + result.errors[0].message);
      return;
    }

    if (result.data.length === 0) {
      alert('No data found in CSV');
      return;
    }

    // Extract headers
    if (this.hasHeader && result.data.length > 0) {
      this.headers = result.data[0];
      this.rows = result.data.slice(1).map((row: any[]) =>
        row.map(cell => ({ value: String(cell || ''), isEditing: false }))
      );
    } else {
      // Generate column headers (Column 1, Column 2, etc.)
      this.columnCount = result.data[0]?.length || 0;
      this.headers = Array.from({ length: this.columnCount }, (_, i) => `Column ${i + 1}`);
      this.rows = result.data.map((row: any[]) =>
        row.map(cell => ({ value: String(cell || ''), isEditing: false }))
      );
    }

    this.rowCount = this.rows.length;
    this.columnCount = this.headers.length;
    this.showImportDialog = false;

    this.saveState();
  }

  startEditing(rowIndex: number, colIndex: number): void {
    this.rows[rowIndex][colIndex].isEditing = true;
  }

  stopEditing(rowIndex: number, colIndex: number): void {
    this.rows[rowIndex][colIndex].isEditing = false;
    this.saveState();
  }

  updateCell(rowIndex: number, colIndex: number, newValue: string): void {
    this.rows[rowIndex][colIndex].value = newValue;
    this.saveState();
  }

  addRow(): void {
    const newRow = this.headers.map(() => ({ value: '', isEditing: false }));
    this.rows.push(newRow);
    this.rowCount = this.rows.length;
    this.saveState();
  }

  deleteRow(index: number): void {
    if (confirm('Delete this row?')) {
      this.rows.splice(index, 1);
      this.rowCount = this.rows.length;
      this.saveState();
    }
  }

  addColumn(): void {
    const newColumnName = prompt('Enter column name:', `Column ${this.headers.length + 1}`);
    if (!newColumnName) return;

    this.headers.push(newColumnName);
    this.rows.forEach(row => {
      row.push({ value: '', isEditing: false });
    });
    this.columnCount = this.headers.length;
    this.saveState();
  }

  deleteColumn(index: number): void {
    if (confirm(`Delete column "${this.headers[index]}"?`)) {
      this.headers.splice(index, 1);
      this.rows.forEach(row => row.splice(index, 1));
      this.columnCount = this.headers.length;
      this.saveState();
    }
  }

  renameColumn(index: number): void {
    const newName = prompt('Enter new column name:', this.headers[index]);
    if (newName) {
      this.headers[index] = newName;
      this.saveState();
    }
  }

  sortByColumn(index: number): void {
    if (this.sortColumn === index) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = index;
      this.sortDirection = 'asc';
    }

    this.rows.sort((a, b) => {
      const aVal = a[index].value.toLowerCase();
      const bVal = b[index].value.toLowerCase();

      const comparison = aVal.localeCompare(bVal, undefined, { numeric: true });
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  exportData(format: 'csv' | 'json' | 'sql' | 'markdown'): void {
    this.exportFormat = format;

    switch (format) {
      case 'csv':
        this.exportOutput = this.exportToCSV();
        break;
      case 'json':
        this.exportOutput = this.exportToJSON();
        break;
      case 'sql':
        this.exportOutput = this.exportToSQL();
        break;
      case 'markdown':
        this.exportOutput = this.exportToMarkdown();
        break;
    }

    this.showExportDialog = true;
  }

  private exportToCSV(): string {
    const csvRows = [];
    csvRows.push(this.headers.map(h => `"${h}"`).join(','));

    this.rows.forEach(row => {
      csvRows.push(row.map(cell => `"${cell.value.replace(/"/g, '""')}"`).join(','));
    });

    return csvRows.join('\n');
  }

  private exportToJSON(): string {
    const data = this.rows.map(row => {
      const obj: any = {};
      this.headers.forEach((header, i) => {
        obj[header] = row[i].value;
      });
      return obj;
    });

    return JSON.stringify(data, null, 2);
  }

  private exportToSQL(): string {
    const lines: string[] = [];

    // CREATE TABLE statement
    const columns = this.headers.map(h => `  \`${h}\` VARCHAR(255)`).join(',\n');
    lines.push(`CREATE TABLE \`${this.tableName}\` (`);
    lines.push(columns);
    lines.push(`);\n`);

    // INSERT statements
    this.rows.forEach(row => {
      const values = row.map(cell => `'${cell.value.replace(/'/g, "''")}'`).join(', ');
      lines.push(`INSERT INTO \`${this.tableName}\` (\`${this.headers.join('`, `')}\`) VALUES (${values});`);
    });

    return lines.join('\n');
  }

  private exportToMarkdown(): string {
    const lines: string[] = [];

    // Header row
    lines.push('| ' + this.headers.join(' | ') + ' |');

    // Separator row
    lines.push('| ' + this.headers.map(() => '---').join(' | ') + ' |');

    // Data rows
    this.rows.forEach(row => {
      lines.push('| ' + row.map(cell => cell.value).join(' | ') + ' |');
    });

    return lines.join('\n');
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.exportOutput).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    });
  }

  downloadExport(): void {
    const extensions: Record<typeof this.exportFormat, string> = {
      csv: 'csv',
      json: 'json',
      sql: 'sql',
      markdown: 'md'
    };

    const filename = `export.${extensions[this.exportFormat]}`;
    const blob = new Blob([this.exportOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearData(): void {
    if (confirm('Clear all data?')) {
      this.headers = [];
      this.rows = [];
      this.csvInput = '';
      this.rowCount = 0;
      this.columnCount = 0;
      this.showImportDialog = true;
    }
  }

  resetImport(): void {
    this.csvInput = '';
  }

  switchDelimiter(newDelimiter: string): void {
    this.delimiter = newDelimiter;
    this.saveState();
  }
}
