/**
 * TutorPlatform - Main Server File
 * 
 * Production-ready Express server with comprehensive middleware,
 * security, logging, and error handling
 * 
 * @version 1.0.0
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');

// Import utilities
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const rateLimiter = require('./middleware/rateLimiter');
const securityMiddleware = require('./middleware/securityMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Trust proxy (needed for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

/**
 * ========================================
 * MIDDLEWARE CONFIGURATION
 * ========================================
 */

// Security HTTP headers
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
}

// Serve static files
app.use('/uploads', express.static('uploads'));

// Apply security middleware
app.use(securityMiddleware);

/**
 * ========================================
 * API ROUTES
 * ========================================
 */

const API_VERSION = process.env.API_VERSION || 'v1';

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TutorPlatform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API root
app.get(`/api/${API_VERSION}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to TutorPlatform API',
    version: API_VERSION,
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      tutors: `/api/${API_VERSION}/tutors`,
      bookings: `/api/${API_VERSION}/bookings`,
      sessions: `/api/${API_VERSION}/sessions`,
      payments: `/api/${API_VERSION}/payments`,
      reviews: `/api/${API_VERSION}/reviews`,
      orders: `/api/${API_VERSION}/orders`
    },
    documentation: 'https://docs.tutorplatform.com'
  });
});

// Apply rate limiting to API routes
app.use(`/api/${API_VERSION}`, rateLimiter);

// Mount routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/tutors`, tutorRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/sessions`, sessionRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);

/**
 * ========================================
 * ERROR HANDLING
 * ========================================
 */

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

/**
 * ========================================
 * UNCAUGHT EXCEPTIONS & REJECTIONS
 * ========================================
 */

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  logger.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

/**
 * ========================================
 * START SERVER
 * ========================================
 */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info('🚀 TutorPlatform API Server Started');
  logger.info('='.repeat(60));
  logger.info(`📡 Server: http://localhost:${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`📦 API Version: ${API_VERSION}`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  logger.info(`📁 Uploads: ${process.env.UPLOAD_PATH || './uploads'}`);
  logger.info('='.repeat(60));
});

/**
 * ========================================
 * GRACEFUL SHUTDOWN
 * ========================================
 */

const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} signal received: closing HTTP server`);
  server.close(async () => {
    logger.info('✅ HTTP server closed');
    
    // Close database connection
    try {
      await mongoose.connection.close();
      logger.info('✅ Database connection closed');
    } catch (error) {
      logger.error('❌ Error closing database connection:', error);
    }
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
