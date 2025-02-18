

import { Quote } from '../types';
import { CircularBuffer } from '../utils/CircularBuffer';
import { isValidQuote } from '../utils/guards';
import { AnalyticsError } from '../utils/guards';

export class QuoteService {
  private readonly quotes: CircularBuffer<Quote>;
  
  constructor(capacity: number = 300) {
    this.quotes = new CircularBuffer(capacity);
  }

  addQuote(quote: Quote): void {
    if (!isValidQuote(quote)) {
      throw new AnalyticsError(
        'Invalid quote data',
        'INVALID_QUOTE',
        quote
      );
    }
    this.quotes.push(quote);
  }

  getSpread(): Decimal {
    const latest = Array.from(this.quotes).pop();
    return latest ? 
      latest.ask.minus(latest.bid) : 
      new Decimal(0);
  }
}