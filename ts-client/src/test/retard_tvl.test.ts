import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm/index";
import { AccountLayout } from "@solana/spl-token";

// Meteora DLMM Program ID
const DLMM_PROGRAM_ID = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const DYNAMIC_AMM_PROGRAM_ID = new PublicKey("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");
const HAWK_MINT = new PublicKey("HAWKThXRcNL9ZGZKqgUXLm4W8tnRZ7U6MVdEepSutj34");
const RETARDIO_MINT = new PublicKey("6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx");
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");
const TRUMP_MINT = new PublicKey("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN")

// Alternative RPC provider to avoid Alchemy restrictions
const connection = new Connection("https://rpc.helius.xyz/?api-key=1c510177-8d47-41f2-9053-d3a30f3f81cf", {
  commitment: "confirmed",
});

async function fetchTokenPrices() {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=RETARDIO,SOLANA&vs_currencies=usd`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return {};
  }
}

describe("Meteora DLMM TVL Tests", () => {
  it("Should fetch all liquidity pools and check RETARDIO-SOL TVL", async () => {
      try {
        // Fetch all liquidity pools managed by DLMM using a more RPC-friendly mSOLod
        const allPairs = await DLMM.getLbPairs(connection, { programId: DLMM_PROGRAM_ID });
        console.log("Total Liquidity Pairs Found:", allPairs.length);

        if (allPairs.length === 0) {
          throw new Error("No liquidity pairs found. DLMM may not be active or accessible.");
        }

          // Filter for RETARDIO-SOL pairs
          const RETARDIOSOLPairs = allPairs.filter(pair => {
            const { tokenXMint, tokenYMint } = pair.account;
            return (
              (tokenXMint.equals(RETARDIO_MINT) && tokenYMint.equals(SOL_MINT)) ||
              (tokenXMint.equals(SOL_MINT) && tokenYMint.equals(RETARDIO_MINT))
            );
          });

        console.log("RETARDIO-SOL Pairs Found:", RETARDIOSOLPairs.length);
        const tokenPrices = await fetchTokenPrices();

        // Compute total TVL from all RETARDIO-SOL pairs using getAccountInfo
        let totalTVL = 0;
        if (RETARDIOSOLPairs.length === 0) {
          throw new Error("No RETARDIO-SOL liquidity pairs found.");
        }

        for (const pair of RETARDIOSOLPairs) {
          const dlmmInstance = await DLMM.create(connection, pair.publicKey);
          const reserveXInfo = await connection.getAccountInfo(dlmmInstance.tokenX.reserve);
          const reserveYInfo = await connection.getAccountInfo(dlmmInstance.tokenY.reserve);
          
          let reserveX = 0, reserveY = 0;
          if (reserveXInfo?.data) {
            const decodedX = AccountLayout.decode(reserveXInfo.data);
            reserveX = parseFloat(decodedX.amount.toString());
          }
          if (reserveYInfo?.data) {
            const decodedY = AccountLayout.decode(reserveYInfo.data);
            reserveY = parseFloat(decodedY.amount.toString());
          }

          // Convert reserves to USD value based on token prices
          const reserveXPrice = tokenPrices.retardio.usd
          const reserveYPrice = tokenPrices.solana.usd
          
          totalTVL += (reserveX * reserveXPrice) + (reserveY * reserveYPrice);
        }

        console.log(`Total TVL for all ${RETARDIOSOLPairs.length} RETARDIO-SOL pools:`, totalTVL);
        expect(totalTVL).toBeGreaterThan(0);

      } catch (error) {
        console.error("Error fetching TVL:", error);
        throw error;
    }
  });
});