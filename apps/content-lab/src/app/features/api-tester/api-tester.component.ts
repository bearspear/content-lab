import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ApiRequest, HttpMethod } from './models/request.model';
import { ApiResponse, ResponseError } from './models/response.model';
import { Collection } from './models/collection.model';
import { ApiRequestService } from './services/api-request.service';
import { StorageService } from './services/storage.service';
import { RequestBuilderComponent } from './components/request-builder/request-builder.component';
import { ResponseViewerComponent } from './components/response-viewer/response-viewer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RequestBuilderComponent,
    ResponseViewerComponent,
    SidebarComponent
  ],
  templateUrl: './api-tester.component.html',
  styleUrls: ['./api-tester.component.scss']
})
export class ApiTesterComponent implements OnInit {
  private requestService = inject(ApiRequestService);
  private storageService = inject(StorageService);

  currentRequest$ = new BehaviorSubject<ApiRequest>(this.getDefaultRequest());
  currentResponse$ = new BehaviorSubject<ApiResponse | ResponseError | null>(null);
  isLoading$ = new BehaviorSubject<boolean>(false);
  sidebarCollapsed = false;

  // Save modal
  showSaveModal = false;
  saveRequestName = '';
  saveSelectedCollection = '';
  saveSelectedFolder = '';
  collections: Collection[] = [];

  ngOnInit(): void {
    // Subscribe to collections
    this.storageService.collections$.subscribe(collections => {
      this.collections = collections;
      // Auto-select first collection if available
      if (collections.length > 0 && !this.saveSelectedCollection) {
        this.saveSelectedCollection = collections[0].id;
      }
    });
  }

  onRequestChange(request: ApiRequest): void {
    this.currentRequest$.next(request);
  }

  onSendRequest(request: ApiRequest): void {
    this.isLoading$.next(true);
    this.currentResponse$.next(null);

    this.requestService.executeRequest(request).subscribe({
      next: (response) => {
        this.currentResponse$.next(response);
        this.isLoading$.next(false);

        // Add to history
        this.storageService.addToHistory(request, response);
      },
      error: (error: ResponseError) => {
        this.currentResponse$.next(error);
        this.isLoading$.next(false);

        // Add to history even if error
        this.storageService.addToHistory(request);
      }
    });
  }

  onRequestSelected(request: ApiRequest): void {
    this.currentRequest$.next(request);
  }

  onSaveRequest(request: ApiRequest): void {
    // Generate default name from URL
    try {
      const url = new URL(request.url);
      this.saveRequestName = `${request.method} ${url.pathname}`;
    } catch {
      this.saveRequestName = `${request.method} Request`;
    }

    this.showSaveModal = true;
  }

  onConfirmSave(): void {
    if (!this.saveRequestName.trim() || !this.saveSelectedCollection) {
      return;
    }

    const request = this.currentRequest$.value;
    this.storageService.saveRequest(
      this.saveSelectedCollection,
      request,
      this.saveRequestName,
      this.saveSelectedFolder || undefined
    );

    // Reset and close
    this.showSaveModal = false;
    this.saveRequestName = '';
    this.saveSelectedFolder = '';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  getSelectedCollectionFolders(): any[] {
    if (!this.saveSelectedCollection) {
      return [];
    }
    const collection = this.collections.find(c => c.id === this.saveSelectedCollection);
    return collection?.folders || [];
  }

  private getDefaultRequest(): ApiRequest {
    return {
      method: HttpMethod.GET,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      queryParams: [],
      headers: [
        { key: 'Accept', value: 'application/json', enabled: true }
      ]
    };
  }
}
