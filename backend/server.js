require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/database');
const createDefaultAdmin = require('./config/seed');
const errorHandler = require('./middleware/errorHandler');
const BlockedDomainChecker = require('./utils/blockedDomainChecker');

// Import routes
const authRoutes = require('./routes/authRoutes');
const brandRoutes = require('./routes/brandRoutes');
const domainRoutes = require('./routes/domainRoutes');
const checkerRoutes = require('./routes/checkerRoutes');
const logRoutes = require('./routes/logRoutes');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  pingTimeout: 60000, // 60 seconds (was 20s default)
  pingInterval: 25000, // 25 seconds
  connectTimeout: 45000 // 45 seconds connection timeout
});

// Connect to database
connectDB().then(() => {
  // Create default admin after DB connection
  createDefaultAdmin();
});

// Security middleware
app.use(helmet());

// CORS - Allow checker system and frontend
const allowedOrigins = [
  process.env.CORS_ORIGIN || 'http://localhost:3000',
  'http://localhost',
  'http://127.0.0.1'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Allow if origin matches or for checker system
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all for development
  },
  credentials: true
}));

// Rate limiting - exclude checker routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased from 100 to 500
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for checker system
    return req.path.startsWith('/api/urls') || req.path.startsWith('/api/bulk-check');
  }
});
app.use('/api', limiter);

// Logging - reduced in production
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    skip: (req, res) => {
      // Skip logging for successful checker updates to reduce spam
      return req.path.includes('/api/urls/update') && res.statusCode === 200;
    }
  }));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/urls', checkerRoutes);
app.use('/api/logs', logRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Domain Management Dashboard API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      brands: '/api/brands',
      domains: '/api/domains',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // You can add custom events here
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Initialize Blocked Domain Checker
let blockedDomainChecker;
if (process.env.CHECKER_WEBSOCKET_URL) {
  blockedDomainChecker = new BlockedDomainChecker(io);
  blockedDomainChecker.connect();
  console.log('✓ Blocked Domain Checker integration initialized');
} else {
  console.log('⚠ CHECKER_WEBSOCKET_URL not configured. Blocked domain checker integration disabled.');
}

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Domain Management Dashboard - Backend API   ║
║   Server running in ${process.env.NODE_ENV || 'development'} mode             ║
║   Port: ${PORT}                                    ║
║   URL: http://localhost:${PORT}                   ║
╚════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (blockedDomainChecker) {
    blockedDomainChecker.disconnect();
  }
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

module.exports = { app, server, io };
