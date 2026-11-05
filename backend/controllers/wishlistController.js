import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { Product } from '../models/Product.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      let wishlist = await Wishlist.findOne({ user: userId }).populate('products');

      if (!wishlist) {
        wishlist = await Wishlist.create({ user: userId, products: [] });
      }

      // Filter out any null products if any were deleted
      const validProducts = wishlist.products.filter((p) => p !== null);
      if (validProducts.length !== wishlist.products.length) {
        wishlist.products = validProducts.map((p) => p._id);
        await wishlist.save();
        wishlist = await Wishlist.findOne({ user: userId }).populate('products');
      }

      return res.json({
        success: true,
        wishlist: {
          _id: wishlist._id,
          user: wishlist.user,
          products: wishlist.products,
          count: wishlist.products.length
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.wishlists[key]) {
      memoryData.wishlists[key] = [];
    }

    return res.json({
      success: true,
      wishlist: {
        _id: `wishlist-${key}`,
        user: userId,
        products: memoryData.wishlists[key],
        count: memoryData.wishlists[key].length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to wishlist (prevent duplicates)
// @route   POST /api/wishlist/add
// @access  Private
export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      const isAlreadyInWishlist = wishlist.products.some(
        (id) => String(id) === String(productId)
      );

      if (!isAlreadyInWishlist) {
        wishlist.products.push(productId);
        await wishlist.save();
      }

      await wishlist.populate('products');

      return res.json({
        success: true,
        message: isAlreadyInWishlist
          ? 'Product already in your curated wishlist'
          : `Added "${product.name}" to your wishlist.`,
        wishlist: {
          _id: wishlist._id,
          user: wishlist.user,
          products: wishlist.products,
          count: wishlist.products.length
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.wishlists[key]) memoryData.wishlists[key] = [];

    const product = memoryData.products.find((p) => p._id === productId || p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const exists = memoryData.wishlists[key].some(
      (p) => (p._id || p.id) === productId
    );

    if (!exists) {
      memoryData.wishlists[key].push(product);
    }

    return res.json({
      success: true,
      message: exists
        ? 'Product already in your wishlist'
        : `Added "${product.name}" to your wishlist.`,
      wishlist: {
        _id: `wishlist-${key}`,
        user: userId,
        products: memoryData.wishlists[key],
        count: memoryData.wishlists[key].length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (mongoose.connection.readyState === 1) {
      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        return res.status(404).json({ success: false, message: 'Wishlist not found' });
      }

      wishlist.products = wishlist.products.filter(
        (id) => String(id) !== String(productId)
      );

      await wishlist.save();
      await wishlist.populate('products');

      return res.json({
        success: true,
        message: 'Product removed from your wishlist.',
        wishlist: {
          _id: wishlist._id,
          user: wishlist.user,
          products: wishlist.products,
          count: wishlist.products.length
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.wishlists[key]) memoryData.wishlists[key] = [];

    memoryData.wishlists[key] = memoryData.wishlists[key].filter(
      (p) => (p._id || p.id) !== productId
    );

    return res.json({
      success: true,
      message: 'Product removed from your wishlist.',
      wishlist: {
        _id: `wishlist-${key}`,
        user: userId,
        products: memoryData.wishlists[key],
        count: memoryData.wishlists[key].length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync / merge guest wishlist into user's account upon login
// @route   POST /api/wishlist/sync
// @access  Private
export const syncWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { guestProducts = [] } = req.body;

    if (!Array.isArray(guestProducts) || guestProducts.length === 0) {
      return getWishlist(req, res, next);
    }

    if (mongoose.connection.readyState === 1) {
      let wishlist = await Wishlist.findOne({ user: userId });
      if (!wishlist) {
        wishlist = new Wishlist({ user: userId, products: [] });
      }

      for (const item of guestProducts) {
        const prodId = item?._id || item?.id || item;
        if (!prodId) continue;

        const product = await Product.findById(prodId);
        if (!product) continue;

        const alreadyAdded = wishlist.products.some(
          (id) => String(id) === String(product._id)
        );

        if (!alreadyAdded) {
          wishlist.products.push(product._id);
        }
      }

      await wishlist.save();
      await wishlist.populate('products');

      return res.json({
        success: true,
        message: 'Guest wishlist synchronized with your account.',
        wishlist: {
          _id: wishlist._id,
          user: wishlist.user,
          products: wishlist.products,
          count: wishlist.products.length
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.wishlists[key]) memoryData.wishlists[key] = [];

    for (const item of guestProducts) {
      const prodId = item?._id || item?.id || item;
      const product = memoryData.products.find((p) => p._id === prodId || p.id === prodId);
      if (product && !memoryData.wishlists[key].some((p) => (p._id || p.id) === prodId)) {
        memoryData.wishlists[key].push(product);
      }
    }

    return res.json({
      success: true,
      message: 'Guest wishlist synchronized with your account.',
      wishlist: {
        _id: `wishlist-${key}`,
        user: userId,
        products: memoryData.wishlists[key],
        count: memoryData.wishlists[key].length
      }
    });
  } catch (error) {
    next(error);
  }
};

