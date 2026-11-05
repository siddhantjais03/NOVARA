import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Create new order with stock validation & payment selection
// @route   POST /api/orders
// @access  Public / Private
export const createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      customerInfo,
      paymentMethod,
      appliedCoupon,
      paymentResult
    } = req.body;

    // 1. Validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your shopping bag contains no items to order'
      });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address (street, city, state, postal code)'
      });
    }

    if (!customerInfo || !customerInfo.email || !customerInfo.name) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required for delivery notifications'
      });
    }

    const validPaymentMethods = ['COD', 'UPI', 'CARD'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid payment method (COD, UPI, or CARD)'
      });
    }

    // 2. Validate Products & Stock Availability
    let itemsPrice = 0;
    const validatedItems = [];

    // MongoDB connected check
    if (mongoose.connection.readyState === 1) {
      for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product "${item.name}" was not found in our catalog`
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for "${product.name}". Only ${product.stock} pieces remaining.`
          });
        }

        itemsPrice += product.price * item.quantity;
        validatedItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'M',
          selectedColor: item.selectedColor || { name: 'Default', hex: '#000000' }
        });
      }

      // Calculate shipping & discount
      const shippingPrice = itemsPrice >= 150 ? 0 : 25;
      let discountPrice = 0;

      if (appliedCoupon) {
        const coupon = await Coupon.findOne({ code: appliedCoupon.toUpperCase(), isActive: true });
        if (coupon) {
          const calc = coupon.calculateDiscount(itemsPrice);
          if (calc.valid) discountPrice = calc.discountAmount;
        }
      }

      const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);

      // Decrement stock
      for (const item of validatedItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      const isPaid = paymentMethod === 'CARD' || paymentMethod === 'UPI';
      const order = await Order.create({
        user: req.user ? req.user._id : null,
        customerInfo,
        orderItems: validatedItems,
        shippingAddress,
        paymentMethod,
        paymentResult: paymentResult || {
          id: isPaid ? `DEMO-PAY-${Date.now()}` : 'COD-PENDING',
          status: isPaid ? 'COMPLETED' : 'PENDING_DELIVERY',
          paymentDetail: paymentMethod === 'UPI' ? 'Verified Demo UPI VPA' : paymentMethod === 'CARD' ? 'Verified Demo Card' : 'Cash upon delivery'
        },
        itemsPrice: Math.round(itemsPrice * 100) / 100,
        shippingPrice,
        discountPrice: Math.round(discountPrice * 100) / 100,
        appliedCoupon: appliedCoupon || null,
        totalPrice: Math.round(totalPrice * 100) / 100,
        isPaid,
        paidAt: isPaid ? new Date() : null,
        orderStatus: 'Confirmed'
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully. Thank you for choosing NOVARA.',
        order
      });
    }

    // In-Memory Fallback
    for (const item of orderItems) {
      const product = memoryData.products.find((p) => p._id === item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name}" was not found in our catalog`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Only ${product.stock} pieces remaining.`
        });
      }

      itemsPrice += product.price * item.quantity;
      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize || 'M',
        selectedColor: item.selectedColor || { name: 'Default', hex: '#000000' }
      });
    }

    const shippingPrice = itemsPrice >= 150 ? 0 : 25;
    let discountPrice = 0;

    if (appliedCoupon) {
      const coupon = memoryData.coupons.find((c) => c.code === appliedCoupon.toUpperCase());
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discountPrice = (itemsPrice * coupon.discountValue) / 100;
        } else {
          discountPrice = Math.min(coupon.discountValue, itemsPrice);
        }
      }
    }

    const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountPrice);

    // Decrement stock in memory
    for (const item of validatedItems) {
      const prod = memoryData.products.find((p) => p._id === item.product);
      if (prod) prod.stock -= item.quantity;
    }

    const isPaid = paymentMethod === 'CARD' || paymentMethod === 'UPI';
    const newOrder = {
      _id: `ord-${Date.now()}`,
      user: req.user ? req.user._id : null,
      customerInfo,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentResult: paymentResult || {
        id: isPaid ? `DEMO-PAY-${Date.now()}` : 'COD-PENDING',
        status: isPaid ? 'COMPLETED' : 'PENDING_DELIVERY',
        paymentDetail: paymentMethod === 'UPI' ? 'Verified Demo UPI VPA' : paymentMethod === 'CARD' ? 'Verified Demo Card' : 'Cash upon delivery'
      },
      itemsPrice: Math.round(itemsPrice * 100) / 100,
      shippingPrice,
      discountPrice: Math.round(discountPrice * 100) / 100,
      appliedCoupon: appliedCoupon || null,
      totalPrice: Math.round(totalPrice * 100) / 100,
      isPaid,
      paidAt: isPaid ? new Date().toISOString() : null,
      orderStatus: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    memoryData.orders.unshift(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Thank you for choosing NOVARA.',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID with ownership verification and IDOR protection
// @route   GET /api/orders/:id
// @access  Private (Owner / Admin)
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || (mongoose.connection.readyState === 1 && !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(404).json({ success: false, message: 'Order not found with provided ID' });
    }

    let order = null;

    if (mongoose.connection.readyState === 1) {
      order = await Order.findById(id).populate('user', 'name email');
    } else {
      order = memoryData.orders.find((o) => o._id === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found with provided ID' });
    }

    // IDOR Protection:
    // 1. House Administrators have authorization to access orders
    if (req.user && req.user.role === 'admin') {
      return res.json({ success: true, order });
    }

    // 2. Verified Patron ownership check via authenticated MongoDB ID
    const orderUserId = order.user?._id || order.user;
    const isOwner =
      req.user &&
      orderUserId &&
      String(orderUserId) === String(req.user._id);

    // If order was placed as a guest (no user ID), verify matching customer email
    const isGuestOwnerByEmail =
      !orderUserId &&
      req.user?.email &&
      order.customerInfo?.email &&
      order.customerInfo.email.toLowerCase() === req.user.email.toLowerCase();

    if (isOwner || isGuestOwnerByEmail) {
      return res.json({ success: true, order });
    }

    // 3. Reject access to other customers' orders with 403 Forbidden
    return res.status(403).json({
      success: false,
      message: 'Access denied: You do not possess authorization to view this order.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    }

    const orders = memoryData.orders.filter(
      (o) => o.user === req.user._id || (req.user.email && o.customerInfo?.email === req.user.email)
    );

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, orders });
    }

    return res.json({
      success: true,
      count: memoryData.orders.length,
      orders: memoryData.orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`
      });
    }

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.orderStatus = status;
      if (status === 'Delivered') {
        order.deliveredAt = new Date();
        if (order.paymentMethod === 'COD') {
          order.isPaid = true;
          order.paidAt = new Date();
        }
      }

      await order.save();
      return res.json({ success: true, message: `Order status updated to ${status}`, order });
    }

    const order = memoryData.orders.find((o) => o._id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.deliveredAt = new Date().toISOString();
      if (order.paymentMethod === 'COD') {
        order.isPaid = true;
        order.paidAt = new Date().toISOString();
      }
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    next(error);
  }
};
