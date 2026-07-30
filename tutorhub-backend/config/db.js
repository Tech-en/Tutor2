/**
 * Database Configuration
 * 
 * Handles MongoDB connection with Mongoose
 * Includes connection pooling, error handling, and event listeners
 * 
 * @module config/db
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 * 
 * Features:
 * - Automatic reconnection
 * - Connection pooling
 * - Error handling and logging
 * - Graceful shutdown
 * 
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // MongoDB connection options for production
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maximum number of sockets
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      autoIndex: process.env.NODE_ENV !== 'production', // Disable in production for performance
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database Name: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🛑 Mongoose connection closed due to app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error(`❌ MongoDB Connection Failed: ${error.message}`);
    logger.error(`Stack: ${error.stack}`);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * Used for testing and graceful shutdown
 * 
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed successfully');
  } catch (error) {
    logger.error(`❌ Error closing MongoDB connection: ${error.message}`);
    throw error;
  }
};

/**
 * Get current connection state
 * 
 * @returns {number} Connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 */
const getConnectionState = () => {
  return mongoose.connection.readyState;
};

/**
 * Get connection statistics
 * 
 * @returns {Object} Connection statistics
 */
const getConnectionStats = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    state: states[state],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    collections: Object.keys(mongoose.connection.collections).length
  };
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionState,
  getConnectionStats
};
