
use chrono::Duration;
use rust_decimal::Decimal;
use market_making::types::{Quote, MarketMakingError}; // Updated import path
use std::collections::VecDeque;

pub struct VolatilityCalculator {
    windows: Vec<Duration>,
    min_samples: usize,
    max_gap_ratio: f64,
}

impl VolatilityCalculator {
    pub fn new(windows: Vec<Duration>, min_samples: usize, max_gap_ratio: f64) -> Self {
        Self {
            windows,
            min_samples,
            max_gap_ratio,
        }
    }

    pub fn calculate(&self, prices: &[Decimal], window: Duration) -> Result<Decimal, MarketMakingError> {
        if prices.len() < self.min_samples {
            return Err(MarketMakingError::InsufficientData);
        }

        let returns: Vec<f64> = prices.windows(2)
            .map(|w| (w[1] / w[0]).ln().to_f64().unwrap())
            .collect();

        let volatility = returns.iter()
            .map(|r| r * r)
            .sum::<f64>()
            .sqrt();

        Ok(Decimal::from_f64(volatility).unwrap())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rust_decimal_macros::dec;

    #[test]
    fn test_volatility_calculation() {
        let calculator = VolatilityCalculator::new(
            vec![Duration::minutes(1), Duration::minutes(5)],
            10,
            0.2
        );

        let prices: Vec<Decimal> = (0..20)
            .map(|i| dec!(100.0) + Decimal::from(i))
            .collect();

        let result = calculator.calculate(&prices, Duration::minutes(5));
        assert!(result.is_ok());
        assert!(result.unwrap() > dec!(0));
    }

    #[test]
    fn test_insufficient_data() {
        let calculator = VolatilityCalculator::new(
            vec![Duration::minutes(1)],
            10,
            0.2
        );

        let prices: Vec<Decimal> = (0..5)
            .map(|i| dec!(100.0) + Decimal::from(i))
            .collect();

        let result = calculator.calculate(&prices, Duration::minutes(1));
        assert!(matches!(result, Err(MarketMakingError::InsufficientData)));
    }
}