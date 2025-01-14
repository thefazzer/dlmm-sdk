use std::collections::VecDeque;
use std::time::{SystemTime, UNIX_EPOCH};
use rust_decimal::prelude::*; // This imports the necessary traits for conversion
use chrono::{DateTime, Duration, TimeZone, Utc};
use rust_decimal::Decimal;
use rust_decimal_macros::dec; // For dec!() macros
use num_traits::FromPrimitive;

use crate::analytics::mm_types::{
    Quote, MarketMakingError, OrderFlowAnalyzer, Trade, TradeAggressor,
};

const FLOW_HISTORY_SIZE: usize = 300; // 5 minutes

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
            timestamp: Utc.timestamp(timestamp as i64, 0),
            price: Decimal::from_f64(price).expect("Invalid price"),
            size: Decimal::from_f64(size).expect("Invalid size"),
            is_buyer: is_buy,
            aggressor: if is_buy {
                TradeAggressor::Buyer
            } else {
                TradeAggressor::Seller
            },
        };

        // Maintain a rolling window of trades
        if self.trades.len() >= FLOW_HISTORY_SIZE {
            self.trades.pop_front();
        }
        self.trades.push_back(trade);

        // Track buy/sell volumes
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
        let cutoff = now.saturating_sub(window_secs);

        let buy_sum: f64 = self
            .buy_volume
            .iter()
            .filter(|(t, _)| *t >= cutoff)
            .map(|(_, v)| v)
            .sum();

        let sell_sum: f64 = self
            .sell_volume
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
        let cutoff = now.saturating_sub(window_secs);

        // Convert cutoff to a Chrono DateTime
        let cutoff_naive = Utc.timestamp(cutoff as i64, 0).naive_utc();
        let cutoff_datetime = DateTime::<Utc>::from_utc(cutoff_naive, Utc);

        let recent_trades: Vec<_> = self
            .trades
            .iter()
            .filter(|trade| trade.timestamp >= cutoff_datetime)
            .collect();

        if recent_trades.is_empty() {
            return None;
        }

        let volume_price_sum: Decimal = recent_trades
            .iter()
            .map(|t| t.price * t.size)
            .sum::<Decimal>();

        let total_volume: Decimal = recent_trades
            .iter()
            .map(|t| t.size)
            .sum::<Decimal>();

        if total_volume == Decimal::ZERO {
            None
        } else {
            // Convert Decimal to f64 carefully
            Some((volume_price_sum / total_volume).to_f64().unwrap_or_default())
        }
    }
}

// Example unit tests for `OrderFlow` or `OrderFlowAnalyzer`.
#[cfg(test)]
mod analyzer_tests {
    use super::*;
    use rust_decimal_macros::dec;

    #[test]
    fn test_imbalance_calculation() {
        let mut flow = OrderFlow::new();

        // Current timestamp for consistent checks
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        // Simulate some trades: more sells than buys
        flow.buy_volume.push_back((now, 100.0));
        flow.sell_volume.push_back((now, 200.0));

        let imbalance = flow.calculate_imbalance(300); // 5 minutes window
        // Expect imbalance to be negative since sells > buys
        assert!(imbalance < 0.0);
        // Imbalance should be between -1 and 1
        assert!(imbalance >= -1.0 && imbalance <= 1.0);
    }

    #[test]
    fn test_get_vwap_no_trades() {
        let flow = OrderFlow::new();
        let result = flow.get_vwap(300); // 5 minutes window
        assert_eq!(result, None);
    }

    #[test]
    fn test_get_vwap_some_trades() {
        let mut flow = OrderFlow::new();
        flow.add_trade(100.0, 2.0, true);
        flow.add_trade(102.0, 1.0, false);
        flow.add_trade(98.0, 1.0, true);

        let vwap = flow.get_vwap(300).unwrap();
        // Check that the VWAP is in a reasonable range
        assert!(vwap > 98.0 && vwap < 102.0);
    }
}
