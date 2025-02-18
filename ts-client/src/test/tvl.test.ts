import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "../dlmm/index";
import { AccountLayout } from "@solana/spl-token";

// Meteora DLMM Program ID
const DLMM_PROGRAM_ID = new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo");
const DYNAMIC_AMM_PROGRAM_ID = new PublicKey("Eo7WjKq67rjJQSZxS6z3YkapzY3eMj6Xy8X5EQVn5UaB");
const HAWK_MINT = new PublicKey("HAWKThXRcNL9ZGZKqgUXLm4W8tnRZ7U6MVdEepSutj34"); // Replace with actual address
const SOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");  // Replace with actual address
const TRUMP_MINT = new PublicKey("6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN")

// Alternative RPC provider to avoid Alchemy restrictions
const connection = new Connection("https://rpc.helius.xyz/?api-key=1c510177-8d47-41f2-9053-d3a30f3f81cf", {
  commitment: "confirmed",
});

describe("Meteora DLMM TVL Tests", () => {
  it("Should fetch all liquidity pools and check TRUMP-SOL TVL", async () => {
    try {
      // Fetch all liquidity pools managed by DLMM using a more RPC-friendly mSOLod
      const allPairs = await DLMM.getLbPairs(connection, { programId: DLMM_PROGRAM_ID });
      console.log("Total Liquidity Pairs Found:", allPairs.length);

      if (allPairs.length === 0) {
        throw new Error("No liquidity pairs found. DLMM may not be active or accessible.");
      }

      // Filter for TRUMP-SOL pairs
      const TRUMPSOLPairs = allPairs.filter(pair => {
        const { tokenXMint, tokenYMint } = pair.account;
        return (
          (tokenXMint.equals(TRUMP_MINT) && tokenYMint.equals(SOL_MINT)) ||
          (tokenXMint.equals(SOL_MINT) && tokenYMint.equals(TRUMP_MINT))
        );
      });

      console.log("TRUMP-SOL Pairs Found:", TRUMPSOLPairs.length);

      if (TRUMPSOLPairs.length === 0) {
        throw new Error("No TRUMP-SOL liquidity pairs found.");
      }

      // Compute total TVL from all TRUMP-SOL pairs using getAccountInfo
      let totalTVL = 0;
      for (const pair of TRUMPSOLPairs) {
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

        totalTVL += reserveX + reserveY;
      }

      console.log("Total TVL for TRUMP-SOL:", totalTVL);
      expect(totalTVL).toBeGreaterThan(200_000_000);
    } catch (error) {
      console.error("Error fetching TVL:", error);
      throw error;
    }
  });
});