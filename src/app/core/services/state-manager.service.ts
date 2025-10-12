import { Injectable } from '@angular/core';

/**
 * State management service for preserving tool states across navigation
 * Uses localStorage for persistence
 */
@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private readonly STATE_PREFIX = 'tool_state_';

  /**
   * Save state for a specific tool
   */
  saveState<T>(toolId: string, state: T): void {
    try {
      const key = this.STATE_PREFIX + toolId;
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save state for ${toolId}:`, error);
    }
  }

  /**
   * Load state for a specific tool
   */
  loadState<T>(toolId: string): T | null {
    try {
      const key = this.STATE_PREFIX + toolId;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn(`Failed to load state for ${toolId}:`, error);
      return null;
    }
  }

  /**
   * Clear state for a specific tool
   */
  clearState(toolId: string): void {
    try {
      const key = this.STATE_PREFIX + toolId;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear state for ${toolId}:`, error);
    }
  }

  /**
   * Clear all tool states
   */
  clearAllStates(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STATE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all states:', error);
    }
  }
}
