

import { configureDecimal } from './utils/decimal';
import { logger } from './utils/logger';
import { validateConfig } from './config';

export async function initializeAnalytics(config: unknown): Promise<void> {
  try {
    // Validate configuration
    const validConfig = validateConfig(config);
    
    // Configure decimal.js
    configureDecimal();
    
    // Initialize logger
    logger.level = validConfig.logLevel;
    
    // Test calculations
    const testCalc = new Decimal('1.23');
    if (!testCalc.isFinite()) {
      throw new Error('Decimal calculations not working correctly');
    }
    
    logger.info('Analytics initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize analytics:', error);
    throw error;
  }
}