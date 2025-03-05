"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BATCH_OPTIONS = void 0;
/**
 * Default configuration for batch processing
 */
exports.DEFAULT_BATCH_OPTIONS = {
    rpcUrl: 'https://api.devnet.solana.com',
    batchSize: 10,
    concurrencyLimit: 5,
    maxRetries: 3,
    retryDelayMs: 1000,
    chunkDelayMs: 500,
    cluster: 'devnet'
};
