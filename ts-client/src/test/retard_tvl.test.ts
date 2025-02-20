import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm/index";
import { AccountLayout } from "@solana/spl-token";
import Decimal from "decimal.js";
import BN from "bn.js";

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

function getDynamicFee(dlmmInstance) {
  let vParameterClone = Object.assign({}, dlmmInstance.lbPair.vParameters);
  let activeId = new BN(dlmmInstance.lbPair.activeId);
  const sParameters = dlmmInstance.lbPair.parameters;

  const currentTimestamp = Date.now() / 1000;
  dlmmInstance.updateReference(
    activeId.toNumber(),
    vParameterClone,
    sParameters,
    currentTimestamp
  );
  dlmmInstance.updateVolatilityAccumulator(
    vParameterClone,
    sParameters,
    activeId.toNumber()
  );

  const totalFee = dlmmInstance.getTotalFee(
    dlmmInstance.lbPair.binStep,
    sParameters,
    vParameterClone
  );
  return new Decimal(totalFee.toString()).div(new Decimal("1000000")).mul(100);
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
        let dynamicFee = getDynamicFee(dlmmInstance);

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