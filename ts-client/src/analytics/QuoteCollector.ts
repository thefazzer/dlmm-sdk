import { Quote } from './types';
import { Result } from './utils/result';
import { DateTime, Duration } from 'luxon';
import { Decimal } from 'decimal.js';

export class QuoteCollector {
  constructor(
    private readonly windowSize: Duration,
    private readonly samplingInterval: Duration,
    private readonly maxGapFill?: Duration
  ) {}

  processQuotes(quotes: Quote[]): Result<Quote[], Error> {
    try {
      if (!quotes.length) return Result.ok([]);
  
      const sorted = [...quotes].sort((a, b) =>
        DateTime.fromISO(a.timestamp).toMillis() - DateTime.fromISO(b.timestamp).toMillis()
      );
  
      this.validateQuotes(sorted);
  
      const filledQuotes = this.fillGaps(sorted);
      return Result.ok(filledQuotes);
    } catch (error) {
      console.error('Error in processQuotes:', error); // Add logging here
      return Result.err(error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  detectPriceJumps(quotes: Quote[], threshold: Decimal): number[] {
    const jumps: number[] = [];
    for (let i = 1; i < quotes.length; i++) {
      const priceDiff = quotes[i].bid.minus(quotes[i - 1].bid).abs();
      const relativeJump = priceDiff.div(quotes[i - 1].bid);
      if (relativeJump.greaterThan(threshold)) {
        jumps.push(i);
      }
    }
    return jumps;
  }

  private validateQuotes(quotes: Quote[]): void {
    const now = DateTime.now();

    for (const quote of quotes) {
      const timestamp = DateTime.fromISO(quote.timestamp);
      if (now.diff(timestamp) > this.windowSize) {
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
      const prev = quotes[i - 1];
      const curr = quotes[i];
      const prevTimestamp = DateTime.fromISO(prev.timestamp);
      const currTimestamp = DateTime.fromISO(curr.timestamp);
      const gap = currTimestamp.diff(prevTimestamp);

      if (gap > this.maxGapFill) {
        throw new Error('Gap too large');
      }

      let nextTimestamp = prevTimestamp.plus(this.samplingInterval);
      while (nextTimestamp < currTimestamp) {
        result.push({
          timestamp: nextTimestamp.toISO()!, // Convert back to ISO string
          bid: prev.bid,
          ask: prev.ask,
          isStale: prev.isStale,
        });
        nextTimestamp = nextTimestamp.plus(this.samplingInterval);
      }

      result.push(curr);
    }

    return result;
  }
}
