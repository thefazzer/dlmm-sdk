

export class OrderFlow {
  // Use typed arrays for better memory efficiency and performance
  private readonly trades: CircularBuffer<Trade>;
  private readonly volumeBuffer: CircularBuffer<VolumeEntry>;
  
  constructor(historySize: number = 300) {
    this.trades = new CircularBuffer<Trade>(historySize);
    this.volumeBuffer = new CircularBuffer<VolumeEntry>(historySize);
  }

  // Use pre-allocated buffers for calculations
  private readonly calculationBuffer = new Float64Array(300);
  
  addTrade(price: Decimal, size: Decimal, isBuyer: boolean): void {
    const timestamp = DateTime.now().toUnixInteger();
    
    this.trades.push({
      timestamp: DateTime.fromSeconds(timestamp),
      price,
      size,
      isBuyer,
      aggressor: isBuyer ? TradeAggressor.Buyer : TradeAggressor.Seller
    });

    this.volumeBuffer.push({
      timestamp,
      size,
      isBuyer
    });
  }

  // Optimize calculations with TypedArrays
  calculateImbalance(windowSecs: number): Decimal {
    const now = DateTime.now().toUnixInteger();
    const cutoff = now - windowSecs;

    let buySum = 0;
    let sellSum = 0;
    
    for (const entry of this.volumeBuffer) {
      if (entry.timestamp >= cutoff) {
        if (entry.isBuyer) {
          buySum += entry.size.toNumber();
        } else {
          sellSum += entry.size.toNumber();
        }
      }
    }

    const total = buySum + sellSum;
    return total === 0 ? 
      new Decimal(0) : 
      new Decimal(buySum - sellSum).div(total);
  }
}