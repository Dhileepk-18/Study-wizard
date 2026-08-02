const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();

// Security & Parsing Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Health check endpoints (available before DB check for monitoring uptime)
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'Study Wizard API Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

// Connect DB middleware for serverless invocations
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('[DB Connection Middleware Error]:', err.message);
    res.status(500).json({
      error: 'Database connection failed',
      message: err.message
    });
  }
});

// Mount API Routes on both /api and root to guarantee serverless rewrite compatibility
app.use('/api', apiRoutes);
app.use(apiRoutes);

// Serve compiled static React app in production standalone mode
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // Root API status endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Study Wizard API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/api/auth/login, /api/auth/register, /api/auth/profile',
        subjects: '/api/subjects',
        exams: '/api/exams',
        schedule: '/api/schedule',
        sessions: '/api/sessions',
        analytics: '/api/analytics',
        health: '/health'
      }
    });
  });
}

// Start standalone server locally if run directly or in non-serverless environment
const PORT = process.env.PORT || 5000;
if (require.main === module || (process.env.NODE_ENV !== 'production' && !process.env.VERCEL)) {
  app.listen(PORT, () => {
    console.log(`[Study Wizard Backend] Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
