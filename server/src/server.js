'use strict';

const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/db');

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

/**
 * Bootstraps the Cyber Companion Backend Gateway.
 * Connects to MongoDB Atlas (when MONGODB_URI is provided) and binds the HTTP server.
 */
const startServer = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn(
        '[Server] MONGODB_URI is not configured. Running in standalone gateway mode.'
      );
    }

    const server = app.listen(PORT, () => {
      console.info(
        `[Server] Cyber Companion Backend Gateway running on http://localhost:${PORT}`
      );
    });

    const shutdown = (signal) => {
      console.info(`[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(() => {
        console.info('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error(`[Server] Fatal startup error: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
