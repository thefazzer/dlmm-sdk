import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm";
import Decimal from "decimal.js";

const TRUMP_MINT = new PublicKey("TRUMPrdeRw2BHAU7vt5oKKEEjFvz6JqKxZKEn8sHpy7");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_DECIMALS = 6;

describe("TVL tests", () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");

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
      
      // Convert to USD value (for USDC, 1 USDC = $1)
      const tvlUsd = new Decimal(usdcReserve.toString())
        .div(new Decimal(10).pow(USDC_DECIMALS))
        .mul(2); // Multiply by 2 since pools are balanced

      totalTvlUsd = totalTvlUsd.add(tvlUsd);
      
      console.log(`Pool ${pair.publicKey.toBase58()} TVL: $${tvlUsd.toFixed(2)}`);
    }

    console.log(`Total TRUMP-USDC TVL: $${totalTvlUsd.toFixed(2)}`);

    // Check if TVL > $200MM
    expect(totalTvlUsd.gte(new Decimal(200_000_000))).toBe(true);
  }, 30000); // Increased timeout since we're making multiple RPC calls
});