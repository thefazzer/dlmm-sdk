import { OrderFlow } from '../analytics/OrderFlow';
import { Decimal } from 'decimal.js';
import { DateTime, Duration } from 'luxon';

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
      expect(result.toString()).toBe('0.33333333333333333333');  // 1/3 imbalance
    });

    it('calculates VWAP', () => {
      orderFlow.addTrade(new Decimal('100'), new Decimal('1'), true);
      orderFlow.addTrade(new Decimal('102'), new Decimal('2'), true);

      const vwap = orderFlow.getVWAP(300);
      expect(vwap).not.toBeNull();
      expect(vwap.toString()).toBe('101.33333333333333333'); 
    });

    it('filters trades by time range', () => {
      const now = DateTime.now();
      const fiveMinutesAgo = now.minus({ minutes: 5 });
      const oneMinuteAgo = now.minus({ minutes: 1 });

      orderFlow.addTrade(new Decimal('100'), new Decimal('1'), true); // Old trade
      orderFlow.addTrade(new Decimal('102'), new Decimal('2'), true); // Recent trade

      const filtered = orderFlow.filterTrades(fiveMinutesAgo, oneMinuteAgo);
      expect(filtered).toHaveLength(1);
    });
  });
});
