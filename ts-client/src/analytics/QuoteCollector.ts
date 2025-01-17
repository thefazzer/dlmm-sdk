

import { DateTime, Duration } from 'luxon';
import { Quote } from './types';

import { Result } from '../utils/result';

export class QuoteCollector {
  private readonly windowSize: Duration;
  private readonly samplingInterval: Duration;
  private readonly maxGapFill?: Duration;

  constructor(windowSize: Duration, samplingInterval: Duration, maxGapFill?: Duration) {
    this.windowSize = windowSize;
    this.samplingInterval = samplingInterval;
    this.maxGapFill = maxGapFill;
  }

  processQuotes(quotes: Quote[]): Quote[] {
    if (!quotes.length) return [];

    const sorted = [...quotes].sort((a, b) => 
      a.timestamp.toMillis() - b.timestamp.toMillis()
    );

    this.validateQuotes(sorted);
    return this.fillGaps(sorted);
  }

  private validateQuotes(quotes: Quote[]): void {
    const now = DateTime.now();
    
    for (const quote of quotes) {
      if (now.diff(quote.timestamp) > this.windowSize) {
        throw new Error('Stale quote detected');
      }
      if (quote.bid.isNegative() || quote.ask.isNegative()) {
        throw new Error('Invalid quote data');
      }
      if (quote.bid.greaterThanOrEqualTo(quote.ask)) {
        throw new Error('Invalid spread');
      }
    }
  }

  private fillGaps(quotes: Quote[]): Quote[] {
    if (!this.maxGapFill || quotes.length < 2) return quotes;
    
    const result: Quote[] = [quotes[0]];
    
    for (let i = 1; i < quotes.length; i++) {
      const gap = quotes[i].timestamp.diff(quotes[i-1].timestamp);
      
      if (gap > this.maxGapFill) {
        throw new Error('Gap too large');
      }
      
      result.push(quotes[i]);
    }
    
    return result;
  processQuotes(quotes: Quote[]): Result<Quote[], Error> {
    try {
      if (!quotes.length) return Result.ok([]);

      const sorted = [...quotes].sort((a, b) => 
        a.timestamp.toMillis() - b.timestamp.toMillis()
      );

      this.validateQuotes(sorted);
      return Result.ok(this.fillGaps(sorted));
    } catch (error) {
      return Result.err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  detectPriceJumps(quotes: Quote[], threshold: Decimal): number[] {
    const jumps: number[] = [];
    for (let i = 1; i < quotes.length; i++) {
      const priceDiff = quotes[i].bid.minus(quotes[i-1].bid).abs();
      const relativeJump = priceDiff.div(quotes[i-1].bid);
      if (relativeJump.greaterThan(threshold)) {
        jumps.push(i);
      }
    }
    return jumps;
  }
}