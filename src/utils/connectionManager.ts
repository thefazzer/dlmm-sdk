import { Connection, ConnectionConfig } from '@solana/web3.js';

/**
 * Creates a Solana connection with default configuration
 * @param rpcUrl The RPC URL to connect to
 * @returns A configured Solana connection
 */
export function createConnection(rpcUrl: string): Connection {
  const config: ConnectionConfig = {
    commitment: 'confirmed',
    disableRetryOnRateLimit: false,
    confirmTransactionInitialTimeout: 60000,
  };
  
  return new Connection(rpcUrl, config);
}

/**
 * Safely closes a Solana connection
 * @param connection The connection to close
 */
export function safelyCloseConnection(connection: Connection): void {
  try {
    // Check if connection and _rpcWebSocket exist before attempting to close
    if (
      connection && 
      (connection as any)._rpcWebSocket && 
      typeof (connection as any)._rpcWebSocket.close === 'function'
    ) {
      (connection as any)._rpcWebSocket.close();
    }
  } catch (e) {
    console.warn("Warning: Could not close connection cleanly", e);
  }
}

/**
 * Executes a function with retry logic
 * @param fn The function to execute
 * @param maxRetries Maximum number of retries
 * @param delayMs Delay between retries in milliseconds
 * @returns The result of the function
 */
export async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries: number = 3, 
  delayMs: number = 1000
): Promise<T> {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      retries++;
      
      if (retries > maxRetries) break;
      
      // Exponential backoff
      const backoffDelay = delayMs * Math.pow(2, retries - 1);
      console.log(`Retrying operation, attempt ${retries}/${maxRetries} after ${backoffDelay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}