const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let isConnected = false;
let connectionPromise = null;
let mongoServerInstance = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // If connection is in progress, reuse the existing promise
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      let rawUri = (process.env.MONGODB_URI || '').trim();
      
      // Clean quotes if user entered URI in quotes
      if ((rawUri.startsWith('"') && rawUri.endsWith('"')) || (rawUri.startsWith("'") && rawUri.endsWith("'"))) {
        rawUri = rawUri.slice(1, -1).trim();
      }

      // Check if URI is valid and does not contain un-replaced placeholders like <password>
      const hasPlaceholder = rawUri.includes('<') || rawUri.includes('>');

      // 1. Attempt connection to external MongoDB URI (Atlas or custom hosted)
      if (rawUri && !hasPlaceholder) {
        try {
          console.log('[MongoDB] Connecting to external database...');
          await mongoose.connect(rawUri, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
          });
          console.log(`[MongoDB] Successfully connected to external database: ${mongoose.connection.host}`);
          isConnected = true;
          return;
        } catch (err) {
          console.warn(`[MongoDB Warning] Could not connect to external URI (${rawUri.split('@')[1] || 'URL'}): ${err.message}`);
          if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            throw new Error(`Failed to connect to MongoDB Atlas (${err.message}). Please check MONGODB_URI on your Vercel Dashboard.`);
          }
        }
      }

      // On Vercel or Production server, require a valid MONGODB_URI
      if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        if (hasPlaceholder) {
          throw new Error('MONGODB_URI contains un-replaced placeholder brackets (like <password>). Update your Vercel environment variables.');
        }
        throw new Error('MONGODB_URI environment variable is missing or unreachable in production.');
      }

      // 2. Local Fallback: Embedded MongoMemoryServer for development only
      const { MongoMemoryServer } = require('mongodb-memory-server');

      if (!mongoServerInstance) {
        console.log('[MongoDB] Initializing embedded MongoMemoryServer for local development...');
        const dbPath = path.join(__dirname, '..', 'data', 'mongodb');
        if (!fs.existsSync(dbPath)) {
          fs.mkdirSync(dbPath, { recursive: true });
        }

        mongoServerInstance = await MongoMemoryServer.create({
          instance: {
            dbPath: dbPath,
            storageEngine: 'wiredTiger'
          }
        });
      }

      const localUri = mongoServerInstance.getUri();
      await mongoose.connect(localUri);
      console.log(`[MongoDB] Connected to local MongoMemoryServer at: ${localUri}`);
      isConnected = true;
    } catch (error) {
      console.error(`[MongoDB Fatal Error] ${error.message}`);
      isConnected = false;
      throw error; // Re-throw so Express middleware responds with 500 error instead of hanging Mongoose queries!
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

module.exports = connectDB;
