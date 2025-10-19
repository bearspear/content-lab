import { Injectable } from '@angular/core';
import { CueData, CueTrack, CueAlbumInfo } from '../models/cue-data.model';

/**
 * CUE Parser Service
 *
 * Parses CUE sheet files to extract album and track information.
 * CUE sheets are text files that define track boundaries for multi-track audio files.
 *
 * Format reference: https://en.wikipedia.org/wiki/Cue_sheet_(computing)
 */
@Injectable({
  providedIn: 'root'
})
export class CueParserService {

  /**
   * Parse a CUE file and extract album and track information
   */
  async parse(cueFile: File): Promise<CueData> {
    const text = await cueFile.text();
    return this.parseText(text);
  }

  /**
   * Parse CUE sheet text content
   */
  parseText(cueText: string): CueData {
    // Normalize line endings and split into lines
    const lines = cueText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('REM COMMENT')); // Filter empty lines and general comments

    const result: CueData = {
      album: {
        comments: []
      },
      filename: null,
      tracks: []
    };

    let currentTrack: Partial<CueTrack> | null = null;
    let inAlbumSection = true; // Track whether we're in album metadata or track metadata

    for (const line of lines) {
      // Album-level metadata (before any TRACK command)
      if (inAlbumSection) {
        if (line.startsWith('PERFORMER')) {
          result.album.artist = this.extractQuoted(line) ?? undefined;
        } else if (line.startsWith('TITLE')) {
          result.album.title = this.extractQuoted(line) ?? undefined;
        } else if (line.startsWith('REM GENRE')) {
          result.album.genre = this.extractAfter(line, 'REM GENRE');
        } else if (line.startsWith('REM DATE')) {
          result.album.year = this.extractAfter(line, 'REM DATE');
        } else if (line.startsWith('REM')) {
          // Store other REM comments
          const comment = this.extractAfter(line, 'REM');
          if (comment) {
            result.album.comments?.push(comment);
          }
        } else if (line.startsWith('FILE')) {
          result.filename = this.extractQuoted(line);
        }
      }

      // TRACK command - start of a new track
      if (line.startsWith('TRACK')) {
        // Save previous track if exists
        if (currentTrack && currentTrack.trackNumber) {
          result.tracks.push(currentTrack as CueTrack);
        }

        inAlbumSection = false; // We're now in track section

        const trackMatch = line.match(/TRACK\s+(\d+)/);
        const trackNum = trackMatch ? parseInt(trackMatch[1], 10) : 0;

        currentTrack = {
          trackNumber: trackNum,
          title: null,
          performer: null,
          startTime: 0
        };
      }

      // Track-level metadata
      else if (currentTrack) {
        if (line.startsWith('TITLE')) {
          currentTrack.title = this.extractQuoted(line);
        } else if (line.startsWith('PERFORMER')) {
          currentTrack.performer = this.extractQuoted(line);
        } else if (line.startsWith('ISRC')) {
          currentTrack.isrc = this.extractAfter(line, 'ISRC');
        } else if (line.startsWith('INDEX 01')) {
          // INDEX 01 is the start point of the track
          const timestampMatch = line.match(/INDEX\s+01\s+([\d:]+)/);
          if (timestampMatch) {
            currentTrack.startTime = this.timestampToSeconds(timestampMatch[1]);
          }
        }
      }
    }

    // Don't forget the last track
    if (currentTrack && currentTrack.trackNumber) {
      result.tracks.push(currentTrack as CueTrack);
    }

    // Calculate end times and durations
    this.calculateTrackDurations(result.tracks);

    return result;
  }

  /**
   * Extract quoted string from a CUE line
   * Example: TITLE "My Song" -> "My Song"
   */
  private extractQuoted(line: string): string | null {
    const match = line.match(/"([^"]*)"/);
    return match ? match[1] : null;
  }

  /**
   * Extract text after a keyword
   * Example: REM GENRE Rock -> "Rock"
   */
  private extractAfter(line: string, keyword: string): string {
    const index = line.indexOf(keyword);
    if (index === -1) return '';

    return line.substring(index + keyword.length).trim().replace(/^["']|["']$/g, '');
  }

  /**
   * Convert CUE timestamp (MM:SS:FF) to seconds
   * FF = frames (1/75th of a second)
   */
  private timestampToSeconds(timestamp: string): number {
    const parts = timestamp.split(':').map(Number);

    if (parts.length !== 3) {
      console.warn('Invalid timestamp format:', timestamp);
      return 0;
    }

    const [minutes, seconds, frames] = parts;

    // Frames are 1/75th of a second (CD audio standard)
    return (minutes * 60) + seconds + (frames / 75);
  }

  /**
   * Calculate end times and durations for all tracks
   * The end time of a track is the start time of the next track
   */
  private calculateTrackDurations(tracks: CueTrack[]): void {
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const nextTrack = tracks[i + 1];

      if (nextTrack) {
        track.endTime = nextTrack.startTime;
        track.duration = track.endTime - track.startTime;
      } else {
        // Last track - we don't know the end time until the audio file is loaded
        track.endTime = undefined;
        track.duration = undefined;
      }
    }
  }

  /**
   * Validate CUE data structure
   */
  validateCueData(cueData: CueData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cueData.filename) {
      errors.push('No audio filename specified in CUE sheet');
    }

    if (cueData.tracks.length === 0) {
      errors.push('No tracks found in CUE sheet');
    }

    // Check for tracks with missing information
    cueData.tracks.forEach((track, index) => {
      if (!track.title) {
        errors.push(`Track ${track.trackNumber}: Missing title`);
      }
      if (track.startTime === undefined || track.startTime < 0) {
        errors.push(`Track ${track.trackNumber}: Invalid start time`);
      }
      // Check track ordering
      if (index > 0 && track.startTime <= cueData.tracks[index - 1].startTime) {
        errors.push(`Track ${track.trackNumber}: Start time must be after previous track`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get album duration from last track's end time
   * (requires audio file to be loaded first)
   */
  calculateAlbumDuration(tracks: CueTrack[]): number {
    if (tracks.length === 0) return 0;

    const lastTrack = tracks[tracks.length - 1];
    return lastTrack.endTime || lastTrack.startTime;
  }
}
