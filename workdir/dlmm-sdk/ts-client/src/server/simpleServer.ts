import express from 'express';
import cors from 'cors';
import { Connection, PublicKey } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import WebSocket from 'ws';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Store active WebSocket connections
const activeConnections: WebSocket[] = [];
let server: any = null;

/**
 * Starts a simple API server for Streamlit integration
 */
export function startServer(): void {
  // REST endpoint to fetch test pools
  app.get('/get_test_pools', async (req, res) => {
    try {
      const rpcUrl = req.query.rpc_url as string || 'https://api.devnet.solana.com';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const cluster = req.query.cluster as string || 'devnet';
      
      const connection = new Connection(rpcUrl, {
        commitment: 'confirmed',
        disableRetryOnRateLimit: false,
        confirmTransactionInitialTimeout: 60000,
      });

      // Fetch pools
      console.log("Fetching pools...");
      const allPoolAddresses = await DLMM.getLbPairs(connection, {});
      console.log(`Found ${allPoolAddresses.length} pools`);
      
      const limitedAddresses = allPoolAddresses.slice(0, limit);
      const allPools = [];
      
      // Process each pool
      for (const pair of limitedAddresses) {
        try {
          const dlmm = await DLMM.create(connection, pair.publicKey);
          const activeBin = await dlmm.getActiveBin();
          const feeInfo = dlmm.getFeeInfo();
          const dynamicFee = dlmm.getDynamicFee();
          const activePriceUI = dlmm.fromPricePerLamport(Number(activeBin.price));
          
          const poolInfo = {
            pubkey: pair.publicKey.toBase58(),
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
          
          allPools.push(poolInfo);
        } catch (error) {
          console.error(`Error processing pool ${pair.publicKey.toBase58()}:`, error);
        }
      }

      // Return structured JSON response
      res.json(allPools);
    } catch (error) {
      console.error('Error in /get_test_pools:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Start the server
  server = app.listen(PORT, () => {
    console.log(`Simple API server running on port ${PORT}`);
  });
}

/**
 * Stops the API server
 */
export function stopServer(): void {
  // Close the server
  if (server) {
    server.close(() => {
      console.log('Server closed');
    });
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}