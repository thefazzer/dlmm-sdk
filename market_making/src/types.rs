use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct Quote {
    pub timestamp: DateTime<Utc>,
    pub bid: Decimal,
    pub ask: Decimal,
    pub is_stale: bool,
}

#[derive(Debug, Clone)]
pub struct Trade {
    pub timestamp: DateTime<Utc>,
    pub price: Decimal,
    pub size: Decimal,
    pub is_buyer: bool,
    pub aggressor: TradeAggressor,
}

#[derive(Debug, Clone, PartialEq)]
pub enum TradeAggressor {
    Buyer,
    Seller,
}

#[derive(Debug, Clone)]
pub struct VolatilityMetrics {
    pub current: Decimal,
    pub moving_avg: Decimal,
    pub forecast: Decimal,
}

#[derive(Debug, Clone)]
pub struct BinRange {
    pub center_price: Decimal,
    pub width: Decimal,
    pub bin_count: u32,
}

#[derive(Debug, Clone)]
pub struct OrderBook {
    pub bids: Vec<OrderBookLevel>,
    pub asks: Vec<OrderBookLevel>,
}

#[derive(Debug, Clone)]
pub struct OrderBookLevel {
    pub price: Decimal,
    pub size: Decimal,
}

#[derive(Error, Debug)]
pub enum MarketMakingError {
    #[error("Insufficient data points")]
    InsufficientData,
    #[error("Stale data detected")]
    StaleData,
    #[error("Invalid data quality")]
    DataQuality,
    #[error("Time series error")]
    TimeSeries,
}
