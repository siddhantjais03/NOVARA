import express from 'express';
import {
  registerUser,
  loginUser,
  adminLogin,
  getUserProfile,
  getAdminProfile,
  updateUserProfile,
  logoutUser
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/admin-login', authLimiter, adminLogin);
router.post('/logout', logoutUser);
router.get('/admin-profile', protect, admin, getAdminProfile);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;

