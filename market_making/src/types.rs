

use std::error::Error;
use std::fmt;
use chrono::{DateTime, Utc};

#[derive(Debug, Clone)]
pub struct Quote {
    pub timestamp: DateTime<Utc>,
    pub bid: f64,
    pub ask: f64,
    pub is_stale: bool,
}

#[derive(Debug)]
pub enum MarketMakingError {
    DataQualityError(String),
    InsufficientDataError(String),
    StaleDataError(String),
    ValidationError(String),
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

impl Error for MarketMakingError {}