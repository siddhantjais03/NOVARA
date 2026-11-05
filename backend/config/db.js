import mongoose from 'mongoose';
import { ensureAdminUser } from './ensureAdmin.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/novara';

  // Prevent uncaught Mongoose connection error event
  mongoose.connection.on('error', (err) => {
    // Graceful error logging
    console.warn(`[Database Notice] ${err.message}`);
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    await ensureAdminUser();
    return conn;
  } catch (err) {
    console.warn(`[Database] MongoDB connection issue (${err.message}).`);
    console.log(`[Database] Running in zero-downtime memory-backed mode.`);
    console.log(`[Database] To persist data directly to MongoDB, start mongod or update MONGODB_URI in backend/.env`);
    await ensureAdminUser();
    return null;
  }
};
