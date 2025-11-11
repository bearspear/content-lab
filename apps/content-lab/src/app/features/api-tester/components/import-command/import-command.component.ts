import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandParserService } from '../../services/command-parser.service';
import { ApiRequest } from '../../models/request.model';

@Component({
  selector: 'app-import-command',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-command.component.html',
  styleUrls: ['./import-command.component.scss']
})
export class ImportCommandComponent {
  @Output() requestImported = new EventEmitter<ApiRequest>();
  @Output() close = new EventEmitter<void>();

  private parserService = inject(CommandParserService);

  commandText = '';
  parsedRequest: ApiRequest | null = null;
  errors: string[] = [];
  isParsed = false;

  onParse(): void {
    if (!this.commandText.trim()) {
      this.errors = ['Please enter a command'];
      return;
    }

    const result = this.parserService.parseCommand(this.commandText);
    this.parsedRequest = result.request;
    this.errors = result.errors;
    this.isParsed = true;
  }

  onImport(): void {
    if (this.parsedRequest && this.errors.length === 0) {
      this.requestImported.emit(this.parsedRequest);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onClear(): void {
    this.commandText = '';
    this.parsedRequest = null;
    this.errors = [];
    this.isParsed = false;
  }

  get canImport(): boolean {
    return this.isParsed && this.parsedRequest !== null && this.errors.length === 0;
  }

  get commandType(): string {
    const cmd = this.commandText.trim();
    if (cmd.startsWith('curl ')) return 'curl';
    if (cmd.startsWith('xh ') || cmd.startsWith('xhs ')) return 'xh';
    if (cmd.startsWith('http ') || cmd.startsWith('https ')) return 'HTTPie';
    if (cmd.startsWith('wget ')) return 'wget';
    return 'unknown';
  }

  get summaryText(): string {
    if (!this.parsedRequest) return '';

    const parts: string[] = [];

    // Method
    parts.push(`${this.parsedRequest.method} request`);

    // Headers count
    const headerCount = this.parsedRequest.headers.length;
    if (headerCount > 0) {
      parts.push(`${headerCount} header${headerCount > 1 ? 's' : ''}`);
    }

    // Body
    if (this.parsedRequest.body) {
      parts.push(`${this.parsedRequest.body.type} body`);
    }

    // Auth
    if (this.parsedRequest.auth) {
      parts.push(`${this.parsedRequest.auth.type} auth`);
    }

    // Query params
    const paramCount = this.parsedRequest.queryParams.length;
    if (paramCount > 0) {
      parts.push(`${paramCount} query param${paramCount > 1 ? 's' : ''}`);
    }

    return parts.join(', ');
  }
}
