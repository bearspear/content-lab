import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type MonacoTheme = 'vs' | 'vs-dark';

/**
 * Service to manage Monaco editor themes globally
 * Since monaco.editor.setTheme() is global, this service coordinates
 * theme changes across all Monaco editor instances
 */
@Injectable({
  providedIn: 'root'
})
export class MonacoThemeService {
  private currentThemeSubject = new BehaviorSubject<MonacoTheme>('vs-dark');
  private componentPreferences = new Map<string, MonacoTheme>();

  /**
   * Observable of the current global Monaco theme
   */
  public currentTheme$: Observable<MonacoTheme> = this.currentThemeSubject.asObservable();

  /**
   * Get the current global Monaco theme
   */
  getCurrentTheme(): MonacoTheme {
    return this.currentThemeSubject.value;
  }

  /**
   * Set the global Monaco theme
   * This will affect all Monaco editor instances
   */
  setTheme(theme: MonacoTheme): void {
    this.currentThemeSubject.next(theme);

    // Apply theme globally to all Monaco editors
    try {
      // Dynamically import monaco if available
      import('monaco-editor').then(monaco => {
        monaco.editor.setTheme(theme);
      }).catch(() => {
        // Monaco not loaded yet, theme will be applied when editors initialize
      });
    } catch {
      // Monaco not available
    }
  }

  /**
   * Register a component's theme preference
   * @param componentId Unique identifier for the component
   * @param theme Preferred theme for this component
   */
  registerComponentPreference(componentId: string, theme: MonacoTheme): void {
    this.componentPreferences.set(componentId, theme);
  }

  /**
   * Get a component's theme preference
   * @param componentId Unique identifier for the component
   * @returns The component's preferred theme, or the current global theme if no preference set
   */
  getComponentPreference(componentId: string): MonacoTheme {
    return this.componentPreferences.get(componentId) || this.getCurrentTheme();
  }

  /**
   * Apply a component's preferred theme when it becomes active
   * @param componentId Unique identifier for the component
   */
  applyComponentTheme(componentId: string): void {
    const preferredTheme = this.componentPreferences.get(componentId);
    if (preferredTheme) {
      this.setTheme(preferredTheme);
    }
  }

  /**
   * Update a component's theme preference and optionally apply it
   * @param componentId Unique identifier for the component
   * @param theme New preferred theme
   * @param applyNow Whether to apply the theme immediately (default: true)
   */
  updateComponentPreference(componentId: string, theme: MonacoTheme, applyNow: boolean = true): void {
    this.componentPreferences.set(componentId, theme);
    if (applyNow) {
      this.setTheme(theme);
    }
  }
}
