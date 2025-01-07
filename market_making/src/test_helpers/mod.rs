

use chrono::{DateTime, Utc, Duration};

pub fn generate_test_quotes(count: usize, interval_secs: i64) -> Vec<Quote> {
    let base_time = Utc::now();
    (0..count)
        .map(|i| Quote {
            timestamp: base_time + Duration::seconds(i as i64 * interval_secs),
            bid: 100.0 + (i as f64 / 10.0).sin(),
            ask: 101.0 + (i as f64 / 10.0).sin(),
        })
        .collect()
}

pub fn generate_test_trades(count: usize) -> Vec<Trade> {
    let base_time = Utc::now();
    (0..count)
        .map(|i| Trade {
            timestamp: base_time + Duration::seconds(i as i64),
            price: 100.0,
            size: 1.0,
            is_buyer: i % 2 == 0,
        })
        .collect()
}