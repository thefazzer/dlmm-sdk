// ... existing code ...

// Add this helper function at the top level of your file
function safelyCloseConnection(connection: Connection): void {
  try {
    // Try different ways to close the connection
    if (!connection) return;
    
    // Method 1: Close WebSocket if available
    if ((connection as any)._rpcWebSocket && 
        typeof (connection as any)._rpcWebSocket.close === 'function') {
      (connection as any)._rpcWebSocket.close();
      return;
    }
    
    // Method 2: Close transport if available
    if ((connection as any)._rpcRequest && 
        (connection as any)._rpcRequest.transport && 
        typeof (connection as any)._rpcRequest.transport.close === 'function') {
      (connection as any)._rpcRequest.transport.close();
      return;
    }
    
    // Method 3: Close WebSocket client if available
    if ((connection as any).client && 
        typeof (connection as any).client.close === 'function') {
      (connection as any).client.close();
      return;
    }
  } catch (e) {
    console.error("Error closing connection:", e);
  }
}

// ... existing code ...

// Then in your processBatch function, replace the connection cleanup code:
finally {
  // Clean up connection resources
  safelyCloseConnection(connection);
  console.log(`Completed batch ${batchIndex}`);
  emitter.completeBatch();
}

// ... existing code ...