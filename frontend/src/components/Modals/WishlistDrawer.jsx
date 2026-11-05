import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './WishlistDrawer.css';

export const WishlistDrawer = () => {
  const {
    wishlistItems,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart
  } = useStore();

  if (!isWishlistOpen) return null;

  return (
    <div className="wishlist-drawer-root">
      <div className="drawer-backdrop" onClick={() => setIsWishlistOpen(false)} />

      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Wishlist">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Heart size={20} className="wishlist-icon-pink" fill="#ec4899" color="#ec4899" />
            <h3 className="drawer-title">Saved Wishlist</h3>
            <span className="drawer-count">({wishlistItems.length} items)</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsWishlistOpen(false)}
            aria-label="Close wishlist"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wishlist Items */}
        <div className="drawer-items-list">
          {wishlistItems.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-icon-wrap">
                <Heart size={36} color="#ec4899" />
              </div>
              <h4>Your wishlist is empty</h4>
              <p>Save pieces you love by tapping the heart icon on any product card.</p>
              <button
                className="btn-primary empty-shop-btn"
                onClick={() => {
                  setIsWishlistOpen(false);
                  const el = document.querySelector('#trending');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Explore Trending</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            wishlistItems.map((product) => (
              <div key={product._id || product.id} className="wishlist-item-card">
                <img
                  src={product.image}
                  alt={product.name}
                  className="wishlist-item-thumb"
                />

                <div className="wishlist-item-info">
                  <div className="wishlist-item-top">
                    <span className="wishlist-category">{product.category}</span>
                    <button
                      className="wishlist-item-remove"
                      onClick={() => toggleWishlist(product)}
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h4 className="wishlist-item-name">{product.name}</h4>

                  <div className="wishlist-price-row">
                    <span className="wishlist-price">${product.price}.00</span>
                    {product.originalPrice && (
                      <span className="wishlist-old-price">${product.originalPrice}.00</span>
                    )}
                  </div>

                  <button
                    className="btn-primary wishlist-move-btn"
                    onClick={() => {
                      addToCart(product);
                      toggleWishlist(product);
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Move to Shopping Bag</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

