import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false
    },
    productId: {
      type: String,
      required: true
    },
    productName: {
      type: String,
      default: 'Atelier Silhouette'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    userName: {
      type: String,
      required: [true, 'Please enter patron name'],
      trim: true
    },
    userEmail: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      required: [true, 'Please select rating from 1 to 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please enter review comment'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Flagged', 'Rejected'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

export const Review = mongoose.model('Review', reviewSchema);

