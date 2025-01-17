

import { DateTime, Duration } from 'luxon';
import { Decimal } from 'decimal.js';
import { QuoteCollector } from '../analytics/QuoteCollector';
import { VolatilityCalculator } from '../analytics/VolatilityCalculator';
import { Quote } from '../analytics/types';

describe('QuoteCollector', () => {
  const collector = new QuoteCollector(
    Duration.fromObject({ minutes: 5 }),
    Duration.fromObject({ seconds: 30 }),
    Duration.fromObject({ minutes: 1 })
  );

  test('processes valid quotes', () => {
    const now = DateTime.now();
    const quotes: Quote[] = [{
      timestamp: now,
      bid: new Decimal('100'),
      ask: new Decimal('101'),
      isStale: false
    }];

    const processed = collector.processQuotes(quotes);
    expect(processed.length).toBe(1);
  });

  test('detects stale quotes', () => {
    const staleQuote: Quote = {
      timestamp: DateTime.now().minus({ minutes: 10 }),
      bid: new Decimal('100'),
      ask: new Decimal('101'),
      isStale: false
    };

    expect(() => collector.processQuotes([staleQuote]))
      .toThrow('Stale quote detected');
  });
});

describe('VolatilityCalculator', () => {
  const calculator = new VolatilityCalculator(
    [Duration.fromObject({ minutes: 1 }), Duration.fromObject({ minutes: 5 })],
    10
  );

  test('calculates volatility', () => {
    const prices = Array.from({ length: 20 }, (_, i) => 
      new Decimal(100).plus(i)
    );

    const vol = calculator.calculate(
      prices, 
      Duration.fromObject({ minutes: 5 })
    );
    
    expect(vol.isPositive()).toBe(true);
  });

  test('handles insufficient data', () => {
    const prices = Array.from({ length: 5 }, (_, i) => 
      new Decimal(100).plus(i)
    );

    expect(() => calculator.calculate(
      prices,
      Duration.fromObject({ minutes: 1 })
    )).toThrow('Insufficient data');
  });
});

  test('validates spread thresholds', () => {
    const quote: Quote = {
      timestamp: DateTime.now(),
      bid: new Decimal('100'),
      ask: new Decimal('106'), // 6% spread
      isStale: false
    };

    expect(collector.validateSpread(quote)).toBe(false);
  });

  test('detects price jumps', () => {
    const quotes: Quote[] = [
      {
        timestamp: DateTime.now(),
        bid: new Decimal('100'),
        ask: new Decimal('101'),
        isStale: false
      },
      {
        timestamp: DateTime.now(),
        bid: new Decimal('120'), // 20% jump
        ask: new Decimal('121'),
        isStale: false
      }
    ];

    const jumps = collector.detectPriceJumps(quotes, new Decimal('0.1'));
    expect(jumps).toEqual([1]);
  });
});

describe('OrderFlow', () => {
  const orderFlow = new OrderFlow();

  test('calculates order imbalance', () => {
    orderFlow.addTrade(
      new Decimal('100'),
      new Decimal('1'),
      true
    );
    orderFlow.addTrade(
      new Decimal('100'),
      new Decimal('0.5'),
      false
    );

    const imbalance = orderFlow.calculateImbalance(300);
    expect(imbalance.isPositive()).toBe(true);
  });

  test('calculates VWAP', () => {
    const vwap = orderFlow.getVWAP(300);
    expect(vwap).not.toBeNull();
    expect(vwap!.equals(new Decimal('100'))).toBe(true);
  });
});

describe('ProfitCalculator', () => {
  const calculator = new ProfitCalculator();

  test('calculates profit metrics', () => {
    calculator.addTrade({
      timestamp: DateTime.now(),
      entryPrice: new Decimal('100'),
      exitPrice: new Decimal('110'),
      amount: new Decimal('1')
    });

    const metrics = calculator.calculateMetrics();
    expect(metrics.totalProfit.equals(new Decimal('10'))).toBe(true);
    expect(metrics.winRate.equals(new Decimal('1'))).toBe(true);
  });
});

  test('filters trades by size', () => {
    const orderFlow = new OrderFlow();
    orderFlow.addTrade(
      new Decimal('100'),
      new Decimal('0.001'), // Too small
      true
    );
    orderFlow.addTrade(
      new Decimal('100'),
      new Decimal('1'),
      true
    );

    const filtered = orderFlow.filterTrades(
      new Decimal('0.01'),
      new Decimal('100')
    );
    expect(filtered.length).toBe(1);
  });
});