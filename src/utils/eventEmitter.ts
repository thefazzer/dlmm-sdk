import { PoolInfo } from '../types/poolTypes';

/**
 * Event emitter for streaming pool processing results
 */
export class PoolEventEmitter {
  private listeners: ((pool: PoolInfo) => void)[] = [];
  private completionListeners: (() => void)[] = [];
  private errorListeners: ((error: Error) => void)[] = [];
  private poolCount = 0;
  private completedBatches = 0;
  private totalBatches = 0;

  /**
   * Sets the total number of batches to be processed
   * @param count Total number of batches
   */
  setTotalBatches(count: number): void {
    this.totalBatches = count;
  }

  /**
   * Registers a callback for when a pool is processed
   * @param callback Function to call when a pool is processed
   * @returns This emitter instance for chaining
   */
  onPool(callback: (pool: PoolInfo) => void): PoolEventEmitter {
    this.listeners.push(callback);
    return this;
  }

  /**
   * Registers a callback for when all processing is complete
   * @param callback Function to call when processing is complete
   * @returns This emitter instance for chaining
   */
  onComplete(callback: () => void): PoolEventEmitter {
    this.completionListeners.push(callback);
    return this;
  }

  /**
   * Registers a callback for when an error occurs
   * @param callback Function to call when an error occurs
   * @returns This emitter instance for chaining
   */
  onError(callback: (error: Error) => void): PoolEventEmitter {
    this.errorListeners.push(callback);
    return this;
  }

  /**
   * Emits a pool processing event
   * @param pool The processed pool information
   */
  emit(pool: PoolInfo): void {
    this.poolCount++;
    this.listeners.forEach(listener => listener(pool));
  }

  /**
   * Emits an error event
   * @param error The error that occurred
   */
  emitError(error: Error): void {
    this.errorListeners.forEach(listener => listener(error));
  }

  /**
   * Marks a batch as complete and triggers completion event if all batches are done
   */
  completeBatch(): void {
    this.completedBatches++;
    if (this.completedBatches === this.totalBatches) {
      this.completionListeners.forEach(listener => listener());
    }
  }

  /**
   * Gets the current count of processed pools
   * @returns Number of processed pools
   */
  getPoolCount(): number {
    return this.poolCount;
  }

  /**
   * Gets the progress percentage of batch processing
   * @returns Percentage of completed batches (0-100)
   */
  getProgress(): number {
    if (this.totalBatches === 0) return 0;
    return (this.completedBatches / this.totalBatches) * 100;
  }
}

/**
 * Creates a promise that resolves when all pools are processed
 * @param emitter The pool event emitter
 * @returns Promise that resolves when processing is complete
 */
export function createBarrier(emitter: PoolEventEmitter): Promise<void> {
  return new Promise((resolve, reject) => {
    emitter.onComplete(() => {
      resolve();
    });
    
    emitter.onError((error) => {
      reject(error);
    });
  });
}