import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String, default: 'M' },
    selectedColor: {
      name: { type: String, default: 'Default' },
      hex: { type: String, default: '#000000' }
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    customerInfo: {
      name: { type: String, required: [true, 'Please provide customer name'] },
      email: { type: String, required: [true, 'Please provide customer email'] },
      phone: { type: String, required: [true, 'Please provide customer phone'] }
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: [val => val.length > 0, 'Order must contain at least one item']
    },
    shippingAddress: {
      street: { type: String, required: [true, 'Street address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      postalCode: { type: String, required: [true, 'Postal code is required'] },
      country: { type: String, required: true, default: 'India' }
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: ['COD', 'UPI', 'CARD'],
      default: 'COD'
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      paymentDetail: { type: String }
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    appliedCoupon: {
      type: String,
      default: null
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing'
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);

