import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthConfig, AuthType } from '../../models/request.model';

@Component({
  selector: 'app-auth-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-builder.component.html',
  styleUrls: ['./auth-builder.component.scss']
})
export class AuthBuilderComponent implements OnInit {
  @Input() auth: AuthConfig | undefined;
  @Output() authChange = new EventEmitter<AuthConfig | undefined>();

  AuthType = AuthType;
  selectedType: AuthType = AuthType.NONE;

  // Form fields
  bearerToken = '';
  basicUsername = '';
  basicPassword = '';
  apiKeyName = '';
  apiKeyValue = '';
  apiKeyLocation: 'header' | 'query' = 'header';

  ngOnInit(): void {
    if (this.auth) {
      this.selectedType = this.auth.type;
      this.loadAuthData();
    }
  }

  ngOnChanges(): void {
    if (this.auth) {
      this.selectedType = this.auth.type;
      this.loadAuthData();
    }
  }

  private loadAuthData(): void {
    if (!this.auth) return;

    switch (this.auth.type) {
      case AuthType.BEARER:
        this.bearerToken = this.auth.bearer?.token || '';
        break;
      case AuthType.BASIC:
        this.basicUsername = this.auth.basic?.username || '';
        this.basicPassword = this.auth.basic?.password || '';
        break;
      case AuthType.API_KEY:
        this.apiKeyName = this.auth.apiKey?.key || '';
        this.apiKeyValue = this.auth.apiKey?.value || '';
        this.apiKeyLocation = this.auth.apiKey?.addTo || 'header';
        break;
    }
  }

  onTypeChange(type: AuthType): void {
    this.selectedType = type;

    if (type === AuthType.NONE) {
      this.authChange.emit(undefined);
    } else {
      this.updateAuth();
    }
  }

  onFieldChange(): void {
    this.updateAuth();
  }

  private updateAuth(): void {
    let authConfig: AuthConfig | undefined;

    switch (this.selectedType) {
      case AuthType.NONE:
        authConfig = undefined;
        break;

      case AuthType.BEARER:
        authConfig = {
          type: AuthType.BEARER,
          bearer: { token: this.bearerToken }
        };
        break;

      case AuthType.BASIC:
        authConfig = {
          type: AuthType.BASIC,
          basic: {
            username: this.basicUsername,
            password: this.basicPassword
          }
        };
        break;

      case AuthType.API_KEY:
        authConfig = {
          type: AuthType.API_KEY,
          apiKey: {
            key: this.apiKeyName,
            value: this.apiKeyValue,
            addTo: this.apiKeyLocation
          }
        };
        break;
    }

    this.authChange.emit(authConfig);
  }

  get authPreview(): string {
    if (!this.auth || this.selectedType === AuthType.NONE) {
      return 'No authentication';
    }

    switch (this.selectedType) {
      case AuthType.BEARER:
        return this.bearerToken
          ? `Authorization: Bearer ${this.bearerToken.substring(0, 20)}${this.bearerToken.length > 20 ? '...' : ''}`
          : 'No token provided';

      case AuthType.BASIC:
        if (this.basicUsername) {
          const credentials = btoa(`${this.basicUsername}:${this.basicPassword || ''}`);
          return `Authorization: Basic ${credentials.substring(0, 20)}...`;
        }
        return 'No username provided';

      case AuthType.API_KEY:
        if (this.apiKeyName && this.apiKeyValue) {
          const location = this.apiKeyLocation === 'header' ? 'Header' : 'Query param';
          return `${location}: ${this.apiKeyName}=${this.apiKeyValue.substring(0, 20)}${this.apiKeyValue.length > 20 ? '...' : ''}`;
        }
        return 'No API key configured';

      default:
        return '';
    }
  }
}
