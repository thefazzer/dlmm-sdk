

import { z } from 'zod';

export const AnalyticsConfig = z.object({
  windowSize: z.number().min(1).max(1000),
  minSamples: z.number().min(2).max(1000),
  maxCacheSize: z.number().min(1).max(10000),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  performanceMonitoring: z.boolean(),
});

export type AnalyticsConfig = z.infer<typeof AnalyticsConfig>;

export const validateConfig = (config: unknown): AnalyticsConfig => {
  return AnalyticsConfig.parse(config);
};