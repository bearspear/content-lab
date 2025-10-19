import { Injectable } from '@angular/core';

/**
 * State management service for preserving tool states across navigation
 * Uses localStorage for persistence with comprehensive error handling
 */
@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private readonly STATE_PREFIX = 'tool_state_';
  private readonly MAX_RETRY_ATTEMPTS = 2;
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
  }

  /**
   * Check if localStorage is available and working
   */
  private checkLocalStorageAvailability(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  /**
   * Save state for a specific tool with retry logic
   * @returns true if save was successful, false otherwise
   */
  saveState<T>(toolId: string, state: T): boolean {
    if (!this.isLocalStorageAvailable) {
      console.warn(`Cannot save state for ${toolId}: localStorage unavailable`);
      return false;
    }

    return this.saveStateWithRetry(toolId, state, 0);
  }

  /**
   * Internal method to save state with retry logic
   */
  private saveStateWithRetry<T>(toolId: string, state: T, attempt: number): boolean {
    try {
      const key = this.STATE_PREFIX + toolId;
      const serialized = JSON.stringify(state);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // Handle quota exceeded error
      if (this.isQuotaExceededError(error)) {
        console.warn(`localStorage quota exceeded for ${toolId}, attempting cleanup...`);

        if (attempt < this.MAX_RETRY_ATTEMPTS) {
          // Try to free up space by removing oldest states
          if (this.cleanupOldStates()) {
            // Retry after cleanup
            return this.saveStateWithRetry(toolId, state, attempt + 1);
          }
        }

        console.error(`Failed to save state for ${toolId}: quota exceeded after cleanup`);
        return false;
      }

      // Handle JSON serialization errors
      if (error instanceof TypeError || error instanceof RangeError) {
        console.error(`Failed to serialize state for ${toolId}:`, error);
        return false;
      }

      // Handle other errors
      console.error(`Failed to save state for ${toolId}:`, error);
      return false;
    }
  }

  /**
   * Check if error is a quota exceeded error
   */
  private isQuotaExceededError(error: any): boolean {
    return (
      error instanceof DOMException &&
      (
        // Modern browsers
        error.name === 'QuotaExceededError' ||
        // Legacy browsers
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )
    );
  }

  /**
   * Clean up old states to free localStorage space
   * @returns true if cleanup was successful
   */
  private cleanupOldStates(): boolean {
    try {
      const keys = Object.keys(localStorage);
      const toolKeys = keys.filter(key => key.startsWith(this.STATE_PREFIX));

      // Remove oldest half of stored states
      const keysToRemove = toolKeys.slice(0, Math.ceil(toolKeys.length / 2));

      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove key ${key}:`, error);
        }
      });

      return keysToRemove.length > 0;
    } catch (error) {
      console.error('Failed to cleanup old states:', error);
      return false;
    }
  }

  /**
   * Load state for a specific tool
   * @returns the state if successful, null otherwise
   */
  loadState<T>(toolId: string): T | null {
    if (!this.isLocalStorageAvailable) {
      return null;
    }

    try {
      const key = this.STATE_PREFIX + toolId;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      // Parse JSON with error handling
      try {
        return JSON.parse(data) as T;
      } catch (parseError) {
        console.error(`Failed to parse state for ${toolId}:`, parseError);
        // Clear corrupted state
        this.clearState(toolId);
        return null;
      }
    } catch (error) {
      console.error(`Failed to load state for ${toolId}:`, error);
      return null;
    }
  }

  /**
   * Clear state for a specific tool
   * @returns true if clear was successful, false otherwise
   */
  clearState(toolId: string): boolean {
    if (!this.isLocalStorageAvailable) {
      return false;
    }

    try {
      const key = this.STATE_PREFIX + toolId;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to clear state for ${toolId}:`, error);
      return false;
    }
  }

  /**
   * Clear all tool states
   * @returns true if all clears were successful, false otherwise
   */
  clearAllStates(): boolean {
    if (!this.isLocalStorageAvailable) {
      return false;
    }

    try {
      const keys = Object.keys(localStorage);
      const toolKeys = keys.filter(key => key.startsWith(this.STATE_PREFIX));

      let allSuccess = true;
      toolKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error(`Failed to remove key ${key}:`, error);
          allSuccess = false;
        }
      });

      return allSuccess;
    } catch (error) {
      console.error('Failed to clear all states:', error);
      return false;
    }
  }

  /**
   * Get the size of stored state for a tool (in bytes)
   */
  getStateSize(toolId: string): number {
    if (!this.isLocalStorageAvailable) {
      return 0;
    }

    try {
      const key = this.STATE_PREFIX + toolId;
      const data = localStorage.getItem(key);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error(`Failed to get state size for ${toolId}:`, error);
      return 0;
    }
  }

  /**
   * Get total size of all stored states (in bytes)
   */
  getTotalStateSize(): number {
    if (!this.isLocalStorageAvailable) {
      return 0;
    }

    try {
      const keys = Object.keys(localStorage);
      const toolKeys = keys.filter(key => key.startsWith(this.STATE_PREFIX));

      return toolKeys.reduce((total, key) => {
        try {
          const data = localStorage.getItem(key);
          return total + (data ? new Blob([data]).size : 0);
        } catch (error) {
          return total;
        }
      }, 0);
    } catch (error) {
      console.error('Failed to calculate total state size:', error);
      return 0;
    }
  }

  /**
   * Check if localStorage is currently available
   */
  isStorageAvailable(): boolean {
    return this.isLocalStorageAvailable;
  }
}
