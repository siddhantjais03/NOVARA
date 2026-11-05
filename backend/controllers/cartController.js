import mongoose from 'mongoose';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { memoryData } from '../config/memoryStore.js';

// Helper to compute subtotal from populated items
const computeSubtotal = (items) => {
  return items.reduce((acc, item) => {
    const price = item.product?.price || item.price || 0;
    return acc + price * item.quantity;
  }, 0);
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: userId }).populate('items.product');

      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      // Filter out any deleted products if any
      const validItems = cart.items.filter((item) => item.product !== null);
      if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        await cart.save();
      }

      const subtotal = computeSubtotal(cart.items);

      return res.json({
        success: true,
        cart: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0)
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.carts[key]) {
      memoryData.carts[key] = [];
    }

    const memoryCart = memoryData.carts[key];
    const subtotal = computeSubtotal(memoryCart);

    return res.json({
      success: true,
      cart: {
        _id: `cart-${key}`,
        user: userId,
        items: memoryCart,
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: memoryCart.reduce((acc, i) => acc + i.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart with stock validation
// @route   POST /api/cart/add
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1, selectedSize = 'M', selectedColor } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found in catalog' });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" is currently out of stock.`
        });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (item) =>
          String(item.product) === String(productId) &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + qty;
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Available stock limit of ${product.stock} reached.`
          });
        }
        cart.items[existingIndex].quantity = newQty;
        if (selectedColor) cart.items[existingIndex].selectedColor = selectedColor;
      } else {
        if (qty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock.`
          });
        }
        cart.items.push({
          product: product._id,
          quantity: qty,
          selectedSize,
          selectedColor: selectedColor || product.colors?.[0] || { name: 'Default', hex: '#000000' }
        });
      }

      await cart.save();
      await cart.populate('items.product');

      const subtotal = computeSubtotal(cart.items);
      return res.status(200).json({
        success: true,
        message: `Added "${product.name}" to your shopping bag.`,
        cart: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0)
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.carts[key]) memoryData.carts[key] = [];

    const product = memoryData.products.find((p) => p._id === productId || p.id === productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = memoryData.carts[key].find(
      (item) =>
        (item.product._id || item.product.id || item.product) === productId &&
        item.selectedSize === selectedSize
    );

    if (existing) {
      existing.quantity = Math.min(product.stock, existing.quantity + qty);
    } else {
      memoryData.carts[key].push({
        product,
        quantity: Math.min(product.stock, qty),
        selectedSize,
        selectedColor: selectedColor || product.colors?.[0] || { name: 'Default', hex: '#000' }
      });
    }

    const subtotal = computeSubtotal(memoryData.carts[key]);
    return res.json({
      success: true,
      message: `Added "${product.name}" to shopping bag.`,
      cart: {
        _id: `cart-${key}`,
        user: userId,
        items: memoryData.carts[key],
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: memoryData.carts[key].reduce((acc, i) => acc + i.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product quantity or specifications in cart
// @route   PUT /api/cart/item
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, selectedSize, quantity, newSize, newColor } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const newQty = parseInt(quantity, 10);

    if (mongoose.connection.readyState === 1) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(
        (item) =>
          String(item.product) === String(productId) &&
          (!selectedSize || item.selectedSize === selectedSize)
      );

      if (itemIndex === -1) {
        return res.status(404).json({ success: false, message: 'Item not found in cart' });
      }

      if (newQty <= 0) {
        // Remove item if quantity set to 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        const product = await Product.findById(productId);
        if (product && newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Available stock limit of ${product.stock} units reached.`
          });
        }

        cart.items[itemIndex].quantity = newQty;
        if (newSize) cart.items[itemIndex].selectedSize = newSize;
        if (newColor) cart.items[itemIndex].selectedColor = newColor;
      }

      await cart.save();
      await cart.populate('items.product');

      const subtotal = computeSubtotal(cart.items);
      return res.json({
        success: true,
        message: 'Cart item updated',
        cart: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0)
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.carts[key]) memoryData.carts[key] = [];

    const idx = memoryData.carts[key].findIndex(
      (item) =>
        (item.product._id || item.product.id || item.product) === productId &&
        (!selectedSize || item.selectedSize === selectedSize)
    );

    if (idx !== -1) {
      if (newQty <= 0) {
        memoryData.carts[key].splice(idx, 1);
      } else {
        memoryData.carts[key][idx].quantity = newQty;
      }
    }

    const subtotal = computeSubtotal(memoryData.carts[key]);
    return res.json({
      success: true,
      message: 'Cart item updated',
      cart: {
        _id: `cart-${key}`,
        user: userId,
        items: memoryData.carts[key],
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: memoryData.carts[key].reduce((acc, i) => acc + i.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/item
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, selectedSize } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    if (mongoose.connection.readyState === 1) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }

      cart.items = cart.items.filter(
        (item) =>
          !(String(item.product) === String(productId) && (!selectedSize || item.selectedSize === selectedSize))
      );

      await cart.save();
      await cart.populate('items.product');

      const subtotal = computeSubtotal(cart.items);
      return res.json({
        success: true,
        message: 'Item removed from shopping bag.',
        cart: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0)
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.carts[key]) memoryData.carts[key] = [];

    memoryData.carts[key] = memoryData.carts[key].filter(
      (item) =>
        !((item.product._id || item.product.id || item.product) === productId &&
          (!selectedSize || item.selectedSize === selectedSize))
    );

    const subtotal = computeSubtotal(memoryData.carts[key]);
    return res.json({
      success: true,
      message: 'Item removed from shopping bag.',
      cart: {
        _id: `cart-${key}`,
        user: userId,
        items: memoryData.carts[key],
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: memoryData.carts[key].reduce((acc, i) => acc + i.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (mongoose.connection.readyState === 1) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
      return res.json({
        success: true,
        message: 'Shopping bag cleared',
        cart: { user: userId, items: [], subtotal: 0, itemCount: 0 }
      });
    }

    memoryData.carts[String(userId)] = [];
    return res.json({
      success: true,
      message: 'Shopping bag cleared',
      cart: { user: userId, items: [], subtotal: 0, itemCount: 0 }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync / merge guest cart into user's database cart upon login
// @route   POST /api/cart/sync
// @access  Private
export const syncCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { guestItems = [] } = req.body;

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return getCart(req, res, next);
    }

    if (mongoose.connection.readyState === 1) {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      for (const guestItem of guestItems) {
        const prodId = guestItem.product?._id || guestItem.product?.id || guestItem.product;
        if (!prodId) continue;

        const product = await Product.findById(prodId);
        if (!product || product.stock <= 0) continue;

        const size = guestItem.selectedSize || 'M';
        const existingIndex = cart.items.findIndex(
          (item) => String(item.product) === String(prodId) && item.selectedSize === size
        );

        const guestQty = Math.max(1, guestItem.quantity || 1);

        if (existingIndex > -1) {
          cart.items[existingIndex].quantity = Math.min(
            product.stock,
            cart.items[existingIndex].quantity + guestQty
          );
        } else {
          cart.items.push({
            product: product._id,
            quantity: Math.min(product.stock, guestQty),
            selectedSize: size,
            selectedColor: guestItem.selectedColor || product.colors?.[0] || { name: 'Default', hex: '#000000' }
          });
        }
      }

      await cart.save();
      await cart.populate('items.product');

      const subtotal = computeSubtotal(cart.items);
      return res.json({
        success: true,
        message: 'Guest shopping bag synchronized with your patron account.',
        cart: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0)
        }
      });
    }

    // In-memory fallback
    const key = String(userId);
    if (!memoryData.carts[key]) memoryData.carts[key] = [];

    for (const guestItem of guestItems) {
      const prodId = guestItem.product?._id || guestItem.product?.id || guestItem.product;
      const product = memoryData.products.find((p) => p._id === prodId || p.id === prodId);
      if (!product) continue;

      const size = guestItem.selectedSize || 'M';
      const existing = memoryData.carts[key].find(
        (i) => (i.product._id || i.product.id) === prodId && i.selectedSize === size
      );

      if (existing) {
        existing.quantity = Math.min(product.stock, existing.quantity + (guestItem.quantity || 1));
      } else {
        memoryData.carts[key].push({
          product,
          quantity: Math.min(product.stock, guestItem.quantity || 1),
          selectedSize: size,
          selectedColor: guestItem.selectedColor || product.colors?.[0]
        });
      }
    }

    const subtotal = computeSubtotal(memoryData.carts[key]);
    return res.json({
      success: true,
      message: 'Guest cart synchronized',
      cart: {
        _id: `cart-${key}`,
        user: userId,
        items: memoryData.carts[key],
        subtotal: Math.round(subtotal * 100) / 100,
        itemCount: memoryData.carts[key].reduce((acc, i) => acc + i.quantity, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

