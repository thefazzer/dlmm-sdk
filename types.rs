

use std::error::Error;
use std::fmt::{self, Display, Formatter}; 
use std::collections::VecDeque;
use chrono::{DateTime, Duration, Utc};
use rust_decimal::Decimal;
use thiserror::Error;

#[derive(Debug, Clone)]
pub struct Quote {
    pub timestamp: DateTime<Utc>,
    pub bid: f64,
    pub ask: f64,
    pub is_stale: bool,
}

#[derive(Error, Debug)]
pub enum MarketMakingError {
    #[error("Data quality error: {0}")]
    DataQualityError(String),
    #[error("Insufficient data: {0}")]
    InsufficientDataError(String),
    #[error("Stale data: {0}")]
    StaleDataError(String),
    #[error("Validation error: {0}")]
    ValidationError(String),
}