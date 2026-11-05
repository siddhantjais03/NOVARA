import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes require user authentication
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/item', updateCartItem);
router.delete('/item', removeFromCart);
router.delete('/clear', clearCart);
router.post('/sync', syncCart);

export default router;

