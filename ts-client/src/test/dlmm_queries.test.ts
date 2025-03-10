import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm/index";
import { AccountLayout } from "@solana/spl-token";
import Decimal from "decimal.js";
//import { BN } from "@coral-xyz/anchor";
import { deriveOracle } from "../dlmm/helpers/derive";

import BN from "bn.js";  // ✅ Correct

import { describe, it } from "node:test";

// Meteora DLMM Program ID
const DLMM_PROGRAM_ID = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const DYNAMIC_AMM_PROGRAM_ID = new PublicKey("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");
const HAWK_MINT = new PublicKey("HAWKThXRcNL9ZGZKqgUXLm4W8tnRZ7U6MVdEepSutj34");
const RETARDIO_MINT = new PublicKey("6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const TRUMP_MINT = new PublicKey("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");

const RPC_PROVIDERS = [
  "https://rpc.ankr.com/solana",
  //"https://solana.getblock.io/mainnet/?api_key=YOUR_API_KEY",
  "https://ssc-dao.genesysgo.net/"
];

let currentRpcIndex = 0;
function getNextRpc() {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_PROVIDERS.length;
  return RPC_PROVIDERS[currentRpcIndex];
}

// const connection = new Connection(getNextRpc(), { commitment: "confirmed" });

// Alternative RPC provider to avoid Alchemy restrictions
const connection = new Connection("https://rpc.helius.xyz/?api-key=1c510177-8d47-41f2-9053-d3a30f3f81cf", {
commitment: "confirmed",
});

async function fetchTokenPrices() {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=RETARDIO,SOLANA&vs_currencies=usd`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return {};
  }
}

async function getAccountInfoWithRetry(
  connection: Connection,
  pubkey: PublicKey,
  retries = 5,
  delay = 500
): Promise<AccountInfo<Buffer> | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const accountInfo = await fetchWithRetry(() => connection.getAccountInfo(pubkey));

      if (accountInfo) return accountInfo;
      throw new Error("Account info is null");
    } catch (error: any) {
      if (error.message.includes("429 Too Many Requests")) {
        console.error(`Server responded with 429 Too Many Requests. Retrying after ${delay}ms delay...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch account info after multiple retries.");
}

function getDynamicFee(dlmmInstance: DLMM): Decimal {
  return dlmmInstance.getDynamicFee();
}

async function get24hMetrics(connection: Connection, dlmmInstance: DLMM) {
  try {
    const [oraclePda] = deriveOracle(dlmmInstance.pubkey, dlmmInstance.program.programId);
    const oracleAccount = await getAccountInfoWithRetry(connection, oraclePda);

    if (!oracleAccount) {
      throw new Error("Oracle account not found");
    }

    // Get timestamp 24h ago
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestamp24hAgo = currentTimestamp - 24 * 60 * 60;

    // The oracle data starts after the 8-byte discriminator
    const oracleData = oracleAccount.data.slice(8);

    // First 24 bytes contain Oracle struct (8 bytes each for idx, active_size, length)
    const idx = new BN(oracleData.slice(0, 8), "le").toNumber();
    const activeSize = new BN(oracleData.slice(8, 16), "le").toNumber();

    // Each Observation is 32 bytes (16 for cumulative_active_bin_id, 8 for created_at, 8 for last_updated_at)
    const OBSERVATION_SIZE = 32;
    const observationsData = oracleData.slice(24);

    let volume24h = new BN(0);

    // Process observations within last 24h
    for (let i = 0; i < activeSize; i++) {
      const obsIndex = (idx - i + activeSize) % activeSize;
      const obsStart = obsIndex * OBSERVATION_SIZE;

      const createdAt = new BN(observationsData.slice(obsStart + 16, obsStart + 24), "le").toNumber();
      const lastUpdatedAt = new BN(observationsData.slice(obsStart + 24, obsStart + 32), "le").toNumber();

      if (lastUpdatedAt >= timestamp24hAgo && createdAt > 0) {
        // Debug raw cumulative data before BN conversion
        const cumulativeIdRaw = observationsData.slice(obsStart, obsStart + 16);
        console.log("Raw Cumulative ID Data (Hex):", cumulativeIdRaw.toString("hex"));

        // Ensure valid hex characters before BN conversion
        const cleanedCumulativeIdRaw = cumulativeIdRaw.toString("hex").replace(/[^0-9a-f]/gi, "");
        const cumulativeId = new BN(cleanedCumulativeIdRaw, "hex");

        volume24h = volume24h.add(cumulativeId.abs());
      }
    }

    const volumeInUsd = new Decimal(volume24h.toString()).div(
      new Decimal(10).pow(dlmmInstance.tokenX.decimal)
    );
    
    // Fix: Ensure no scientific notation before BN conversion
    const feesInUsd = new Decimal(volumeInUsd).mul(dlmmInstance.getDynamicFee()).div(100);
    
    return {
      volume24h: volumeInUsd.toFixed(2),
      fees24h: feesInUsd.toFixed(2),
    };
    
  } catch (error) {
    console.warn("Failed to fetch 24h metrics:", error);
    return {
      volume24h: "0",
      fees24h: "0",
    };
  }
}

async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  retries = 5,
  delay = 500
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      if (error.message.includes("429 Too Many Requests")) {
        console.warn(`🚨 RPC Rate Limit hit! Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error; // Stop retrying on other errors
      }
    }
  }
  throw new Error("Failed after multiple retries.");
}

describe("Meteora DLMM TVL Tests", () => {
  it("Should fetch all liquidity pools and check RETARDIO-SOL TVL", async () => {
    try {
      console.time("Fetching Liquidity Pairs");
      const allPairs = await DLMM.getLbPairs(connection, { programId: DLMM_PROGRAM_ID });
      console.timeEnd("Fetching Liquidity Pairs");

      console.log(`Total Liquidity Pairs Found: ${allPairs.length}`);
      if (allPairs.length === 0) throw new Error("No liquidity pairs found.");

      // Filter for RETARDIO-SOL pairs
      let RETARDIOSOLPairs = allPairs.filter(pair =>
        (pair.account.tokenXMint.equals(RETARDIO_MINT) && pair.account.tokenYMint.equals(SOL_MINT)) ||
        (pair.account.tokenXMint.equals(SOL_MINT) && pair.account.tokenYMint.equals(RETARDIO_MINT))
      );

      console.log(`RETARDIO-SOL Pairs Found: ${RETARDIOSOLPairs.length}`);
      if (RETARDIOSOLPairs.length === 0) throw new Error("No RETARDIO-SOL liquidity pairs found.");

      // Limit pairs to max 500 if >500
      if (RETARDIOSOLPairs.length > 500) {
        console.log(`Limiting processing to 500 pairs out of ${RETARDIOSOLPairs.length}`);
        RETARDIOSOLPairs = RETARDIOSOLPairs.slice(0, 500);
      }

      const tokenPrices = await fetchTokenPrices();
      let totalTVL = 0;

      // Suppress "429 Too Many Requests" error logs
      const originalConsoleError = console.error;
      console.error = (msg, ...args) => {
        if (typeof msg === "string" && msg.includes("429 Too Many Requests")) return;
        originalConsoleError(msg, ...args);
      };

      // Process all pairs, ensuring all async operations complete before logging
      const results = await Promise.allSettled(
        RETARDIOSOLPairs.map(async (pair) => {
          try {
            const dlmmInstance = await DLMM.create(connection, pair.publicKey);
            const reserveXInfo = await connection.getAccountInfo(dlmmInstance.tokenX.reserve);
            const reserveYInfo = await connection.getAccountInfo(dlmmInstance.tokenY.reserve);

            let reserveX = 0, reserveY = 0;
            if (reserveXInfo?.data) reserveX = parseFloat(AccountLayout.decode(reserveXInfo.data).amount.toString());
            if (reserveYInfo?.data) reserveY = parseFloat(AccountLayout.decode(reserveYInfo.data).amount.toString());

            const reserveXPrice = tokenPrices.retardio?.usd || 1;
            const reserveYPrice = tokenPrices.solana?.usd || 1;

            let poolTVL = (reserveX * reserveXPrice) + (reserveY * reserveYPrice);
            let dynamicFee = getDynamicFee(dlmmInstance);
            const binStep = dlmmInstance.lbPair.binStep / 100; // Convert to percentage

            // Get 24h metrics
            const { volume24h, fees24h } = await get24hMetrics(connection, dlmmInstance);

            return {
              poolId: pair.publicKey.toString(),
              poolTVL: poolTVL.toFixed(2),
              binStep,
              dynamicFee: dynamicFee.toFixed(2),
              volume24h: Number(volume24h).toFixed(2),
              fees24h: Number(fees24h).toFixed(2)
            };
          } catch (error) {
            return { error: `Error processing pool ${pair.publicKey.toString()}: ${error.message}` };
          }
        })
      );

      // Restore original console.error
      console.error = originalConsoleError;

      // Log only successful results
      results.forEach((result) => {
        if (result.status === "fulfilled" && !result.value?.error) {
          console.log(
            `Pool: ${result.value.poolId}, ` +
            `Pool TVL: $${result.value.poolTVL}, ` +
            `Bin Step: ${result.value.binStep}%, ` +
            `Dynamic Fee: ${result.value.dynamicFee}%, ` +
            `24h Volume: $${result.value.volume24h}, ` +
            `24h Fees: $${result.value.fees24h}`
          );
          totalTVL += parseFloat(result.value.poolTVL);
        } else {
          console.warn(result.status.toString() || "Unknown error processing pool");
        }
      });

      console.log(`Total TVL for RETARDIO-SOL pools: $${totalTVL.toFixed(2)}`);
      expect(totalTVL).toBeGreaterThan(0);

    } catch (error) {
      console.error("Error fetching TVL:", error);
      throw error;
    }
  });
});

describe("Meteora DLMM RETARDIO-SOL Pair Count Test", () => {
  it("Should verify there are between 10 and 100 RETARDIO-SOL pairs", async () => {
    try {
      console.time("Fetching Liquidity Pairs");
      const allPairs = await DLMM.getLbPairs(connection, { programId: DLMM_PROGRAM_ID });
      console.timeEnd("Fetching Liquidity Pairs");

      console.log("Total Liquidity Pairs Found:", allPairs.length);
      
      const RETARDIOSOLPairs = allPairs.filter(pair =>
        (pair.account.tokenXMint.equals(RETARDIO_MINT) && pair.account.tokenYMint.equals(SOL_MINT)) ||
        (pair.account.tokenXMint.equals(SOL_MINT) && pair.account.tokenYMint.equals(RETARDIO_MINT))
      );

      console.log("RETARDIO-SOL Pairs Found:", RETARDIOSOLPairs.length);
      
      // Assert that there are between 10 and 100 RETARDIO-SOL pairs
      expect(RETARDIOSOLPairs.length).toBeGreaterThan(10);
      expect(RETARDIOSOLPairs.length).toBeLessThan(100);
    } catch (error) {
      console.error("Error fetching RETARDIO-SOL pairs:", error);
      throw error;
    }
  });
});

describe("Meteora DLMM HAWK-SOL Pair Count Test", () => {
  it("Should verify there are between 10 and 100 HAWK-SOL pairs", async () => {
    try {
      // Suppress unwanted console errors
      const originalConsoleError = console.error;
      console.error = (msg, ...args) => {
        if (typeof msg === "string" && msg.includes("429 Too Many Requests")) return;
        originalConsoleError(msg, ...args);
      };

      console.time("Fetching Liquidity Pairs");
      const allPairs = await DLMM.getLbPairs(connection, { programId: DLMM_PROGRAM_ID });
      console.timeEnd("Fetching Liquidity Pairs");

      console.log(`Total Liquidity Pairs Found: ${allPairs.length}`);

      const hawkSolPairs = allPairs.filter(pair =>
        (pair.account.tokenXMint.equals(HAWK_MINT) && pair.account.tokenYMint.equals(SOL_MINT)) ||
        (pair.account.tokenXMint.equals(SOL_MINT) && pair.account.tokenYMint.equals(HAWK_MINT))
      );

      console.log(`HAWK-SOL Pairs Found: ${hawkSolPairs.length}`);

      if (hawkSolPairs.length > 0) {
        console.log("\n=== HAWK-SOL Pool Details ===");
        console.log(
          "------------------------------------------------------------------------------------------------"
        );
        console.log(
          "| Pool ID                | Bin Step | Active Bin | Protocol Fee X | Protocol Fee Y | Base Spread | Status  |"
        );
        console.log(
          "------------------------------------------------------------------------------------------------"
        );
      
        // Ensure all async calls resolve before logging
        const poolData = await Promise.all(
          hawkSolPairs.map(async (pair) => {
            try {
              const dlmmInstance = await DLMM.create(connection, pair.publicKey);
      
              return `| ${pair.publicKey.toString().slice(0, 20)}... | ` +
                     `${dlmmInstance.lbPair?.binStep ?? "N/A"}     | ` +
                     `${dlmmInstance.lbPair?.activeId ?? "N/A"}     | ` +
                     `${dlmmInstance.lbPair?.protocolFee?.amountX ?? "N/A"}         | ` +
                     `${dlmmInstance.lbPair?.protocolFee?.amountY ?? "N/A"}         | ` +
                     `${(dlmmInstance.lbPair?.parameters?.baseFactor ?? 0 / 10000).toFixed(2)}%        | ` +
                     `${dlmmInstance.lbPair?.status ?? "N/A"}  |`;
            } catch (error) {
              console.error(`Error processing pool ${pair.publicKey.toString()}:`, error);
              return `| ${pair.publicKey.toString().slice(0, 20)}... | ERROR | ERROR | ERROR | ERROR | ERROR | ERROR |`;
            }
          })
        );
      
        // Ensure logs only print valid data
        poolData.forEach(row => console.log(row));
      
        console.log(
          "------------------------------------------------------------------------------------------------"
        );
      }
      
      expect(hawkSolPairs.length).toBeGreaterThanOrEqual(10);
      expect(hawkSolPairs.length).toBeLessThanOrEqual(100);

      // Restore original console.error after test execution
      console.error = originalConsoleError;

    } catch (error) {
      console.error("Error fetching HAWK-SOL pairs:", error);
      throw error;
    }
  });
});

describe("Meteora DLMM Specific Pool Test", () => {
  it("Should verify existence of specific Retardio-SOL DLMM pool and output its details", async () => {
    try {
      // The specific pool address to check
      const specificPoolAddress = new PublicKey("BDrohyd6uDbazHuBEKMGUq9G74UY8SAS2yrU9SyC9K7L");
      
      console.log(`Fetching specific DLMM pool: ${specificPoolAddress.toString()}`);
      
      // Create DLMM instance for the specific pool
      const dlmmInstance = await DLMM.create(connection, specificPoolAddress);
      
      // Verify the pool exists and is a Retardio-SOL pool
      const isRetardioSolPool = 
        (dlmmInstance.tokenX.publicKey.equals(RETARDIO_MINT) && dlmmInstance.tokenY.publicKey.equals(SOL_MINT)) ||
        (dlmmInstance.tokenX.publicKey.equals(SOL_MINT) && dlmmInstance.tokenY.publicKey.equals(RETARDIO_MINT));
      
      expect(isRetardioSolPool).toBe(true);
      
      // Output pool details
      console.log("Pool Details:");
      console.log(`- Pool ID: ${specificPoolAddress.toString()}`);
      console.log(`- Bin Step: ${dlmmInstance.lbPair.binStep}`);
      console.log(`- Active Bin: ${dlmmInstance.lbPair.activeId}`);
      console.log(`- Protocol Fee: ${dlmmInstance.lbPair.protocolFee}`);
      console.log(`- Base Spread: ${dlmmInstance.lbPair.parameters.baseFactor / 10000}%`);
      console.log(`- Status: ${dlmmInstance.lbPair.status}`);

      // Get reserves
      const reserveXInfo = await connection.getAccountInfo(dlmmInstance.tokenX.reserve);
      const reserveYInfo = await connection.getAccountInfo(dlmmInstance.tokenY.reserve);
      
      let reserveX = 0, reserveY = 0;
      if (reserveXInfo?.data) reserveX = parseFloat(AccountLayout.decode(reserveXInfo.data).amount.toString());
      if (reserveYInfo?.data) reserveY = parseFloat(AccountLayout.decode(reserveYInfo.data).amount.toString());
      
      console.log(`- Reserve X: ${reserveX}`);
      console.log(`- Reserve Y: ${reserveY}`);
      
      // Get dynamic fee
      const dynamicFee = getDynamicFee(dlmmInstance);
      console.log(`- Dynamic Fee: ${dynamicFee.toFixed(2)}%`);
      
      // Get 24h metrics
      const { volume24h, fees24h } = await get24hMetrics(connection, dlmmInstance);
      console.log(`- 24h Volume: $${Number(volume24h).toFixed(2)}`);
      console.log(`- 24h Fees: $${Number(fees24h).toFixed(2)}`);
      
    } catch (error) {
      console.error("Error fetching specific DLMM pool:", error);
      throw error;
    }
  });
});

afterAll(async () => {
  console.log("✅ Closing Solana connection...");
  await new Promise((resolve) => setTimeout(resolve, 1000));
});