import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Validate a coupon code and calculate discount on subtotal
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res, next) => {
  try {
    const code = req.body.code;
    const subtotal = req.body.subtotal !== undefined ? req.body.subtotal : req.body.orderAmount;

    if (!code || code.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please enter a coupon code'
      });
    }

    const subtotalNum = parseFloat(subtotal);
    if (isNaN(subtotalNum) || subtotalNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid subtotal amount is required to calculate discount'
      });
    }

    const normalizedCode = code.trim().toUpperCase();

    let coupon = null;

    if (mongoose.connection.readyState === 1) {
      coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });
    }

    if (!coupon) {
      coupon = memoryData.coupons.find(
        (c) => c.code === normalizedCode && c.isActive
      );
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: `Coupon code "${normalizedCode}" is invalid or has expired`
      });
    }

    if (coupon.minOrderAmount && subtotalNum < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Coupon "${coupon.code}" requires a minimum order subtotal of $${coupon.minOrderAmount}`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotalNum * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotalNum);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalTotal = Math.max(0, subtotalNum - discountAmount);

    return res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        subtotal: subtotalNum,
        finalTotal: Math.round(finalTotal * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const coupons = await Coupon.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: coupons.length, coupons });
    }

    return res.json({
      success: true,
      count: memoryData.coupons.length,
      coupons: memoryData.coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, expiryDate } = req.body;

    const normalizedCode = code.toUpperCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existing = await Coupon.findOne({ code: normalizedCode });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Coupon code "${normalizedCode}" already exists`
        });
      }

      const coupon = await Coupon.create({
        code: normalizedCode,
        discountType: discountType || 'percentage',
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined
      });

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        coupon
      });
    }

    const existing = memoryData.coupons.find((c) => c.code === normalizedCode);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Coupon code "${normalizedCode}" already exists`
      });
    }

    const newCoupon = {
      _id: `c-${Date.now()}`,
      code: normalizedCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      isActive: true,
      description: `${discountValue}${discountType === 'percentage' ? '%' : ' off'} promotion`,
      createdAt: new Date().toISOString()
    };

    memoryData.coupons.push(newCoupon);

    return res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon: newCoupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      await Coupon.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Coupon deleted successfully' });
    }

    const idx = memoryData.coupons.findIndex((c) => c._id === id || c.code === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    memoryData.coupons.splice(idx, 1);
    return res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon active status (Admin)
// @route   PATCH /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const coupon = await Coupon.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      coupon.isActive = !coupon.isActive;
      await coupon.save();
      return res.json({
        success: true,
        message: `Coupon ${coupon.code} is now ${coupon.isActive ? 'active' : 'inactive'}`,
        coupon
      });
    }

    const coupon = memoryData.coupons.find((c) => c._id === id || c.code === id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    coupon.isActive = !coupon.isActive;
    return res.json({
      success: true,
      message: `Coupon ${coupon.code} is now ${coupon.isActive ? 'active' : 'inactive'}`,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

