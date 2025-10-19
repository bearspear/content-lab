import { Injectable } from '@angular/core';
import { LibraryConfig } from '../config/library.config';

export interface ScriptLoadResult {
  success: boolean;
  url: string;
  usedFallback: boolean;
  error?: string;
}

/**
 * Service for dynamically loading external JavaScript libraries
 * Implements CDN loading with local fallback and caching
 */
@Injectable({
  providedIn: 'root'
})
export class ScriptLoaderService {
  private loadedScripts = new Map<string, ScriptLoadResult>();
  private loadingPromises = new Map<string, Promise<ScriptLoadResult>>();

  /**
   * Load a script dynamically with CDN and local fallback
   * @param library Library configuration
   * @returns Promise with load result
   */
  async loadScript(library: LibraryConfig): Promise<ScriptLoadResult> {
    // Return cached result if already loaded
    if (this.loadedScripts.has(library.id)) {
      return this.loadedScripts.get(library.id)!;
    }

    // Return ongoing load promise if currently loading
    if (this.loadingPromises.has(library.id)) {
      return this.loadingPromises.get(library.id)!;
    }

    // Check if library is already loaded globally (in iframe or window)
    if (library.globalVar && this.isLibraryLoaded(library.globalVar)) {
      const result: ScriptLoadResult = {
        success: true,
        url: 'already-loaded',
        usedFallback: false
      };
      this.loadedScripts.set(library.id, result);
      return result;
    }

    // Start loading
    const loadPromise = this.performLoad(library);
    this.loadingPromises.set(library.id, loadPromise);

    try {
      const result = await loadPromise;
      this.loadedScripts.set(library.id, result);
      return result;
    } finally {
      this.loadingPromises.delete(library.id);
    }
  }

  /**
   * Perform the actual script loading with fallback logic
   */
  private async performLoad(library: LibraryConfig): Promise<ScriptLoadResult> {
    // Try CDN first
    try {
      await this.loadScriptFromUrl(library.cdnUrl);
      return {
        success: true,
        url: library.cdnUrl,
        usedFallback: false
      };
    } catch (cdnError) {
      console.warn(`Failed to load ${library.name} from CDN, trying local fallback...`, cdnError);

      // Try local fallback
      try {
        const absoluteLocalUrl = library.localUrl.startsWith('http')
          ? library.localUrl
          : `${window.location.origin}${library.localUrl}`;

        await this.loadScriptFromUrl(absoluteLocalUrl);
        return {
          success: true,
          url: absoluteLocalUrl,
          usedFallback: true
        };
      } catch (localError) {
        console.error(`Failed to load ${library.name} from both CDN and local`, {
          cdnError,
          localError
        });

        return {
          success: false,
          url: library.cdnUrl,
          usedFallback: false,
          error: `Failed to load from both CDN and local: ${localError}`
        };
      }
    }
  }

  /**
   * Load a script from a URL using DOM manipulation
   */
  private loadScriptFromUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script from ${url}`));
      };

      // Set timeout for slow connections
      const timeout = setTimeout(() => {
        reject(new Error(`Script load timeout for ${url}`));
      }, 10000); // 10 second timeout

      script.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Failed to load script from ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Check if a library is already loaded by checking for its global variable
   */
  private isLibraryLoaded(globalVar: string): boolean {
    try {
      return typeof (window as any)[globalVar] !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Get load result for a library if it has been loaded
   */
  getLoadResult(libraryId: string): ScriptLoadResult | undefined {
    return this.loadedScripts.get(libraryId);
  }

  /**
   * Check if a library is currently loaded
   */
  isLoaded(libraryId: string): boolean {
    const result = this.loadedScripts.get(libraryId);
    return result?.success === true;
  }

  /**
   * Get all loaded libraries
   */
  getLoadedLibraries(): string[] {
    return Array.from(this.loadedScripts.entries())
      .filter(([_, result]) => result.success)
      .map(([id, _]) => id);
  }

  /**
   * Clear load cache (useful for testing or reset)
   */
  clearCache(): void {
    this.loadedScripts.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get the script URL to use in iframe (CDN with local fallback)
   * Returns script tag HTML with onerror fallback
   */
  getScriptTagWithFallback(library: LibraryConfig): string {
    const localUrl = library.localUrl.startsWith('http')
      ? library.localUrl
      : `${window.location.origin}${library.localUrl}`;

    return `  <script src="${library.cdnUrl}"
           onerror="this.onerror=null; this.src='${localUrl}'; console.warn('CDN failed for ${library.name}, using local fallback');">
  </script>`;
  }
}
