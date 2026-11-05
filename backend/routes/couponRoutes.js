import express from 'express';
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/validate', validateCoupon);

router.route('/')
  .get(protect, admin, getCoupons)
  .post(protect, admin, createCoupon);

router.delete('/:id', protect, admin, deleteCoupon);
router.patch('/:id/toggle', protect, admin, toggleCouponStatus);

export default router;

