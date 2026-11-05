import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  CreditCard,
  QrCode,
  Truck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ordersAPI, couponsAPI } from '../../services/api';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import './CheckoutPage.css';

export const CheckoutPage = () => {
  const { cartItems, cartSubtotal, clearCart, showToast, user, setLatestOrder } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiVpa, setUpiVpa] = useState('patron@novarabank');
  const [cardData, setCardData] = useState({
    number: '4242 •••• •••• 4242',
    name: user?.name || 'Elena Rostova',
    expiry: '12/28',
    cvc: '789'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const freeShippingThreshold = 150;
  const shippingCost = cartSubtotal >= freeShippingThreshold ? 0 : 25;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal + shippingCost - discountAmount);

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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.street ||
      !formData.city ||
      !formData.postalCode
    ) {
      showToast('Please complete all contact and address fields.', 'info');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your shopping bag is empty.', 'info');
      navigate('/shop');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod,
        paymentResult: {
          id: paymentMethod === 'COD' ? 'COD-PAY-ON-DELIVERY' : `DEMO-${paymentMethod}-${Date.now()}`,
          status: paymentMethod === 'COD' ? 'PENDING_DELIVERY' : 'COMPLETED',
          paymentDetail:
            paymentMethod === 'UPI'
              ? `UPI ID: ${upiVpa}`
              : paymentMethod === 'CARD'
              ? `Demo Card ending in ${cardData.number.slice(-4)}`
              : 'Cash on Delivery'
        },
        orderItems: cartItems.map((item) => ({
          product: item.product._id || item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'M',
          selectedColor: item.selectedColor || { name: 'Default', hex: '#000000' }
        })),
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await ordersAPI.createOrder(orderPayload);
      if (res.success && res.order) {
        setLatestOrder(res.order);
        clearCart();
        showToast('Order confirmed successfully!');
        navigate(`/order-confirmation/${res.order._id}`);
      }
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page-root">
        <AnnouncementBar />
        <Navbar />
        <main className="container checkout-page-container">
          <div className="cart-empty-view">
            <h3>Your Shopping Bag is Empty</h3>
            <p>Please select at least one item before proceeding to checkout.</p>
            <Link to="/shop" className="btn-primary">
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="container checkout-page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/cart">Cart</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Checkout</span>
        </nav>

        <div className="checkout-page-header">
          <h1 className="checkout-page-title">Novara Atelier Checkout</h1>
          <p className="checkout-page-sub">
            Complete your bespoke patron reservation with verified atelier security.
          </p>
        </div>

        <form onSubmit={handleSubmitOrder} className="checkout-grid-layout">
          {/* Steps column */}
          <div className="checkout-steps-col">
            {/* 1. Patron Info */}
            <div className="checkout-card-section">
              <div className="section-head-badge">
                <span className="section-number">1</span>
                <h2>Patron Contact Details</h2>
              </div>

              <div className="form-grid-2">
                <div className="input-block">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Elena Rostova"
                    required
                  />
                </div>
                <div className="input-block">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="elena@novara.luxury"
                    required
                  />
                </div>
              </div>

              <div className="input-block">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {/* 2. Destination */}
            <div className="checkout-card-section">
              <div className="section-head-badge">
                <span className="section-number">2</span>
                <h2>Shipping Destination</h2>
              </div>

              <div className="input-block">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Apartment, building, street address"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="input-block">
                  <label>City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai / Milan / London"
                    required
                  />
                </div>
                <div className="input-block">
                  <label>State / Province *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-block">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="400001"
                    required
                  />
                </div>
                <div className="input-block">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="checkout-card-section">
              <div className="section-head-badge">
                <span className="section-number">3</span>
                <h2>Payment Method (Demo Mode)</h2>
              </div>

              <div className="payment-selector-grid">
                <label className={`payment-method-card ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <QrCode size={22} color="#7c3aed" />
                  <div className="pay-card-details">
                    <strong>Instant UPI</strong>
                    <span>Demo sandbox: GPay, PhonePe, Paytm</span>
                  </div>
                </label>

                <label className={`payment-method-card ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <CreditCard size={22} color="#2563eb" />
                  <div className="pay-card-details">
                    <strong>Credit / Debit Card</strong>
                    <span>Demo card simulation: Visa, Mastercard</span>
                  </div>
                </label>

                <label className={`payment-method-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="pay"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <Truck size={22} color="#10b981" />
                  <div className="pay-card-details">
                    <strong>Cash on Delivery (COD)</strong>
                    <span>Dispatched from atelier; settle upon inspection</span>
                  </div>
                </label>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="payment-sandbox-fields">
                  <div className="input-block">
                    <label>Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="patron@upi"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="payment-sandbox-fields">
                  <div className="input-block">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    />
                  </div>
                  <div className="form-grid-2">
                    <div className="input-block">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                    </div>
                    <div className="input-block">
                      <label>CVC</label>
                      <input
                        type="password"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary right column */}
          <div className="checkout-summary-card">
            <h3 className="summary-heading">Order Review</h3>

            <div className="checkout-items-preview-list">
              {cartItems.map((item, idx) => (
                <div key={idx} className="check-item-line">
                  <img src={item.product.image} alt={item.product.name} className="check-item-img" />
                  <div className="check-item-info">
                    <span className="check-item-name">{item.product.name}</span>
                    <span className="check-item-meta">
                      Size: {item.selectedSize} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="check-item-price">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon box */}
            <div className="cart-coupon-form">
              <input
                type="text"
                placeholder="WELCOME10 / SAVE20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="cart-coupon-input"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="cart-coupon-btn"
                disabled={loadingCoupon}
              >
                {loadingCoupon ? '...' : 'Apply'}
              </button>
            </div>

            {appliedCoupon && (
              <div className="cart-applied-pill">
                <span>
                  ✓ {appliedCoupon.code} applied (-${appliedCoupon.discountAmount})
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
                <span>Express Delivery</span>
                <span>{shippingCost === 0 ? 'Complimentary' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="tot-line total-line">
                <span>Total Due</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" className="order-place-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Place Atelier Order • ${finalTotal.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

