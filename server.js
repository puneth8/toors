// ============================================
// BusGo Backend - Main Server Entry Point
// ============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ============================================
// Middleware
// ============================================
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting on API routes
app.use('/api/', apiLimiter);

// ============================================
// Routes
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/buses', require('./routes/buses'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/trains', require('./routes/trains'));
app.use('/api/flights', require('./routes/flights'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BusGo API is running' });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚌 BusGo server running on port ${PORT}`);
});
