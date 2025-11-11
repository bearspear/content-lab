import { Injectable } from '@angular/core';
import { ApiRequest, HttpMethod, BodyType, AuthType } from '../models/request.model';

@Injectable({ providedIn: 'root' })
export class CommandParserService {

  /**
   * Parse a curl, xh, HTTPie, or wget command into an ApiRequest
   */
  parseCommand(command: string): { request: ApiRequest; errors: string[] } {
    const trimmed = command.trim();
    const errors: string[] = [];

    // Detect command type
    if (trimmed.startsWith('curl ')) {
      return this.parseCurl(trimmed, errors);
    } else if (trimmed.startsWith('xh ') || trimmed.startsWith('xhs ')) {
      return this.parseXh(trimmed, errors);
    } else if (trimmed.startsWith('http ') || trimmed.startsWith('https ')) {
      return this.parseHttpie(trimmed, errors);
    } else if (trimmed.startsWith('wget ')) {
      return this.parseWget(trimmed, errors);
    }

    errors.push('Unrecognized command. Must start with: curl, xh, http, https, or wget');
    return { request: this.getEmptyRequest(), errors };
  }

  /**
   * Parse a curl command
   */
  private parseCurl(command: string, errors: string[]): { request: ApiRequest; errors: string[] } {
    const request: ApiRequest = this.getEmptyRequest();

    // Remove 'curl ' prefix and normalize line continuations
    let normalized = command.replace(/^curl\s+/, '').replace(/\\\n\s*/g, ' ').trim();

    try {
      // Extract URL (can be quoted or unquoted)
      const urlMatch = normalized.match(/'([^']+)'|"([^"]+)"|(\S+)/);
      if (urlMatch) {
        request.url = urlMatch[1] || urlMatch[2] || urlMatch[3];
        normalized = normalized.replace(urlMatch[0], '').trim();
      } else {
        errors.push('No URL found in curl command');
        return { request, errors };
      }

      // Parse options
      const tokens = this.tokenize(normalized);
      let i = 0;

      while (i < tokens.length) {
        const token = tokens[i];

        // Method: -X or --request
        if (token === '-X' || token === '--request') {
          request.method = (tokens[++i] || 'GET').toUpperCase() as HttpMethod;
        }
        // Headers: -H or --header
        else if (token === '-H' || token === '--header') {
          const headerValue = tokens[++i];
          if (headerValue) {
            const [key, ...valueParts] = headerValue.split(':');
            const value = valueParts.join(':').trim();
            request.headers.push({ key: key.trim(), value, enabled: true });
          }
        }
        // Data: -d, --data, --data-raw, --data-binary
        else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
          const data = tokens[++i];
          if (data) {
            if (!request.body) {
              request.body = { type: BodyType.RAW, content: '' };
            }
            // Append data (curl allows multiple -d flags)
            request.body.content += (request.body.content ? '&' : '') + data;
          }
          // Auto-set method to POST if not specified
          if (request.method === HttpMethod.GET) {
            request.method = HttpMethod.POST;
          }
        }
        // Form data: -F or --form
        else if (token === '-F' || token === '--form') {
          const formValue = tokens[++i];
          if (formValue) {
            if (!request.body) {
              request.body = { type: BodyType.FORM_DATA, content: '' };
            }
            // Parse form field (key=value or key=@filepath)
            request.body.content += (request.body.content ? '\n' : '') + formValue;
          }
          if (request.method === HttpMethod.GET) {
            request.method = HttpMethod.POST;
          }
        }
        // Basic auth: -u or --user
        else if (token === '-u' || token === '--user') {
          const userPass = tokens[++i];
          if (userPass) {
            const [username, password] = userPass.split(':');
            request.auth = {
              type: AuthType.BASIC,
              basic: { username, password: password || '' }
            };
          }
        }
        // User agent: -A or --user-agent
        else if (token === '-A' || token === '--user-agent') {
          const ua = tokens[++i];
          if (ua) {
            request.headers.push({ key: 'User-Agent', value: ua, enabled: true });
          }
        }
        // Referer: -e or --referer
        else if (token === '-e' || token === '--referer') {
          const referer = tokens[++i];
          if (referer) {
            request.headers.push({ key: 'Referer', value: referer, enabled: true });
          }
        }
        // Cookies: -b or --cookie
        else if (token === '-b' || token === '--cookie') {
          const cookie = tokens[++i];
          if (cookie) {
            request.headers.push({ key: 'Cookie', value: cookie, enabled: true });
          }
        }
        // Timeout: -m or --max-time
        else if (token === '-m' || token === '--max-time') {
          const timeout = parseInt(tokens[++i], 10);
          if (!isNaN(timeout)) {
            request.timeout = timeout * 1000; // Convert to ms
          }
        }
        // Compressed: --compressed
        else if (token === '--compressed') {
          request.headers.push({ key: 'Accept-Encoding', value: 'gzip, deflate', enabled: true });
        }
        // Ignore some common flags
        else if (token === '-L' || token === '--location' || token === '-s' || token === '--silent' ||
                 token === '-S' || token === '--show-error' || token === '-v' || token === '--verbose') {
          // Skip these flags (no value needed)
        }
        // Unknown option
        else if (token.startsWith('-')) {
          errors.push(`Unknown or unsupported option: ${token}`);
        }

        i++;
      }

