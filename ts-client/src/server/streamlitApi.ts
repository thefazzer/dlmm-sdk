import * as express from "express"
import * as cors from 'cors';
import WebSocket from 'ws'; // Works with esModuleInterop enabled
import { fetchPools, fetchPoolsStreaming } from './batchProcessor';
import { PoolInfo, BatchProcessingOptions } from '../../../src/types/poolTypes';

const app = express.default(); // Use `.default()` if `esModuleInterop` is not enabled

const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors.default);
app.use(express.json());

// Store active WebSocket connections
const activeConnections: WebSocket[] = [];

/**
 * Starts the API server for Streamlit integration
 */
export function startStreamlitApi(): void {
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

  // WebSocket endpoint for streaming pool data
  const server = app.listen(PORT, () => {
    console.log(`Streamlit API server running on port ${PORT}`);
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
export function stopStreamlitApi(): void {
  // Close all active WebSocket connections
  activeConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
}

// Start the server if this file is run directly
if (require.main === module) {
  startStreamlitApi();
}