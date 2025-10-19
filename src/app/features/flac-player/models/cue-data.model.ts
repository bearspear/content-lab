/**
 * CUE Sheet Data Models
 *
 * These interfaces represent the structure of CUE sheet files,
 * which contain track information for multi-track audio albums.
 */

export interface CueData {
  /** Album-level metadata */
  album: CueAlbumInfo;
  /** Referenced audio filename from FILE command */
  filename: string | null;
  /** List of tracks defined in the CUE sheet */
  tracks: CueTrack[];
}

export interface CueAlbumInfo {
  /** Album title from TITLE command */
  title?: string;
  /** Album artist from PERFORMER command */
  artist?: string;
  /** Genre from REM GENRE command */
  genre?: string;
  /** Year from REM DATE command */
  year?: string;
  /** Any additional REM comments */
  comments?: string[];
}

export interface CueTrack {
  /** Track number (1-based) */
  trackNumber: number;
  /** Track title from TITLE command */
  title: string | null;
  /** Track performer from PERFORMER command */
  performer: string | null;
  /** Start time in seconds (from INDEX 01) */
  startTime: number;
  /** End time in seconds (calculated from next track's start) */
  endTime?: number;
  /** Track duration in seconds (endTime - startTime) */
  duration?: number;
  /** ISRC code if present */
  isrc?: string;
}

/**
 * Helper type for CUE parsing state machine
 */
export interface CueParseState {
  /** Current track being parsed */
  currentTrack: Partial<CueTrack> | null;
  /** Album info being built */
  album: CueAlbumInfo;
  /** Completed tracks */
  tracks: CueTrack[];
}
