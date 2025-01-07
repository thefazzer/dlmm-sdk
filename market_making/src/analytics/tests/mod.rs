

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{DateTime, Utc};

    #[test]
    fn test_quote_collection() {
        let quotes = vec![
            Quote {
                timestamp: Utc::now(),
                bid: 100.0,
                ask: 101.0,
            }
        ];
        
        let collector = QuoteCollector::new(
            Duration::minutes(5),
            Duration::seconds(30)
        );

        let processed = collector.process_quotes(&quotes);
        assert!(processed.is_ok());
        assert_eq!(processed.unwrap().len(), 1);
    }

    #[test]
    fn test_volatility_calculation() {
        let prices: Vec<f64> = (0..20).map(|i| 100.0 + (i as f64)).collect();
        let calculator = VolatilityCalculator::new(
            vec![Duration::minutes(1), Duration::minutes(5)],
            10
        );

        let vol = calculator.calculate(&prices, Duration::minutes(5));
        assert!(vol.is_ok());
        assert!(vol.unwrap() > 0.0);
    }
}(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_quote_collection() {
        // Test the Rust implementation directly
    }
    
    #[test]
    fn test_volatility_calculation() {
        // Test the Rust implementation directly
    }
}