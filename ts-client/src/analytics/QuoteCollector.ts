

import { DateTime, Duration } from 'luxon';
import { Quote } from './types';

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
  }
}