

use std::collections::VecDeque;
use std::time::{SystemTime, UNIX_EPOCH};

const FLOW_HISTORY_SIZE: usize = 300; // 5 minutes

#[derive(Debug, Clone)]
pub struct Trade {
    pub timestamp: u64,
    pub price: f64,
    pub size: f64,
    pub is_buy: bool,
}

pub struct OrderFlow {
    pub trades: VecDeque<Trade>,
    pub buy_volume: VecDeque<(u64, f64)>,  // (timestamp, volume)
    pub sell_volume: VecDeque<(u64, f64)>,
}

impl OrderFlow {
    pub fn new() -> Self {
        Self {
            trades: VecDeque::with_capacity(FLOW_HISTORY_SIZE),
            buy_volume: VecDeque::with_capacity(FLOW_HISTORY_SIZE),
            sell_volume: VecDeque::with_capacity(FLOW_HISTORY_SIZE),
        }
    }

    pub fn add_trade(&mut self, price: f64, size: f64, is_buy: bool) {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let trade = Trade {
            timestamp,
            price,
            size,
            is_buy,
        };

        if self.trades.len() >= FLOW_HISTORY_SIZE {
            self.trades.pop_front();
        }
        self.trades.push_back(trade);

        let queue = if is_buy {
            &mut self.buy_volume
        } else {
            &mut self.sell_volume
        };

        if queue.len() >= FLOW_HISTORY_SIZE {
            queue.pop_front();
        }
        queue.push_back((timestamp, size));
    }

    pub fn calculate_imbalance(&self, window_secs: u64) -> f64 {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let cutoff = now - window_secs;

        let buy_sum: f64 = self.buy_volume
            .iter()
            .filter(|(t, _)| *t >= cutoff)
            .map(|(_, v)| v)
            .sum();

        let sell_sum: f64 = self.sell_volume
            .iter()
            .filter(|(t, _)| *t >= cutoff)
            .map(|(_, v)| v)
            .sum();

        let total = buy_sum + sell_sum;
        if total == 0.0 {
            0.0
        } else {
            (buy_sum - sell_sum) / total
        }
    }

    pub fn get_vwap(&self, window_secs: u64) -> Option<f64> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let cutoff = now - window_secs;

        let trades: Vec<_> = self.trades
            .iter()
            .filter(|t| t.timestamp >= cutoff)
            .collect();

        if trades.is_empty() {
            return None;
        }

        let volume_price_sum: f64 = trades
            .iter()
            .map(|t| t.price * t.size)
            .sum();

        let total_volume: f64 = trades
            .iter()
            .map(|t| t.size)
            .sum();

        Some(volume_price_sum / total_volume)
    }

    pub fn get_trade_flow_pressure(&self, window_secs: u64) -> f64 {
        let imbalance = self.calculate_imbalance(window_secs);
        let vwap = self.get_vwap(window_secs).unwrap_or(0.0);
        
        // Combine order imbalance with VWAP movement
        imbalance * vwap.signum()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_order_flow_imbalance() {
        let mut flow = OrderFlow::new();
        
        // Add some test trades
        flow.add_trade(100.0, 1.0, true);  // buy
        flow.add_trade(101.0, 2.0, false); // sell
        flow.add_trade(102.0, 3.0, true);  // buy
        
        let imbalance = flow.calculate_imbalance(60);
        assert!(imbalance > 0.0); // Should be buy-heavy
        
        let vwap = flow.get_vwap(60).unwrap();
        assert!(vwap > 100.0 && vwap < 102.0);
    }
}

use chrono::{DateTime, Duration, Utc};
use rust_decimal::Decimal;
use crate::types::{Trade, MarketMakingError};

pub struct OrderFlowAnalyzer {
    min_trade_size: Decimal,
    max_trade_size: Decimal,
    window_size: Duration,
}

impl OrderFlowAnalyzer {
    pub fn new(min_trade_size: Decimal, max_trade_size: Decimal, window_size: Duration) -> Self {
        Self {
            min_trade_size,
            max_trade_size,
            window_size,
        }
    }

    pub fn calculate_imbalance(&self, trades: &[Trade], now: DateTime<Utc>) -> Decimal {
        if trades.is_empty() {
            return Decimal::ZERO;
        }

        let filtered = self.filter_trades(trades);
        let (buy_volume, sell_volume) = filtered.iter()
            .fold((Decimal::ZERO, Decimal::ZERO), |(buy, sell), trade| {
                if trade.is_buyer {
                    (buy + trade.size, sell)
                } else {
                    (buy, sell + trade.size)
                }
            });

        let total_volume = buy_volume + sell_volume;
        if total_volume == Decimal::ZERO {
            return Decimal::ZERO;
        }

        (buy_volume - sell_volume) / total_volume
    }

    pub fn filter_trades(&self, trades: &[Trade]) -> Vec<Trade> {
        trades.iter()
            .filter(|t| t.size >= self.min_trade_size && t.size <= self.max_trade_size)
            .cloned()
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal_macros::dec;

    #[test]
    fn test_imbalance_calculation() {
        let analyzer = OrderFlowAnalyzer::new(
            dec!(0.01),
            dec!(100.0),
            Duration::minutes(5)
        );

        let now = Utc::now();
        let trades = vec![
            Trade {
                timestamp: now,
                price: dec!(100.0),
                size: dec!(100.0),
                is_buyer: true,
                aggressor: crate::types::TradeAggressor::Buyer,
            },
            Trade {
                timestamp: now,
                price: dec!(100.0),
                size: dec!(50.0),
                is_buyer: false,
                aggressor: crate::types::TradeAggressor::Seller,
            },
        ];

        let imbalance = analyzer.calculate_imbalance(&trades, now);
        assert!(imbalance > dec!(0));
        assert!(imbalance <= dec!(1));
    }

    #[test]
    fn test_trade_filtering() {
        let analyzer = OrderFlowAnalyzer::new(
            dec!(0.01),
            dec!(100.0),
            Duration::minutes(5)
        );

        let now = Utc::now();
        let trades = vec![
            Trade {
                timestamp: now,
                price: dec!(100.0),
                size: dec!(0.001),  // Too small
                is_buyer: true,
                aggressor: crate::types::TradeAggressor::Buyer,
            },
            Trade {
                timestamp: now,
                price: dec!(100.0),
                size: dec!(1000.0),  // Too large
                is_buyer: true,
                aggressor: crate::types::TradeAggressor::Buyer,
            },
            Trade {
                timestamp: now,
                price: dec!(100.0),
                size: dec!(1.0),  // Just right
                is_buyer: true,
                aggressor: crate::types::TradeAggressor::Buyer,
            },
        ];

        let filtered = analyzer.filter_trades(&trades);
        assert_eq!(filtered.len(), 1);
    }
}