      // Parse query params from URL
      this.extractQueryParams(request);

      // Detect body content type
      this.detectBodyContentType(request);

    } catch (error: any) {
      errors.push(`Parse error: ${error.message}`);
    }

    return { request, errors };
  }

  /**
   * Parse an xh command (similar to HTTPie but Rust-based)
   */
  private parseXh(command: string, errors: string[]): { request: ApiRequest; errors: string[] } {
    // xh uses HTTPie syntax
    return this.parseHttpie(command.replace(/^xhs?\s+/, 'http '), errors);
  }

  /**
   * Parse an HTTPie command (http/https)
   */
  private parseHttpie(command: string, errors: string[]): { request: ApiRequest; errors: string[] } {
    const request: ApiRequest = this.getEmptyRequest();

    // Remove 'http ' or 'https ' prefix
    let normalized = command.replace(/^https?\s+/, '').trim();

    try {
      const tokens = this.tokenize(normalized);

      // First token might be method
      if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(tokens[0]?.toUpperCase())) {
        request.method = tokens.shift()!.toUpperCase() as HttpMethod;
      }

      // Next token is URL
      if (tokens.length > 0) {
        request.url = tokens.shift()!;
      } else {
        errors.push('No URL found in HTTPie command');
        return { request, errors };
      }

      // Parse remaining tokens (HTTPie format: key:value, key=value, key==value)
      const bodyData: Record<string, any> = {};

      for (const token of tokens) {
        // Header (key:value)
        if (token.includes(':') && !token.includes('=')) {
          const [key, ...valueParts] = token.split(':');
          request.headers.push({
            key: key.trim(),
            value: valueParts.join(':').trim().replace(/^["']|["']$/g, ''),
            enabled: true
          });
        }
        // JSON field (key=value)
        else if (token.includes('=') && !token.includes('==')) {
          const [key, ...valueParts] = token.split('=');
          bodyData[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
        }
        // Query param (key==value)
        else if (token.includes('==')) {
          const [key, ...valueParts] = token.split('==');
          request.queryParams.push({
            key,
            value: valueParts.join('==').replace(/^["']|["']$/g, ''),
            enabled: true
          });
        }
      }

      // Convert body data to JSON
      if (Object.keys(bodyData).length > 0) {
        request.body = {
          type: BodyType.JSON,
          content: JSON.stringify(bodyData, null, 2)
        };
        request.method = request.method === HttpMethod.GET ? HttpMethod.POST : request.method;

        // Add Content-Type if not present
        if (!request.headers.some(h => h.key.toLowerCase() === 'content-type')) {
          request.headers.push({ key: 'Content-Type', value: 'application/json', enabled: true });
        }
      }

      this.extractQueryParams(request);

    } catch (error: any) {
      errors.push(`Parse error: ${error.message}`);
    }

    return { request, errors };
  }

  /**
   * Parse a wget command
   */
  private parseWget(command: string, errors: string[]): { request: ApiRequest; errors: string[] } {
    const request: ApiRequest = this.getEmptyRequest();

    // Remove 'wget ' prefix
    let normalized = command.replace(/^wget\s+/, '').trim();

    try {
      const tokens = this.tokenize(normalized);
      let i = 0;

      while (i < tokens.length) {
        const token = tokens[i];

        // Method: --method
        if (token === '--method') {
          request.method = (tokens[++i] || 'GET').toUpperCase() as HttpMethod;
        }
        // Header: --header
        else if (token === '--header') {
          const headerValue = tokens[++i];
          if (headerValue) {
            const [key, ...valueParts] = headerValue.split(':');
            request.headers.push({ key: key.trim(), value: valueParts.join(':').trim(), enabled: true });
          }
        }
        // Body: --body-data
        else if (token === '--body-data') {
          const data = tokens[++i];
          if (data) {
            request.body = { type: BodyType.RAW, content: data };
          }
        }
        // URL (no flag)
        else if (!token.startsWith('-')) {
          request.url = token;
        }

        i++;
      }

      this.extractQueryParams(request);
      this.detectBodyContentType(request);

    } catch (error: any) {
      errors.push(`Parse error: ${error.message}`);
    }

    return { request, errors };
  }

  /**
   * Tokenize command string respecting quotes and escapes
   */
  private tokenize(command: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let escaped = false;

    for (let i = 0; i < command.length; i++) {
      const char = command[i];

      if (escaped) {
        current += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote;
        continue;
      }

      if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote;
        continue;
      }

      if (char === ' ' && !inSingleQuote && !inDoubleQuote) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        continue;
      }

      current += char;
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Extract query parameters from URL into separate fields
   */
  private extractQueryParams(request: ApiRequest): void {
    try {
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        request.queryParams.push({ key, value, enabled: true });
      });
      // Remove query string from URL
      request.url = url.origin + url.pathname;
    } catch {
      // Invalid URL, skip parsing
    }
  }

  /**
   * Auto-detect body content type from content
   */
  private detectBodyContentType(request: ApiRequest): void {
    if (!request.body) return;

    const content = request.body.content as string;

    // Try to parse as JSON
    try {
      JSON.parse(content);
      request.body.type = BodyType.JSON;
      request.body.contentType = 'application/json';

      // Add Content-Type header if not present
      if (!request.headers.some(h => h.key.toLowerCase() === 'content-type')) {
        request.headers.push({ key: 'Content-Type', value: 'application/json', enabled: true });
      }
      return;
    } catch {}

    // Check for XML
    if (content.trim().startsWith('<')) {
      request.body.type = BodyType.XML;
      request.body.contentType = 'application/xml';

      if (!request.headers.some(h => h.key.toLowerCase() === 'content-type')) {
        request.headers.push({ key: 'Content-Type', value: 'application/xml', enabled: true });
      }
      return;
    }

    // Check for form data (key=value&key=value)
    if (/^[\w-]+=.+(&[\w-]+=.+)*$/.test(content)) {
      request.body.type = BodyType.FORM_URLENCODED;
      request.body.contentType = 'application/x-www-form-urlencoded';

      if (!request.headers.some(h => h.key.toLowerCase() === 'content-type')) {
        request.headers.push({ key: 'Content-Type', value: 'application/x-www-form-urlencoded', enabled: true });
      }
    }
  }

  /**
   * Get empty request template
   */
  private getEmptyRequest(): ApiRequest {
    return {
      method: HttpMethod.GET,
      url: '',
      queryParams: [],
      headers: [],
      body: undefined,
      auth: undefined
    };
  }
}
