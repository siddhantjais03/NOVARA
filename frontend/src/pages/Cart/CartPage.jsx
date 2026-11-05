import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { couponsAPI } from '../../services/api';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import './CartPage.css';

export const CartPage = () => {
  const {
    cartItems,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
    freeShippingThreshold,
    shippingProgress,
    showToast
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code.', 'info');
      return;
    }

    setLoadingCoupon(true);
    try {
      const res = await couponsAPI.validateCoupon(couponCode, cartSubtotal);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        showToast(`Coupon "${res.coupon.code}" applied! Saved $${res.coupon.discountAmount}`);
      }
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const shippingCost = cartSubtotal >= freeShippingThreshold ? 0 : 25;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal + shippingCost - discountAmount);

  return (
    <div className="cart-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="container cart-page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Shopping Bag</span>
        </nav>

        <div className="cart-page-header">
          <h1 className="cart-page-title">Patron Shopping Bag</h1>
          <p className="cart-page-sub">
            Review your chosen atelier garments before proceeding to bespoke checkout.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-view">
            <div className="cart-empty-icon">
              <ShoppingBag size={42} />
            </div>
            <h3>Your Shopping Bag is Empty</h3>
            <p>
              Discover timeless silhouettes and sartorial masterpieces from our current atelier
              collection.
            </p>
            <Link to="/shop" className="btn-primary">
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-layout-grid">
            {/* Left: Items list */}
            <div className="cart-items-card">
              {/* Free shipping progress */}
              <div className="cart-shipping-meter">
                <div className="meter-header">
                  <Truck size={18} color="#7c3aed" />
                  <span>
                    {cartSubtotal >= freeShippingThreshold
                      ? 'Complimentary Express Atelier Delivery Unlocked'
                      : `Add $${(freeShippingThreshold - cartSubtotal).toFixed(
                          2
                        )} more for Complimentary Express Shipping`}
                  </span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill" style={{ width: `${shippingProgress}%` }} />
                </div>
              </div>

              {/* Items */}
              <div className="cart-items-table">
                {cartItems.map((item, idx) => {
                  const id = item.product._id || item.product.id;
                  const stockLimit = item.product.stock !== undefined ? item.product.stock : 10;
                  return (
                    <div key={`${id}-${item.selectedSize}-${idx}`} className="cart-item-row">
                      <div className="cart-item-thumb">
                        <img src={item.product.image} alt={item.product.name} />
                      </div>

                      <div className="cart-item-meta">
                        <Link to={`/product/${id}`} className="cart-item-title">
                          {item.product.name}
                        </Link>
                        <span className="cart-item-specs">
                          Size: {item.selectedSize}
                          {item.selectedColor ? ` • ${item.selectedColor.name}` : ''}
                        </span>
                        <span className="cart-item-price">${item.product.price}.00</span>
                      </div>

                      <div className="cart-qty-stepper">
                        <button
                          onClick={() => updateQuantity(id, item.selectedSize, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="cart-qty-num">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(id, item.selectedSize, item.quantity + 1)}
                          disabled={item.quantity >= stockLimit}
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-total-col">
                        <span className="cart-line-total">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(id, item.selectedSize)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Summary */}
            <div className="cart-summary-card">
              <h3 className="summary-heading">Order Summary</h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="cart-coupon-form">
                <input
                  type="text"
                  placeholder="WELCOME10, SAVE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="cart-coupon-input"
                />
                <button type="submit" className="cart-coupon-btn" disabled={loadingCoupon}>
                  {loadingCoupon ? '...' : 'Apply'}
                </button>
              </form>

              {appliedCoupon && (
                <div className="cart-applied-pill">
                  <span>
                    ✓ Code <strong>{appliedCoupon.code}</strong> (-${appliedCoupon.discountAmount})
                  </span>
                  <button type="button" onClick={() => setAppliedCoupon(null)}>
                    ✕
                  </button>
                </div>
              )}

              <div className="cart-totals-group">
                <div className="tot-line">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="tot-line discount-green">
                    <span>Coupon Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="tot-line">
                  <span>Express Atelier Delivery</span>
                  <span>{shippingCost === 0 ? 'Complimentary' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="tot-line total-line">
                  <span>Estimated Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout" className="checkout-link-btn">
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

