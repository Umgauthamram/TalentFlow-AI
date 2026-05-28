const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { initializeTransporter } = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidates');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Normalize allowed origins to ensure they have http/https protocol
    const formattedOrigins = allowedOrigins.map(url => {
      return url.startsWith('http') ? url : `https://${url}`;
    });

    if (
      formattedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') ||
      /^http:\/\/localhost:\d+$/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'TalentFlow AI Smart ATS API is running successfully',
    healthCheck: '/api/health'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TalentFlow AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max size: 10MB' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Start server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Initialize email service
  initializeTransporter();

  // In Vercel serverless environment, we export the app and don't call app.listen()
  if (process.env.VERCEL) {
    console.log('🚀 Running in Vercel Serverless environment');
    return;
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║    🚀 TalentFlow AI — Smart ATS Backend     ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║    Server:  http://localhost:${PORT}            ║`);
    console.log(`║    Health:  http://localhost:${PORT}/api/health  ║`);
    console.log('║    Mode:    ' + (process.env.NODE_ENV || 'development').padEnd(33) + '║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});

module.exports = app;
