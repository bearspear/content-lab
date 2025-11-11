import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiRequest, HttpMethod, BodyType, AuthType } from '../models/request.model';
import { ApiResponse, ResponseError } from '../models/response.model';

@Injectable({ providedIn: 'root' })
export class ApiRequestService {
  private httpClient = inject(HttpClient);
  private proxyUrl = 'http://localhost:3000/api/proxy'; // content-lab-server proxy
  private useProxy = false; // Toggle for using proxy

  setProxyEnabled(enabled: boolean): void {
    this.useProxy = enabled;
  }

  isProxyEnabled(): boolean {
    return this.useProxy;
  }

  executeRequest(request: ApiRequest): Observable<ApiResponse> {
    // Use proxy if enabled
    if (this.useProxy) {
      return this.executeProxiedRequest(request);
    }

    // Direct request (may hit CORS)
    const startTime = performance.now();

    // Build HTTP options
    const options = this.buildHttpOptions(request);

    // Build URL with query params
    const url = this.buildUrl(request);

    // Execute request
    return this.httpClient.request(request.method, url, {
      ...options,
      observe: 'response'
    }).pipe(
      map(response => {
        const endTime = performance.now();
        return this.buildApiResponse(response, endTime - startTime);
      }),
      catchError(error => throwError(() => this.handleError(error)))
    );
  }

  private executeProxiedRequest(request: ApiRequest): Observable<ApiResponse> {
    // Build the proxy request payload
    const headers: Record<string, string> = {};
    request.headers.forEach(header => {
      if (header.enabled && header.key && header.value) {
        headers[header.key] = header.value;
      }
    });

    // Apply auth to headers
    if (request.auth) {
      const authHeaders = this.getAuthHeaders(request.auth);
      Object.assign(headers, authHeaders);
    }

    const proxyPayload = {
      method: request.method,
      url: this.buildUrl(request),
      headers: headers,
      body: request.body?.content || null,
      timeout: request.timeout || 30000
    };

    // Send request through proxy
    return this.httpClient.post<any>(this.proxyUrl, proxyPayload).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data as ApiResponse;
        } else if (response.error) {
          throw response.error;
        }
        throw { type: 'unknown', message: 'Invalid proxy response' };
      }),
      catchError(error => {
        if (error.error?.error) {
          return throwError(() => error.error.error as ResponseError);
        }
        return throwError(() => this.handleError(error));
      })
    );
  }

  private buildHttpOptions(request: ApiRequest): any {
    let headers = new HttpHeaders();

    // Add custom headers
    request.headers.forEach(header => {
      if (header.enabled && header.key && header.value) {
        headers = headers.set(header.key, header.value);
      }
    });

    // Apply authentication
    if (request.auth) {
      headers = this.applyAuth(headers, request.auth);
    }

    const options: any = { headers };

    // Add body if present
    if (request.body && request.method !== HttpMethod.GET && request.method !== HttpMethod.HEAD) {
      options.body = this.buildBody(request.body);
    }

    // Add timeout if specified
    if (request.timeout) {
      // Note: Angular HttpClient doesn't directly support timeout
      // This would need to be implemented with rxjs timeout operator if needed
    }

    return options;
  }

  private buildUrl(request: ApiRequest): string {
    let url = request.url;

    // Add query parameters
    const enabledParams = request.queryParams.filter(p => p.enabled && p.key);
    if (enabledParams.length > 0) {
      const params = new URLSearchParams();
      enabledParams.forEach(param => {
        params.append(param.key, param.value);
      });
      const queryString = params.toString();
      url = url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
    }

    return url;
  }

  private applyAuth(headers: HttpHeaders, auth: any): HttpHeaders {
    switch (auth.type) {
      case AuthType.BEARER:
        if (auth.bearer?.token) {
          headers = headers.set('Authorization', `Bearer ${auth.bearer.token}`);
        }
        break;

      case AuthType.BASIC:
        if (auth.basic?.username) {
          const credentials = btoa(`${auth.basic.username}:${auth.basic.password || ''}`);
          headers = headers.set('Authorization', `Basic ${credentials}`);
        }
        break;

      case AuthType.API_KEY:
        if (auth.apiKey?.key && auth.apiKey?.value) {
          if (auth.apiKey.addTo === 'header') {
            headers = headers.set(auth.apiKey.key, auth.apiKey.value);
          }
          // Query param API keys are handled in buildUrl
        }
        break;

      case AuthType.CUSTOM:
        if (auth.custom) {
          auth.custom.forEach((header: any) => {
            if (header.enabled) {
              headers = headers.set(header.key, header.value);
            }
          });
        }
        break;

      default:
        break;
    }

    return headers;
  }

  private getAuthHeaders(auth: any): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (auth.type) {
      case AuthType.BEARER:
        if (auth.bearer?.token) {
          headers['Authorization'] = `Bearer ${auth.bearer.token}`;
        }
        break;

      case AuthType.BASIC:
        if (auth.basic?.username) {
          const credentials = btoa(`${auth.basic.username}:${auth.basic.password || ''}`);
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;

      case AuthType.API_KEY:
        if (auth.apiKey?.key && auth.apiKey?.value && auth.apiKey.addTo === 'header') {
          headers[auth.apiKey.key] = auth.apiKey.value;
        }
        break;

      case AuthType.CUSTOM:
        if (auth.custom) {
          auth.custom.forEach((header: any) => {
            if (header.enabled) {
              headers[header.key] = header.value;
            }
          });
        }
        break;
    }

    return headers;
  }

  private buildBody(body: any): any {
    switch (body.type) {
      case BodyType.JSON:
        // If content is already an object, stringify it
        return typeof body.content === 'string' ? body.content : JSON.stringify(body.content);

      case BodyType.XML:
      case BodyType.RAW:
        return body.content;

      case BodyType.FORM_URLENCODED:
        // Convert to URLSearchParams format
        if (typeof body.content === 'string') {
          return body.content;
        }
        break;

      case BodyType.FORM_DATA:
        // Return FormData as-is
        return body.content;

      default:
        return body.content;
    }

    return body.content;
  }

  private buildApiResponse(response: any, responseTime: number): ApiResponse {
    // Extract headers
    const headers: Record<string, string> = {};
    response.headers.keys().forEach((key: string) => {
      headers[key] = response.headers.get(key);
    });

    // Calculate response size (approximation)
    const bodyString = typeof response.body === 'string'
      ? response.body
      : JSON.stringify(response.body);
    const size = new Blob([bodyString]).size;

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body: response.body,
      responseTime: Math.round(responseTime),
      size,
      timestamp: new Date()
    };
  }

  private handleError(error: HttpErrorResponse): ResponseError {
    let errorType: ResponseError['type'] = 'unknown';
    let message = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorType = 'network';
      message = `Network error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 0) {
        errorType = 'cors';
        message = 'CORS error or network failure. Check if the API allows requests from this origin.';
      } else if (error.status === 408 || error.status === 504) {
        errorType = 'timeout';
        message = `Request timeout (${error.status})`;
      } else {
        message = `HTTP ${error.status}: ${error.statusText || error.message}`;
      }
    }

    return {
      type: errorType,
      message,
      timestamp: new Date()
    };
  }
}
