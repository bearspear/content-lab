import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiRequest, HttpMethod, BodyType, Header, QueryParam, AuthConfig } from '../../models/request.model';
import { HeadersEditorComponent } from '../headers-editor/headers-editor.component';
import { QueryParamsEditorComponent } from '../headers-editor/query-params-editor.component';
import { AuthBuilderComponent } from '../auth-builder/auth-builder.component';
import { ImportCommandComponent } from '../import-command/import-command.component';
import { ApiRequestService } from '../../services/api-request.service';

@Component({
  selector: 'app-request-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeadersEditorComponent,
    QueryParamsEditorComponent,
    AuthBuilderComponent,
    ImportCommandComponent
  ],
  templateUrl: './request-builder.component.html',
  styleUrls: ['./request-builder.component.scss']
})
export class RequestBuilderComponent implements OnInit {
  @Input() request: ApiRequest | null = null;
  @Input() isLoading: boolean | null = false;
  @Output() requestChange = new EventEmitter<ApiRequest>();
  @Output() sendRequest = new EventEmitter<ApiRequest>();
  @Output() saveRequest = new EventEmitter<ApiRequest>();

  private apiRequestService = inject(ApiRequestService);

  HttpMethod = HttpMethod;
  methods = Object.values(HttpMethod);

  localRequest!: ApiRequest;
  activeTab: 'params' | 'headers' | 'body' | 'auth' = 'body';
  bodyContent = '';
  showImportModal = false;
  useProxy = false;

  ngOnInit(): void {
    if (this.request) {
      this.localRequest = { ...this.request };
      this.bodyContent = this.request.body?.content as string || '';
    }
  }

  ngOnChanges(): void {
    if (this.request) {
      this.localRequest = { ...this.request };
      this.bodyContent = this.request.body?.content as string || '';
    }
  }

  onMethodChange(method: HttpMethod): void {
    this.localRequest.method = method;
    this.emitChange();
  }

  onUrlChange(url: string): void {
    this.localRequest.url = url;
    this.emitChange();
  }

  onHeadersChange(headers: Header[]): void {
    this.localRequest.headers = headers;
    this.emitChange();
  }

  onParamsChange(params: QueryParam[]): void {
    this.localRequest.queryParams = params;
    this.emitChange();
  }

  onAuthChange(auth: AuthConfig | undefined): void {
    this.localRequest.auth = auth;
    this.emitChange();
  }

  onBodyChange(content: string): void {
    this.bodyContent = content;

    // Update the request body
    if (!this.localRequest.body) {
      this.localRequest.body = {
        type: BodyType.JSON,
        content: content
      };
    } else {
      this.localRequest.body.content = content;
    }

    this.emitChange();
  }

  onImportClick(): void {
    this.showImportModal = true;
  }

  onRequestImported(imported: ApiRequest): void {
    // Merge the imported request with the local request
    this.localRequest = {
      ...this.localRequest,
      ...imported,
      id: this.localRequest.id,
      name: this.localRequest.name
    };

    // Update body content for textarea
    this.bodyContent = imported.body?.content as string || '';

    this.showImportModal = false;
    this.emitChange();
  }

  onCloseImport(): void {
    this.showImportModal = false;
  }

  onProxyToggle(): void {
    this.apiRequestService.setProxyEnabled(this.useProxy);
  }

  onSave(): void {
    this.saveRequest.emit(this.localRequest);
  }

  onSend(): void {
    this.sendRequest.emit(this.localRequest);
  }

  private emitChange(): void {
    this.requestChange.emit(this.localRequest);
  }

  get canSend(): boolean {
    return !!this.localRequest?.url && !this.isLoading;
  }

  get canSave(): boolean {
    return !!this.localRequest?.url;
  }
}
