

use std::collections::VecDeque;
use chrono::Duration;
use rust_decimal::Decimal;
use crate::types::MarketMakingError;

pub struct VolatilityCalculator {
    price_history: VecDeque<(u64, f64)>,
    window_sizes: Vec<Duration>,
    min_samples: usize,
    max_gap_ratio: f64,
}

impl VolatilityCalculator {
    pub fn new(window_sizes: Vec<Duration>, min_samples: usize, max_gap_ratio: f64) -> Self {
        let max_size = window_sizes.len();
        Self {
            price_history: VecDeque::with_capacity(max_size),
            window_sizes,
            min_samples,
            max_gap_ratio,
        }
    }

    pub fn add_price(&mut self, timestamp: u64, price: f64) {
        if self.price_history.len() >= self.price_history.capacity() {
            self.price_history.pop_front();
        }
        self.price_history.push_back((timestamp, price));
    }

    pub fn calculate_volatilities(&self) -> Vec<(usize, f64)> {
        self.window_sizes
            .iter()
            .map(|&window| {
                let vol = self.calculate_volatility_for_window(window);
                (window, vol)
            })
            .collect()
    }

    fn calculate_volatility_for_window(&self, window: usize) -> f64 {
        if self.price_history.len() < 2 {
            return 0.0;
        }

        let prices: Vec<_> = self.price_history
            .iter()
            .rev()
            .take(window)
            .map(|(_, price)| *price)
            .collect();

        if prices.len() < 2 {
            return 0.0;
        }

        // Calculate log returns
        let returns: Vec<f64> = prices
            .windows(2)
            .map(|w| (w[0] / w[1]).ln())
            .collect();

        // Calculate standard deviation
        let mean = returns.iter().sum::<f64>() / returns.len() as f64;
        let variance = returns
            .iter()
            .map(|r| (r - mean).powi(2))
            .sum::<f64>() / (returns.len() - 1) as f64;

        // Annualize volatility (assuming prices are at 1-second intervals)
        (variance.sqrt() * (31_536_000_f64 / window as f64).sqrt()) * 100.0
    }

    pub fn get_latest_volatility(&self) -> f64 {
        // Use the smallest window size for latest volatility
        if let Some(&window) = self.window_sizes.iter().min() {
            self.calculate_volatility_for_window(window)
        } else {
            0.0
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_volatility_calculation() {
        let mut calc = VolatilityCalculator::new(vec![60, 300]); // 1min and 5min windows
        
        // Add some test prices
        for i in 0..400 {
            // Simulate some price movement
            let price = 100.0 + (i as f64 / 100.0).sin() * 5.0;
            calc.add_price(i as u64, price);
        }

        let vols = calc.calculate_volatilities();
        assert_eq!(vols.len(), 2);
        
        // Verify volatilities are reasonable (non-zero and finite)
        for (_, vol) in vols {
            assert!(vol > 0.0);
            assert!(vol.is_finite());
        }
    }
}

use chrono::Duration;
use rust_decimal::Decimal;
use crate::types::MarketMakingError;
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