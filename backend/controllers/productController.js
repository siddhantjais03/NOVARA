import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Get all products with advanced search, multi-filters & sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      gender,
      minPrice,
      maxPrice,
      size,
      inStock,
      badge,
      isTrending,
      isBestSeller,
      sort,
      page = 1,
      limit = 24
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 24;
    const skip = (pageNum - 1) * limitNum;

    // 1. If MongoDB is connected
    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (search && search.trim() !== '') {
        query.$or = [
          { name: { $regex: search.trim(), $options: 'i' } },
          { description: { $regex: search.trim(), $options: 'i' } },
          { category: { $regex: search.trim(), $options: 'i' } },
          { sku: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      if (category && category !== 'All') {
        const catLower = category.toLowerCase().trim();
        if (catLower === 'bags') {
          query.$and = (query.$and || []).concat([
            {
              $or: [
                { category: { $regex: /^bags$/i } },
                {
                  category: { $regex: /^accessories$/i },
                  name: { $regex: /shoulder bag|crossbody|duffle/i }
                }
              ]
            }
          ]);
        } else if (catLower === 'watches') {
          query.$and = (query.$and || []).concat([
            {
              $or: [
                { category: { $regex: /^watches$/i } },
                {
                  category: { $regex: /^jewelry$/i },
                  name: { $regex: /watch/i }
                }
              ]
            }
          ]);
        } else if (catLower === 'accessories') {
          query.$and = (query.$and || []).concat([
            {
              $or: [
                {
                  category: { $regex: /^accessories$/i },
                  name: { $not: /shoulder bag|crossbody|duffle/i }
                },
                {
                  category: { $regex: /^jewelry$/i },
                  name: { $not: /watch/i }
                }
              ]
            }
          ]);
        } else if (catLower === 'clothing') {
          query.$and = (query.$and || []).concat([
            {
              category: { $in: [/^clothing$/i, /^womenswear$/i, /^menswear$/i] }
            }
          ]);
        } else if (category.includes(',')) {
          query.category = { $in: category.split(',').map((c) => c.trim()) };
        } else {
          query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
        }
      }

      if (gender && gender !== 'All') {
        query.gender = { $in: [gender, 'Unisex'] };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      if (size && size !== 'All') {
        query.sizes = size;
      }

      if (inStock === 'true' || inStock === true) {
        query.stock = { $gt: 0 };
      }

      if (badge) query.badge = badge;
      if (isTrending === 'true') query.isTrending = true;
      if (isBestSeller === 'true') query.isBestSeller = true;

      let sortOptions = { createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { price: 1 };
      else if (sort === 'price-desc') sortOptions = { price: -1 };
      else if (sort === 'rating') sortOptions = { rating: -1, reviewsCount: -1 };
      else if (sort === 'popular') sortOptions = { reviewsCount: -1 };
      else if (sort === 'discount') sortOptions = { discount: -1 };

      const totalCount = await Product.countDocuments(query);
      const overallTotal = await Product.countDocuments();
      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: products.length,
        totalCount,
        overallTotal,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        products
      });
    }

    // 2. In-memory Filter & Search Fallback
    let items = [...memoryData.products];

    // Search filter
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.sku && p.sku.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      const catList = category.split(',').map((c) => c.trim().toLowerCase());
      items = items.filter((p) => catList.includes(p.category.toLowerCase()));
    }

    // Gender filter
    if (gender && gender !== 'All') {
      items = items.filter(
        (p) => p.gender.toLowerCase() === gender.toLowerCase() || p.gender === 'Unisex'
      );
    }

    // Price range
    if (minPrice) items = items.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) items = items.filter((p) => p.price <= Number(maxPrice));

    // Size filter
    if (size && size !== 'All') {
      items = items.filter((p) => p.sizes && p.sizes.includes(size));
    }

    // Stock
    if (inStock === 'true' || inStock === true) {
      items = items.filter((p) => p.stock > 0);
    }

    // Badges / Flags
    if (badge) items = items.filter((p) => p.badge === badge);
    if (isTrending === 'true') items = items.filter((p) => p.isTrending);
    if (isBestSeller === 'true') items = items.filter((p) => p.isBestSeller);

    // Sorting
    if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);
    else if (sort === 'popular') items.sort((a, b) => b.reviewsCount - a.reviewsCount);
    else if (sort === 'discount') items.sort((a, b) => b.discount - a.discount);
    else items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalCount = items.length;
    const overallTotal = memoryData.products.length;
    const paginated = items.slice(skip, skip + limitNum);

    return res.json({
      success: true,
      count: paginated.length,
      totalCount,
      overallTotal,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      products: paginated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found with specified ID'
        });
      }
      return res.json({ success: true, product });
    }

    const product = memoryData.products.find((p) => p._id === req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found with specified ID'
      });
    }

    return res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      gender,
      price,
      originalPrice,
      discount,
      stock,
      description,
      image,
      hoverImage,
      colors,
      sizes,
      badge,
      isTrending,
      isBestSeller,
      sku
    } = req.body;

    if (!name || !category || price === undefined || !image || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, price, image, description'
      });
    }

    const priceNum = Number(price);
    const origPriceNum = originalPrice ? Number(originalPrice) : priceNum;
    const calculatedDiscount =
      discount !== undefined && discount !== null
        ? Number(discount)
        : origPriceNum > priceNum
        ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
        : 0;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.create({
        name,
        category,
        gender: gender || 'Unisex',
        price: priceNum,
        originalPrice: origPriceNum,
        discount: calculatedDiscount,
        stock: stock !== undefined ? Number(stock) : 10,
        description,
        image,
        hoverImage: hoverImage || image,
        colors: colors || [{ name: 'Default', hex: '#0f172a' }],
        sizes: sizes || ['S', 'M', 'L', 'XL'],
        badge: badge || '',
        sku: sku || undefined,
        isTrending: isTrending === true || isTrending === 'true',
        isBestSeller: isBestSeller === true || isBestSeller === 'true'
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product
      });
    }

    const newProduct = {
      _id: `prod-${Date.now()}`,
      name,
      category,
      gender: gender || 'Unisex',
      price: priceNum,
      originalPrice: origPriceNum,
      discount: calculatedDiscount,
      rating: 5.0,
      reviewsCount: 1,
      stock: stock !== undefined ? Number(stock) : 10,
      description,
      image,
      hoverImage: hoverImage || image,
      colors: colors || [{ name: 'Default', hex: '#0f172a' }],
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      badge: badge || 'New Season',
      sku: sku || undefined,
      isTrending: isTrending === true || isTrending === 'true',
      isBestSeller: isBestSeller === true || isBestSeller === 'true',
      createdAt: new Date().toISOString()
    };

    memoryData.products.unshift(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      return res.json({ success: true, message: 'Product updated successfully', product });
    }

    const index = memoryData.products.findIndex((p) => p._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    memoryData.products[index] = { ...memoryData.products[index], ...req.body };

    return res.json({
      success: true,
      message: 'Product updated successfully',
      product: memoryData.products[index]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      await product.deleteOne();
      return res.json({ success: true, message: 'Product deleted from catalog successfully' });
    }

    const index = memoryData.products.findIndex((p) => p._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    memoryData.products.splice(index, 1);

    return res.json({
      success: true,
      message: 'Product deleted from catalog successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock quantity directly
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin
export const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    if (stock === undefined || isNaN(stock) || Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid non-negative stock count'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock: Number(stock) },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      return res.json({
        success: true,
        message: `Stock updated to ${product.stock}`,
        stock: product.stock,
        product
      });
    }

    const product = memoryData.products.find((p) => p._id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.stock = Number(stock);

    return res.json({
      success: true,
      message: `Stock updated to ${product.stock}`,
      stock: product.stock,
      product
    });
  } catch (error) {
    next(error);
  }
};
