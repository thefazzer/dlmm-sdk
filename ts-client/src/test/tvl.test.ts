import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm";
import Decimal from "decimal.js";

const TRUMP_MINT = new PublicKey("TRUMPrdeRw2BHAU7vt5oKKEEjFvz6JqKxZKEn8sHpy7");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_DECIMALS = 6;

describe("TVL tests", () => {
  // Connect to local validator which is synced with mainnet
  const connection = new Connection("http://127.0.0.1:8899", {
    commitment: "confirmed",
    wsEndpoint: "ws://127.0.0.1:8900"
  });

  it("TRUMP-USDC pools TVL should be > $200MM", async () => {
    // Get all LB pairs
    const allPairs = await DLMM.getLbPairs(connection);
    
    // Filter for TRUMP-USDC pairs
    const trumpUsdcPairs = allPairs.filter(pair => {
      const { tokenXMint, tokenYMint } = pair.account;
      return (
        (tokenXMint.equals(TRUMP_MINT) && tokenYMint.equals(USDC_MINT)) ||
        (tokenXMint.equals(USDC_MINT) && tokenYMint.equals(TRUMP_MINT))
      );
    });

    console.log(`Found ${trumpUsdcPairs.length} TRUMP-USDC pairs`);

    // Calculate total TVL across all pairs
    let totalTvlUsd = new Decimal(0);

    for (const pair of trumpUsdcPairs) {
      const dlmm = await DLMM.create(connection, pair.publicKey);
      
      // Get reserves
      const usdcReserve = dlmm.tokenX.publicKey.equals(USDC_MINT) 
        ? dlmm.tokenX.amount 
        : dlmm.tokenY.amount;
      
      const trumpReserve = dlmm.tokenX.publicKey.equals(TRUMP_MINT)
        ? dlmm.tokenX.amount
        : dlmm.tokenY.amount;

      // Get active bin price to value TRUMP tokens
      const activeBin = await dlmm.getActiveBin();
      const trumpPriceInUsdc = Number(dlmm.fromPricePerLamport(Number(activeBin.price)));
      
      // Calculate TVL in USD
      const usdcValue = new Decimal(usdcReserve.toString())
        .div(new Decimal(10).pow(USDC_DECIMALS));
        
      const trumpValue = new Decimal(trumpReserve.toString())
        .div(new Decimal(10).pow(USDC_DECIMALS))
        .mul(trumpPriceInUsdc);

      const pairTvl = usdcValue.add(trumpValue);
      totalTvlUsd = totalTvlUsd.add(pairTvl);
      
      console.log(`Pool ${pair.publicKey.toBase58()}:`);
      console.log(`- USDC Reserve: $${usdcValue.toFixed(2)}`);
      console.log(`- TRUMP Reserve: ${trumpReserve.toString()} (Worth $${trumpValue.toFixed(2)})`);
      console.log(`- TRUMP Price: $${trumpPriceInUsdc}`);
      console.log(`- Total TVL: $${pairTvl.toFixed(2)}\n`);
    }

    console.log(`Total TRUMP-USDC TVL: $${totalTvlUsd.toFixed(2)}`);

    // Check if TVL > $200MM
    expect(totalTvlUsd.gte(new Decimal(200_000_000))).toBe(true);
  }, 30000);
});