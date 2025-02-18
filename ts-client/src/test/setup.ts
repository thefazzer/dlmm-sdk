

import { Decimal } from 'decimal.js';
import { DateTime } from 'luxon';
import { configureDecimal } from '../analytics/utils/decimal';
import { initializeAnalytics } from '../analytics/init';

beforeAll(async () => {
  await initializeAnalytics({
    windowSize: 300,
    minSamples: 10,
    maxCacheSize: 1000,
    logLevel: 'error',
    performanceMonitoring: false
  });
});

export const createTestQuote = (
  bid: number | string,
  ask: number | string,
  timestampOffset: number = 0
) => ({
  timestamp: DateTime.now().minus({ seconds: timestampOffset }),
  bid: new Decimal(bid),
  ask: new Decimal(ask),
  isStale: false
});

export const createTestTrade = (
  price: number | string,
  size: number | string,
  isBuyer: boolean,
  timestampOffset: number = 0
) => ({
  timestamp: DateTime.now().minus({ seconds: timestampOffset }),
  price: new Decimal(price),
  size: new Decimal(size),
  isBuyer,
  aggressor: isBuyer ? 'BUYER' : 'SELLER'
});