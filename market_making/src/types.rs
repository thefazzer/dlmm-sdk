use std::error::Error;
use std::fmt;
use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct Quote {
    pub timestamp: DateTime<Utc>,
    pub bid: f64,
    pub ask: f64,
    pub is_stale: bool,
}

impl fmt::Display for MarketMakingError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            MarketMakingError::DataQualityError(msg) => write!(f, "Data quality error: {}", msg),
            MarketMakingError::InsufficientDataError(msg) => write!(f, "Insufficient data: {}", msg),
            MarketMakingError::StaleDataError(msg) => write!(f, "Stale data: {}", msg),
            MarketMakingError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
        }
    }
}

impl Display for MarketMakingError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for MarketMakingError {}

#[derive(Debug)]
pub struct VolatilityMetrics {
    pub current: Decimal,
    pub moving_avg: Decimal,
    pub forecast: Decimal,
}

pub struct OrderFlow {
    pub trades: VecDeque<Trade>,
    pub buy_volume: VecDeque<(u64, f64)>,  // (timestamp, volume)
    pub sell_volume: VecDeque<(u64, f64)>,
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

#[derive(Debug, Clone, PartialEq)]
pub struct OrderFlowAnalyzer {
    min_trade_size: Decimal,
    max_trade_size: Decimal,
    window_size: Duration,
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
