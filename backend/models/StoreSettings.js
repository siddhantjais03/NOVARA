import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'NOVARA Haute Couture & Luxury Goods',
      trim: true
    },
    tagline: {
      type: String,
      default: 'Discover Your Style. Define Your World.',
      trim: true
    },
    contactEmail: {
      type: String,
      default: 'concierge@novara.luxury',
      trim: true
    },
    supportPhone: {
      type: String,
      default: '+91 (0) 11 4982 7000',
      trim: true
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    currencySymbol: {
      type: String,
      default: '$',
      trim: true
    },
    freeShippingThreshold: {
      type: Number,
      default: 150,
      min: 0
    },
    standardShippingFee: {
      type: Number,
      default: 25,
      min: 0
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: 0
    },
    announcementText: {
      type: String,
      default: 'COMPLIMENTARY WORLDWIDE COURIER DELIVERY ON ORDERS ABOVE $150 • CODE: WELCOME10 FOR 10% PRIVILEGE',
      trim: true
    },
    enableReviews: {
      type: Boolean,
      default: true
    },
    maintenanceMode: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

