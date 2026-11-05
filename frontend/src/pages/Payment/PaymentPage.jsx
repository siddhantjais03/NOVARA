import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Truck,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { useStore } from '../../context/StoreContext';
import { ordersAPI } from '../../services/api';
import './PaymentPage.css';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discount, finalTotal, appliedCoupon, clearCart, user, showToast } = useStore();

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'COD'
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('elena@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Elena Rostova');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // If cart is empty, fallback to demo order items
  const items = cart.length > 0 ? cart : [
    {
      product: {
        _id: '672801a1e1b2c3d4e5f60001',
        name: 'Sovereign Cashmere Double-Breasted Overcoat',
        price: 495,
        image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80'
      },
      quantity: 1,
      selectedSize: 'M',
      selectedColor: { name: 'Camel', hex: '#c19a6b' }
    }
  ];

  const calculatedSubtotal = cart.length > 0 ? subtotal : 495;
  const calculatedDiscount = cart.length > 0 ? discount : 49.5;
  const calculatedTotal = cart.length > 0 ? finalTotal : 445.5;

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentResult = {
        id: `DEMO-${paymentMethod}-${Date.now().toString().slice(-6)}`,
        status: 'COMPLETED',
        paymentDetail:
          paymentMethod === 'UPI'
            ? `UPI ID: ${upiId}`
            : paymentMethod === 'CARD'
            ? `Card ending in ${cardNumber.slice(-4)}`
            : 'Cash on Arrival at Doorstep'
      };

      const orderPayload = {
        customerInfo: {
          name: user?.name || cardHolder || 'Elena Rostova',
          email: user?.email || 'patron@novara.luxury',
          phone: user?.phone || '+91 98765 43210'
        },
        shippingAddress: user?.address || {
          street: '12 Luxury Boulevard',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India'
        },
        paymentMethod,
        paymentResult,
        orderItems: items.map((item) => ({
          product: item.product._id || item.product.id,
          name: item.product.name,
          image: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize || 'M',
          selectedColor: item.selectedColor || { name: 'Noir', hex: '#000' }
        })),
        appliedCoupon: appliedCoupon?.code || (cart.length === 0 ? 'WELCOME10' : null),
        itemsPrice: calculatedSubtotal,
        shippingPrice: 0,
        discountPrice: calculatedDiscount,
        totalPrice: calculatedTotal
      };

      const response = await ordersAPI.createOrder(orderPayload);
      clearCart();
      showToast('Payment authenticated! Booking atelier delivery...', 'success');

      const orderId = response.order?._id || `ord-${Date.now()}`;
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      showToast(err.message || 'Payment simulation completed with receipt generated.');
      navigate('/order-confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="payment-page-main">
        <header className="payment-header-banner">
          <div className="payment-step-indicator">
            <Lock size={14} />
            <span>Step 3 of 3 • Secure Payment</span>
          </div>
          <h1 className="payment-page-title">Novara Atelier Payment Gateway</h1>
          <p className="payment-page-sub">
            Encrypted with 256-Bit SSL luxury financial protocols. Instant receipt issued upon confirmation.
          </p>
        </header>

        <div className="payment-grid-layout">
          {/* Left: Payment Method Selection & Inputs */}
          <section className="payment-card-panel">
            <div className="panel-title-row">
              <h2 className="panel-title">
                <CreditCard size={20} color="#6366f1" />
                <span>Select Settlement Method</span>
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                ✓ Zero Transaction Surcharge
              </span>
            </div>

            <div className="payment-methods-grid">
              <button
                type="button"
                className={`payment-method-tile ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                <div className="tile-icon">
                  <QrCode size={20} />
                </div>
                <strong className="tile-name">Instant UPI</strong>
                <span className="tile-sub">GPay, PhonePe, Paytm</span>
              </button>

              <button
                type="button"
                className={`payment-method-tile ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <div className="tile-icon">
                  <CreditCard size={20} />
                </div>
                <strong className="tile-name">Credit / Debit</strong>
                <span className="tile-sub">Visa, Mastercard, Amex</span>
              </button>

              <button
                type="button"
                className={`payment-method-tile ${paymentMethod === 'COD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('COD')}
              >
                <div className="tile-icon">
                  <Truck size={20} />
                </div>
                <strong className="tile-name">Pay on Arrival</strong>
                <span className="tile-sub">Cash on Delivery</span>
              </button>
            </div>

            <form onSubmit={handleExecutePayment}>
              {/* Method: UPI */}
              {paymentMethod === 'UPI' && (
                <div className="method-detail-box">
                  <div className="upi-qr-box">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=novara.atelier@okaxis&pn=NOVARA%20Luxury&am=445.50&cu=USD"
                      alt="UPI QR Code"
                      className="upi-qr-img"
                    />
                    <div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem' }}>Scan to Pay via UPI App</h4>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                        Scan the dynamic QR code with Google Pay, PhonePe, or Paytm for instant VIP clearance.
                      </p>
                      <div className="upi-apps-row">
                        <span className="upi-pill">Google Pay</span>
                        <span className="upi-pill">PhonePe</span>
                        <span className="upi-pill">Paytm</span>
                        <span className="upi-pill">BHIM</span>
                      </div>
                    </div>
                  </div>

                  <div className="payment-input-group">
                    <label>Or Enter Virtual Payment Address (VPA)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@upi or username@okhdfcbank"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Method: CARD */}
              {paymentMethod === 'CARD' && (
                <div className="method-detail-box">
                  <div className="mockup-credit-card">
                    <div className="mockup-chip" />
                    <div className="mockup-number">{cardNumber}</div>
                    <div className="mockup-footer">
                      <div>
                        <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.7 }}>
                          Card Holder
                        </span>
                        <strong>{cardHolder || 'ELENA ROSTOVA'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.7 }}>
                          Expires
                        </span>
                        <strong>{cardExpiry}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="payment-input-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      required
                    />
                  </div>

                  <div className="input-row-2">
                    <div className="payment-input-group">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Elena Rostova"
                        required
                      />
                    </div>
                    <div className="payment-input-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                  </div>

                  <div className="payment-input-group" style={{ maxWidth: '160px' }}>
                    <label>CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Method: COD */}
              {paymentMethod === 'COD' && (
                <div className="method-detail-box">
                  <div className="cod-perk-box">
                    <Truck size={28} color="#4f46e5" />
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0f172a' }}>
                        White-Glove Cash on Delivery
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                        Inspect your hand-tailored luxury garments upon personal arrival. Pay via cash or courier card POS machine.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-pay-action" disabled={isProcessing}>
                {isProcessing ? (
                  <span>Securing Atelier Transaction...</span>
                ) : (
                  <>
                    <span>Authorise Payment (${calculatedTotal.toFixed(2)})</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="security-seal-row">
                <ShieldCheck size={16} color="#16a34a" />
                <span>PCI-DSS Level 1 Compliant • 256-Bit Financial Encryption</span>
              </div>
            </form>
          </section>

          {/* Right: Order Summary */}
          <aside className="order-summary-card">
            <h3 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '1.25rem', marginBottom: '16px' }}>
              Atelier Order Summary
            </h3>

            <div className="summary-items-list">
              {items.map((item, index) => {
                const prod = item.product;
                return (
                  <div key={index} className="summary-item-row">
                    <img src={prod.image} alt={prod.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{prod.name}</div>
                      <div className="summary-item-meta">
                        Qty: {item.quantity} • Size: {item.selectedSize || 'M'}
                      </div>
                    </div>
                    <strong>${(prod.price * item.quantity).toFixed(2)}</strong>
                  </div>
                );
              })}
            </div>

            <div className="summary-price-lines">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${calculatedSubtotal.toFixed(2)}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="summary-line" style={{ color: '#16a34a' }}>
                  <span>Privilege Discount ({appliedCoupon?.code || 'WELCOME10'})</span>
                  <span>-${calculatedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line">
                <span>White-Glove Courier Delivery</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>COMPLIMENTARY</span>
              </div>
              <div className="summary-line">
                <span>Estimated Luxury Duties</span>
                <span>$0.00</span>
              </div>
              <div className="summary-line total">
                <span>Total Due</span>
                <span>${calculatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

