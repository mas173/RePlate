import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import donationRoutes from './routes/donation.routes.js';
import claimRoutes from './routes/claim.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import assistantRoutes from './routes/assistant.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

// Import cron scheduler
import { startCronJobs } from './services/cron.service.js';

// Import Redis client
import redisClient from './config/redis.js';

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Global Middleware
// =====================

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// =====================
// Webhook Routes (raw body — MUST be before express.json)
// Svix signature verification requires the raw Buffer body.
// =====================
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Body parsing (all other routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// =====================
// Health Check
// =====================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'RePlate API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// =====================
// API Routes
// =====================
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);

// =====================
// Error Handling
// =====================
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} does not exist`,
  });
});

// =====================
// Start Server
// =====================
app.listen(PORT, () => {
  console.log(`\n🌿 RePlate API Server`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port:        ${PORT}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health\n`);

  // Connect to Redis (asynchronous, degrades gracefully if offline)
  redisClient.connect().catch((err) => {
    console.warn('⚠️ Could not establish initial Redis connection. Caching disabled:', err.message);
  });

  // Start background cron jobs
  startCronJobs();
});

export default app;
