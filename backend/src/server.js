const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database first
connectDB().then(() => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Ritual active on port ${PORT}`);
  });

  // Graceful Shutdown Rituals
  const gracefulShutdown = () => {
    console.log('[SERVER] SIGTERM/SIGINT received. Closing gates...');
    server.close(() => {
      console.log('[SERVER] Gates closed. Journey ends.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
});
