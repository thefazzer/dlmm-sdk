import { startServer } from './unifiedServer';

// Start the server when this file is run directly
startServer();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  process.exit(0);
});