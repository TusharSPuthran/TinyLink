// back/db.js (fallback-friendly)
const mongoose = require('mongoose');

async function connectDB() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error('MONGO_URL not set in environment');
    throw new Error('MONGO_URL required');
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected via MONGO_URL');
    return;
  } catch (err) {
    console.error('MongoDB connection error using MONGO_URL:', err?.message || err);

    // If allowed, try a local fallback
    const allowFallback = process.env.ALLOW_LOCAL_FALLBACK === 'true';
    if (!allowFallback) {
      throw err;
    }

    const localUrl = process.env.LOCAL_MONGO_URL || 'mongodb://localhost:27017/tinylink';
    try {
      console.log('Attempting local MongoDB fallback at', localUrl);
      await mongoose.connect(localUrl);
      console.log('MongoDB connected via local fallback');
      return;
    } catch (localErr) {
      console.error('Local MongoDB fallback failed:', localErr?.message || localErr);
      // rethrow original error for visibility
      throw err;
    }
  }
}

module.exports = connectDB;
