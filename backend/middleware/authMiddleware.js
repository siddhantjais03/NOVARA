import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { memoryData } from '../config/memoryStore.js';

const getAuthenticatedUser = async (decoded) => {
  if (mongoose.connection.readyState !== 1) {
    const memoryUser = memoryData.users.find(
      (u) =>
        (decoded.id && String(u._id) === String(decoded.id)) ||
        (decoded.email && u.email?.toLowerCase() === decoded.email?.toLowerCase())
    );
    return memoryUser || null;
  }

  let user = null;

  // Find by MongoDB ObjectId only when the token contains a valid ObjectId.
  if (mongoose.Types.ObjectId.isValid(decoded.id)) {
    user = await User.findById(decoded.id).select('-password');
  }

  // If the token contains an email, use it as a fallback.
  if (!user && decoded.email) {
    user = await User.findOne({
      email: decoded.email.toLowerCase()
    }).select('-password');
  }

  return user;
};

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await getAuthenticatedUser(decoded);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please log in again.'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('[Auth Error]', error.message);

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = await getAuthenticatedUser(decoded);
    }
  } catch (error) {
    req.user = null;
  }

  next();
};