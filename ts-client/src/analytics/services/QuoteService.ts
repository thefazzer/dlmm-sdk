import { Decimal } from 'decimal.js';
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
    const latest = this.quotes.peekLast();

    if (!latest || !latest.ask || !latest.bid) {
      return new Decimal(0);
    }

    const ask = new Decimal(latest.ask);
    const bid = new Decimal(latest.bid);

    if (ask.lessThan(bid)) {
      throw new AnalyticsError(
        'Invalid spread: ask price is lower than bid price',
        'INVALID_SPREAD',
        latest
      );
    }

    return ask.minus(bid);
  }
}
