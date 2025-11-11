import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../models/request.model';

@Component({
  selector: 'app-headers-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './headers-editor.component.html',
  styleUrls: ['./headers-editor.component.scss']
})
export class HeadersEditorComponent {
  @Input() headers: Header[] = [];
  @Output() headersChange = new EventEmitter<Header[]>();

  addHeader(): void {
    const newHeaders = [...this.headers, { key: '', value: '', enabled: true }];
    this.headersChange.emit(newHeaders);
  }

  removeHeader(index: number): void {
    const newHeaders = this.headers.filter((_, i) => i !== index);
    this.headersChange.emit(newHeaders);
  }

  updateHeader(index: number, field: 'key' | 'value' | 'enabled', value: any): void {
    const newHeaders = [...this.headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    this.headersChange.emit(newHeaders);
  }

  addCommonHeader(key: string, value: string): void {
    // Check if header already exists
    const existingIndex = this.headers.findIndex(h => h.key.toLowerCase() === key.toLowerCase());

    if (existingIndex >= 0) {
      // Update existing header
      const newHeaders = [...this.headers];
      newHeaders[existingIndex] = { key, value, enabled: true };
      this.headersChange.emit(newHeaders);
    } else {
      // Add new header
      const newHeaders = [...this.headers, { key, value, enabled: true }];
      this.headersChange.emit(newHeaders);
    }
  }

  get hasEmptyHeaders(): boolean {
    return this.headers.some(h => !h.key && !h.value);
  }
}
