import { OnInit, OnDestroy, Directive } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';

/**
 * Abstract base class for components that need state persistence
 *
 * Provides common functionality for:
 * - Loading state from localStorage on init
 * - Saving state with automatic debouncing
 * - Resetting to default state
 * - Cleanup on destroy
 *
 * @example
 * ```typescript
 * export class MyComponent extends StatefulComponent<MyState> {
 *   protected readonly TOOL_ID = 'my-tool';
 *
 *   constructor(stateManager: StateManagerService) {
 *     super(stateManager);
 *   }
 *
 *   protected getDefaultState(): MyState {
 *     return { value: '', count: 0 };
 *   }
 *
 *   protected applyState(state: MyState): void {
 *     this.value = state.value;
 *     this.count = state.count;
 *   }
 * }
 * ```
 */
@Directive()
export abstract class StatefulComponent<T> implements OnInit, OnDestroy {
  private saveStateTimeout: any;

  /**
   * Unique identifier for this tool's state in localStorage
   * Must be implemented by derived classes
   */
  protected abstract readonly TOOL_ID: string;

  /**
   * Returns the default state for this component
   * Called when no saved state exists or after reset
   */
  protected abstract getDefaultState(): T;

  /**
   * Applies loaded state to the component
   * Override this to update component properties from state
   */
  protected abstract applyState(state: T): void;

  /**
   * Creates current state object to be saved
   * Override this to customize what gets saved
   */
  protected abstract getCurrentState(): T;

  constructor(protected stateManager: StateManagerService) {}

  ngOnInit(): void {
    this.loadState();
  }

  ngOnDestroy(): void {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }
  }

  /**
   * Loads saved state from localStorage
   * If no state exists, applies default state
   */
  protected loadState(): void {
    const savedState = this.stateManager.loadState<T>(this.TOOL_ID);

    if (savedState) {
      this.applyState(savedState);
    } else {
      const defaultState = this.getDefaultState();
      this.applyState(defaultState);
    }
  }

  /**
   * Saves current state to localStorage with debouncing
   * Automatically debounces saves by 500ms to prevent excessive writes
   */
  protected saveState(): void {
    if (this.saveStateTimeout) {
      clearTimeout(this.saveStateTimeout);
    }

    this.saveStateTimeout = setTimeout(() => {
      const state = this.getCurrentState();
      this.stateManager.saveState(this.TOOL_ID, state);
    }, 500); // Debounce saves by 500ms
  }

  /**
   * Resets component to default state
   * Clears saved state from localStorage and applies default state
   * Override to add custom reset logic
   */
  public onReset(): void {
    this.stateManager.clearState(this.TOOL_ID);
    const defaultState = this.getDefaultState();
    this.applyState(defaultState);
  }
}
