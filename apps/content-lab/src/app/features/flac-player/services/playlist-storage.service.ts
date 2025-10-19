import { Injectable } from '@angular/core';

/**
 * Serializable player state (for localStorage)
 * Note: Cannot store File objects or Blob URLs in localStorage
 */
export interface PlayerState {
  volume: number;
  lastTrackIndex: number;
  lastPosition: number;
  timestamp: number;
}

/**
 * Playlist Storage Service
 *
 * Manages persistence of player state to browser localStorage.
 *
 * Limitations:
 * - Cannot store File objects (browser security)
 * - Cannot store Blob URLs (session-specific)
 * - Users must re-upload files after page reload
 *
 * What IS persisted:
 * - Volume level
 * - Last played track index
 * - Playback position
 */
@Injectable({
  providedIn: 'root'
})
export class PlaylistStorageService {
  private readonly STORAGE_KEY = 'flac-player-state';

  /**
   * Save player state to localStorage
   */
  savePlayerState(state: Partial<PlayerState>): void {
    try {
      const currentState = this.loadPlayerState();
      const newState: PlayerState = {
        ...currentState,
        ...state,
        timestamp: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newState));
      console.log('💾 Player state saved:', newState);
    } catch (error) {
      console.warn('Failed to save player state:', error);
    }
  }

  /**
   * Load player state from localStorage
   */
  loadPlayerState(): PlayerState {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return this.getDefaultState();
      }

      const state = JSON.parse(data) as PlayerState;
      console.log('📂 Player state loaded:', state);
      return state;
    } catch (error) {
      console.warn('Failed to load player state:', error);
      return this.getDefaultState();
    }
  }

  /**
   * Clear saved player state
   */
  clearPlayerState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Player state cleared');
    } catch (error) {
      console.warn('Failed to clear player state:', error);
    }
  }

  /**
   * Get default player state
   */
  private getDefaultState(): PlayerState {
    return {
      volume: 70,
      lastTrackIndex: -1,
      lastPosition: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Check if state is stale (older than 7 days)
   */
  isStateStale(state: PlayerState): boolean {
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - state.timestamp > SEVEN_DAYS;
  }
}
