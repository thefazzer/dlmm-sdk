import { QuoteCollector } from '../analytics/QuoteCollector';
import { Quote } from '../analytics/types';
import { Decimal } from 'decimal.js';
import { DateTime, Duration } from 'luxon';

describe('QuoteCollector', () => {
  const windowSize = Duration.fromObject({ minutes: 10 });
  const samplingInterval = Duration.fromObject({ seconds: 30 });
  const maxGapFill = Duration.fromObject({ minutes: 1 });

  const collector = new QuoteCollector(windowSize, samplingInterval, maxGapFill);

  it('processes valid quotes', () => {
    const quotes: Quote[] = [
      {
        timestamp: DateTime.now().minus({ minutes: 5 }).toISO()!,
        bid: new Decimal(100),
        ask: new Decimal(101),
        isStale: false,
      },
      {
        timestamp: DateTime.now().toISO()!,
        bid: new Decimal(102),
        ask: new Decimal(103),
        isStale: false,
      },
    ];

    const result = collector.processQuotes(quotes);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(2); // Original length maintained
  });

  it('detects price jumps above threshold', () => {
    const quotes: Quote[] = [
      {
        timestamp: DateTime.now().minus({ minutes: 5 }).toISO()!,
        bid: new Decimal(100),
        ask: new Decimal(101),
        isStale: false,
      },
      {
        timestamp: DateTime.now().toISO()!,
        bid: new Decimal(120),
        ask: new Decimal(121),
        isStale: false,
      },
    ];

    const jumps = collector.detectPriceJumps(quotes, new Decimal('0.1'));
    expect(jumps).toHaveLength(1); // One jump detected
  });

  it('handles empty quotes gracefully', () => {
    const quotes: Quote[] = [];
    const result = collector.processQuotes(quotes);
    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toHaveLength(0);
  });
});
