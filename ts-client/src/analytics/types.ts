

import { Decimal } from 'decimal.js';
import { DateTime, Duration } from 'luxon';

export interface Trade {
  timestamp: DateTime;
  price: Decimal;
  size: Decimal;
  isBuyer: boolean;
  aggressor: TradeAggressor;
}

export enum TradeAggressor {
  Buyer = 'BUYER',
  Seller = 'SELLER'
}

export interface OrderBookLevel {
  price: Decimal;
  size: Decimal;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface ProfitMetrics {
  totalProfit: Decimal;
  profitPerTrade: Decimal;
  winRate: Decimal;
}

export interface VolumeProfile {
  priceLevels: PriceLevel[];
  totalVolume: Decimal;
  weightedAveragePrice: Decimal;
}

export interface PriceLevel {
  price: Decimal;
  volume: Decimal;
}

export interface MarketMetrics {
  volatility: Decimal;
  orderFlowImbalance: Decimal;
  vwap: Decimal;
  profitMetrics: ProfitMetrics;
}

import * as t from 'io-ts';
import { DateFromISOString } from 'io-ts-types';

export interface AnalyticsConfig {
  windowSize: number;
  minSamples: number;
  maxCacheSize: number;
  logLevel: string;
  performanceMonitoring: boolean;
}

const isDecimal = (value: any): value is Decimal => value instanceof Decimal;

export const QuoteCodec = t.type({
  timestamp: DateFromISOString,
  bid: t.refinement(t.unknown, isDecimal), // Updated to use refinement
  ask: t.refinement(t.unknown, isDecimal), // Updated to use refinement
  isStale: t.boolean
});

export type Quote = t.TypeOf<typeof QuoteCodec>;