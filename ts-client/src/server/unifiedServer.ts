import express from 'express';
import cors from 'cors';
import WebSocket from 'ws';
import { Connection, PublicKey } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import { PoolInfo, BatchProcessingOptions, DEFAULT_BATCH_OPTIONS } from '../../../src/types/poolTypes';
import { PoolEventEmitter, createBarrier } from '../../../src/utils/eventEmitter';
import { createConnection, safelyCloseConnection, withRetry } from './connectionManager';
import { fetchPools, fetchPoolsStreaming, processBatch } from './batchProcessor';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store active WebSocket connections
const activeConnections: WebSocket[] = [];
let server: any = null;

/**
 * Starts the unified API server for Streamlit integration
 */
export function startServer(): void {
  // REST endpoint to fetch all pools
  app.get('/get_pools', async (req, res) => {
    try {
      const options: Partial<BatchProcessingOptions> = {
        rpcUrl: req.query.rpc_url as string || 'https://api.devnet.solana.com',
        batchSize: req.query.batch_size ? parseInt(req.query.batch_size as string) : 10,
        concurrencyLimit: req.query.concurrency ? parseInt(req.query.concurrency as string) : 5,
        cluster: req.query.cluster as string || 'devnet'
      };
      
      const pools = await fetchPools(options);
      res.json(pools);
    } catch (error) {
      console.error('Error fetching pools:', error);
      res.status(500).json({ error: 'Failed to fetch pools', details: (error as Error).message });
    }
  });

  // Endpoint to get a limited number of pools for testing
  app.get('/get_test_pools', async (req, res) => {
    try {
      const rpcUrl = req.query.rpc_url as string || 'https://api.devnet.solana.com';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const cluster = req.query.cluster as string || 'devnet';
      
      const connection = createConnection(rpcUrl);

      // Fetch pools
      const poolAddresses = await fetchPoolAddresses(connection, cluster);
      const limitedAddresses = poolAddresses.slice(0, limit);
      
      const emitter = new PoolEventEmitter();
      const allPools: PoolInfo[] = [];
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

  // WebSocket endpoint for streaming pool data
  server = app.listen(PORT, () => {
    console.log(`Unified API server running on port ${PORT}`);
  });

  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    activeConnections.push(ws);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.action === 'fetch_pools_streaming') {
          const options: Partial<BatchProcessingOptions> = {
            rpcUrl: data.rpc_url || 'https://api.devnet.solana.com',
            batchSize: data.batch_size || 10,
            concurrencyLimit: data.concurrency || 5,
            cluster: data.cluster || 'devnet'
          };
          
          await fetchPoolsStreaming(
            (pool: PoolInfo, progress: number) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'pool_data',
                  data: pool,
                  progress
                }));
              }
            },
            options
          );
          
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'complete',
              message: 'All pools processed'
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'error',
            message: (error as Error).message
          }));
        }
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      const index = activeConnections.indexOf(ws);
      if (index !== -1) {
        activeConnections.splice(index, 1);
      }
    });
  });
}

/**
 * Stops the API server
 */
export function stopServer(): void {
  // Close all active WebSocket connections
  activeConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
  
  // Close the server
  if (server) {
    server.close(() => {
      console.log('Server closed');
    });
  }
}

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

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}