const App = require('./app');
const config = require('./config');

// Create and start the application
const app = new App();

// Start the server
app.start().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  app.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  app.close();
  process.exit(0);
});