import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Get all categories with active product count
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const counts = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      const countMap = {};
      counts.forEach((c) => {
        countMap[c._id] = c.count;
      });

      const categories = memoryData.categories.map((cat) => ({
        ...cat,
        productCount: countMap[cat.name] || 0
      }));

      return res.json({ success: true, count: categories.length, categories });
    }

    const categories = memoryData.categories.map((cat) => {
      const productCount = memoryData.products.filter(
        (p) => p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return {
        ...cat,
        productCount
      };
    });

    return res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter category name' });
    }

    const trimmed = name.trim();
    const existing = memoryData.categories.find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const newCat = {
      name: trimmed,
      slug: trimmed.toLowerCase().replace(/\s+/g, '-'),
      description: description || 'Artisan luxury collection.',
      image: image || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
      productCount: 0
    };

    memoryData.categories.push(newCat);

    return res.status(201).json({
      success: true,
      message: `Category "${trimmed}" created successfully`,
      category: newCat
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:name
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const { name } = req.params;
    const idx = memoryData.categories.findIndex(
      (c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === name.toLowerCase()
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const removed = memoryData.categories.splice(idx, 1)[0];
    return res.json({
      success: true,
      message: `Category "${removed.name}" deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

