import express from 'express';
import { getAdminStats, getCustomers } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getCustomers);
router.get('/customers', protect, admin, getCustomers);

export default router;
