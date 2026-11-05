import mongoose from 'mongoose';
import { StoreSettings } from '../models/StoreSettings.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let settings = await StoreSettings.findOne();

      if (!settings) {
        settings = await StoreSettings.create({
          storeName: memoryData.settings?.storeName || 'NOVARA Haute Couture & Luxury Goods',
          tagline: memoryData.settings?.tagline || 'Discover Your Style. Define Your World.',
          contactEmail: memoryData.settings?.contactEmail || 'concierge@novara.luxury',
          supportPhone: memoryData.settings?.supportPhone || '+91 (0) 11 4982 7000',
          currency: memoryData.settings?.currency || 'USD',
          currencySymbol: memoryData.settings?.currencySymbol || '$',
          freeShippingThreshold: memoryData.settings?.freeShippingThreshold ?? 150,
          standardShippingFee: memoryData.settings?.standardShippingFee ?? 25,
          taxPercentage: memoryData.settings?.taxPercentage ?? 0,
          announcementText: memoryData.settings?.announcementText || 'COMPLIMENTARY WORLDWIDE COURIER DELIVERY ON ORDERS ABOVE $150 • CODE: WELCOME10 FOR 10% PRIVILEGE',
          enableReviews: memoryData.settings?.enableReviews ?? true,
          maintenanceMode: memoryData.settings?.maintenanceMode ?? false
        });
      }

      // Sync with memoryData
      memoryData.settings = settings.toObject();

      return res.json({
        success: true,
        settings
      });
    }

    // In-memory fallback
    return res.json({
      success: true,
      settings: memoryData.settings
    });
  } catch (error) {
    next(error);
  }
};

// Explicit whitelist of permitted StoreSettings fields
const ALLOWED_SETTINGS = [
  'storeName',
  'tagline',
  'contactEmail',
  'supportPhone',
  'currency',
  'currencySymbol',
  'freeShippingThreshold',
  'standardShippingFee',
  'taxPercentage',
  'announcementText',
  'enableReviews',
  'maintenanceMode'
];

// @desc    Update store settings (Admin)
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const sanitizedUpdates = {};

    // Validate and whitelist properties strictly
    for (const field of ALLOWED_SETTINGS) {
      if (req.body && req.body[field] !== undefined) {
        const val = req.body[field];
        if (['freeShippingThreshold', 'standardShippingFee', 'taxPercentage'].includes(field)) {
          const num = Number(val);
          if (!isNaN(num) && num >= 0) {
            sanitizedUpdates[field] = num;
          }
        } else if (['enableReviews', 'maintenanceMode'].includes(field)) {
          sanitizedUpdates[field] = Boolean(val);
        } else if (typeof val === 'string') {
          sanitizedUpdates[field] = val.trim();
        }
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid configurable settings provided. Permitted fields: ' + ALLOWED_SETTINGS.join(', ')
      });
    }

    if (mongoose.connection.readyState === 1) {
      const settings = await StoreSettings.findOneAndUpdate(
        {},
        { $set: sanitizedUpdates },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      memoryData.settings = settings.toObject();

      return res.json({
        success: true,
        message: 'Store settings updated successfully',
        settings
      });
    }

    // In-memory fallback
    memoryData.settings = {
      ...memoryData.settings,
      ...sanitizedUpdates
    };

    return res.json({
      success: true,
      message: 'Store settings updated successfully',
      settings: memoryData.settings
    });
  } catch (error) {
    next(error);
  }
};
