import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please enter coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
      required: true
    },
    discountValue: {
      type: Number,
      required: [true, 'Please enter discount value'],
      min: [1, 'Discount value must be at least 1']
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    maxDiscountAmount: {
      type: Number,
      default: null
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    },
    isActive: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Method to calculate discount for a given subtotal
couponSchema.methods.calculateDiscount = function (subtotal) {
  if (!this.isActive) {
    return { valid: false, message: 'Coupon is no longer active' };
  }
  if (this.expiryDate && new Date() > this.expiryDate) {
    return { valid: false, message: 'Coupon has expired' };
  }
  if (subtotal < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of $${this.minOrderAmount} required for this coupon`
    };
  }

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (subtotal * this.discountValue) / 100;
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    // Fixed amount discount
    discount = Math.min(this.discountValue, subtotal);
  }

  return {
    valid: true,
    discountAmount: Math.round(discount * 100) / 100,
    code: this.code,
    discountType: this.discountType,
    discountValue: this.discountValue
  };
};

export const Coupon = mongoose.model('Coupon', couponSchema);

