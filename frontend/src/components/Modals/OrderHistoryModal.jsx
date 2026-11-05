import React, { useEffect, useState } from 'react';
import { X, Package, ShoppingBag, Navigation } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ordersAPI } from '../../services/api';
import { formatOrderDateTimeIST } from '../../utils/dateUtils';
import { OrderTimelineStepper } from '../OrderTracking/OrderTimelineStepper';
import { OrderTrackingMap } from '../OrderTracking/OrderTrackingMap';
import './OrderHistoryModal.css';

export const OrderHistoryModal = () => {
  const {
    isOrderHistoryOpen,
    setIsOrderHistoryOpen,
    user
  } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrackingId, setExpandedTrackingId] = useState(null);

  const loadOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await ordersAPI.getMyOrders();
        setOrders(res.orders || []);
      } else {
        // Guest: load all demo orders
        const res = await ordersAPI.getAllOrders().catch(() => ({ orders: [] }));
        setOrders(res.orders || []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOrderHistoryOpen) {
      loadOrders();
    }
  }, [isOrderHistoryOpen, loadOrders]);

  if (!isOrderHistoryOpen) return null;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Shipped':
        return 'status-shipped';
      case 'Confirmed':
      case 'Processing':
        return 'status-confirmed';
      default:
        return 'status-default';
    }
  };

  return (
    <div className="orderhistory-modal-root">
      <div className="orderhistory-backdrop" onClick={() => setIsOrderHistoryOpen(false)} />

      <div className="orderhistory-dialog" role="dialog" aria-modal="true" aria-label="Order History">
        <div className="orderhistory-header">
          <div className="orderhistory-title-group">
            <Package size={22} className="history-icon" />
            <div>
              <h2 className="history-title">Atelier Order Archive</h2>
              <span className="history-subtitle">
                {user ? `${user.name}’s History` : 'Patron Order Tracking'}
              </span>
            </div>
          </div>
          <button
            className="orderhistory-close-btn"
            onClick={() => setIsOrderHistoryOpen(false)}
            aria-label="Close orders"
          >
            <X size={20} />
          </button>
        </div>

        <div className="orderhistory-content">
          {loading ? (
            <div className="history-loading-state">
              <div className="history-spinner" />
              <p>Retrieving order logs from the NOVARA archive...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="history-empty-state">
              <ShoppingBag size={48} className="empty-bag-icon" />
              <h3>No past reservations logged</h3>
              <p>Explore our seasonal drop to place your inaugural bespoke order.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setIsOrderHistoryOpen(false);
                  const el = document.querySelector('#trending');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div className="order-cards-stack">
              {orders.map((ord) => (
                <div key={ord._id} className="history-order-card">
                  <div className="hist-order-header">
                    <div>
                      <span className="hist-order-id">
                        Order #{ord._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="hist-order-date">
                        {formatOrderDateTimeIST(ord.createdAt)}
                      </span>
                    </div>

                    <div className="hist-order-badge-row">
                      <span className={`status-pill ${getStatusBadgeClass(ord.orderStatus)}`}>
                        {ord.orderStatus}
                      </span>
                      <span className="hist-order-total">${ord.totalPrice?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="hist-order-items">
                    {ord.orderItems?.map((item, i) => (
                      <div key={i} className="hist-item-row">
                        <img src={item.image} alt={item.name} className="hist-item-thumb" />
                        <div className="hist-item-info">
                          <span className="hist-item-name">{item.name}</span>
                          <span className="hist-item-meta">
                            Qty: {item.quantity} • Size: {item.selectedSize} • ${item.price}.00
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hist-order-footer">
                    <span className="hist-dest">
                      Delivery: {ord.shippingAddress?.city}, {ord.shippingAddress?.country}
                    </span>
                    <button
                      type="button"
                      className="hist-track-btn"
                      onClick={() => setExpandedTrackingId(expandedTrackingId === ord._id ? null : ord._id)}
                    >
                      <Navigation size={13} />
                      <span>{expandedTrackingId === ord._id ? 'Close Map' : 'Track Order'}</span>
                    </button>
                  </div>

                  {expandedTrackingId === ord._id && (
                    <div className="hist-tracking-wrap">
                      <OrderTimelineStepper order={ord} />
                      <OrderTrackingMap shippingAddress={ord.shippingAddress} orderId={ord._id} orderStatus={ord.orderStatus} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

