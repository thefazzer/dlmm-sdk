/**
 * Structure for pool information that can be used by StreamLit
 */
export interface PoolInfo {
  pubkey: string;
  tokenX: {
    mint: string;
    symbol?: string;
    decimal: number;
    reserve: string;
    amount: string;
  };
  tokenY: {
    mint: string;
    symbol?: string;
    decimal: number;
    reserve: string;
    amount: string;
  };
  binStep: number;
  activeId: number;
  activePrice: string;
  activePriceUI: string;
  feeInfo: {
    baseFeeRatePercentage: string;
    maxFeeRatePercentage: string;
    protocolFeePercentage: string;
  };
  dynamicFee: string;
  timestamp: number;
}

/**
 * Configuration options for batch processing
 */
export interface BatchProcessingOptions {
  rpcUrl: string;
  batchSize: number;
  concurrencyLimit: number;
  maxRetries: number;
  retryDelayMs: number;
  chunkDelayMs: number;
  cluster?: string;
}

/**
 * Default configuration for batch processing
 */
export const DEFAULT_BATCH_OPTIONS: BatchProcessingOptions = {
  rpcUrl: 'https://api.devnet.solana.com',
  batchSize: 10,
  concurrencyLimit: 5,
  maxRetries: 3,
  retryDelayMs: 1000,
  chunkDelayMs: 500,
  cluster: 'devnet'
};