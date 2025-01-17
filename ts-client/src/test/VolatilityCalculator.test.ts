

import { VolatilityCalculator } from '../analytics/VolatilityCalculator';
import { Duration } from 'luxon'
import { Decimal } from 'decimal.js';

describe('VolatilityCalculator', () => {
  const calculator = new VolatilityCalculator(
    [Duration.fromObject({ minutes: 1 }), Duration.fromObject({ minutes: 5 })],
    10
  );

  describe('volatility calculation', () => {
    it('calculates volatility for valid price series', () => {
      const prices = Array.from(
        { length: 20 }, 
        (_, i) => new Decimal(100).plus(i)
      );
      
      const result = calculator.calculate(prices, Duration.fromObject({ minutes: 5 }));
      expect(result.isOk()).toBe(true);
      expect(result.unwrap().isPositive()).toBe(true);
    });

    it('handles insufficient data', () => {
      const prices = Array.from(
        { length: 5 }, 
        (_, i) => new Decimal(100).plus(i)
      );
      
      const result = calculator.calculate(prices, Duration.fromObject({ minutes: 1 }));
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toContain('Insufficient samples');
    });

    it('handles non-finite values', () => {
      const prices = [new Decimal('Infinity'), new Decimal(100)];
      const result = calculator.calculate(prices, Duration.fromObject({ minutes: 1 }));
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr().message).toContain('Non-finite');
    });
  });
});