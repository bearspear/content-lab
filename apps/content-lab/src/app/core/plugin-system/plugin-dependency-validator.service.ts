/**
 * Plugin Dependency Validator Service
 * Validates that plugin dependencies are available in the application
 *
 * Phase 4: Advanced Features - Dependency Validation
 *
 * Responsibilities:
 * - Check if required dependencies exist in window/global scope
 * - Validate npm packages are available
 * - Report missing dependencies
 * - Provide dependency resolution suggestions
 */

import { Injectable } from '@angular/core';
import { FeaturePluginMetadata } from './plugin.interface';

export interface DependencyValidationResult {
  pluginId: string;
  pluginName: string;
  valid: boolean;
  missingDependencies: string[];
  availableDependencies: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PluginDependencyValidatorService {
  /**
   * Known global dependencies and their detection methods
   */
  private readonly knownGlobals: Record<string, () => boolean> = {
    'monaco-editor': () => typeof (window as any).monaco !== 'undefined',
    'three': () => typeof (window as any).THREE !== 'undefined',
    'codemirror': () => typeof (window as any).CodeMirror !== 'undefined',
    'marked': () => typeof (window as any).marked !== 'undefined',
    'katex': () => typeof (window as any).katex !== 'undefined',
    'highlight.js': () => typeof (window as any).hljs !== 'undefined',
    'gsap': () => typeof (window as any).gsap !== 'undefined',
  };

  /**
   * Known npm packages and their module detection
   * These are packages that should be importable
   */
  private readonly knownPackages = new Set([
    '@angular/core',
    '@angular/common',
    '@angular/router',
    '@angular/forms',
    'rxjs',
    'buffer',
    'file-saver',
    'jszip',
    'pdf-lib',
    'music-metadata-browser',
    'astronomy-engine',
    'suncalc',
    'html2pdf.js',
    'cheerio',
    'yaml',
    'xml2js'
  ]);

  constructor() {
    console.log('[PluginDependencyValidator] Service initialized');
  }

  /**
   * Validate dependencies for a plugin
   * @param metadata Plugin metadata containing dependencies
   * @returns Validation result with missing dependencies
   */
  validateDependencies(metadata: FeaturePluginMetadata): DependencyValidationResult {
    const dependencies = metadata.dependencies || [];

    if (dependencies.length === 0) {
      return {
        pluginId: metadata.id,
        pluginName: metadata.name,
        valid: true,
        missingDependencies: [],
        availableDependencies: []
      };
    }

    const missingDependencies: string[] = [];
    const availableDependencies: string[] = [];

    for (const dep of dependencies) {
      if (this.isDependencyAvailable(dep)) {
        availableDependencies.push(dep);
      } else {
        missingDependencies.push(dep);
      }
    }

    const valid = missingDependencies.length === 0;

    if (!valid) {
      console.warn(
        `[PluginDependencyValidator] Plugin '${metadata.id}' has missing dependencies:`,
        missingDependencies
      );
    } else {
      console.log(
        `[PluginDependencyValidator] ✓ Plugin '${metadata.id}' dependencies validated:`,
        availableDependencies
      );
    }

    return {
      pluginId: metadata.id,
      pluginName: metadata.name,
      valid,
      missingDependencies,
      availableDependencies
    };
  }

  /**
   * Check if a specific dependency is available
   * @param dependency Dependency name to check
   * @returns True if dependency is available
   */
  isDependencyAvailable(dependency: string): boolean {
    // Check if it's a known global library
    if (this.knownGlobals[dependency]) {
      return this.knownGlobals[dependency]();
    }

    // Check if it's a known npm package
    if (this.knownPackages.has(dependency)) {
      return true; // Assume npm packages are available if listed
    }

    // For unknown dependencies, try to detect in window scope
    // Convert package names to likely global names
    const globalName = this.packageNameToGlobalName(dependency);
    return typeof (window as any)[globalName] !== 'undefined';
  }

  /**
   * Convert npm package name to likely global variable name
   * Examples:
   * - 'monaco-editor' -> 'monaco'
   * - 'three' -> 'THREE'
   * - 'pdf-lib' -> 'PDFLib'
   * @param packageName npm package name
   * @returns Likely global variable name
   */
  private packageNameToGlobalName(packageName: string): string {
    // Remove scope if present (@org/package -> package)
    const unscoped = packageName.replace(/^@[^/]+\//, '');

    // Remove hyphens and capitalize (monaco-editor -> monacoEditor)
    const camelCase = unscoped.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    return camelCase;
  }

  /**
   * Validate dependencies for multiple plugins
   * @param pluginsMetadata Array of plugin metadata
   * @returns Array of validation results
   */
  validateMultiple(pluginsMetadata: FeaturePluginMetadata[]): DependencyValidationResult[] {
    return pluginsMetadata.map(metadata => this.validateDependencies(metadata));
  }

  /**
   * Get all plugins with missing dependencies
   * @param validationResults Array of validation results
   * @returns Plugins with missing dependencies
   */
  getPluginsWithMissingDependencies(
    validationResults: DependencyValidationResult[]
  ): DependencyValidationResult[] {
    return validationResults.filter(result => !result.valid);
  }

  /**
   * Get a summary report of dependency validation
   * @param validationResults Array of validation results
   * @returns Summary object
   */
  getSummary(validationResults: DependencyValidationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    totalDependencies: number;
    missingDependencies: number;
  } {
    const invalid = validationResults.filter(r => !r.valid).length;
    const totalDeps = validationResults.reduce(
      (sum, r) => sum + r.availableDependencies.length + r.missingDependencies.length,
      0
    );
    const missingDeps = validationResults.reduce(
      (sum, r) => sum + r.missingDependencies.length,
      0
    );

    return {
      total: validationResults.length,
      valid: validationResults.length - invalid,
      invalid,
      totalDependencies: totalDeps,
      missingDependencies: missingDeps
    };
  }

  /**
   * Register a custom global dependency detector
   * @param name Dependency name
   * @param detector Function that returns true if dependency is available
   */
  registerGlobalDetector(name: string, detector: () => boolean): void {
    this.knownGlobals[name] = detector;
    console.log(`[PluginDependencyValidator] Registered detector for: ${name}`);
  }

  /**
   * Register a known npm package
   * @param packageName Package name
   */
  registerKnownPackage(packageName: string): void {
    this.knownPackages.add(packageName);
    console.log(`[PluginDependencyValidator] Registered known package: ${packageName}`);
  }
}
