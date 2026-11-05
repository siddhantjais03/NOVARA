import React from 'react';
import { CheckCircle2, Package, Truck, ArrowRight, X, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './OrderSuccessModal.css';

export const OrderSuccessModal = () => {
  const {
    latestOrder,
    isOrderSuccessOpen,
    setIsOrderSuccessOpen,
    setIsOrderHistoryOpen
  } = useStore();

  if (!isOrderSuccessOpen || !latestOrder) return null;

  const order = latestOrder;
  const orderId = order._id;

  return (
    <div className="ordersuccess-modal-root">
      <div className="ordersuccess-backdrop" onClick={() => setIsOrderSuccessOpen(false)} />

      <div className="ordersuccess-dialog" role="dialog" aria-modal="true" aria-label="Order Confirmation">
        <button
          className="ordersuccess-close-btn"
          onClick={() => setIsOrderSuccessOpen(false)}
          aria-label="Close confirmation"
        >
          <X size={20} />
        </button>

        <div className="ordersuccess-content">
          {/* Success Check Badge */}
          <div className="success-halo-icon">
            <CheckCircle2 size={42} />
          </div>

          <span className="success-pre-title">Reservation Confirmed</span>
          <h2 className="success-title">Thank You for Your Patronage</h2>
          <p className="success-desc">
            Your order has been logged into the NOVARA Atelier system. A digital receipt has
            been dispatched to <strong>{order.customerInfo?.email}</strong>.
          </p>

          {/* Reference Card */}
          <div className="order-reference-card">
            <div className="ref-top-row">
              <div className="ref-block">
                <span className="ref-label">Order Reference</span>
                <strong className="ref-val">#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="ref-block text-right">
                <span className="ref-label">Total Amount</span>
                <strong className="ref-val text-primary">${order.totalPrice?.toFixed(2)}</strong>
              </div>
            </div>

            <div className="ref-divider" />

            {/* Stepper Timeline */}
            <div className="order-timeline-stepper">
              <div className="step-point completed">
                <div className="step-circle">✓</div>
                <span>Confirmed</span>
              </div>
              <div className="step-line active" />
              <div className="step-point in-progress">
                <div className="step-circle">
                  <Clock size={12} />
                </div>
                <span>Atelier Prep</span>
              </div>
              <div className="step-line" />
              <div className="step-point">
                <div className="step-circle">
                  <Truck size={12} />
                </div>
                <span>Express Transit</span>
              </div>
              <div className="step-line" />
              <div className="step-point">
                <div className="step-circle">
                  <Package size={12} />
                </div>
                <span>Delivered</span>
              </div>
            </div>

            {/* Delivery & Items Summary */}
            <div className="ref-meta-grid">
              <div className="meta-sub-col">
                <span className="meta-sub-title">Delivery Destination</span>
                <p>
                  {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                </p>
                <span className="meta-sub-badge">Payment: {order.paymentMethod}</span>
              </div>

              <div className="meta-sub-col">
                <span className="meta-sub-title">Estimated Delivery</span>
                <p>3 - 5 Business Days</p>
                <span className="meta-sub-badge green">Carbon Neutral Transit</span>
              </div>
            </div>

            {/* Items preview list */}
            <div className="order-items-preview">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="preview-item-row">
                  <img src={item.image} alt={item.name} className="preview-item-img" />
                  <div className="preview-item-details">
                    <span className="preview-name">{item.name}</span>
                    <span className="preview-sub">
                      Size: {item.selectedSize} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="preview-price">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="ordersuccess-actions">
            <button
              className="btn-primary"
              onClick={() => {
                setIsOrderSuccessOpen(false);
                setIsOrderHistoryOpen(true);
              }}
            >
              <span>View Order History</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="btn-secondary"
              onClick={() => setIsOrderSuccessOpen(false)}
            >
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

