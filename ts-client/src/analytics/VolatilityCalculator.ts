

import { Decimal } from 'decimal.js';
import { Duration } from 'luxon';

import { logger } from './utils/logger';


export class VolatilityCalculator {
  constructor(
    private readonly windows: ReadonlyArray<Duration>,
    private readonly minSamples: number,
    private readonly config: AnalyticsConfig
  ) {
    if (!windows.length) {
      throw new Error('At least one window duration is required');
    }
    if (windows.some(w => w.toMillis() <= 0)) {
      throw new Error('Window durations must be positive');
    }
  }

  calculate(prices: ReadonlyArray<Decimal>, window: Duration): Result<Decimal, Error> {
    try {
      if (prices.length < this.minSamples) {
        return Result.err(new Error(`Insufficient samples: ${prices.length} < ${this.minSamples}`));
      }

      if (prices.some(p => !p.isFinite())) {
        return Result.err(new Error('Non-finite price values detected'));
      }

      const returns = this.calculateReturns(prices);
      return Result.ok(this.computeVolatility(returns));
      
    } catch (error) {
      logger.error('Volatility calculation failed:', error);
      return Result.err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private calculateReturns(prices: ReadonlyArray<Decimal>): Decimal[] {
    return prices.slice(1).map((price, i) => {
      try {
        return price.div(prices[i]).ln();
      } catch (error) {
        throw new Error(`Failed to calculate return at index ${i}: ${error.message}`);
      }
    });
  }
}