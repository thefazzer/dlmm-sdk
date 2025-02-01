

import { Decimal } from 'decimal.js';
import { Quote, Trade } from '../types';

export const calculateVWAP = (trades: ReadonlyArray<Trade>): Decimal => {
  if (!trades.length) {
    return new Decimal(0);
  }

  const [volumePriceSum, totalVolume] = trades.reduce(
    ([sum, volume], trade) => [
      sum.plus(trade.price.mul(trade.size)),
      volume.plus(trade.size)
    ],
    [new Decimal(0), new Decimal(0)]
  );

  return totalVolume.isZero() ? 
    new Decimal(0) : 
    volumePriceSum.div(totalVolume);
};

export const calculateImbalance = (
  trades: ReadonlyArray<Trade>,
  windowSize: number
): Decimal => {
  const filtered = trades.filter(t => 
    Date.now() - t.timestamp.toMillis() <= windowSize
  );

  const [buyVolume, sellVolume] = filtered.reduce(
    ([buy, sell], trade) => trade.isBuyer ? 
      [buy.plus(trade.size), sell] : 
      [buy, sell.plus(trade.size)],
    [new Decimal(0), new Decimal(0)]
  );

  const total = buyVolume.plus(sellVolume);
  return total.isZero() ? 
    new Decimal(0) : 
    buyVolume.minus(sellVolume).div(total);
};