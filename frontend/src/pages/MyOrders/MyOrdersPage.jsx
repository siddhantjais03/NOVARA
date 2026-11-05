import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Navigation, ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ordersAPI } from '../../services/api';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { formatOrderDateTimeIST } from '../../utils/dateUtils';
import { OrderTimelineStepper } from '../../components/OrderTracking/OrderTimelineStepper';
import { OrderTrackingMap } from '../../components/OrderTracking/OrderTrackingMap';
import './MyOrdersPage.css';

export const MyOrdersPage = () => {
  const { user } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTrackingOrderId, setExpandedTrackingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        if (user) {
          const res = await ordersAPI.getMyOrders();
          setOrders(res.orders || []);
        } else {
          const res = await ordersAPI.getAllOrders().catch(() => ({ orders: [] }));
          setOrders(res.orders || []);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-delivered';
      case 'Shipped':
        return 'status-shipped';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-processing';
    }
  };

  return (
    <div className="orders-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="container orders-page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">My Orders</span>
        </nav>

        <div className="orders-page-header">
          <div>
            <h1 className="orders-page-title">Patron Order Archive</h1>
            <p className="orders-page-sub">
              Track active atelier dispatches and inspect historical reservations.
            </p>
          </div>
          <span className="wishlist-count-badge">
            {orders.length} {orders.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {loading ? (
          <div className="cart-empty-view">
            <p>Accessing the NOVARA secure ledger...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="cart-empty-view">
            <div className="cart-empty-icon">
              <Package size={42} />
            </div>
            <h3>No Orders Found</h3>
            <p>You have not placed any orders under this patron profile yet.</p>
            <Link to="/shop" className="btn-primary">
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="orders-stack">
            {orders.map((ord) => (
              <div key={ord._id} className="order-history-card">
                <div className="order-card-top-bar">
                  <div className="order-ref-group">
                    <span className="order-num">#{ord._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date-tag">
                      {formatOrderDateTimeIST(ord.createdAt)}
                    </span>
                  </div>

                  <div className="order-card-right-group">
                    <span className={`order-status-badge ${getStatusClass(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                    <span className="order-total-price">${ord.totalPrice?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-items-scroll">
                  {ord.orderItems?.map((item, idx) => (
                    <div key={idx} className="ord-item-row">
                      <img src={item.image} alt={item.name} className="ord-item-thumb" />
                      <div className="ord-item-meta">
                        <strong>{item.name}</strong>
                        <span>
                          Quantity: {item.quantity} • Size: {item.selectedSize}
                        </span>
                      </div>
                      <span className="ord-item-cost">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-footer-details">
                    <span>
                      Destination: {ord.shippingAddress?.street}, {ord.shippingAddress?.city}
                    </span>
                    <span>
                      Payment: {ord.paymentMethod} ({ord.isPaid ? 'Settled' : 'Pending'})
                    </span>
                  </div>

                  <button
                    type="button"
                    className="track-shipment-toggle-btn"
                    onClick={() => setExpandedTrackingOrderId(expandedTrackingOrderId === ord._id ? null : ord._id)}
                    aria-label="Toggle shipment tracking"
                  >
                    <Navigation size={14} />
                    <span>{expandedTrackingOrderId === ord._id ? 'Hide Dispatch Route' : 'Track Atelier Shipment'}</span>
                    <ChevronDown size={14} className={`chevron-rotate ${expandedTrackingOrderId === ord._id ? 'open' : ''}`} />
                  </button>
                </div>

                {expandedTrackingOrderId === ord._id && (
                  <div className="order-tracking-expanded-section">
                    <OrderTimelineStepper order={ord} />
                    <OrderTrackingMap shippingAddress={ord.shippingAddress} orderId={ord._id} orderStatus={ord.orderStatus} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

