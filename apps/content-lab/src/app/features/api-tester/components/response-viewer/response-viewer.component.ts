import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiResponse, ResponseError, isResponseError } from '../../models/response.model';

@Component({
  selector: 'app-response-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './response-viewer.component.html',
  styleUrls: ['./response-viewer.component.scss']
})
export class ResponseViewerComponent {
  @Input() response: ApiResponse | ResponseError | null = null;
  @Input() isLoading: boolean | null = false;

  activeTab: 'body' | 'headers' | 'raw' = 'body';

  get isError(): boolean {
    return this.response ? isResponseError(this.response) : false;
  }

  get apiResponse(): ApiResponse | null {
    return this.response && !isResponseError(this.response) ? this.response : null;
  }

  get error(): ResponseError | null {
    return this.response && isResponseError(this.response) ? this.response : null;
  }

  get formattedBody(): string {
    if (!this.apiResponse) return '';

    const body = this.apiResponse.body;

    if (typeof body === 'string') {
      // Try to parse and format JSON
      try {
        const parsed = JSON.parse(body);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return body;
      }
    } else if (typeof body === 'object') {
      return JSON.stringify(body, null, 2);
    }

    return String(body);
  }

  get statusClass(): string {
    if (!this.apiResponse) return '';

    const status = this.apiResponse.status;
    if (status >= 200 && status < 300) return 'status-success';
    if (status >= 300 && status < 400) return 'status-redirect';
    if (status >= 400 && status < 500) return 'status-client-error';
    if (status >= 500) return 'status-server-error';
    return '';
  }

  get headersArray(): Array<{ key: string; value: string }> {
    if (!this.apiResponse) return [];

    return Object.entries(this.apiResponse.headers).map(([key, value]) => ({
      key,
      value
    }));
  }

  get rawResponse(): string {
    if (!this.apiResponse) return '';

    return JSON.stringify(this.apiResponse, null, 2);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log('Copied to clipboard');
    });
  }
}
