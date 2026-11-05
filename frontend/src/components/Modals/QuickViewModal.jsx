import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './QuickViewModal.css';

export const QuickViewModal = () => {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isLiked = isInWishlist(product._id || product.id);
  const gallery = [product.image, product.hoverImage || product.image];

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      selectedSize,
      selectedColor: product.colors?.[selectedColorIdx]
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      closeQuickView();
    }, 900);
  };

  return (
    <div className="quickview-root">
      <div className="quickview-backdrop" onClick={closeQuickView} />

      <div className="quickview-dialog" role="dialog" aria-modal="true" aria-label={product.name}>
        {/* Close Button */}
        <button className="quickview-close-btn" onClick={closeQuickView} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="quickview-body">
          {/* Left Media Stage */}
          <div className="quickview-media">
            <div className="quickview-main-image-wrap">
              <img
                src={gallery[activeImageIdx]}
                alt={product.name}
                className="quickview-main-image"
              />
              {product.discount > 0 && (
                <span className="badge-pill badge-pill-sale quickview-badge">
                  -{product.discount}% OFF
                </span>
              )}
            </div>

            <div className="quickview-thumbs">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  className={`quickview-thumb-btn ${activeImageIdx === i ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(i)}
                >
                  <img src={img} alt={`Preview ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Product Configurator */}
          <div className="quickview-info">
            <div className="quickview-category-row">
              <span className="qv-category">{product.category}</span>
              {product.badge && <span className="qv-tag">{product.badge}</span>}
            </div>

            <h2 className="qv-title">{product.name}</h2>

            {/* Ratings */}
            <div className="qv-rating-row">
              <div className="qv-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span className="qv-rating-score">{product.rating.toFixed(1)}</span>
              <span className="qv-review-count">({product.reviewsCount} customer reviews)</span>
            </div>

            {/* Price */}
            <div className="qv-price-row">
              <span className="qv-current-price">${product.price}.00</span>
              {product.originalPrice && (
                <span className="qv-old-price">${product.originalPrice}.00</span>
              )}
              {product.discount > 0 && (
                <span className="qv-discount-pill">Save {product.discount}%</span>
              )}
            </div>

            <p className="qv-description">{product.description}</p>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="qv-option-group">
                <label className="qv-option-label">
                  Selected Hue:{' '}
                  <strong>{product.colors[selectedColorIdx]?.name}</strong>
                </label>
                <div className="qv-swatches">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`qv-color-dot ${selectedColorIdx === idx ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColorIdx(idx)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="qv-option-group">
                <div className="qv-size-header">
                  <label className="qv-option-label">Select Size</label>
                  <span className="qv-size-guide-link">Size Guide</span>
                </div>
                <div className="qv-sizes-list">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`qv-size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="qv-actions-row">
              <div className="qv-qty-picker">
                <button
                  className="qv-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="qv-qty-val">{quantity}</span>
                <button
                  className="qv-qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                className={`btn-primary qv-add-btn ${addedSuccess ? 'added-done' : ''}`}
                onClick={handleAddToCart}
              >
                {addedSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Bag • ${(product.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                className={`qv-wish-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist toggle"
              >
                <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : 'currentColor'} />
              </button>
            </div>

            {/* Luxury Guarantee Badges */}
            <div className="qv-perks-row">
              <div className="qv-perk">
                <Truck size={14} color="#7c3aed" />
                <span>Complimentary Express Shipping</span>
              </div>
              <div className="qv-perk">
                <ShieldCheck size={14} color="#10b981" />
                <span>Certified Authentic Italian Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

