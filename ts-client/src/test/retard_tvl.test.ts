import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm/index";
import { AccountLayout } from "@solana/spl-token";
import Decimal from "decimal.js";
import BN from "bn.js";
import { deriveOracle } from "../dlmm/helpers/derive";

// Meteora DLMM Program ID
const DLMM_PROGRAM_ID = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const DYNAMIC_AMM_PROGRAM_ID = new PublicKey("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");
const HAWK_MINT = new PublicKey("HAWKThXRcNL9ZGZKqgUXLm4W8tnRZ7U6MVdEepSutj34");
const RETARDIO_MINT = new PublicKey("6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const TRUMP_MINT = new PublicKey("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN");

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

function getDynamicFee(pair) {
  let vParameterClone = Object.assign({}, pair.vParameters);
  let activeId = new BN(pair.activeId);
  const sParameters = pair.parameters;

  const currentTimestamp = Date.now() / 1000;
  pair.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
  pair.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());

  const totalFee = pair.getTotalFee(pair.binStep, sParameters, vParameterClone);
  return new Decimal(totalFee.toString()).div(new Decimal("1000000")).mul(100);
}

async function get24hMetrics(connection: Connection, dlmmInstance: DLMM) {
  try {
    const [oraclePda] = deriveOracle(dlmmInstance.pubkey, dlmmInstance.program.programId);
    const oracleAccount = await connection.getAccountInfo(oraclePda);
    
    if (!oracleAccount) {
      throw new Error("Oracle account not found");
    }

    // Get timestamp 24h ago
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestamp24hAgo = currentTimestamp - 24 * 60 * 60;
    
    // The oracle data starts after the 8-byte discriminator
    const oracleData = oracleAccount.data.slice(8);
    
    // First 24 bytes contain Oracle struct (8 bytes each for idx, active_size, length)
    const idx = new BN(oracleData.slice(0, 8), 'le').toNumber();
    const activeSize = new BN(oracleData.slice(8, 16), 'le').toNumber();
    
    // Each Observation is 32 bytes (16 for cumulative_active_bin_id, 8 for created_at, 8 for last_updated_at)
    const OBSERVATION_SIZE = 32;
    const observationsData = oracleData.slice(24); // Skip Oracle struct

    let volume24h = new BN(0);
    let fees24h = new BN(0);

    // Process observations within last 24h
    for (let i = 0; i < activeSize; i++) {
      const obsIndex = (idx - i + activeSize) % activeSize;
      const obsStart = obsIndex * OBSERVATION_SIZE;
      
      const createdAt = new BN(observationsData.slice(obsStart + 16, obsStart + 24), 'le').toNumber();
      const lastUpdatedAt = new BN(observationsData.slice(obsStart + 24, obsStart + 32), 'le').toNumber();
      
      if (lastUpdatedAt >= timestamp24hAgo && createdAt > 0) {
        // This observation is within our 24h window and is initialized
        const cumulativeId = new BN(observationsData.slice(obsStart, obsStart + 16), 'le');
        
        // Calculate volume and fees based on cumulative values
        // Note: This is a simplified calculation - you may need to adjust based on actual oracle data structure
        volume24h = volume24h.add(cumulativeId.abs());
      }
    }

    // Convert to USD using token prices
    const volumeInUsd = volume24h.toNumber() / Math.pow(10, dlmmInstance.tokenX.decimal);
    const feesInUsd = volumeInUsd * (dlmmInstance.getDynamicFee().toNumber() / 100); // Estimate fees based on current fee rate

    return {
      volume24h: volumeInUsd,
      fees24h: feesInUsd
    };
  } catch (error) {
    console.warn("Failed to fetch 24h metrics:", error);
    return {
      volume24h: 0,
      fees24h: 0
    };
  }
}

describe("Meteora DLMM TVL Tests", () => {
  it("Should fetch all liquidity pools and check RETARDIO-SOL TVL", async () => {
    try {
      const allPairs = await DLMM.getLbPairs(connection, { programId: DLMM_PROGRAM_ID });
      console.log("Total Liquidity Pairs Found:", allPairs.length);
      if (allPairs.length === 0) throw new Error("No liquidity pairs found.");

      const RETARDIOSOLPairs = allPairs.filter(pair =>
        (pair.account.tokenXMint.equals(RETARDIO_MINT) && pair.account.tokenYMint.equals(SOL_MINT)) ||
        (pair.account.tokenXMint.equals(SOL_MINT) && pair.account.tokenYMint.equals(RETARDIO_MINT))
      );

      console.log("RETARDIO-SOL Pairs Found:", RETARDIOSOLPairs.length);
      const tokenPrices = await fetchTokenPrices();
      let totalTVL = 0;
      if (RETARDIOSOLPairs.length === 0) throw new Error("No RETARDIO-SOL liquidity pairs found.");

      for (const pair of RETARDIOSOLPairs) {
        console.log(`\n=== Pool: ${pair.publicKey.toString()} ===`);
        const dlmmInstance = await DLMM.create(connection, pair.publicKey);
        const reserveXInfo = await connection.getAccountInfo(dlmmInstance.tokenX.reserve);
        const reserveYInfo = await connection.getAccountInfo(dlmmInstance.tokenY.reserve);
        
        let reserveX = 0, reserveY = 0;
        if (reserveXInfo?.data) reserveX = parseFloat(AccountLayout.decode(reserveXInfo.data).amount.toString());
        if (reserveYInfo?.data) reserveY = parseFloat(AccountLayout.decode(reserveYInfo.data).amount.toString());

        const reserveXPrice = tokenPrices.retardio?.usd || 1;
        const reserveYPrice = tokenPrices.solana?.usd || 1;
        
        let poolTVL = (reserveX * reserveXPrice) + (reserveY * reserveYPrice);
        let dynamicFee = getDynamicFee(pair);

        console.log(`Pool TVL: $${poolTVL.toFixed(2)}, Dynamic Fee: ${dynamicFee.toFixed(2)}%`);
        totalTVL += poolTVL;
      }

      console.log(`Total TVL for RETARDIO-SOL pools: $${totalTVL.toFixed(2)}`);
      expect(totalTVL).toBeGreaterThan(0);
    } catch (error) {
      console.error("Error fetching TVL:", error);
      throw error;
    }
  });
});