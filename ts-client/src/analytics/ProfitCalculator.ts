

import { Decimal } from 'decimal.js';
import { DateTime } from 'luxon';

export interface TradePnL {
  timestamp: DateTime;
  entryPrice: Decimal;
  exitPrice: Decimal;
  amount: Decimal;
}

export interface ProfitMetrics {
  totalProfit: Decimal;
  profitPerTrade: Decimal;
  winRate: Decimal;
}

export class ProfitCalculator {
  private trades: TradePnL[] = [];

  addTrade(trade: TradePnL): void {
    this.trades.push(trade);
  }

  calculateMetrics(): ProfitMetrics {
    let totalProfit = new Decimal(0);
    let winningTrades = 0;

    for (const trade of this.trades) {
      const profit = trade.exitPrice
        .minus(trade.entryPrice)
        .mul(trade.amount);
      
      totalProfit = totalProfit.plus(profit);
      if (profit.isPositive()) {
        winningTrades++;
      }
    }

    const profitPerTrade = this.trades.length ? 
      totalProfit.div(this.trades.length) : 
      new Decimal(0);

    const winRate = this.trades.length ? 
      new Decimal(winningTrades).div(this.trades.length) : 
      new Decimal(0);

    return {
      totalProfit,
      profitPerTrade,
      winRate
    };
  }
}