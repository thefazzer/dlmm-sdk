import express from 'express';
import cors from 'cors';
import { Connection, PublicKey } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import { PoolEventEmitter } from '../../../src/utils/eventEmitter';
import { processBatch } from './batchProcessor';
import { BatchProcessingOptions } from '../../../src/types/poolTypes';

const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";

app.get('/get_pools', async (req, res) => {
    try {
        const rpcUrl = req.query.rpc_url as string || DEFAULT_RPC_URL;
        const batchSize = req.query.batch_size ? parseInt(req.query.batch_size as string) : 5;
        const cluster = req.query.cluster as string || 'devnet';
        
        const connection = new Connection(rpcUrl, {
            commitment: 'confirmed',
            disableRetryOnRateLimit: false,
            confirmTransactionInitialTimeout: 60000,
        });

        // Fetch pools
        const poolAddresses = await fetchPoolAddresses(connection, cluster);
        const emitter = new PoolEventEmitter();
        
        const allPools: any[] = [];
        emitter.onPool((pool) => allPools.push(pool));

        // Set up completion handler
        const completionPromise = new Promise<void>((resolve) => {
            emitter.onComplete(() => resolve());
        });

        // Create batches
        const batches: PublicKey[][] = [];
        for (let i = 0; i < poolAddresses.length; i += batchSize) {
            batches.push(poolAddresses.slice(i, i + batchSize));
        }
        
        // Set total batches in emitter
        emitter.setTotalBatches(batches.length);
        
        // Process batches
        console.log(`Processing ${batches.length} batches with size ${batchSize}`);
        
        // Start all batches in parallel
        const options: BatchProcessingOptions = {
            rpcUrl,
            batchSize,
            concurrencyLimit: 5,
            maxRetries: 3,
            retryDelayMs: 1000,
            chunkDelayMs: 500,
            cluster
        };

        await Promise.all(batches.map((batch, index) => 
            processBatch(batch, index, emitter, options)
        ));
        
        // Wait for all batches to complete
        await completionPromise;

        // Return structured JSON response
        res.json(allPools);
    } catch (error) {
        console.error('Error in /get_pools:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Endpoint to get a limited number of pools for testing
app.get('/get_test_pools', async (req, res) => {
    try {
        const rpcUrl = req.query.rpc_url as string || DEFAULT_RPC_URL;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        const cluster = req.query.cluster as string || 'devnet';
        
        const connection = new Connection(rpcUrl, {
            commitment: 'confirmed',
            disableRetryOnRateLimit: false,
            confirmTransactionInitialTimeout: 60000,
        });

        // Fetch pools
        const poolAddresses = await fetchPoolAddresses(connection, cluster);
        const limitedAddresses = poolAddresses.slice(0, limit);
        
        const emitter = new PoolEventEmitter();
        const allPools: any[] = [];
        emitter.onPool((pool) => allPools.push(pool));

        // Process single batch
        const options: BatchProcessingOptions = {
            rpcUrl,
            batchSize: limit,
            concurrencyLimit: 2,
            maxRetries: 3,
            retryDelayMs: 1000,
            chunkDelayMs: 500,
            cluster
        };

        emitter.setTotalBatches(1);
        await processBatch(limitedAddresses, 0, emitter, options);

        // Return structured JSON response
        res.json(allPools);
    } catch (error) {
        console.error('Error in /get_test_pools:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Helper function to fetch pool addresses
async function fetchPoolAddresses(connection: Connection, cluster: string): Promise<PublicKey[]> {
    try {
        const allPoolAddresses = await DLMM.getLbPairs(connection, {});
        return allPoolAddresses.map(pair => pair.publicKey);
    } catch (error) {
        console.error("Error fetching pools:", error);
        return [];
    }
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});