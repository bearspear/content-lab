import { Injectable } from '@angular/core';
import * as mm from 'music-metadata-browser';

/**
 * Track Metadata Interface
 * Extracted from audio file metadata tags
 */
export interface TrackMetadata {
  title: string;
  artist: string;
  album: string;
  year?: number;
  genre?: string;
  trackNumber?: number;
  totalTracks?: number;
  duration?: number;
  albumArt?: string; // Blob URL for album artwork
  bitrate?: number;
  sampleRate?: number;
  codec?: string;
}

/**
 * Metadata Service
 *
 * Extracts metadata from audio files (FLAC, MP3, WAV, etc.)
 * using the music-metadata-browser library.
 *
 * Supports:
 * - ID3 tags (MP3)
 * - Vorbis Comments (FLAC, OGG)
 * - iTunes metadata (M4A)
 * - Album artwork extraction
 */
@Injectable({
  providedIn: 'root'
})
export class MetadataService {

  /**
   * Extract metadata from an audio file
   */
  async extractMetadata(file: File): Promise<TrackMetadata> {
    try {
      console.log('🎵 Extracting metadata from:', file.name, 'Size:', file.size, 'Type:', file.type);
      const metadata = await mm.parseBlob(file);

      console.log('✅ Metadata extracted successfully:', {
        title: metadata.common.title,
        artist: metadata.common.artist,
        album: metadata.common.album,
        hasArt: !!metadata.common.picture?.[0]
      });

      return {
        title: metadata.common.title || this.extractTitleFromFilename(file.name),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        year: metadata.common.year,
        genre: metadata.common.genre?.[0],
        trackNumber: metadata.common.track?.no ?? undefined,
        totalTracks: metadata.common.track?.of ?? undefined,
        duration: metadata.format.duration,
        bitrate: metadata.format.bitrate,
        sampleRate: metadata.format.sampleRate,
        codec: metadata.format.codec,
        albumArt: await this.extractAlbumArt(metadata)
      };
    } catch (error) {
      console.error('❌ Metadata extraction FAILED for:', file.name);
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return this.createFallbackMetadata(file);
    }
  }

  /**
   * Extract album artwork from metadata
   * Returns a blob URL that can be used in <img> src
   */
  private async extractAlbumArt(metadata: mm.IAudioMetadata): Promise<string | undefined> {
    try {
      const picture = metadata.common.picture?.[0];

      if (picture) {
        // Create blob from picture data
        const blob = new Blob([picture.data], { type: picture.format });
        return URL.createObjectURL(blob);
      }

      return undefined;
    } catch (error) {
      console.warn('Failed to extract album art:', error);
      return undefined;
    }
  }

  /**
   * Extract title from filename
   * Removes file extension and track numbers
   */
  private extractTitleFromFilename(filename: string): string {
    return filename
      .replace(/\.(flac|mp3|wav|ogg|m4a|aac)$/i, '')
      .replace(/^[\d\s-]+/, '') // Remove leading track numbers like "01 - "
      .trim();
  }

  /**
   * Create fallback metadata when extraction fails
   */
  private createFallbackMetadata(file: File): TrackMetadata {
    return {
      title: this.extractTitleFromFilename(file.name),
      artist: 'Unknown Artist',
      album: 'Unknown Album'
    };
  }

  /**
   * Batch extract metadata from multiple files
   * Useful for playlist imports
   */
  async extractBatchMetadata(files: File[]): Promise<TrackMetadata[]> {
    const promises = files.map(file => this.extractMetadata(file));
    return Promise.all(promises);
  }

  /**
   * Check if a file type supports metadata extraction
   */
  supportsMetadata(filename: string): boolean {
    const supported = ['.flac', '.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return supported.includes(ext);
  }

  /**
   * Revoke album art blob URL to free memory
   */
  revokeAlbumArt(albumArtUrl: string | undefined): void {
    if (albumArtUrl && albumArtUrl.startsWith('blob:')) {
      URL.revokeObjectURL(albumArtUrl);
    }
  }
}
