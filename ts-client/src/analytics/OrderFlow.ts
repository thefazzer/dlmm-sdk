
import { DateTime, Duration } from 'luxon';
import { Decimal } from 'decimal.js';
import { Trade, TradeAggressor } from './types';

export class OrderFlow {
  private trades: Trade[] = [];
  private buyVolume: Map<number, Decimal> = new Map();
  private sellVolume: Map<number, Decimal> = new Map();
  private readonly historySize: number = 300; // 5 minutes

  addTrade(price: Decimal, size: Decimal, isBuyer: boolean): void {
    const timestamp = DateTime.now().toUnixInteger();
    
    const trade: Trade = {
      timestamp: DateTime.fromSeconds(timestamp),
      price,
      size,
      isBuyer,
      aggressor: isBuyer ? TradeAggressor.Buyer : TradeAggressor.Seller
    };

    if (this.trades.length >= this.historySize) {
      this.trades.shift();
    }
    this.trades.push(trade);

    const volume = this.isBuyer ? this.buyVolume : this.sellVolume;
    if (volume.size >= this.historySize) {
      const oldestKey = Math.min(...volume.keys());
      volume.delete(oldestKey);
    }
    volume.set(timestamp, size);
  }

  calculateImbalance(windowSecs: number): Decimal {
    const now = DateTime.now().toUnixInteger();
    const cutoff = now - windowSecs;

    const buySum = this.sumVolume(this.buyVolume, cutoff);
    const sellSum = this.sumVolume(this.sellVolume, cutoff);
    const total = buySum.plus(sellSum);

    return total.isZero() ? 
      new Decimal(0) : 
      buySum.minus(sellSum).div(total);
  }

  private sumVolume(volume: Map<number, Decimal>, cutoff: number): Decimal {
    return Array.from(volume.entries())
      .filter(([timestamp]) => timestamp >= cutoff)
      .reduce((sum, [_, size]) => sum.plus(size), new Decimal(0));
  }

  getVWAP(windowSecs: number): Decimal | null {
    const now = DateTime.now().toUnixInteger();
    const cutoff = now - windowSecs;

    const trades = this.trades.filter(t => 
      t.timestamp.toUnixInteger() >= cutoff
    );

    if (!trades.length) return null;

    const volumePriceSum = trades.reduce((sum, t) => 
      sum.plus(t.price.mul(t.size)), new Decimal(0)
    );

    const totalVolume = trades.reduce((sum, t) => 
      sum.plus(t.size), new Decimal(0)
    );

    return volumePriceSum.div(totalVolume);
  }
}