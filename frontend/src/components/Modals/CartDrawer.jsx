import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { couponsAPI } from '../../services/api';
import './CartDrawer.css';

export const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartCount,
    freeShippingThreshold,
    shippingProgress,
    showToast
  } = useStore();

  const [promoInput, setPromoInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) {
      showToast('Please enter a coupon code', 'info');
      return;
    }

    try {
      const res = await couponsAPI.validateCoupon(promoInput.trim(), cartSubtotal);
      if (res.success) {
        setDiscountAmount(res.coupon.discountAmount);
        setAppliedCode(res.coupon.code);
        showToast(`Coupon "${res.coupon.code}" applied! Saved $${res.coupon.discountAmount}`);
      }
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  return (
    <div className="cart-drawer-root">
      {/* Backdrop */}
      <div className="drawer-backdrop" onClick={() => setIsCartOpen(false)} />

      {/* Drawer Panel */}
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping Bag">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <ShoppingBag size={20} className="drawer-bag-icon" />
            <h3 className="drawer-title">Shopping Bag</h3>
            <span className="drawer-count">({cartCount} items)</span>
          </div>
          <button
            className="drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="shipping-progress-box">
          <div className="shipping-text-row">
            {remainingForFreeShipping > 0 ? (
              <span>
                Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more for{' '}
                <span className="gradient-text">Free Global Express Shipping</span>
              </span>
            ) : (
              <span className="shipping-unlocked">
                🎉 Congratulations! You have unlocked <strong>Free Global Express Shipping</strong>
              </span>
            )}
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="drawer-items-list">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-icon-wrap">
                <ShoppingBag size={36} />
              </div>
              <h4>Your bag is currently empty</h4>
              <p>Explore our seasonal runway collection and find your next statement piece.</p>
              <button
                className="btn-primary empty-shop-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  const el = document.querySelector('#trending');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Discover Collection</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const id = item.product._id || item.product.id;
              return (
                <div
                  key={`${id}-${item.selectedSize}`}
                  className="cart-item-card"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="cart-item-thumb"
                  />

                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <h4 className="cart-item-name">{item.product.name}</h4>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(id, item.selectedSize)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="cart-item-variants">
                      <span className="variant-pill">Size: {item.selectedSize}</span>
                      {item.selectedColor && (
                        <span className="variant-pill">
                          Color: {item.selectedColor.name}
                        </span>
                      )}
                    </div>

                    <div className="cart-item-bottom">
                      <div className="quantity-controls">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateQuantity(
                              id,
                              item.selectedSize,
                              item.quantity - 1
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-number">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateQuantity(
                              id,
                              item.selectedSize,
                              item.quantity + 1
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="cart-item-price">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Promo Code Form */}
            <form className="cart-promo-form" onSubmit={handleApplyPromo}>
              <input
                type="text"
                placeholder="Coupon (e.g. WELCOME10, SAVE20)"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="cart-promo-input"
              />
              <button type="submit" className="cart-promo-btn">
                Apply
              </button>
            </form>

            <div className="cart-summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="summary-row discount-row">
                  <span>Voucher Deduction ({appliedCode})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Estimated Shipping</span>
                <span>{remainingForFreeShipping === 0 ? 'Complimentary (Free)' : '$25.00'}</span>
              </div>

              <div className="summary-row total-row">
                <span>Total Due</span>
                <span className="total-amount">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn-primary checkout-btn"
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="cart-guarantee-note">
              <ShieldCheck size={14} color="#10b981" />
              <span>Encrypted 256-Bit SSL Checkout • Free 30-Day Returns</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
