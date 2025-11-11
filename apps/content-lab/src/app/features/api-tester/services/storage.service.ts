import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Collection, SavedRequest, HistoryEntry, CollectionFolder } from '../models/collection.model';
import { ApiRequest } from '../models/request.model';
import { ApiResponse } from '../models/response.model';

const STORAGE_KEYS = {
  COLLECTIONS: 'api-tester-collections',
  HISTORY: 'api-tester-history',
};

const MAX_HISTORY_ENTRIES = 50;

@Injectable({ providedIn: 'root' })
export class StorageService {
  private collectionsSubject = new BehaviorSubject<Collection[]>([]);
  private historySubject = new BehaviorSubject<HistoryEntry[]>([]);

  collections$ = this.collectionsSubject.asObservable();
  history$ = this.historySubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  // Collections Management
  getCollections(): Collection[] {
    return this.collectionsSubject.value;
  }

  createCollection(name: string, description?: string): Collection {
    const collection: Collection = {
      id: this.generateId(),
      name,
      description,
      folders: [],
      requests: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collections = [...this.collectionsSubject.value, collection];
    this.saveCollections(collections);
    return collection;
  }

  updateCollection(id: string, updates: Partial<Collection>): void {
    const collections = this.collectionsSubject.value.map(col =>
      col.id === id ? { ...col, ...updates, updatedAt: new Date() } : col
    );
    this.saveCollections(collections);
  }

  deleteCollection(id: string): void {
    const collections = this.collectionsSubject.value.filter(col => col.id !== id);
    this.saveCollections(collections);
  }

  // Folder Management
  createFolder(collectionId: string, name: string, parentId?: string): CollectionFolder {
    const folder: CollectionFolder = {
      id: this.generateId(),
      name,
      parentId,
      collapsed: false,
    };

    const collections = this.collectionsSubject.value.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          folders: [...col.folders, folder],
          updatedAt: new Date(),
        };
      }
      return col;
    });

    this.saveCollections(collections);
    return folder;
  }

  deleteFolder(collectionId: string, folderId: string): void {
    const collections = this.collectionsSubject.value.map(col => {
      if (col.id === collectionId) {
        // Remove folder and all requests in it
        return {
          ...col,
          folders: col.folders.filter(f => f.id !== folderId && f.parentId !== folderId),
          requests: col.requests.filter(r => r.folderId !== folderId),
          updatedAt: new Date(),
        };
      }
      return col;
    });

    this.saveCollections(collections);
  }

  toggleFolder(collectionId: string, folderId: string): void {
    const collections = this.collectionsSubject.value.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          folders: col.folders.map(f =>
            f.id === folderId ? { ...f, collapsed: !f.collapsed } : f
          ),
        };
      }
      return col;
    });

    this.saveCollections(collections);
  }

  // Saved Requests Management
  saveRequest(collectionId: string, request: ApiRequest, name: string, folderId?: string): SavedRequest {
    const savedRequest: SavedRequest = {
      ...request,
      id: request.id || this.generateId(),
      name,
      folderId,
      collectionId,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    const collections = this.collectionsSubject.value.map(col => {
      if (col.id === collectionId) {
        // Update if exists, otherwise add
        const existingIndex = col.requests.findIndex(r => r.id === savedRequest.id);
        const requests = existingIndex >= 0
          ? col.requests.map((r, i) => i === existingIndex ? savedRequest : r)
          : [...col.requests, savedRequest];

        return {
          ...col,
          requests,
          updatedAt: new Date(),
        };
      }
      return col;
    });

    this.saveCollections(collections);
    return savedRequest;
  }

  updateSavedRequest(collectionId: string, requestId: string, updates: Partial<SavedRequest>): void {
    const collections = this.collectionsSubject.value.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: col.requests.map(r =>
            r.id === requestId ? { ...r, ...updates, lastUsed: new Date() } : r
          ),
          updatedAt: new Date(),
        };
      }
      return col;
    });

    this.saveCollections(collections);
  }

  deleteSavedRequest(collectionId: string, requestId: string): void {
    const collections = this.collectionsSubject.value.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: col.requests.filter(r => r.id !== requestId),
          updatedAt: new Date(),
        };
      }
      return col;
    });

    this.saveCollections(collections);
  }

  getSavedRequest(collectionId: string, requestId: string): SavedRequest | undefined {
    const collection = this.collectionsSubject.value.find(c => c.id === collectionId);
    return collection?.requests.find(r => r.id === requestId);
  }

  // History Management
  addToHistory(request: ApiRequest, response?: ApiResponse): void {
    const entry: HistoryEntry = {
      id: this.generateId(),
      request,
      response: response ? {
        status: response.status,
        statusText: response.statusText,
        responseTime: response.responseTime,
        size: response.size,
      } : undefined,
      timestamp: new Date(),
    };

    const history = [entry, ...this.historySubject.value];

    // Limit to MAX_HISTORY_ENTRIES
    const limitedHistory = history.slice(0, MAX_HISTORY_ENTRIES);
    this.saveHistory(limitedHistory);
  }

  clearHistory(): void {
    this.saveHistory([]);
  }

  deleteHistoryEntry(id: string): void {
    const history = this.historySubject.value.filter(e => e.id !== id);
    this.saveHistory(history);
  }

  getHistory(): HistoryEntry[] {
    return this.historySubject.value;
  }

  // Storage Helpers
  private saveCollections(collections: Collection[]): void {
    this.collectionsSubject.next(collections);
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
    } catch (error) {
      console.error('Failed to save collections to localStorage:', error);
    }
  }

  private saveHistory(history: HistoryEntry[]): void {
    this.historySubject.next(history);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      // Load collections
      const collectionsJson = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
      if (collectionsJson) {
        const collections = JSON.parse(collectionsJson, this.dateReviver);
        this.collectionsSubject.next(collections);
      }

      // Load history
      const historyJson = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (historyJson) {
        const history = JSON.parse(historyJson, this.dateReviver);
        this.historySubject.next(history);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  // Helper to revive Date objects from JSON
  private dateReviver(key: string, value: any): any {
    const dateFields = ['createdAt', 'updatedAt', 'lastUsed', 'timestamp'];
    if (dateFields.includes(key) && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // Export/Import
  exportCollections(): string {
    return JSON.stringify(this.collectionsSubject.value, null, 2);
  }

  importCollections(json: string): void {
    try {
      const collections = JSON.parse(json, this.dateReviver);
      if (Array.isArray(collections)) {
        this.saveCollections(collections);
      }
    } catch (error) {
      console.error('Failed to import collections:', error);
      throw new Error('Invalid collections format');
    }
  }
}
