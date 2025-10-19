import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type MonacoTheme = 'vs' | 'vs-dark';

/**
 * Service to manage global Monaco editor theme
 *
 * IMPORTANT: Monaco's setTheme() is global and affects ALL editor instances.
 * This service manages a global theme that all Monaco components use.
 */
@Injectable({
  providedIn: 'root'
})
export class MonacoThemeService {
  private readonly GLOBAL_THEME_KEY = 'app-global-monaco-theme';
  private themeSubject: BehaviorSubject<MonacoTheme>;

  constructor() {
    const storedTheme = this.getStoredTheme();
    this.themeSubject = new BehaviorSubject<MonacoTheme>(storedTheme);
    this.applyTheme(storedTheme);
  }

  /**
   * Get the current global theme as an observable
   */
  get theme$(): Observable<MonacoTheme> {
    return this.themeSubject.asObservable();
  }

  /**
   * Get the current global theme value
   */
  get currentTheme(): MonacoTheme {
    return this.themeSubject.value;
  }

  /**
   * Set the global theme
   * @param theme Theme to set globally
   */
  setGlobalTheme(theme: MonacoTheme): void {
    localStorage.setItem(this.GLOBAL_THEME_KEY, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme === 'vs' ? 'vs-dark' : 'vs';
    this.setGlobalTheme(newTheme);
  }

  /**
   * Get the stored global theme from localStorage
   */
  private getStoredTheme(): MonacoTheme {
    const stored = localStorage.getItem(this.GLOBAL_THEME_KEY);
    return (stored as MonacoTheme) || 'vs-dark';
  }

  /**
   * Apply a theme to Monaco Editor globally
   * Note: This affects ALL editor instances
   * @param theme Theme to apply
   */
  private applyTheme(theme: MonacoTheme): void {
    try {
      import('monaco-editor').then(monaco => {
        monaco.editor.setTheme(theme);
      }).catch(() => {
        // Monaco not loaded yet
      });
    } catch {
      // Monaco not available
    }
  }

  // Legacy methods for backward compatibility - now use global theme
  getComponentTheme(componentId: string, defaultTheme: MonacoTheme = 'vs-dark'): MonacoTheme {
    return this.currentTheme;
  }

  setComponentTheme(componentId: string, theme: MonacoTheme): void {
    this.setGlobalTheme(theme);
  }
}
