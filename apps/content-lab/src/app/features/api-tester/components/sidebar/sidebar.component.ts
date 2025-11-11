import { Component, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { Collection, SavedRequest, HistoryEntry, CollectionFolder } from '../../models/collection.model';
import { ApiRequest } from '../../models/request.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Output() requestSelected = new EventEmitter<ApiRequest>();
  @Output() requestDeleted = new EventEmitter<{ collectionId: string; requestId: string }>();

  private storageService = inject(StorageService);

  activeTab: 'collections' | 'history' = 'collections';
  collections: Collection[] = [];
  history: HistoryEntry[] = [];

  showNewCollectionModal = false;
  showNewFolderModal = false;
  showSaveRequestModal = false;
  newCollectionName = '';
  newCollectionDescription = '';
  newFolderName = '';
  selectedCollectionForFolder?: string;
  selectedFolderForFolder?: string;

  ngOnInit(): void {
    // Subscribe to collections and history
    this.storageService.collections$.subscribe(collections => {
      this.collections = collections;
    });

    this.storageService.history$.subscribe(history => {
      this.history = history;
    });
  }

  // Collection Management
  onCreateCollection(): void {
    if (this.newCollectionName.trim()) {
      this.storageService.createCollection(
        this.newCollectionName,
        this.newCollectionDescription || undefined
      );
      this.newCollectionName = '';
      this.newCollectionDescription = '';
      this.showNewCollectionModal = false;
    }
  }

  onDeleteCollection(collectionId: string): void {
    if (confirm('Delete this collection and all its requests?')) {
      this.storageService.deleteCollection(collectionId);
    }
  }

  // Folder Management
  onShowNewFolderModal(collectionId: string, parentId?: string): void {
    this.selectedCollectionForFolder = collectionId;
    this.selectedFolderForFolder = parentId;
    this.showNewFolderModal = true;
  }

  onCreateFolder(): void {
    if (this.newFolderName.trim() && this.selectedCollectionForFolder) {
      this.storageService.createFolder(
        this.selectedCollectionForFolder,
        this.newFolderName,
        this.selectedFolderForFolder
      );
      this.newFolderName = '';
      this.showNewFolderModal = false;
    }
  }

  onDeleteFolder(collectionId: string, folderId: string): void {
    if (confirm('Delete this folder and all its requests?')) {
      this.storageService.deleteFolder(collectionId, folderId);
    }
  }

  onToggleFolder(collectionId: string, folderId: string): void {
    this.storageService.toggleFolder(collectionId, folderId);
  }

  // Request Management
  onRequestClick(request: SavedRequest): void {
    this.requestSelected.emit(request);
  }

  onDeleteRequest(collectionId: string, requestId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this saved request?')) {
      this.storageService.deleteSavedRequest(collectionId, requestId);
      this.requestDeleted.emit({ collectionId, requestId });
    }
  }

  // History Management
  onHistoryClick(entry: HistoryEntry): void {
    this.requestSelected.emit(entry.request);
  }

  onDeleteHistoryEntry(id: string, event: Event): void {
    event.stopPropagation();
    this.storageService.deleteHistoryEntry(id);
  }

  onClearHistory(): void {
    if (confirm('Clear all history?')) {
      this.storageService.clearHistory();
    }
  }

  // Helpers
  getRequestsInFolder(collection: Collection, folderId?: string): SavedRequest[] {
    return collection.requests.filter(r => r.folderId === folderId);
  }

  getFoldersInFolder(collection: Collection, parentId?: string): CollectionFolder[] {
    return collection.folders.filter(f => f.parentId === parentId);
  }

  getMethodColor(method: string): string {
    const colors: Record<string, string> = {
      GET: '#61affe',
      POST: '#49cc90',
      PUT: '#fca130',
      PATCH: '#50e3c2',
      DELETE: '#f93e3e',
      HEAD: '#9012fe',
      OPTIONS: '#0d5aa7',
    };
    return colors[method] || '#999';
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}
