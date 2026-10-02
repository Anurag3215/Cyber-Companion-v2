'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const threatRoutes = require('./routes/threatRoutes');

dotenv.config();

const app = express();

// 1. Security HTTP Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.disable('x-powered-by');

// 2. Cross-Origin Resource Sharing (CORS) Policy
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  })
);

// 3. Body Parsing Middleware (Strict Payload Limit for DoS Mitigation)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 4. Health & Readiness Endpoints
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'cyber-companion-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'cyber-companion-gateway',
    timestamp: new Date().toISOString(),
  });
});

// 5. Threat Intelligence & Scoring API Routes
app.use('/api/v1', threatRoutes);

// 6. 404 Fallback Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource Not Found',
    path: req.originalUrl,
  });
});

// 6. Centralized Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Internal Server Error',
  });
});

if (require.main === module) {
  const PORT = Number(process.env.PORT) || 5000;
  (async () => {
    try {
      if (process.env.MONGODB_URI) {
        await connectDB();
      } else {
        console.warn(
          '[Server] MONGODB_URI not set; starting gateway without active DB connection.'
        );
      }
      app.listen(PORT, () => {
        console.info(
          `[Server] Cyber Companion Gateway listening on port ${PORT}`
        );
      });
    } catch (error) {
      console.error(`[Server] Startup failure: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = app;
