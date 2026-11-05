import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Get all reviews (Optionally filtered by productId or status)
// @route   GET /api/reviews
// @access  Public (Pending reviews restricted to Admins)
export const getReviews = async (req, res, next) => {
  try {
    const { productId, status } = req.query;
    const isAdmin = Boolean(req.user && req.user.role === 'admin');

    if (mongoose.connection.readyState === 1) {
      // Ensure initial authentic patron reviews are populated in MongoDB if not already present
      if (Array.isArray(memoryData.reviews) && memoryData.reviews.length > 0) {
        for (const r of memoryData.reviews) {
          const exists = await Review.findOne({
            $or: [
              { userEmail: r.userEmail },
              { comment: r.comment }
            ]
          });

          if (!exists) {
            let matchedProd = null;
            if (mongoose.Types.ObjectId.isValid(r.productId)) {
              matchedProd = await Product.findById(r.productId);
            }
            if (!matchedProd && r.productName) {
              matchedProd = await Product.findOne({ name: r.productName });
            }

            await Review.create({
              product: matchedProd ? matchedProd._id : undefined,
              productId: matchedProd ? String(matchedProd._id) : String(r.productId),
              productName: r.productName || matchedProd?.name || 'Atelier Silhouette',
              userName: r.userName,
              userEmail: r.userEmail,
              rating: r.rating,
              comment: r.comment,
              status: r.status || 'Approved',
              createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
            });
          }
        }
      }

      const filter = {};

      if (productId) {
        filter.$or = [
          { productId: String(productId) },
          ...(mongoose.Types.ObjectId.isValid(productId) ? [{ product: productId }] : [])
        ];
      }

      // Review Moderation Access Control:
      // - Non-admin visitors & customers can ONLY view Approved reviews
      // - Authenticated Admins can view all reviews or filter by any status (Pending, Rejected, etc.)
      if (isAdmin) {
        if (status && status !== 'All') {
          filter.status = status;
        }
      } else {
        filter.status = 'Approved';
      }

      const reviews = await Review.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: reviews.length, reviews });
    }

    // In-memory fallback
    let list = [...memoryData.reviews];
    if (productId) {
      list = list.filter((r) => String(r.productId) === String(productId));
    }
    if (isAdmin) {
      if (status && status !== 'All') {
        list = list.filter((r) => r.status === status);
      }
    } else {
      list = list.filter((r) => r.status === 'Approved');
    }

    return res.json({ success: true, count: list.length, reviews: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product review (with duplicate prevention)
// @route   POST /api/reviews
// @access  Public / Patron (Optional JWT)
export const createReview = async (req, res, next) => {
  try {
    const { productId, productName, userName, userEmail, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product ID, rating (1-5), and review text.'
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a whole number between 1 and 5'
      });
    }

    const userId = req.user ? req.user._id : null;
    const authorEmail = (req.user ? req.user.email : userEmail || '').toLowerCase().trim();
    const authorName = (req.user ? req.user.name : userName || 'Patron').trim();

    if (mongoose.connection.readyState === 1) {
      // 1. Check for duplicate review by same customer for this product
      const duplicateConditions = [];
      if (userId) {
        duplicateConditions.push({ user: userId });
      }
      if (authorEmail) {
        duplicateConditions.push({ userEmail: authorEmail });
      }

      if (duplicateConditions.length > 0) {
        const existingReview = await Review.findOne({
          $and: [
            {
              $or: [
                { productId: String(productId) },
                ...(mongoose.Types.ObjectId.isValid(productId) ? [{ product: productId }] : [])
              ]
            },
            { $or: duplicateConditions }
          ]
        });

        if (existingReview) {
          return res.status(400).json({
            success: false,
            message: 'You have already submitted a review for this silhouette.'
          });
        }
      }

      // 2. Create review with default 'Pending' status awaiting moderation
      const review = await Review.create({
        product: mongoose.Types.ObjectId.isValid(productId) ? productId : undefined,
        productId: String(productId),
        productName: productName || 'Atelier Silhouette',
        user: userId || undefined,
        userName: authorName,
        userEmail: authorEmail,
        rating: ratingNum,
        comment: comment.trim(),
        status: 'Pending'
      });

      // Note: Newly submitted reviews remain Pending until approved by House Administrator.
      // They do not affect the public product rating or review count until moderated.

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully. It will appear publicly once approved by our atelier team.',
        review
      });
    }

    // In-memory fallback
    const duplicate = memoryData.reviews.find(
      (r) =>
        String(r.productId) === String(productId) &&
        ((userId && String(r.user) === String(userId)) ||
          (authorEmail && r.userEmail?.toLowerCase() === authorEmail))
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this silhouette.'
      });
    }

    const newRev = {
      _id: `rev-${Date.now()}`,
      productId: String(productId),
      productName: productName || 'Atelier Silhouette',
      user: userId,
      userName: authorName,
      userEmail: authorEmail,
      rating: ratingNum,
      comment: comment.trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    memoryData.reviews.unshift(newRev);

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully. It will appear publicly once approved by our atelier team.',
      review: newRev
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review status (Admin moderation)
// @route   PATCH /api/reviews/:id/status
// @access  Private/Admin
export const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Pending', 'Flagged', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be Approved, Pending, Flagged, or Rejected.'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      review.status = status;
      await review.save();

      // Recalculate product rating & reviewsCount for Approved reviews
      const prodId = review.product || review.productId;
      if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
        const approvedReviews = await Review.find({
          $or: [{ productId: String(prodId) }, { product: prodId }],
          status: 'Approved'
        });
        const count = approvedReviews.length;
        const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
        await Product.findByIdAndUpdate(prodId, {
          rating: Math.round(avg * 10) / 10,
          reviewsCount: count
        });
      }

      return res.json({ success: true, message: `Review status updated to "${status}"`, review });
    }

    const review = memoryData.reviews.find((r) => r._id === id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    review.status = status;
    return res.json({ success: true, message: `Review status updated to "${status}"`, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }
      const prodId = review.product || review.productId;
      await Review.findByIdAndDelete(id);

      // Recalculate product rating & count for Approved reviews
      if (prodId && mongoose.Types.ObjectId.isValid(prodId)) {
        const approvedReviews = await Review.find({
          $or: [{ productId: String(prodId) }, { product: prodId }],
          status: 'Approved'
        });
        const count = approvedReviews.length;
        const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 5.0;
        await Product.findByIdAndUpdate(prodId, {
          rating: Math.round(avg * 10) / 10,
          reviewsCount: count
        });
      }

      return res.json({ success: true, message: 'Review deleted successfully' });
    }

    const idx = memoryData.reviews.findIndex((r) => r._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    memoryData.reviews.splice(idx, 1);
    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
