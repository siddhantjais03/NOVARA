import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      enum: [
        'Accessories',
        'Footwear',
        'Outerwear',
        'Clothing',
        'Bags',
        'Watches',
        'Womenswear',
        'Menswear',
        'Jewelry'
      ],
      trim: true
    },
    gender: {
      type: String,
      enum: ['Women', 'Men', 'Unisex'],
      default: 'Unisex'
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      min: [0, 'Price must be positive']
    },
    originalPrice: {
      type: Number,
      default: function () {
        return this.price;
      }
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    badge: {
      type: String,
      enum: ['Trending', 'Best Seller', 'New Season', 'Exclusive', 'Sale', 'Limited Edition', ''],
      default: ''
    },
    image: {
      type: String,
      required: [true, 'Please provide primary product image URL']
    },
    hoverImage: {
      type: String,
      default: ''
    },
    colors: {
      type: [colorSchema],
      default: []
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L']
    },
    stock: {
      type: Number,
      required: [true, 'Please enter stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 15
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
      trim: true
    },
    isTrending: {
      type: Boolean,
      default: false
    },
    isBestSeller: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Calculate discount automatically if originalPrice is higher than price
productSchema.pre('save', function (next) {
  if (this.originalPrice && this.originalPrice > this.price && (!this.discount || this.discount === 0)) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Text index for fast full-text searching
productSchema.index({ name: 'text', description: 'text', category: 'text' });

export const Product = mongoose.model('Product', productSchema);

