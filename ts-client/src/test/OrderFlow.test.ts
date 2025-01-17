

import { OrderFlow } from '../analytics/OrderFlow';
import { createTestTrade } from './setup';
import { Decimal } from 'decimal.js';

describe('OrderFlow', () => {
  let orderFlow: OrderFlow;

  beforeEach(() => {
    orderFlow = new OrderFlow();
  });

  describe('order flow analysis', () => {
    it('calculates imbalance', () => {
      orderFlow.addTrade(new Decimal('100'), new Decimal('1'), true);
      orderFlow.addTrade(new Decimal('100'), new Decimal('0.5'), false);

      const result = orderFlow.calculateImbalance(300);
      expect(result.isPositive()).toBe(true);
      expect(result.toString()).toBe('0.333333333333333333'); // 1/3 imbalance
    });

    it('calculates VWAP', () => {
      orderFlow.addTrade(new Decimal('100'), new Decimal('1'), true);
      orderFlow.addTrade(new Decimal('102'), new Decimal('2'), true);

      const vwap = orderFlow.getVWAP(300);
      expect(vwap).not.toBeNull();
      expect(vwap!.toString()).toBe('101.333333333333333333');
    });

    it('filters trades by size', () => {
      orderFlow.addTrade(new Decimal('100'), new Decimal('0.001'), true);
      orderFlow.addTrade(new Decimal('100'), new Decimal('1'), true);
      orderFlow.addTrade(new Decimal('100'), new Decimal('1000'), true);

      const filtered = orderFlow.filterTrades(
        new Decimal('0.01'),
        new Decimal('100')
      );
      expect(filtered).toHaveLength(1);
    });
  });
});