

export class RateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly limit: number,
    private readonly interval: number
  ) {}

  async throttle(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter(t => now - t < this.interval);
    
    if (this.timestamps.length >= this.limit) {
      const oldestCall = this.timestamps[0];
      const delay = this.interval - (now - oldestCall);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.timestamps.push(now);
  }
}