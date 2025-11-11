import { ApiRequest } from './request.model';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  folders: CollectionFolder[];
  requests: SavedRequest[];
  environment?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionFolder {
  id: string;
  name: string;
  parentId?: string;
  collapsed?: boolean;
}

export interface SavedRequest extends ApiRequest {
  id: string;
  name: string;
  folderId?: string;
  collectionId?: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface HistoryEntry {
  id: string;
  request: ApiRequest;
  response?: {
    status: number;
    statusText: string;
    responseTime: number;
    size: number;
  };
  timestamp: Date;
}
