export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParam {
  key: string;
  value: string;
  enabled: boolean;
}

export enum BodyType {
  NONE = 'none',
  JSON = 'json',
  XML = 'xml',
  FORM_URLENCODED = 'form-urlencoded',
  FORM_DATA = 'form-data',
  RAW = 'raw',
  BINARY = 'binary'
}

export interface RequestBody {
  type: BodyType;
  content: string | FormData;
  contentType?: string;
}

export interface ApiRequest {
  id?: string;
  name?: string;
  method: HttpMethod;
  url: string;
  queryParams: QueryParam[];
  headers: Header[];
  body?: RequestBody;
  auth?: AuthConfig;
  timeout?: number;
}

export interface AuthConfig {
  type: AuthType;
  bearer?: { token: string };
  basic?: { username: string; password: string };
  apiKey?: { key: string; value: string; addTo: 'header' | 'query' };
  custom?: Header[];
}

export enum AuthType {
  NONE = 'none',
  BEARER = 'bearer',
  BASIC = 'basic',
  API_KEY = 'api-key',
  OAUTH2 = 'oauth2',
  CUSTOM = 'custom'
}
