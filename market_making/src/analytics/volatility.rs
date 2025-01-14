use chrono::Duration;
use num_traits::FromPrimitive;
use rust_decimal::Decimal;
use crate::analytics::mm_types::MarketMakingError; // Adjust import path as needed
use num_traits::ToPrimitive;

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

    pub fn calculate(&self, prices: &[Decimal], _window: Duration) -> Result<Decimal, MarketMakingError> {
        // Check minimal sample requirement
        if prices.len() < self.min_samples {
            return Err(MarketMakingError::InsufficientDataError(
                "Insufficient data for volatility calculation.".to_string(),
            ));
        }

        // Compute log returns
        let returns: Vec<f64> = prices
            .windows(2)
            .map(|w| {
                // Handle possible None from to_f64()
                let p0 = w[0].to_f64().unwrap_or(0.0);
                let p1 = w[1].to_f64().unwrap_or(0.0);
                if p0 <= f64::EPSILON {
                    0.0
                } else {
                    (p1 / p0).ln()
                }
            })
            .collect();

        // If no returns, cannot calculate variance
        if returns.len() < 2 {
            return Err(MarketMakingError::InsufficientDataError(
                "Not enough price points for variance.".to_string(),
            ));
        }

        // Variance = sum of squared returns / (n - 1)
        let variance = returns
            .iter()
            .map(|r| r * r)
            .sum::<f64>()
            / (returns.len() as f64 - 1.0);

        // Standard deviation
        let volatility = variance.sqrt();

        // Scale if needed; here, just multiply by 1,000,000.0
        let scaled_volatility = volatility * 1_000_000.0;

        // Convert to Decimal, fallback to ZERO if out of range
        let dec_volatility = Decimal::from_f64(scaled_volatility).unwrap_or(Decimal::ZERO);

        Ok(dec_volatility)
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
            0.2,
        );

        // Generate a small increasing price array
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
            0.2,
        );

        // Only 5 samples, less than min_samples=10
        let prices: Vec<Decimal> = (0..5)
            .map(|i| dec!(100.0) + Decimal::from(i))
            .collect();

        let result = calculator.calculate(&prices, Duration::minutes(1));
        match result {
            Err(MarketMakingError::InsufficientDataError(msg)) => {
                assert!(msg.contains("Insufficient data"));
            }
            _ => panic!("Expected InsufficientDataError"),
        }
    }
}
