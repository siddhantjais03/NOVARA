import express from 'express';
import {
  getReviews,
  createReview,
  updateReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.route('/')
  .get(optionalProtect, getReviews)
  .post(optionalProtect, createReview);

router.route('/:id')
  .delete(protect, admin, deleteReview);

router.patch('/:id/status', protect, admin, updateReviewStatus);

export default router;

