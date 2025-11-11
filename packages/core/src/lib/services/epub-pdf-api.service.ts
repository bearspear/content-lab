/**
 * EPUB to PDF API Service
 * Communicates with the content-lab-server backend API
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, tap } from 'rxjs';
import {
  UploadResponse,
  ParseResponse,
  ConvertResponse,
  JobStatusResponse,
  PresetsResponse,
  DeleteResponse,
  PdfConversionOptions,
  ConversionJob
} from '../models/epub-pdf.model';

@Injectable({
  providedIn: 'root'
})
export class EpubPdfApiService {
  private readonly apiUrl = 'http://localhost:3000/api/epub-pdf';

  constructor(private http: HttpClient) {}

  /**
   * Upload EPUB file
   */
  uploadEpub(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('epub', file);

    return this.http.post<UploadResponse>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Parse EPUB structure
   */
  parseEpub(fileId: string): Observable<ParseResponse> {
    return this.http.post<ParseResponse>(`${this.apiUrl}/parse`, { fileId });
  }

  /**
   * Convert EPUB to PDF
   */
  convertToPdf(
    fileId: string,
    options: PdfConversionOptions
  ): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(`${this.apiUrl}/convert`, {
      fileId,
      options
    });
  }

  /**
   * Preview HTML (generate HTML without PDF conversion)
   */
  previewHtml(
    fileId: string,
    options: PdfConversionOptions
  ): Observable<{ success: boolean; html: string; metadata: any; fileId: string }> {
    return this.http.post<{ success: boolean; html: string; metadata: any; fileId: string }>(
      `${this.apiUrl}/preview-html`,
      { fileId, options }
    );
  }

  /**
   * Convert edited HTML to PDF
   */
  convertHtmlToPdf(
    html: string,
    fileId: string,
    options: PdfConversionOptions
  ): Observable<ConvertResponse> {
    return this.http.post<ConvertResponse>(`${this.apiUrl}/convert-html`, {
      html,
      fileId,
      options
    });
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): Observable<JobStatusResponse> {
    return this.http.get<JobStatusResponse>(`${this.apiUrl}/status/${jobId}`);
  }

  /**
   * Poll job status until complete or failed
   * @param jobId Job ID to poll
   * @param pollInterval Interval in milliseconds (default 2000)
   */
  pollJobStatus(
    jobId: string,
    pollInterval: number = 2000
  ): Observable<JobStatusResponse> {
    return interval(pollInterval).pipe(
      switchMap(() => this.getJobStatus(jobId)),
      takeWhile(
        (response) =>
          response.status !== 'completed' && response.status !== 'failed',
        true // Include last emission
      )
    );
  }

  /**
   * Download PDF
   */
  downloadPdf(jobId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${jobId}`, {
      responseType: 'blob'
    });
  }

  /**
   * Download PDF and trigger browser download
   */
  downloadAndSavePdf(jobId: string, filename: string): Observable<Blob> {
    return this.downloadPdf(jobId).pipe(
      tap((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
      })
    );
  }

  /**
   * Get conversion presets
   */
  getPresets(): Observable<PresetsResponse> {
    return this.http.get<PresetsResponse>(`${this.apiUrl}/presets`);
  }

  /**
   * Delete job and associated files
   */
  deleteJob(jobId: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/job/${jobId}`);
  }

  /**
   * Health check
   */
  healthCheck(): Observable<{ success: boolean; status: string; timestamp: string }> {
    return this.http.get<{ success: boolean; status: string; timestamp: string }>(
      'http://localhost:3000/api/health'
    );
  }
}
