

import { Quote, Trade } from '../types';

export const isValidQuote = (quote: Quote): boolean => {
  return !quote.bid.isNegative() && 
         !quote.ask.isNegative() && 
         quote.bid.lessThan(quote.ask);
};

export const isValidTrade = (trade: Trade): boolean => {
  return !trade.price.isNegative() && 
         !trade.size.isNegative() && 
         trade.timestamp.isValid;
};

export class AnalyticsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}