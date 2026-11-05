import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { memoryData } from '../config/memoryStore.js';

// Generate JWT using MongoDB user ID or memory user ID.
const generateToken = (user) => {
  return jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d'
    }
  );
};

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  membershipTier: user.membershipTier,
  address: user.address
});

// REGISTER USER
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        phone,
        address,
        role: 'user'
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully. Welcome to NOVARA.',
        token: generateToken(user),
        user: formatUser(user)
      });
    }

    const existingUser = memoryData.users.find(
      user => user.email === normalizedEmail
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const newUser = {
      _id: `u-${Date.now()}`,
      name,
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'user',
      phone: phone || '',
      membershipTier: 'Patron Privilège',
      address: address || {},
      createdAt: new Date().toISOString()
    };

    memoryData.users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to NOVARA.',
      token: generateToken(newUser),
      user: formatUser(newUser)
    });

  } catch (error) {
    next(error);
  }
};

// LOGIN USER
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        email: normalizedEmail
      }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      return res.json({
        success: true,
        message: 'Welcome back to NOVARA',
        token: generateToken(user),
        user: formatUser(user)
      });
    }

    const user = memoryData.users.find(
      user => user.email === normalizedEmail
    );

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    return res.json({
      success: true,
      message: 'Welcome back to NOVARA',
      token: generateToken(user),
      user: formatUser(user)
    });

  } catch (error) {
    next(error);
  }
};

// DIRECTOR PORTAL ADMINISTRATOR LOGIN
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both administrator email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        email: normalizedEmail
      }).select('+password');

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid administrator email or password.'
        });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: `Access Denied: Account "${user.email}" does not possess administrator privileges.`
        });
      }

      return res.json({
        success: true,
        message: 'Welcome to the NOVARA Director Portal',
        token: generateToken(user),
        user: formatUser(user)
      });
    }

    // In-memory fallback
    const user = memoryData.users.find(
      u => u.email.toLowerCase() === normalizedEmail
    );

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator email or password.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Account "${user.email}" does not possess administrator privileges.`
      });
    }

    return res.json({
      success: true,
      message: 'Welcome to the NOVARA Director Portal',
      token: generateToken(user),
      user: formatUser(user)
    });

  } catch (error) {
    next(error);
  }
};

// GET USER PROFILE
export const getUserProfile = async (req, res, next) => {
  try {
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    } else {
      user = memoryData.users.find(
        item => item._id === String(req.user._id)
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: {
        ...formatUser(user),
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// GET ADMIN PROFILE (For verified Administrator Session)
export const getAdminProfile = async (req, res, next) => {
  try {
    const adminUser = req.user;

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Administrator privileges required.'
      });
    }

    return res.json({
      success: true,
      admin: {
        ...formatUser(adminUser),
        createdAt: adminUser.createdAt
      }
    });

  } catch (error) {
    next(error);
  }
};

// UPDATE USER PROFILE
export const updateUserProfile = async (req, res, next) => {
  try {
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(req.user._id);
    } else {
      user = memoryData.users.find(
        item => item._id === String(req.user._id)
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;

    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address
      };
    }

    if (req.body.password) {
      if (mongoose.connection.readyState === 1) {
        user.password = req.body.password;
      } else {
        user.passwordHash = bcrypt.hashSync(req.body.password, 10);
      }
    }

    if (mongoose.connection.readyState === 1) {
      await user.save();
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      token: generateToken(user),
      user: formatUser(user)
    });

  } catch (error) {
    next(error);
  }
};

// LOGOUT USER
export const logoutUser = async (req, res) => {
  return res.json({
    success: true,
    message: 'Signed out successfully'
  });
};