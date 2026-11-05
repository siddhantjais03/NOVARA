import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All wishlist routes require user authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/sync', syncWishlist);

export default router;

