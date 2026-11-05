import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ordersAPI, couponsAPI } from '../../services/api';
import './CheckoutModal.css';

export const CheckoutModal = () => {
  const {
    cartItems,
    cartSubtotal,
    isCheckoutOpen,
    setIsCheckoutOpen,
    clearCart,
    showToast,
    user,
    setLatestOrder,
    setIsOrderSuccessOpen
  } = useStore();

  // Form State
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

  // Payment Method: 'COD', 'UPI', 'CARD'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiVpa, setUpiVpa] = useState('patron@novarabank');
  const [cardData, setCardData] = useState({
    number: '4242 •••• •••• 4242',
    name: user?.name || 'Elena Rostova',
    expiry: '12/28',
    cvc: '789'
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  if (!isCheckoutOpen) return null;

  // Shipping logic: Free over $150
  const freeShippingThreshold = 150;
  const shippingCost = cartSubtotal >= freeShippingThreshold ? 0 : 25;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal + shippingCost - discountAmount);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a coupon code', 'info');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = await couponsAPI.validateCoupon(couponCode, cartSubtotal);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        showToast(`Coupon "${res.coupon.code}" applied! Saved $${res.coupon.discountAmount}`);
      }
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.city || !formData.postalCode) {
      showToast('Please complete all contact and shipping address fields.', 'info');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your shopping bag is empty.', 'info');
      return;
    }

    setIsPlacingOrder(true);

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

      if (res.success) {
        setLatestOrder(res.order);
        clearCart();
        setIsCheckoutOpen(false);
        setIsOrderSuccessOpen(true);
        showToast('Your order has been confirmed! An invoice is ready.');
      }
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="checkout-modal-root">
      <div className="checkout-backdrop" onClick={() => setIsCheckoutOpen(false)} />

      <div className="checkout-dialog" role="dialog" aria-modal="true" aria-label="Secure Checkout">
        {/* Header */}
        <div className="checkout-header">
          <div className="checkout-title-group">
            <Lock size={18} className="lock-icon" />
            <div>
              <h2 className="checkout-heading">Novara Atelier Checkout</h2>
              <span className="checkout-sub">256-Bit Encrypted Patron Protocol</span>
            </div>
          </div>
          <button
            className="checkout-close-btn"
            onClick={() => setIsCheckoutOpen(false)}
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-form-grid">
          {/* Left Column: Details & Payment */}
          <div className="checkout-left-col">
            {/* Step 1: Patron Information */}
            <div className="checkout-section-block">
              <div className="section-step-badge">
                <span>1</span>
                <h3>Patron Information</h3>
              </div>

              <div className="form-fields-row">
                <div className="form-group flex-1">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Elena Rostova"
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="elena@novara.luxury"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="checkout-section-block">
              <div className="section-step-badge">
                <span>2</span>
                <h3>Shipping Destination</h3>
              </div>

              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, street name"
                  required
                />
              </div>

              <div className="form-fields-row">
                <div className="form-group flex-1">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai / Delhi / Milan"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>State / Province *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra / NY"
                    required
                  />
                </div>
              </div>

              <div className="form-fields-row">
                <div className="form-group flex-1">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="India"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="checkout-section-block">
              <div className="section-step-badge">
                <span>3</span>
                <h3>Payment Method (Demo Sandbox)</h3>
              </div>

              <div className="payment-options-grid">
                {/* Demo UPI */}
                <label className={`payment-pill-card ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div className="pay-card-content">
                    <QrCode size={20} className="pay-icon" />
                    <div>
                      <strong>Instant UPI</strong>
                      <span>GPay, PhonePe, Paytm, BHIM</span>
                    </div>
                  </div>
                </label>

                {/* Demo Card */}
                <label className={`payment-pill-card ${paymentMethod === 'CARD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                  <div className="pay-card-content">
                    <CreditCard size={20} className="pay-icon" />
                    <div>
                      <strong>Credit / Debit Card</strong>
                      <span>Visa, Mastercard, Amex</span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`payment-pill-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className="pay-card-content">
                    <Truck size={20} className="pay-icon" />
                    <div>
                      <strong>Cash on Delivery</strong>
                      <span>Pay at doorstep</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Dynamic Payment Fields */}
              {paymentMethod === 'UPI' && (
                <div className="payment-subform">
                  <label>Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    placeholder="yourname@okbank"
                  />
                  <p className="pay-hint">Demo sandbox mode: instant verification simulated.</p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="payment-subform card-subform">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    />
                  </div>
                  <div className="form-fields-row">
                    <div className="form-group flex-1">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label>Security Code (CVC)</label>
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

          {/* Right Column: Order Summary & Placement */}
          <div className="checkout-right-col">
            <div className="summary-card">
              <h3 className="summary-title">Order Overview ({cartItems.length} items)</h3>

              <div className="summary-items-list">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="summary-item-row">
                    <img src={item.product.image} alt={item.product.name} className="summary-thumb" />
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.product.name}</span>
                      <span className="summary-item-spec">
                        Qty: {item.quantity} • Size: {item.selectedSize}
                      </span>
                    </div>
                    <span className="summary-item-price">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <div className="checkout-coupon-box">
                <input
                  type="text"
                  placeholder="Coupon: WELCOME10, SAVE20..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="coupon-input"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="coupon-apply-btn"
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </div>

              {appliedCoupon && (
                <div className="coupon-active-badge">
                  <span>✓ Code <strong>{appliedCoupon.code}</strong> applied (-${appliedCoupon.discountAmount})</span>
                  <button type="button" onClick={() => setAppliedCoupon(null)}>✕</button>
                </div>
              )}

              {/* Price Calculations */}
              <div className="summary-totals-list">
                <div className="tot-row">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="tot-row discount-tot">
                    <span>Voucher Deduction</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="tot-row">
                  <span>Global Express Shipping</span>
                  <span>{shippingCost === 0 ? 'Complimentary (Free)' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="tot-row final-tot-row">
                  <span>Total Amount</span>
                  <span className="final-val">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary checkout-submit-btn"
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order (${finalTotal.toFixed(2)})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="checkout-assurances">
                <ShieldCheck size={14} color="#10b981" />
                <span>30-Day Doorstep Returns • 100% Authentic Italian Craft</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

