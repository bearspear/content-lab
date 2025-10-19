import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface CodeInsertEvent {
  code: string;
  targetTab?: 'html' | 'css' | 'js';
}

@Injectable({
  providedIn: 'root'
})
export class CodeBridgeService {
  private insertCodeSubject = new Subject<CodeInsertEvent>();
  private tempCounter = 0;

  // Store pending code to be inserted
  private pendingJsCode: string[] = [];
  private pendingHtmlCode: string[] = [];
  private pendingCssCode: string[] = [];

  // Observable for components to subscribe to
  insertCode$ = this.insertCodeSubject.asObservable();

  /**
   * Insert JSON as a JavaScript constant in the JS Playground
   */
  insertJsonAsJsConstant(jsonContent: string): string {
    try {
      // Validate and parse JSON
      const parsed = JSON.parse(jsonContent);

      // Increment counter
      this.tempCounter++;
      const varName = `temp${this.tempCounter}`;

      // Format as JavaScript constant with proper indentation
      const formattedJson = JSON.stringify(parsed, null, 2);
      const jsCode = `const ${varName} = ${formattedJson};\n\n`;

      // Store in pending queue
      this.pendingJsCode.push(jsCode);

      // Also emit the insert event for real-time insertion if component is active
      this.insertCodeSubject.next({
        code: jsCode,
        targetTab: 'js'
      });

      return varName;
    } catch (error) {
      throw new Error('Invalid JSON: Cannot insert into JavaScript Playground');
    }
  }

  /**
   * Insert raw code into a specific tab
   */
  insertCode(code: string, targetTab: 'html' | 'css' | 'js' = 'js'): void {
    // Store in pending queue
    if (targetTab === 'js') {
      this.pendingJsCode.push(code);
    } else if (targetTab === 'html') {
      this.pendingHtmlCode.push(code);
    } else if (targetTab === 'css') {
      this.pendingCssCode.push(code);
    }

    // Also emit the insert event
    this.insertCodeSubject.next({
      code,
      targetTab
    });
  }

  /**
   * Get and clear all pending code for a specific tab
   */
  getPendingCode(targetTab: 'html' | 'css' | 'js'): string {
    let pending: string[];

    if (targetTab === 'js') {
      pending = [...this.pendingJsCode];
      this.pendingJsCode = [];
    } else if (targetTab === 'html') {
      pending = [...this.pendingHtmlCode];
      this.pendingHtmlCode = [];
    } else {
      pending = [...this.pendingCssCode];
      this.pendingCssCode = [];
    }

    return pending.join('');
  }

  /**
   * Check if there's pending code for a specific tab
   */
  hasPendingCode(targetTab: 'html' | 'css' | 'js'): boolean {
    if (targetTab === 'js') {
      return this.pendingJsCode.length > 0;
    } else if (targetTab === 'html') {
      return this.pendingHtmlCode.length > 0;
    } else {
      return this.pendingCssCode.length > 0;
    }
  }

  /**
   * Reset the temp counter
   */
  resetTempCounter(): void {
    this.tempCounter = 0;
  }

  /**
   * Get the current temp counter value
   */
  getTempCounter(): number {
    return this.tempCounter;
  }
}
