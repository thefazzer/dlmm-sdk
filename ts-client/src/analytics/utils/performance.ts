

export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;
    
    const measurements = this.metrics.get(name) || [];
    measurements.push(duration);
    this.metrics.set(name, measurements);
    
    return result;
  }

  static getStats(name: string) {
    const measurements = this.metrics.get(name) || [];
    return {
      avg: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      count: measurements.length
    };
  }
}