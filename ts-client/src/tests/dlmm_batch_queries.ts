import { Connection, PublicKey } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import { BN } from 'bn.js';
import { Decimal } from 'decimal.js';
import * as fs from 'fs';

// Pool information structure that can be used by StreamLit
interface PoolInfo {
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

// Event emitter for streaming results
class PoolEventEmitter {
  private listeners: ((pool: PoolInfo) => void)[] = [];
  private completionListeners: (() => void)[] = [];
  private poolCount = 0;
  private completedBatches = 0;
  private totalBatches = 0;

  constructor() {}

  setTotalBatches(count: number) {
    this.totalBatches = count;
  }

  onPool(callback: (pool: PoolInfo) => void) {
    this.listeners.push(callback);
    return this;
  }

  onComplete(callback: () => void) {
    this.completionListeners.push(callback);
    return this;
  }

  emit(pool: PoolInfo) {
    this.poolCount++;
    this.listeners.forEach(listener => listener(pool));
  }

  completeBatch() {
    this.completedBatches++;
    if (this.completedBatches === this.totalBatches) {
      this.completionListeners.forEach(listener => listener());
    }
  }

  getPoolCount() {
    return this.poolCount;
  }
}

// Process a batch of pools
async function processBatch(
  poolAddresses: PublicKey[],
  batchIndex: number,
  emitter: PoolEventEmitter,
  rpcUrl: string
): Promise<void> {
  console.log(`Starting batch ${batchIndex} with ${poolAddresses.length} pools`);
  
  // Create a new connection for this batch
  const connection = new Connection(rpcUrl, 'confirmed');
  
  try {
    // Process pools in parallel but with a concurrency limit
    const concurrencyLimit = 10; // Adjust based on RPC endpoint capabilities
    const chunks = [];
    
    for (let i = 0; i < poolAddresses.length; i += concurrencyLimit) {
      chunks.push(poolAddresses.slice(i, i + concurrencyLimit));
    }
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(async (poolAddress) => {
        try {
          const dlmm = await DLMM.create(connection, poolAddress);
          
          // Get active bin and fee info
          const activeBin = await dlmm.getActiveBin();
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
    }
  } catch (error) {
    console.error(`Error in batch ${batchIndex}:`, error);
  } finally {
    // Clean up connection resources
    // Note: Solana web3.js doesn't have an explicit dispose method,
    // but we can set it to null to help garbage collection
    (connection as any)._rpcWebSocket.close();
    console.log(`Completed batch ${batchIndex}`);
    emitter.completeBatch();
  }
}

async function main() {
  // Configuration
  const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
  const batchSize = 500;
  const outputFile = 'dlmm_pools.json';
  
  // Create event emitter
  const emitter = new PoolEventEmitter();
  
  // Collection to store all pool information
  const allPools: PoolInfo[] = [];
  
  // Set up event handlers
  emitter.onPool((pool) => {
    allPools.push(pool);
    console.log(`Processed pool: ${pool.pubkey} (Total: ${allPools.length})`);
  });
  
  emitter.onComplete(() => {
    console.log(`All batches completed. Total pools: ${allPools.length}`);
    
    // Save results to file
    fs.writeFileSync(outputFile, JSON.stringify(allPools, null, 2));
    console.log(`Results saved to ${outputFile}`);
    
    // Additional analysis could be done here
    const tokenXCounts = new Map<string, number>();
    const tokenYCounts = new Map<string, number>();
    
    allPools.forEach(pool => {
      tokenXCounts.set(pool.tokenX.mint, (tokenXCounts.get(pool.tokenX.mint) || 0) + 1);
      tokenYCounts.set(pool.tokenY.mint, (tokenYCounts.get(pool.tokenY.mint) || 0) + 1);
    });
    
    console.log(`Unique token X mints: ${tokenXCounts.size}`);
    console.log(`Unique token Y mints: ${tokenYCounts.size}`);
  });
  
  // Get all DLMM pools
  console.log("Fetching all DLMM pools...");
  const connection = new Connection(rpcUrl, 'confirmed');
  const allPoolAddresses = await DLMM.getLbPairs(connection);
  console.log(`Found ${allPoolAddresses.length} DLMM pools`);
  
  // Create batches
  const batches: PublicKey[][] = [];
  for (let i = 0; i < allPoolAddresses.length; i += batchSize) {
    batches.push(allPoolAddresses.slice(i, i + batchSize).map(pair => pair.publicKey));
  }
  
  // Set total batches in emitter
  emitter.setTotalBatches(batches.length);
  
  // Process batches
  console.log(`Processing ${batches.length} batches with size ${batchSize}`);
  
  // Start all batches in parallel
  await Promise.all(batches.map((batch, index) => 
    processBatch(batch, index, emitter, rpcUrl)
  ));
}

// Create a barrier that resolves when all pools are processed
function createBarrier(emitter: PoolEventEmitter): Promise<void> {
  return new Promise((resolve) => {
    emitter.onComplete(() => {
      resolve();
    });
  });
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    console.error("Error in main:", err);
    process.exit(1);
  });
}

export { main, PoolInfo, PoolEventEmitter, createBarrier };