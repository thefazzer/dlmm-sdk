import { PublicKey } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import { PoolInfo, BatchProcessingOptions, DEFAULT_BATCH_OPTIONS } from '../types/poolTypes';
import { PoolEventEmitter, createBarrier } from './eventEmitter';
import { createConnection, safelyCloseConnection, withRetry } from './connectionManager';

/**
 * Processes a batch of DLMM pools
 * @param poolAddresses Array of pool addresses to process
 * @param batchIndex Index of the current batch
 * @param emitter Event emitter for streaming results
 * @param options Batch processing options
 */
export async function processBatch(
  poolAddresses: PublicKey[],
  batchIndex: number,
  emitter: PoolEventEmitter,
  options: BatchProcessingOptions
): Promise<void> {
  console.log(`Starting batch ${batchIndex} with ${poolAddresses.length} pools`);
  
  // Create a new connection for this batch
  const connection = createConnection(options.rpcUrl);
  
  try {
    // Process pools in parallel but with a concurrency limit
    const chunks = [];
    
    for (let i = 0; i < poolAddresses.length; i += options.concurrencyLimit) {
      chunks.push(poolAddresses.slice(i, i + options.concurrencyLimit));
    }
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (poolAddress) => {
        try {
          // Use retry logic for creating DLMM instance
          const dlmm = await withRetry(
            () => DLMM.create(connection, poolAddress, { cluster: options.cluster }),
            options.maxRetries,
            options.retryDelayMs
          );
          
          // Get active bin and fee info
          const activeBin = await withRetry(
            () => dlmm.getActiveBin(),
            options.maxRetries,
            options.retryDelayMs
          );
          
          const feeInfo = dlmm.getFeeInfo();
          const dynamicFee = dlmm.getDynamicFee();
          
          // Convert price to UI format
          const activePriceUI = dlmm.fromPricePerLamport(Number(activeBin.price));
          
          // Create pool info object
          const poolInfo: PoolInfo = {
            pubkey: poolAddress.toBase58(),
            tokenX: {
              mint: dlmm.tokenX.publicKey.toBase58(),
              decimal: dlmm.tokenX.decimal,
              reserve: dlmm.tokenX.reserve.toBase58(),
              amount: dlmm.tokenX.amount.toString(),
            },
            tokenY: {
              mint: dlmm.tokenY.publicKey.toBase58(),
              decimal: dlmm.tokenY.decimal,
              reserve: dlmm.tokenY.reserve.toBase58(),
              amount: dlmm.tokenY.amount.toString(),
            },
            binStep: dlmm.lbPair.binStep,
            activeId: dlmm.lbPair.activeId,
            activePrice: activeBin.price,
            activePriceUI,
            feeInfo: {
              baseFeeRatePercentage: feeInfo.baseFeeRatePercentage.toString(),
              maxFeeRatePercentage: feeInfo.maxFeeRatePercentage.toString(),
              protocolFeePercentage: feeInfo.protocolFeePercentage.toString(),
            },
            dynamicFee: dynamicFee.toString(),
            timestamp: Date.now(),
          };
          
          // Emit the pool info
          emitter.emit(poolInfo);
        } catch (error) {
          console.error(`Error processing pool ${poolAddress.toBase58()}:`, error);
        }
      }));
      
      // Add a delay between chunks to avoid rate limiting
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, options.chunkDelayMs));
      }
    }
  } catch (error) {
    console.error(`Error in batch ${batchIndex}:`, error);
    emitter.emitError(error as Error);
  } finally {
    // Clean up connection resources
    safelyCloseConnection(connection);
    console.log(`Completed batch ${batchIndex}`);
    emitter.completeBatch();
  }
}

/**
 * Fetches and processes DLMM pools in batches
 * @param options Batch processing options
 * @returns Promise that resolves to an array of processed pool information
 */
