'use strict';

const mongoose = require('mongoose');

/**
 * Asynchronous MongoDB Atlas connection wrapper using Mongoose.
 * Enforces strict query filtering and production-grade connection timeouts.
 *
 * @returns {Promise<typeof mongoose>} Active Mongoose connection instance
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      '[Database] CRITICAL: MONGODB_URI environment variable is not defined.'
    );
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.info(
      `[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`
    );

    mongoose.connection.on('error', (err) => {
      console.error(`[Database] Runtime connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection lost.');
    });

    return conn;
  } catch (error) {
    console.error(
      `[Database] Failed to establish MongoDB Atlas connection: ${error.message}`
    );
    throw error;
  }
};

connectDB.connectDB = connectDB;
module.exports = connectDB;
