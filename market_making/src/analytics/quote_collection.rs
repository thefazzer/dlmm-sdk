use crate::analytics::mm_types::Quote;
use thiserror::Error;
use chrono::Duration;
use chrono::Utc;
#[derive(Error, Debug)]
pub enum QuoteError {
    #[error("Stale quote detected")]
    StaleQuote,
    #[error("Invalid quote data")]
    InvalidQuote,
    #[error("Gap too large")]
    GapTooLarge,
}

pub struct QuoteCollector {
    window_size: Duration,
    sampling_interval: Duration,
    max_gap_fill: Option<Duration>,
}

impl QuoteCollector {
    pub fn new(
        window_size: Duration,
        sampling_interval: Duration,
        max_gap_fill: Option<Duration>,
    ) -> Self {
        Self {
            window_size,
            sampling_interval,
            max_gap_fill,
        }
    }

    /// Process an array of quotes, sorting them by timestamp and filling large gaps.
    pub fn process_quotes(&self, quotes: &[Quote]) -> Result<Vec<Quote>, QuoteError> {
        if quotes.is_empty() {
            return Ok(vec![]);
        }

        let mut processed = quotes.to_vec();
        processed.sort_by_key(|q| q.timestamp);

        self.validate_quotes(&processed)?;
        self.fill_gaps(&mut processed)?;

        Ok(processed)
    }

    /// Validate quotes against staleness and basic data checks.
    fn validate_quotes(&self, quotes: &[Quote]) -> Result<(), QuoteError> {
        let now = Utc::now();

        for quote in quotes {
            // Check if quote is stale
            if (now - quote.timestamp) > self.window_size {
                return Err(QuoteError::StaleQuote);
            }
            // Check for non-positive bids/asks
            if quote.bid <= 0.0 || quote.ask <= 0.0 {
                return Err(QuoteError::InvalidQuote);
            }
            // Check if bid >= ask
            if quote.bid >= quote.ask {
                return Err(QuoteError::InvalidQuote);
            }
        }
        Ok(())
    }

    /// Fill or detect large gaps between quotes. If gap is too large, return an error.
    fn fill_gaps(&self, quotes: &mut Vec<Quote>) -> Result<(), QuoteError> {
        if let Some(max_gap) = self.max_gap_fill {
            let mut i = 0;
            while i < quotes.len() - 1 {
                let gap = quotes[i + 1].timestamp - quotes[i].timestamp;
                if gap > max_gap {
                    return Err(QuoteError::GapTooLarge);
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
    use chrono::{Duration, Utc};

    #[test]
    fn test_valid_quotes() {
        let collector = QuoteCollector::new(Duration::minutes(5), Duration::seconds(30), None);

        // Build sample quotes
        let now = Utc::now();
        let quotes = vec![
            Quote {
                timestamp: now - Duration::minutes(1),
                bid: 99.5_f64,
                ask: 100.5_f64,
                is_stale: false,
            },
            Quote {
                timestamp: now,
                bid: 99.7_f64,
                ask: 100.7_f64,
                is_stale: false,
            },
        ];

        let result = collector.process_quotes(&quotes);
        assert!(result.is_ok());
        let processed = result.unwrap();
        assert_eq!(processed.len(), 2);
    }

    #[test]
    fn test_stale_quote() {
        let collector = QuoteCollector::new(Duration::minutes(1), Duration::seconds(30), None);

        let now = Utc::now();
        let quotes = vec![
            Quote {
                // This one is stale (older by 5 minutes, exceeding our 1-minute window)
                timestamp: now - Duration::minutes(5),
                bid: 99.0_f64,
                ask: 100.0_f64,
                is_stale: false,
            },
        ];

        let result = collector.process_quotes(&quotes);
        assert!(matches!(result, Err(QuoteError::StaleQuote)));
    }

    #[test]
    fn test_invalid_quote() {
        let collector = QuoteCollector::new(Duration::minutes(5), Duration::seconds(30), None);

        let now = Utc::now();
        // Bid is >= Ask, so invalid
        let quotes = vec![
            Quote {
                timestamp: now,
                bid: 100.0_f64,
                ask: 100.0_f64,
                is_stale: false,
            },
        ];

        let result = collector.process_quotes(&quotes);
        assert!(matches!(result, Err(QuoteError::InvalidQuote)));
    }

    #[test]
    fn test_gap_too_large() {
        let collector = QuoteCollector::new(
            Duration::minutes(5),
            Duration::seconds(30),
            Some(Duration::seconds(5)),
        );

        let now = Utc::now();
        let quotes = vec![
            Quote {
                timestamp: now,
                bid: 99.9_f64,
                ask: 100.1_f64,
                is_stale: false,
            },
            Quote {
                // This is 10 seconds after the first, bigger than max_gap_fill=5s
                timestamp: now + Duration::seconds(10),
                bid: 100.0_f64,
                ask: 101.0_f64,
                is_stale: false,
            },
        ];

        let result = collector.process_quotes(&quotes);
        assert!(matches!(result, Err(QuoteError::GapTooLarge)));
    }
}
