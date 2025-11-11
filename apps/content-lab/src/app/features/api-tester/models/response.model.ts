export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  responseTime: number;
  size: number;
  timestamp: Date;
  requestId?: string;
}

export interface ResponseError {
  message: string;
  type: 'network' | 'timeout' | 'abort' | 'cors' | 'unknown';
  timestamp: Date;
}

export type ApiResult = ApiResponse | ResponseError;

export function isResponseError(result: ApiResult): result is ResponseError {
  return 'type' in result && 'message' in result;
}
