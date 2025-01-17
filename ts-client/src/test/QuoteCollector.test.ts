

import { QuoteCollector } from '../analytics/QuoteCollector';
import { createTestQuote } from './setup';
import { Duration } from 'luxon';

describe('QuoteCollector', () => {
  const collector = new QuoteCollector(
    Duration.fromObject({ minutes: 5 }),
    Duration.fromObject({ seconds: 30 }),
    Duration.fromObject({ minutes: 1 })
  );

  describe('quote processing', () => {
    it('processes valid quotes', () => {
      const quotes = [createTestQuote('100', '101')];
      const result = collector.processQuotes(quotes);
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toHaveLength(1);
    });

    it('handles stale quotes', () => {
      const quotes = [createTestQuote('100', '101', 360)]; // 6 minutes old
      const result = collector.processQuotes(quotes);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toContain('Stale quote');
    });

    it('validates spreads', () => {
      const quotes = [createTestQuote('101', '100')]; // Invalid spread
      const result = collector.processQuotes(quotes);
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toContain('Invalid spread');
    });

    it('detects price jumps', () => {
      const quotes = [
        createTestQuote('100', '101'),
        createTestQuote('120', '121'), // 20% jump
      ];
      const jumps = collector.detectPriceJumps(quotes, new Decimal('0.1'));
      expect(jumps).toEqual([1]);
    });
  });
});