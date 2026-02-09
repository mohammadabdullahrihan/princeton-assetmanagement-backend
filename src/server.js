// Forced restart for environment update
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables immediately
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Create Express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database Connection with caching for serverless
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/asset-management';

// Cache connection for serverless environments
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    cachedConnection = connection;
    console.log('✅ Connected to MongoDB');
    return connection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // Don't exit in serverless environment
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

// Initialize connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/reports', reportRoutes);

// Serve static files from public directory for the landing page
app.use(express.static(path.join(__dirname, 'public')));

// Base route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server only if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  // In serverless, we don't necessarily want to exit the process, 
  // but for local dev it's fine.
  if (require.main === module) {
    process.exit(1);
  }
});

module.exports = app;
