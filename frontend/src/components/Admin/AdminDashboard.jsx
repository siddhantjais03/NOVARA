import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  AlertTriangle,
  X,
  Search
} from 'lucide-react';
import { adminAPI, productsAPI, ordersAPI } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { formatOrderDateTimeIST } from '../../utils/dateUtils';
import './AdminDashboard.css';

export const AdminDashboard = ({ onBackToStore }) => {
  const { showToast, user } = useStore();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'stock'
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  // Search in admin products
  const [productSearch, setProductSearch] = useState('');

  // Add/Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Outerwear',
    gender: 'Unisex',
    price: '',
    originalPrice: '',
    discount: '',
    stock: '',
    description: '',
    image: '',
    badge: 'New Season'
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ stats: null })),
        productsAPI.getProducts({ limit: 100 }),
        ordersAPI.getAllOrders().catch(() => ({ orders: [] }))
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (productsRes?.products) setProducts(productsRes.products);
      if (ordersRes?.orders) setOrders(ordersRes.orders);
    } catch (err) {
      showToast(err.message, 'info');
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Open Add Product Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'Outerwear',
      gender: 'Unisex',
      price: '',
      originalPrice: '',
      discount: '',
      stock: '15',
      description: '',
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
      badge: 'New Season'
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      category: p.category,
      gender: p.gender || 'Unisex',
      price: p.price,
      originalPrice: p.originalPrice || p.price,
      discount: p.discount || 0,
      stock: p.stock,
      description: p.description,
      image: p.image,
      badge: p.badge || ''
    });
    setIsProductModalOpen(true);
  };

  // Save (Create or Update) Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        await productsAPI.updateProduct(id, productForm);
        showToast(`Product "${productForm.name}" updated successfully!`);
      } else {
        await productsAPI.createProduct(productForm);
        showToast(`Product "${productForm.name}" created and added to catalog!`);
      }
      setIsProductModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you certain you wish to delete "${name}" from the catalog?`)) {
      return;
    }
    try {
      await productsAPI.deleteProduct(id);
      showToast(`Product "${name}" deleted.`);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Quick Stock Update
  const handleStockUpdate = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await productsAPI.updateStock(id, newStock);
      showToast(`Stock updated to ${newStock}`);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"`);
      fetchDashboardData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const lowStockItems = products.filter((p) => p.stock <= 5);

  return (
    <div className="admin-dashboard-root">
      {/* Top Bar */}
      <header className="admin-header">
        <div className="container admin-header-inner">
          <div className="admin-brand-col">
            <button className="admin-back-btn" onClick={onBackToStore}>
              <ArrowLeft size={16} />
              <span>Back to Storefront</span>
            </button>
            <div className="admin-title-row">
              <span className="admin-badge">Atelier Management System</span>
              <h1 className="admin-title">NOVARA House Administration</h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />
            <div className="admin-user-pill">
              <div className="admin-avatar">A</div>
              <div>
                <strong>{user?.name || 'Administrator'}</strong>
                <span>House Director</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container admin-body">
        {/* Metric Cards Row */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap purple">
              <Package size={22} />
            </div>
            <div className="metric-card-info">
              <span className="metric-title">Catalog Products</span>
              <strong className="metric-number">
                {stats?.totalProducts ?? products.length}
              </strong>
              <span className="metric-sub">Active Luxury Silhouettes</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap blue">
              <ShoppingBag size={22} />
            </div>
            <div className="metric-card-info">
              <span className="metric-title">Total Orders</span>
              <strong className="metric-number">
                {stats?.totalOrders ?? orders.length}
              </strong>
              <span className="metric-sub">Patron Transactions</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap green">
              <DollarSign size={22} />
            </div>
            <div className="metric-card-info">
              <span className="metric-title">Gross Revenue</span>
              <strong className="metric-number">
                ${stats?.revenue ? stats.revenue.toLocaleString() : '1,845.50'}
              </strong>
              <span className="metric-sub">Net Atelier Volume</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap yellow">
              <AlertTriangle size={22} />
            </div>
            <div className="metric-card-info">
              <span className="metric-title">Low Stock Alerts</span>
              <strong className="metric-number">{lowStockItems.length}</strong>
              <span className="metric-sub">Inventory &le; 5 pieces</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="admin-tabs-bar">
          <div className="admin-tabs-list">
            <button
              className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={16} />
              <span>Products Management ({products.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={16} />
              <span>Orders Management ({orders.length})</span>
            </button>
            <button
              className={`admin-tab-btn ${activeTab === 'stock' ? 'active' : ''}`}
              onClick={() => setActiveTab('stock')}
            >
              <AlertTriangle size={16} />
              <span>Stock Controls ({lowStockItems.length})</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <button className="btn-primary admin-add-prod-btn" onClick={handleOpenAddModal}>
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          )}
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="admin-panel-card">
            <div className="panel-search-bar">
              <Search size={18} className="panel-search-icon" />
              <input
                type="text"
                placeholder="Search catalog by name or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <span className="panel-search-count">
                Showing {filteredProducts.length} of {products.length}
              </span>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const id = p._id || p.id;
                    return (
                      <tr key={id}>
                        <td>
                          <div className="table-product-cell">
                            <img src={p.image} alt={p.name} className="table-thumb" />
                            <div>
                              <strong className="table-prod-name">{p.name}</strong>
                              <span className="table-prod-gender">{p.gender || 'Unisex'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="table-category-tag">{p.category}</span>
                        </td>
                        <td>
                          <strong>${p.price}.00</strong>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="table-old-price">${p.originalPrice}</span>
                          )}
                        </td>
                        <td>
                          {p.discount > 0 ? (
                            <span className="table-discount-pill">-{p.discount}%</span>
                          ) : (
                            <span className="table-text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <div className="table-stock-stepper">
                            <button
                              onClick={() => handleStockUpdate(id, p.stock, -1)}
                              title="Decrease stock"
                            >
                              -
                            </button>
                            <span className={`stock-count ${p.stock <= 5 ? 'critical' : ''}`}>
                              {p.stock}
                            </span>
                            <button
                              onClick={() => handleStockUpdate(id, p.stock, 1)}
                              title="Increase stock"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          {p.badge ? (
                            <span className="table-badge-pill">{p.badge}</span>
                          ) : (
                            <span className="table-text-muted">Standard</span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="table-actions-group">
                            <button
                              className="table-action-btn edit"
                              onClick={() => handleOpenEditModal(p)}
                              title="Edit product details"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              className="table-action-btn delete"
                              onClick={() => handleDeleteProduct(id, p.name)}
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="admin-panel-card">
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Reference</th>
                    <th>Patron Info</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td>
                        <strong>#{ord._id.slice(-8).toUpperCase()}</strong>
                        <span className="table-date-sub">
                          {formatOrderDateTimeIST(ord.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="patron-info-cell">
                          <strong>{ord.customerInfo?.name}</strong>
                          <span>{ord.customerInfo?.email}</span>
                          <span className="table-city-sub">{ord.shippingAddress?.city}</span>
                        </div>
                      </td>
                      <td>
                        <span className="order-items-count">
                          {ord.orderItems?.length || 1} pieces
                        </span>
                      </td>
                      <td>
                        <strong className="order-total-val">
                          ${ord.totalPrice?.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className="table-pay-badge">
                          {ord.paymentMethod} • {ord.isPaid ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-select ${ord.orderStatus.toLowerCase()}`}
                          value={ord.orderStatus}
                          onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK MANAGEMENT */}
        {activeTab === 'stock' && (
          <div className="admin-panel-card">
            <div className="stock-alert-header">
              <AlertTriangle size={24} color="#f59e0b" />
              <div>
                <h3>Low Inventory Threshold Alert</h3>
                <p>
                  Products below 5 units remaining in stock. Replenish immediately to
                  avoid fulfillment backorders.
                </p>
              </div>
            </div>

            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Remaining Units</th>
                    <th>Stock Replenishment</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((p) => {
                    const id = p._id || p.id;
                    return (
                      <tr key={id}>
                        <td>
                          <div className="table-product-cell">
                            <img src={p.image} alt={p.name} className="table-thumb" />
                            <strong>{p.name}</strong>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <span className="stock-count critical">{p.stock} units left</span>
                        </td>
                        <td>
                          <div className="replenish-buttons">
                            <button
                              className="replenish-btn"
                              onClick={() => handleStockUpdate(id, p.stock, 10)}
                            >
                              +10 Units
                            </button>
                            <button
                              className="replenish-btn"
                              onClick={() => handleStockUpdate(id, p.stock, 25)}
                            >
                              +25 Units
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="admin-modal-root">
          <div className="admin-modal-backdrop" onClick={() => setIsProductModalOpen(false)} />
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Edit Atelier Product' : 'Add New Luxury Silhouette'}</h3>
              <button
                className="modal-close"
                onClick={() => setIsProductModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Sovereign Cashmere Trench"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group flex-1">
                  <label>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="Outerwear">Outerwear</option>
                    <option value="Womenswear">Womenswear</option>
                    <option value="Menswear">Menswear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Jewelry">Jewelry</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Gender</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Women">Women</option>
                    <option value="Men">Men</option>
                  </select>
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group flex-1">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="495"
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Original Price ($)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    placeholder="680"
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Initial Stock *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Primary Image URL *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Editorial Description *</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Hand-tailored from 100% cashmere with structured shoulders..."
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Product Changes' : 'Create & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

