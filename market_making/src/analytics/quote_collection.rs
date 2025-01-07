

use thiserror::Error;
use chrono::{DateTime, Duration, Utc};
use rust_decimal::Decimal;
use crate::types::{Quote, MarketMakingError};


#[derive(Error, Debug)]
pub enum QuoteError {
    #[error("Stale quote detected")]
    StaleQuote,
    #[error("Invalid quote data")]
    InvalidQuote,
    #[error("Gap too large")]
    GapTooLarge,
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{DateTime, Duration, Utc};
use rust_decimal::Decimal;
use crate::types::{Quote, MarketMakingError};

pub struct QuoteCollector {
    window_size: Duration,
    sampling_interval: Duration,
    max_gap_fill: Option<Duration>,
}

impl QuoteCollector {
    pub fn new(window_size: Duration, sampling_interval: Duration, max_gap_fill: Option<Duration>) -> Self {
        Self {
            window_size,
            sampling_interval,
            max_gap_fill,
        }
    }

    pub fn process_quotes(&self, quotes: &[Quote]) -> Result<Vec<Quote>, MarketMakingError> {
        if quotes.is_empty() {
            return Ok(vec![]);
        }

        let mut processed = quotes.to_vec();
        processed.sort_by_key(|q| q.timestamp);

        self.validate_quotes(&processed)?;
        self.fill_gaps(&mut processed)?;

        Ok(processed)
    }

    fn validate_quotes(&self, quotes: &[Quote]) -> Result<(), MarketMakingError> {
        let now = Utc::now();
        
        for quote in quotes {
            if (now - quote.timestamp) > self.window_size {
                return Err(MarketMakingError::StaleData);
            }
            
            if quote.bid <= Decimal::ZERO || quote.ask <= Decimal::ZERO {
                return Err(MarketMakingError::DataQuality);
            }
            
            if quote.bid >= quote.ask {
                return Err(MarketMakingError::DataQuality);
            }
        }
        
        Ok(())
    }

    fn fill_gaps(&self, quotes: &mut Vec<Quote>) -> Result<(), MarketMakingError> {
        if let Some(max_gap) = self.max_gap_fill {
            let mut i = 0;
            while i < quotes.len() - 1 {
                let gap = quotes[i + 1].timestamp - quotes[i].timestamp;
                if gap > max_gap {
                    return Err(MarketMakingError::DataQuality);
                }
                i += 1;
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal_macros::dec;

    #[test]
    fn test_basic_quote_collection() {
        let collector = QuoteCollector::new(
            Duration::minutes(5),
            Duration::seconds(30),
            Some(Duration::minutes(1))
        );

        let now = Utc::now();
        let quotes = vec![
            Quote {
                timestamp: now,
                bid: dec!(100.0),
                ask: dec!(101.0),
                is_stale: false,
            }
        ];

        let result = collector.process_quotes(&quotes);
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }

    #[test]
    fn test_invalid_quotes() {
        let collector = QuoteCollector::new(
            Duration::minutes(5),
            Duration::seconds(30),
            Some(Duration::minutes(1))
        );

        let now = Utc::now();
        let invalid_quotes = vec![
            Quote {
                timestamp: now,
                bid: dec!(101.0),
                ask: dec!(100.0),  // Crossed market
                is_stale: false,
            }
        ];

        let result = collector.process_quotes(&invalid_quotes);
        assert!(matches!(result, Err(MarketMakingError::DataQuality)));
    }

    #[test]
    fn test_missing_quotes() {
        let collector = QuoteCollector::new(
            Duration::minutes(5),
            Duration::seconds(30),
            Some(Duration::minutes(1))
        );

        let now = Utc::now();
        let mut quotes = vec![];
        for i in 0..10 {
            if i != 5 {  // Create gap at i=5
                quotes.push(Quote {
                    timestamp: now + Duration::seconds(i * 30),
                    bid: Decimal::new(1000, 1),  // 100.0
                    ask: Decimal::new(1010, 1),  // 101.0
                    is_stale: false,
                });
            }
        }

        let processed = collector.process_quotes(&quotes).unwrap();
        assert_eq!(processed.len(), 10);
    }

    #[test]
    fn test_stale_quotes() {
        let collector = QuoteCollector::new(
            Duration::minutes(5),
            Duration::seconds(30),
            Some(Duration::minutes(1))
        );

        let now = Utc::now();
        let stale_quotes = vec![
            Quote {
                timestamp: now - Duration::minutes(10),
                bid: Decimal::new(1000, 1),
                ask: Decimal::new(1010, 1),
                is_stale: false,
            }
        ];

        let result = collector.process_quotes(&stale_quotes);
        assert!(matches!(result, Err(QuoteError::StaleQuote)));
    }
}
}