export async function fetchPools(
  options: Partial<BatchProcessingOptions> = {}
): Promise<PoolInfo[]> {
  // Merge provided options with defaults
  const mergedOptions: BatchProcessingOptions = {
    ...DEFAULT_BATCH_OPTIONS,
    ...options
  };
  
  // Create event emitter
  const emitter = new PoolEventEmitter();
  
  // Collection to store all pool information
  const allPools: PoolInfo[] = [];
  
  // Set up event handlers
  emitter.onPool((pool) => {
    allPools.push(pool);
    console.log(`Processed pool: ${pool.pubkey} (Total: ${allPools.length})`);
  });
  
  // Create a promise that resolves when all batches are complete
  const completionPromise = createBarrier(emitter);
  
  // Get all DLMM pools
  console.log("Fetching DLMM pools...");
  const connection = createConnection(mergedOptions.rpcUrl);
  
  try {
    const allPoolAddresses = await withRetry(
      () => DLMM.getLbPairs(connection, { cluster: mergedOptions.cluster }),
      mergedOptions.maxRetries,
      mergedOptions.retryDelayMs
    );
    
    console.log(`Found ${allPoolAddresses.length} DLMM pools`);
    
    // Create batches
    const batches: PublicKey[][] = [];
    for (let i = 0; i < allPoolAddresses.length; i += mergedOptions.batchSize) {
      batches.push(allPoolAddresses.slice(i, i + mergedOptions.batchSize).map(pair => pair.publicKey));
    }
    
    // Set total batches in emitter
    emitter.setTotalBatches(batches.length);
    
    // Process batches
    console.log(`Processing ${batches.length} batches with size ${mergedOptions.batchSize}`);
    
    // Start all batches in parallel
    await Promise.all(batches.map((batch, index) => 
      processBatch(batch, index, emitter, mergedOptions)
    ));
    
    // Wait for all batches to complete
    await completionPromise;
    
    return allPools;
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  } finally {
    safelyCloseConnection(connection);
  }
}

/**
 * Fetches pools with a streaming API for real-time updates
 * @param callback Function to call with each processed pool
 * @param options Batch processing options
 * @returns Promise that resolves when all pools are processed
 */
export async function fetchPoolsStreaming(
  callback: (pool: PoolInfo, progress: number) => void,
  options: Partial<BatchProcessingOptions> = {}
): Promise<void> {
  // Merge provided options with defaults
  const mergedOptions: BatchProcessingOptions = {
    ...DEFAULT_BATCH_OPTIONS,
    ...options
  };
  
  // Create event emitter
  const emitter = new PoolEventEmitter();
  
  // Set up event handlers
  emitter.onPool((pool) => {
    callback(pool, emitter.getProgress());
  });
  
  // Create a promise that resolves when all batches are complete
  const completionPromise = createBarrier(emitter);
  
  // Get all DLMM pools
  console.log("Fetching DLMM pools...");
  const connection = createConnection(mergedOptions.rpcUrl);
  
  try {
    const allPoolAddresses = await withRetry(
      () => DLMM.getLbPairs(connection, { cluster: mergedOptions.cluster }),
      mergedOptions.maxRetries,
      mergedOptions.retryDelayMs
    );
    
    console.log(`Found ${allPoolAddresses.length} DLMM pools`);
    
    // Create batches
    const batches: PublicKey[][] = [];
    for (let i = 0; i < allPoolAddresses.length; i += mergedOptions.batchSize) {
      batches.push(allPoolAddresses.slice(i, i + mergedOptions.batchSize).map(pair => pair.publicKey));
    }
    
    // Set total batches in emitter
    emitter.setTotalBatches(batches.length);
    
    // Process batches
    console.log(`Processing ${batches.length} batches with size ${mergedOptions.batchSize}`);
    
    // Start all batches in parallel
    await Promise.all(batches.map((batch, index) => 
      processBatch(batch, index, emitter, mergedOptions)
    ));
    
    // Wait for all batches to complete
    await completionPromise;
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  } finally {
    safelyCloseConnection(connection);
  }
}