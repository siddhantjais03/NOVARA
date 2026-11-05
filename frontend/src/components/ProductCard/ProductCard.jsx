import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    openQuickView
  } = useStore();

  const [isHovered, setIsHovered] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const prodId = product._id || product.id;
  const isLiked = isInWishlist(prodId);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1, {
      selectedColor: product.colors?.[selectedColorIndex],
      selectedSize: product.sizes?.[0]
    });
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  const handleToggleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => openQuickView(product)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openQuickView(product);
      }}
    >
      {/* Product Image Stage */}
      <div className="product-media-wrapper">
        <img
          src={isHovered && product.hoverImage ? product.hoverImage : product.image}
          alt={product.name}
          className="product-main-image"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="product-badges-row">
          {product.discount > 0 && (
            <span className="badge-pill badge-pill-sale">
              -{product.discount}%
            </span>
          )}
          {product.badge && (
            <span className="badge-pill badge-pill-gradient badge-status">
              {product.badge}
            </span>
          )}
        </div>

        {/* Action Overlay: Wishlist Heart & Quick View */}
        <div className="product-actions-overlay">
          <button
            className={`action-circle-btn wishlist-action ${isLiked ? 'liked' : ''}`}
            onClick={handleToggleWishlist}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart
              size={18}
              fill={isLiked ? '#ef4444' : 'none'}
              color={isLiked ? '#ef4444' : 'currentColor'}
            />
          </button>

          <button
            className="action-circle-btn quickview-action"
            onClick={handleQuickView}
            aria-label="Quick preview"
            title="Quick view"
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Slide-Up Add To Cart Button (Desktop overlay + Mobile fixed) */}
        <div className="product-quick-add-wrap">
          <button
            className={`btn-primary product-add-cart-btn ${isAddedRecently ? 'added-success' : ''}`}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            {isAddedRecently ? (
              <>
                <Check size={16} />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Details Content */}
      <div className="product-details">
        {/* Category & Color Swatches */}
        <div className="product-meta-row">
          <span className="product-category-name">{product.category}</span>

          {product.colors && product.colors.length > 0 && (
            <div className="product-swatches">
              {product.colors.map((color, idx) => (
                <button
                  key={idx}
                  className={`color-swatch-dot ${selectedColorIndex === idx ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColorIndex(idx);
                  }}
                  title={color.name}
                  aria-label={`Select color ${color.name}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3 className="product-name" title={product.name}>
          <Link
            to={`/product/${prodId}`}
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {product.name}
          </Link>
        </h3>

        {/* Rating Row */}
        <div className="product-rating-row">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'}
                color="#f59e0b"
              />
            ))}
          </div>
          <span className="rating-value">{product.rating.toFixed(1)}</span>
          <span className="rating-count">({product.reviewsCount})</span>
        </div>

        {/* Price Row: Current, Previous, Discount Pill */}
        <div className="product-price-row">
          <div className="price-group">
            <span className="current-price">${product.price}.00</span>
            {product.originalPrice && (
              <span className="previous-price">${product.originalPrice}.00</span>
            )}
          </div>
          {product.discount > 0 && (
            <span className="discount-tag">Save {product.discount}%</span>
          )}
        </div>

        {/* Mobile Dedicated Add To Cart Button */}
        <button
          className={`mobile-add-cart-btn ${isAddedRecently ? 'added-success' : ''}`}
          onClick={handleAddToCart}
        >
          {isAddedRecently ? (
            <>
              <Check size={14} /> Added
            </>
          ) : (
            <>
              <ShoppingBag size={14} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

