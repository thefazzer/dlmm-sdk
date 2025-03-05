"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolEventEmitter = void 0;
exports.createBarrier = createBarrier;
/**
 * Event emitter for streaming pool processing results
 */
var PoolEventEmitter = /** @class */ (function () {
    function PoolEventEmitter() {
        this.listeners = [];
        this.completionListeners = [];
        this.errorListeners = [];
        this.poolCount = 0;
        this.completedBatches = 0;
        this.totalBatches = 0;
    }
    /**
     * Sets the total number of batches to be processed
     * @param count Total number of batches
     */
    PoolEventEmitter.prototype.setTotalBatches = function (count) {
        this.totalBatches = count;
    };
    /**
     * Registers a callback for when a pool is processed
     * @param callback Function to call when a pool is processed
     * @returns This emitter instance for chaining
     */
    PoolEventEmitter.prototype.onPool = function (callback) {
        this.listeners.push(callback);
        return this;
    };
    /**
     * Registers a callback for when all processing is complete
     * @param callback Function to call when processing is complete
     * @returns This emitter instance for chaining
     */
    PoolEventEmitter.prototype.onComplete = function (callback) {
        this.completionListeners.push(callback);
        return this;
    };
    /**
     * Registers a callback for when an error occurs
     * @param callback Function to call when an error occurs
     * @returns This emitter instance for chaining
     */
    PoolEventEmitter.prototype.onError = function (callback) {
        this.errorListeners.push(callback);
        return this;
    };
    /**
     * Emits a pool processing event
     * @param pool The processed pool information
     */
    PoolEventEmitter.prototype.emit = function (pool) {
        this.poolCount++;
        this.listeners.forEach(function (listener) { return listener(pool); });
    };
    /**
     * Emits an error event
     * @param error The error that occurred
     */
    PoolEventEmitter.prototype.emitError = function (error) {
        this.errorListeners.forEach(function (listener) { return listener(error); });
    };
    /**
     * Marks a batch as complete and triggers completion event if all batches are done
     */
    PoolEventEmitter.prototype.completeBatch = function () {
        this.completedBatches++;
        if (this.completedBatches === this.totalBatches) {
            this.completionListeners.forEach(function (listener) { return listener(); });
        }
    };
    /**
     * Gets the current count of processed pools
     * @returns Number of processed pools
     */
    PoolEventEmitter.prototype.getPoolCount = function () {
        return this.poolCount;
    };
    /**
     * Gets the progress percentage of batch processing
     * @returns Percentage of completed batches (0-100)
     */
    PoolEventEmitter.prototype.getProgress = function () {
        if (this.totalBatches === 0)
            return 0;
        return (this.completedBatches / this.totalBatches) * 100;
    };
    return PoolEventEmitter;
}());
exports.PoolEventEmitter = PoolEventEmitter;
/**
 * Creates a promise that resolves when all pools are processed
 * @param emitter The pool event emitter
 * @returns Promise that resolves when processing is complete
 */
function createBarrier(emitter) {
    return new Promise(function (resolve, reject) {
        emitter.onComplete(function () {
            resolve();
        });
        emitter.onError(function (error) {
            reject(error);
        });
    });
}
