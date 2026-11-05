import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, Truck, Package, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ordersAPI } from '../../services/api';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { formatOrderDateTimeIST } from '../../utils/dateUtils';
import { OrderTimelineStepper } from '../../components/OrderTracking/OrderTimelineStepper';
import { OrderTrackingMap } from '../../components/OrderTracking/OrderTrackingMap';
import './OrderConfirmationPage.css';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { latestOrder } = useStore();
  const [order, setOrder] = useState(latestOrder || null);
  const [loading, setLoading] = useState(() => !latestOrder && !!id);

  useEffect(() => {
    if (!latestOrder && id) {
      ordersAPI
        .getOrderById(id)
        .then((res) => {
          if (res.success && res.order) {
            setOrder(res.order);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, latestOrder]);

  if (loading && !order) {
    return (
      <div className="order-confirmation-root">
        <AnnouncementBar />
        <Navbar />
        <main className="container order-confirmation-container">
          <div className="confirmation-card">
            <p>Accessing the NOVARA Atelier Reservation Ledger...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const orderId = order?._id || id || 'NOVARA-DEMO';

  return (
    <div className="order-confirmation-root">
      <AnnouncementBar />
      <Navbar />

      <main className="container order-confirmation-container">
        <div className="confirmation-card">
          <div className="confirmation-hero-badge">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="confirmation-title">Reservation Confirmed</h1>
          <p className="confirmation-sub">
            Your sartorial acquisition has been officially confirmed and placed into the NOVARA
            atelier queue.
          </p>

          <div className="confirmation-ref-box">
            <div className="ref-row-header">
              <div className="ref-ord-id">
                <span>Order Reference</span>
                <strong>#{orderId.slice(-8).toUpperCase()}</strong>
              </div>
              <div className="ref-ord-date" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Placed At</span>
                <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--color-primary, #0f172a)' }}>
                  {formatOrderDateTimeIST(order?.createdAt || new Date())}
                </strong>
              </div>
              <div className="ref-ord-total">
                <span>Total Amount</span>
                <strong>${order?.totalPrice ? order.totalPrice.toFixed(2) : '385.00'}</strong>
              </div>
            </div>

            {/* Live Order Timeline Stepper & Estimated Tracking Map */}
            <OrderTimelineStepper order={order} />
            <OrderTrackingMap shippingAddress={order?.shippingAddress} orderId={orderId} orderStatus={order?.orderStatus || 'Confirmed'} />

            {/* Delivery address info */}
            {order?.shippingAddress && (
              <div style={{ marginTop: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong>Delivery Destination:</strong> {order.shippingAddress.street},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.postalCode} • {order.paymentMethod}
              </div>
            )}

            {/* Items list */}
            {order?.orderItems && order.orderItems.length > 0 && (
              <div className="conf-items-list">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="conf-item-row">
                    <img src={item.image} alt={item.name} className="conf-item-thumb" />
                    <div className="conf-item-meta">
                      <strong>{item.name}</strong>
                      <span>
                        Qty: {item.quantity} • Size: {item.selectedSize}
                      </span>
                    </div>
                    <span className="conf-item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="confirmation-actions">
            <Link to="/orders" className="btn-primary">
              <span>View Order Archive</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="btn-secondary">
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

