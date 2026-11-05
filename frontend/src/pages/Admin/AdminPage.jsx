import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  AlertTriangle,
  X,
  Search,
  SlidersHorizontal,
  ShieldAlert,
  Tag,
  Star,
  BarChart2,
  Settings,
  Layers,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Percent,
  Calendar,
  MessageSquare,
  Check,
  XCircle,
  RotateCw,
  Filter,
  CreditCard,
  Lock,
  LogOut
} from 'lucide-react';
import {
  adminAPI,
  productsAPI,
  ordersAPI,
  couponsAPI,
  reviewsAPI,
  categoriesAPI,
  settingsAPI
} from '../../services/api';
import { useStore } from '../../context/StoreContext';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { formatOrderDateTimeIST } from '../../utils/dateUtils';
import './AdminPage.css';

export const AdminPage = () => {
  const { user, adminUser, login, adminLogin, adminLogout, logout, showToast } = useStore();

  const isHouseAdmin = (adminUser && adminUser.role === 'admin') || (user && user.role === 'admin');
  const activeAdmin = (adminUser && adminUser.role === 'admin') ? adminUser : (user?.role === 'admin' ? user : null);

  // Admin Authentication Gate Form States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // 10 Modules:
  // 1. overview (Dashboard)
  // 2. products (Product Management)
  // 3. categories (Category Management)
  // 4. orders (Order Management)
  // 5. customers (Customer Management)
  // 6. inventory (Inventory Management)
  // 7. coupons (Coupon Management)
  // 8. reviews (Review Management)
  // 9. analytics (Analytics)
  // 10. settings (Settings)
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);

  // Reviews state & filtering
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');

  // Search & Filter in products
  const [productSearch, setProductSearch] = useState('');

  // Add / Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
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

  // Add Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80'
  });

  // Add Coupon Modal
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '15',
    minOrderAmount: '100',
    maxDiscountAmount: '150'
  });

  const fetchAllData = useCallback(async () => {
    try {
      const [
        statsRes,
        prodsRes,
        ordsRes,
        custRes,
        catsRes,
        coupsRes,
        revsRes,
        settRes
      ] = await Promise.all([
        adminAPI.getStats().catch(() => ({ stats: null })),
        productsAPI.getProducts({ limit: 200 }).catch(() => ({ products: [] })),
        ordersAPI.getAllOrders().catch(() => ({ orders: [] })),
        adminAPI.getCustomers().catch(() => ({ customers: [] })),
        categoriesAPI.getCategories().catch(() => ({ categories: [] })),
        couponsAPI.getCoupons().catch(() => ({ coupons: [] })),
        reviewsAPI.getReviews().catch(() => ({ reviews: [] })),
        settingsAPI.getSettings().catch(() => ({ settings: null }))
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (prodsRes?.products) setProducts(prodsRes.products);
      if (ordsRes?.orders) setOrders(ordsRes.orders);
      if (custRes?.customers) setCustomers(custRes.customers);
      if (catsRes?.categories) setCategories(catsRes.categories);
      if (coupsRes?.coupons) setCoupons(coupsRes.coupons);
      if (revsRes?.reviews) setReviews(revsRes.reviews);
      if (settRes?.settings) setStoreSettings(settRes.settings);
    } catch (err) {
      showToast(err.message, 'info');
    }
  }, [showToast]);

  useEffect(() => {
    if (isHouseAdmin) {
      fetchAllData();
    }
  }, [isHouseAdmin, fetchAllData]);

  const fetchReviewsOnly = useCallback(async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const res = await reviewsAPI.getReviews();
      if (res && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      }
    } catch (err) {
      setReviewsError(err.message || 'Could not load patron reviews.');
      showToast(err.message || 'Could not load patron reviews.', 'info');
    } finally {
      setReviewsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isHouseAdmin && activeTab === 'reviews') {
      fetchReviewsOnly();
    }
  }, [isHouseAdmin, activeTab, fetchReviewsOnly]);

  // Authenticate as House Administrator via actual backend credentials
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAuthError('Please enter both your administrator email and password.');
      return;
    }

    setIsAuthenticating(true);
    try {
      const loginFn = adminLogin || login;
      const res = await loginFn(adminEmail.trim(), adminPassword);
      if (res && res.success) {
        const verifiedAdmin = res.admin || res.user;
        if (verifiedAdmin && verifiedAdmin.role === 'admin') {
          showToast(`Welcome, ${verifiedAdmin.name}. Administrator access granted.`, 'success');
          setAdminPassword('');
          setAuthError('');
        } else {
          setAuthError(`Access Denied: Account "${verifiedAdmin?.email || adminEmail}" does not possess administrator privileges.`);
          showToast('Access Denied: Account is not an administrator.', 'error');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid administrator credentials. Access rejected.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Product Actions
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: '',
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

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      sku: p.sku || '',
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id;
        await productsAPI.updateProduct(id, productForm);
        showToast(`Product "${productForm.name}" updated successfully!`, 'success');
      } else {
        await productsAPI.createProduct(productForm);
        showToast(`Product "${productForm.name}" added to catalog!`, 'success');
      }
      setIsProductModalOpen(false);
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you certain you wish to remove "${name}" from the atelier catalog?`)) {
      return;
    }
    try {
      await productsAPI.deleteProduct(id);
      showToast(`Product "${name}" deleted.`, 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleStockUpdate = async (id, currentStock, delta) => {
    const newStock = Math.max(0, currentStock + delta);
    try {
      await productsAPI.updateStock(id, newStock);
      showToast(`Stock updated to ${newStock} pieces`, 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"`, 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await categoriesAPI.createCategory(categoryForm);
      showToast(`Category "${categoryForm.name}" created!`, 'success');
      setIsCategoryModalOpen(false);
      setCategoryForm({ name: '', description: '', image: '' });
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleDeleteCategory = async (name) => {
    if (!window.confirm(`Remove category "${name}"?`)) return;
    try {
      await categoriesAPI.deleteCategory(name);
      showToast(`Category "${name}" removed.`, 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Coupon Actions
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await couponsAPI.createCoupon(couponForm);
      showToast(`Coupon "${couponForm.code.toUpperCase()}" created!`, 'success');
      setIsCouponModalOpen(false);
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '15', minOrderAmount: '100', maxDiscountAmount: '150' });
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await couponsAPI.toggleCoupon(id);
      showToast('Coupon status updated', 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await couponsAPI.deleteCoupon(id);
      showToast('Coupon deleted', 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  // Review Actions
  const handleReviewStatus = async (id, status) => {
    try {
      await reviewsAPI.updateStatus(id, status);
      showToast(`Review marked as "${status}"`, 'success');
      await fetchReviewsOnly();
      adminAPI.getStats().then((s) => s?.stats && setStats(s.stats)).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Failed to update review status', 'info');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review from MongoDB?')) return;
    try {
      await reviewsAPI.deleteReview(id);
      showToast('Review permanently removed', 'success');
      await fetchReviewsOnly();
      adminAPI.getStats().then((s) => s?.stats && setStats(s.stats)).catch(() => {});
    } catch (err) {
      showToast(err.message || 'Failed to delete review', 'info');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await settingsAPI.updateSettings(storeSettings);
      showToast('Store settings saved successfully!', 'success');
      fetchAllData();
    } catch (err) {
      showToast(err.message, 'info');
    }
  };

  const lowStockItems = products.filter((p) => p.stock <= 5);
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredReviews = reviews.filter((rev) => {
    const query = reviewSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (rev.userName && rev.userName.toLowerCase().includes(query)) ||
      (rev.userEmail && rev.userEmail.toLowerCase().includes(query)) ||
      (rev.productName && rev.productName.toLowerCase().includes(query)) ||
      (rev.comment && rev.comment.toLowerCase().includes(query));

    const matchesStatus =
      reviewStatusFilter === 'All' ||
      (rev.status || 'Approved').toLowerCase() === reviewStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Live Analytics Calculations based strictly on actual MongoDB orders and products
  const analyticsData = useMemo(() => {
    const validOrders = orders.filter((o) => o.orderStatus !== 'Cancelled');
    const validOrdersCount = stats?.validOrdersCount ?? validOrders.length;
    const grossRevenue =
      stats?.revenue ??
      validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const paidRevenue =
      stats?.paidRevenue ??
      validOrders.filter((o) => o.isPaid).reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const aov =
      stats?.averageOrderValue ??
      (validOrdersCount > 0 ? Math.round((grossRevenue / validOrdersCount) * 100) / 100 : 0);

    const totalOrdersCount = stats?.totalOrders ?? orders.length;
    const paidOrdersCount =
      stats?.paidOrdersCount ??
      orders.filter((o) => o.isPaid && o.orderStatus !== 'Cancelled').length;
    const checkoutConversionRate =
      stats?.checkoutConversionRate ??
      (totalOrdersCount > 0
        ? Math.round((paidOrdersCount / totalOrdersCount) * 1000) / 10
        : 0);

    const totalProductsCount = stats?.totalProducts ?? products.length;
    const inStockCount =
      stats?.inStockCount ?? products.filter((p) => p.stock > 5).length;
    const lowStockCount =
      stats?.criticalStockCount ??
      products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount =
      stats?.outOfStockCount ?? products.filter((p) => p.stock <= 0).length;
    const inventoryHealth =
      stats?.inventoryHealth ??
      (totalProductsCount > 0
        ? Math.round((inStockCount / totalProductsCount) * 1000) / 10
        : 100);

    // Real Category Revenue Share with Proportional Order Discount Allocation
    let categoryRevenueShare = stats?.categoryRevenueShare || [];
    if (!categoryRevenueShare || categoryRevenueShare.length === 0) {
      const prodCatMap = {};
      products.forEach((p) => {
        prodCatMap[p._id || p.id] = p.category;
      });

      const catMap = {};
      const unitsMap = {};

      validOrders.forEach((order) => {
        const items = order.orderItems || [];
        const orderItemsGross = items.reduce(
          (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
          0
        );
        const orderDiscount = order.discountPrice || 0;

        items.forEach((item) => {
          const cat = prodCatMap[item.product] || 'Accessories';
          const itemGross = (item.price || 0) * (item.quantity || 1);
          const itemDiscount =
            orderItemsGross > 0 && orderDiscount > 0
              ? orderDiscount * (itemGross / orderItemsGross)
              : 0;
          const itemNet = Math.max(0, itemGross - itemDiscount);

          catMap[cat] = (catMap[cat] || 0) + itemNet;
          unitsMap[cat] = (unitsMap[cat] || 0) + (item.quantity || 1);
        });
      });

      const totalItemRevenue = Object.values(catMap).reduce((a, b) => a + b, 0);

      categoryRevenueShare = Object.keys(catMap)
        .map((cat) => ({
          category: cat,
          revenue: Math.round(catMap[cat] * 100) / 100,
          percentage:
            totalItemRevenue > 0
              ? Math.round((catMap[cat] / totalItemRevenue) * 1000) / 10
              : 0,
          unitsSold: unitsMap[cat] || 0
        }))
        .sort((a, b) => b.revenue - a.revenue);
    }

    // Payment Method Breakdown from actual orders
    let paymentMethodStats = stats?.paymentMethodStats || [];
    if (!paymentMethodStats || paymentMethodStats.length === 0) {
      const payMap = {};
      validOrders.forEach((o) => {
        const method = o.paymentMethod || 'OTHER';
        if (!payMap[method]) {
          payMap[method] = { count: 0, volume: 0 };
        }
        payMap[method].count += 1;
        payMap[method].volume += o.totalPrice || 0;
      });
      paymentMethodStats = Object.keys(payMap).map((m) => ({
        _id: m,
        count: payMap[m].count,
        volume: payMap[m].volume
      }));
    }

    // Order Status Breakdown from actual orders
    let orderStatusStats = stats?.orderStatusStats || [];
    if (!orderStatusStats || orderStatusStats.length === 0) {
      const statusMap = {};
      orders.forEach((o) => {
        const s = o.orderStatus || 'Processing';
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      orderStatusStats = Object.keys(statusMap).map((s) => ({
        _id: s,
        count: statusMap[s]
      }));
    }

    return {
      validOrdersCount,
      grossRevenue,
      paidRevenue,
      aov,
      totalOrdersCount,
      paidOrdersCount,
      checkoutConversionRate,
      totalProductsCount,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      inventoryHealth,
      categoryRevenueShare,
      paymentMethodStats,
      orderStatusStats
    };
  }, [stats, orders, products]);

  // Gate: Only authenticated House Administrators can access the Admin Dashboard
  if (!isHouseAdmin) {
    return (
      <div className="admin-page-root">
        <AnnouncementBar />
        <main className="admin-locked-view">
          <div className="locked-card admin-login-card">
            {/* Top-Right Theme Toggle */}
            <div className="admin-login-theme-toggle-wrap">
              <ThemeToggle className="admin-login-theme-btn" />
            </div>

            <div className="locked-icon admin-auth">
              <Lock size={34} />
            </div>
            <h2>Director Portal Authentication</h2>
            <p>
              Authorized House Administrators must verify their credentials to access operational and
              database controls.
            </p>

            {user && user.role !== 'admin' && (
              <div
                className="current-user-chip patron-active-banner"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  marginBottom: '1.25rem',
                  fontSize: '0.84rem',
                  color: '#cbd5e1'
                }}
              >
                <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Active Storefront Patron:</span>
                <strong style={{ color: '#fff' }}>{user.name}</strong>
                <span style={{ color: '#94a3b8' }}>({user.email})</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.72rem',
                    background: 'rgba(52, 211, 153, 0.15)',
                    color: '#34d399',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                >
                  PRESERVED
                </span>
              </div>
            )}

            {authError && (
              <div className="admin-auth-error-banner">
                <AlertTriangle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="admin-login-form">
              <div className="form-group text-left">
                <label>Administrator Email</label>
                <input
                  type="email"
                  placeholder="e.g. admin@novara.luxury"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group text-left">
                <label>Secret Password</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <div
                className="admin-credentials-hint"
                style={{
                  marginTop: '0.25rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ color: '#cbd5e1', fontWeight: 500, marginBottom: '0.2rem' }}>
                  Configured Administrator Accounts:
                </div>
                <div>
                  <code>admin@novara.luxury</code>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary admin-submit-btn"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? 'Authenticating with Atelier...' : 'Sign In as Administrator'}
              </button>

              <div
                className="login-form-footer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '1.25rem'
                }}
              >
                <Link to="/" className="store-return-link">
                  ← Return to Storefront
                </Link>
                {user && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                    onClick={() => {
                      logout();
                      setAuthError('');
                    }}
                  >
                    Sign Out Patron Account
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-page-root">
      <div className="admin-layout-wrapper">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-brand-name">NOVARA</span>
            <span className="sidebar-badge">Director Portal</span>
          </div>

          <div
            className="admin-session-indicator"
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
              fontSize: '0.8rem'
            }}
          >
            <div style={{ color: '#a5b4fc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }}></span>
              Director: {activeAdmin?.name || 'Administrator'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
              {activeAdmin?.email}
            </div>
            {user && user.role !== 'admin' && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.72rem',
                  color: '#c7d2fe'
                }}
              >
                Storefront Patron: <strong>{user.name}</strong> (Active)
              </div>
            )}
          </div>

          <nav className="sidebar-nav-list">
            <button
              className={`sidebar-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <SlidersHorizontal size={17} />
              <span>1. Dashboard</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={17} />
              <span>2. Products</span>
              <span className="sidebar-tab-pill">{products.length}</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <Layers size={17} />
              <span>3. Categories</span>
              <span className="sidebar-tab-pill">{categories.length}</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={17} />
              <span>4. Orders</span>
              <span className="sidebar-tab-pill">{orders.length}</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => setActiveTab('customers')}
            >
              <Users size={17} />
              <span>5. Customers</span>
              <span className="sidebar-tab-pill">{customers.length}</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <AlertTriangle size={17} />
              <span>6. Inventory</span>
              {lowStockItems.length > 0 && (
                <span className="sidebar-tab-pill">{lowStockItems.length}</span>
              )}
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              <Tag size={17} />
              <span>7. Coupons</span>
              <span className="sidebar-tab-pill">{coupons.length}</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <Star size={17} />
              <span>8. Reviews</span>
              <span className="sidebar-tab-pill">{reviews.length}</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart2 size={17} />
              <span>9. Analytics</span>
            </button>

            <button
              className={`sidebar-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={17} />
              <span>10. Settings</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div style={{ marginBottom: '12px' }}>
              <ThemeToggle showLabel={true} className="admin-sidebar-theme-btn" />
            </div>
            <Link to="/" className="store-return-btn">
              <ArrowLeft size={16} />
              <span>Return to Storefront</span>
            </Link>
            <button
              type="button"
              className="store-return-btn admin-logout-action-btn"
              style={{
                marginTop: '10px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#f87171',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '9px 14px',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                adminLogout();
                showToast(
                  user
                    ? `Director session ended. Patron session (${user.name}) remains active.`
                    : 'Administrator session ended.',
                  'info'
                );
              }}
            >
              <LogOut size={16} />
              <span>Sign Out Administrator</span>
            </button>
          </div>
        </aside>

        {/* Main Stage */}
        <main className="admin-main-stage">
          <header className="admin-stage-header">
            <div>
              <h1 className="stage-title">
                {activeTab === 'overview' && 'House Performance & Dashboard'}
                {activeTab === 'products' && 'Product Silhouette Management'}
                {activeTab === 'categories' && 'Atelier Category Management'}
                {activeTab === 'orders' && 'Patron Order Fulfillment'}
                {activeTab === 'customers' && 'Registered Patrons & Accounts'}
                {activeTab === 'inventory' && 'Inventory Management & Restocking'}
                {activeTab === 'coupons' && 'Promotional Coupon Management'}
                {activeTab === 'reviews' && 'Customer Reviews & Moderation'}
                {activeTab === 'analytics' && 'Executive Luxury Analytics'}
                {activeTab === 'settings' && 'Store Configuration & Policies'}
              </h1>
              <p className="stage-sub">
                Atelier operational controls and real-time database management.
              </p>
            </div>

            {activeTab === 'products' && (
              <button className="btn-primary" onClick={handleOpenAdd}>
                <Plus size={16} />
                <span>Add Silhouette</span>
              </button>
            )}

            {activeTab === 'categories' && (
              <button className="btn-primary" onClick={() => setIsCategoryModalOpen(true)}>
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            )}

            {activeTab === 'coupons' && (
              <button className="btn-primary" onClick={() => setIsCouponModalOpen(true)}>
                <Plus size={16} />
                <span>Create Coupon</span>
              </button>
            )}
          </header>

          {/* Metric Stats Cards */}
          <div className="admin-stats-grid">
            <div className="stat-box">
              <div className="stat-icon purple">
                <Package size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Catalog Products</span>
                <strong className="stat-number">{stats?.totalProducts ?? products.length}</strong>
                <span className="stat-subtext">Active Silhouettes</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon blue">
                <ShoppingBag size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Total Orders</span>
                <strong className="stat-number">{stats?.totalOrders ?? orders.length}</strong>
                <span className="stat-subtext">Patron Bookings</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon green">
                <DollarSign size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Gross Revenue</span>
                <strong className="stat-number">
                  ${Number(stats?.revenue ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </strong>
                <span className="stat-subtext">Settled Volume</span>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon orange">
                <Users size={22} />
              </div>
              <div className="stat-data">
                <span className="stat-label">Patron Accounts</span>
                <strong className="stat-number">{stats?.totalUsers ?? customers.length}</strong>
                <span className="stat-subtext">Registered Members</span>
              </div>
            </div>
          </div>

          {/* MODULE 1: DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="admin-content-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display, serif)' }}>
                Recent Atelier Orders
              </h3>
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Patron</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <strong>#{ord._id.slice(-8).toUpperCase()}</strong>
                        </td>
                        <td>{ord.customerInfo?.name || 'Patron'}</td>
                        <td>{ord.orderItems?.length || 1} items</td>
                        <td>
                          <strong>${ord.totalPrice?.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="table-category-tag">{ord.paymentMethod}</span>
                        </td>
                        <td>
                          <span className={`status-pill status-${ord.orderStatus.toLowerCase()}`}>
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 2: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="admin-content-card">
              <div className="table-toolbar">
                <div className="toolbar-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search catalog by name or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing {filteredProducts.length} of {products.length} pieces
                </span>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Badge</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
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
                                <span className="table-prod-gender">{p.sku ? `${p.sku} • ` : ''}{p.gender || 'Unisex'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="table-category-tag">{p.category}</span>
                          </td>
                          <td>
                            <strong>${p.price}.00</strong>
                          </td>
                          <td>
                            <div className="table-stock-stepper">
                              <button onClick={() => handleStockUpdate(id, p.stock, -1)}>-</button>
                              <span className={`stock-count ${p.stock <= 5 ? 'critical' : ''}`}>
                                {p.stock}
                              </span>
                              <button onClick={() => handleStockUpdate(id, p.stock, 1)}>+</button>
                            </div>
                          </td>
                          <td>
                            {p.badge ? (
                              <span className="table-badge-pill">{p.badge}</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td>
                            <div className="table-actions-group">
                              <button
                                className="table-action-btn edit"
                                onClick={() => handleOpenEdit(p)}
                                title="Edit Silhouette"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                className="table-action-btn delete"
                                onClick={() => handleDeleteProduct(id, p.name)}
                                title="Delete Silhouette"
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

          {/* MODULE 3: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="admin-content-card">
              <div className="categories-admin-grid">
                {categories.map((cat, idx) => (
                  <div key={idx} className="category-admin-card">
                    <img src={cat.image} alt={cat.name} className="category-card-img" />
                    <div className="category-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#0f172a' }}>
                          {cat.name}
                        </h4>
                        <span className="table-badge-pill">{cat.productCount || 0} Pieces</span>
                      </div>
                      <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                        {cat.description}
                      </p>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#dc2626' }}
                        onClick={() => handleDeleteCategory(cat.name)}
                      >
                        Remove Category
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 4: ORDER MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="admin-content-card">
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Patron Details</th>
                      <th>Pieces</th>
                      <th>Total</th>
                      <th>Settlement</th>
                      <th>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <strong>#{ord._id.slice(-8).toUpperCase()}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>
                            {formatOrderDateTimeIST(ord.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong>{ord.customerInfo?.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>
                              {ord.customerInfo?.email}
                            </span>
                          </div>
                        </td>
                        <td>{ord.orderItems?.length || 1} pieces</td>
                        <td>
                          <strong>${ord.totalPrice?.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="table-category-tag">{ord.paymentMethod}</span>
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

          {/* MODULE 5: CUSTOMER MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="admin-content-card">
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Patron Name</th>
                      <th>Email Coordinates</th>
                      <th>Role</th>
                      <th>Membership Tier</th>
                      <th>Patron Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.length > 0 ? (
                      customers.map((cust) => (
                        <tr key={cust._id}>
                          <td>
                            <strong>{cust.name}</strong>
                          </td>
                          <td>{cust.email}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                cust.role === 'admin' ? 'status-delivered' : 'status-confirmed'
                              }`}
                            >
                              {cust.role}
                            </span>
                          </td>
                          <td>{cust.membershipTier || 'Patron Privilège'}</td>
                          <td>
                            {cust.createdAt
                              ? new Date(cust.createdAt).toLocaleDateString()
                              : 'Active Member'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td><strong>Elena Rostova</strong></td>
                        <td>elena@novara.luxury</td>
                        <td><span className="status-pill status-confirmed">user</span></td>
                        <td>VIP Atelier Tier</td>
                        <td>Today</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 6: INVENTORY MANAGEMENT */}
          {activeTab === 'inventory' && (
            <div className="admin-content-card">
              <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: '#fffbeb', borderBottom: '1px solid #fef3c7' }}>
                <AlertTriangle size={28} color="#f59e0b" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#92400e' }}>
                    Low Inventory Watchlist (&le; 5 units)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309' }}>
                    Replenish atelier stock to avoid dispatch delays.
                  </p>
                </div>
              </div>

              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Silhouette</th>
                      <th>Category</th>
                      <th>Current Units</th>
                      <th>Quick Replenishment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((p) => {
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
                              <span className="stock-count critical">{p.stock} units</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                  onClick={() => handleStockUpdate(id, p.stock, 10)}
                                >
                                  +10 Units
                                </button>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                                  onClick={() => handleStockUpdate(id, p.stock, 25)}
                                >
                                  +25 Units
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: '#16a34a' }}>
                          ✓ All boutique inventory levels are currently optimal.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 7: COUPON MANAGEMENT */}
          {activeTab === 'coupons' && (
            <div className="admin-content-card">
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Type</th>
                      <th>Benefit</th>
                      <th>Min Order</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {
                      const id = c._id || c.code;
                      return (
                        <tr key={id}>
                          <td>
                            <strong style={{ fontFamily: 'monospace', letterSpacing: '0.08em', color: '#6d28d9' }}>
                              {c.code}
                            </strong>
                          </td>
                          <td>
                            <span className="table-category-tag">{c.discountType}</span>
                          </td>
                          <td>
                            <strong>
                              {c.discountType === 'percentage'
                                ? `${c.discountValue}% OFF`
                                : `$${c.discountValue} OFF`}
                            </strong>
                          </td>
                          <td>${c.minOrderAmount || 0}</td>
                          <td>
                            <span className={`status-pill ${c.isActive ? 'status-approved' : 'status-flagged'}`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-group">
                              <button
                                className="table-action-btn edit"
                                onClick={() => handleToggleCoupon(id)}
                                title="Toggle Status"
                              >
                                {c.isActive ? <ToggleRight size={18} color="#16a34a" /> : <ToggleLeft size={18} color="#dc2626" />}
                              </button>
                              <button
                                className="table-action-btn delete"
                                onClick={() => handleDeleteCoupon(id)}
                                title="Delete Coupon"
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

          {/* MODULE 8: REVIEW MANAGEMENT */}
          {activeTab === 'reviews' && (
            <div className="admin-content-card">
              <div className="table-toolbar">
                <div className="reviews-toolbar-left">
                  <div className="toolbar-search">
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Search patron, email, silhouette or comment..."
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                    />
                    {reviewSearch && (
                      <button
                        className="search-clear-btn"
                        onClick={() => setReviewSearch('')}
                        aria-label="Clear search"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="review-filter-group">
                    <Filter size={15} color="#64748b" />
                    <select
                      className="review-status-filter-select"
                      value={reviewStatusFilter}
                      onChange={(e) => setReviewStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses ({reviews.length})</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Flagged">Flagged</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="reviews-toolbar-right">
                  <button
                    className="btn-secondary refresh-btn"
                    onClick={fetchReviewsOnly}
                    disabled={reviewsLoading}
                    title="Refresh reviews from MongoDB"
                  >
                    <RotateCw size={15} className={reviewsLoading ? 'animate-spin' : ''} />
                    <span>{reviewsLoading ? 'Refreshing...' : 'Refresh Records'}</span>
                  </button>
                </div>
              </div>

              {reviewsError && (
                <div className="admin-error-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <span>{reviewsError}</span>
                  </div>
                  <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={fetchReviewsOnly}>
                    Retry
                  </button>
                </div>
              )}

              {reviewsLoading && reviews.length === 0 ? (
                <div className="admin-loading-state">
                  <div className="admin-loading-spinner" />
                  <p>Retrieving authentic patron reviews from MongoDB Atlas...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="admin-empty-reviews-state">
                  <div className="empty-reviews-icon">
                    <Star size={34} color="#818cf8" />
                  </div>
                  <h3>No Patron Reviews Found</h3>
                  <p>
                    {reviewSearch || reviewStatusFilter !== 'All'
                      ? 'No reviews match your current search and filter criteria.'
                      : 'No customer reviews have been submitted yet. When patrons review silhouettes, they will appear here.'}
                  </p>
                  {(reviewSearch || reviewStatusFilter !== 'All') && (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setReviewSearch('');
                        setReviewStatusFilter('All');
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Patron Reviewer</th>
                        <th>Silhouette</th>
                        <th>Rating</th>
                        <th>Comment &amp; Experience</th>
                        <th>Submission Date</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReviews.map((rev) => {
                        const reviewId = rev._id || rev.id;
                        const dateFormatted = rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Recent';
                        const timeFormatted = rev.createdAt
                          ? new Date(rev.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '';

                        return (
                          <tr key={reviewId}>
                            <td>
                              <div className="reviewer-table-cell">
                                <div className="reviewer-table-avatar">
                                  {(rev.userName || 'P').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong className="reviewer-table-name">{rev.userName}</strong>
                                  <span className="reviewer-table-email">
                                    {rev.userEmail || 'Unverified Guest'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="product-table-cell">
                                <strong className="product-table-name">
                                  {rev.productName || 'Atelier Silhouette'}
                                </strong>
                                {rev.productId && (
                                  <span className="product-table-id">
                                    ID: {String(rev.productId).slice(-6)}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <div className="rating-table-cell">
                                <div className="stars-row">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      fill={i < (rev.rating || 5) ? '#f59e0b' : 'none'}
                                      color="#f59e0b"
                                    />
                                  ))}
                                </div>
                                <span className="rating-score-text">
                                  {Number(rev.rating || 5).toFixed(1)} / 5.0
                                </span>
                              </div>
                            </td>

                            <td>
                              <p className="comment-table-text" title={rev.comment}>
                                "{rev.comment}"
                              </p>
                            </td>

                            <td>
                              <div className="date-table-cell">
                                <span className="date-main">{dateFormatted}</span>
                                {timeFormatted && <span className="date-time">{timeFormatted}</span>}
                              </div>
                            </td>

                            <td>
                              <select
                                className={`status-select ${(rev.status || 'Approved').toLowerCase()}`}
                                value={rev.status || 'Approved'}
                                onChange={(e) => handleReviewStatus(reviewId, e.target.value)}
                              >
                                <option value="Approved">Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Flagged">Flagged</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>

                            <td>
                              <div className="table-actions-group">
                                {rev.status !== 'Approved' && (
                                  <button
                                    className="table-action-btn approve"
                                    onClick={() => handleReviewStatus(reviewId, 'Approved')}
                                    title="Approve Review"
                                    aria-label="Approve Review"
                                  >
                                    <Check size={15} />
                                  </button>
                                )}
                                {rev.status !== 'Rejected' && (
                                  <button
                                    className="table-action-btn reject"
                                    onClick={() => handleReviewStatus(reviewId, 'Rejected')}
                                    title="Reject Review"
                                    aria-label="Reject Review"
                                  >
                                    <XCircle size={15} />
                                  </button>
                                )}
                                <button
                                  className="table-action-btn delete"
                                  onClick={() => handleDeleteReview(reviewId)}
                                  title="Permanently Delete Review"
                                  aria-label="Delete Review"
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
              )}
            </div>
          )}

          {/* MODULE 9: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div>
              {/* Primary Real KPIs from Database */}
              <div className="analytics-metric-row">
                <div className="analytics-card">
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Average Order Value (AOV)
                  </span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#0f172a', margin: '8px 0' }}>
                    ${Number(analyticsData.aov).toFixed(2)}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={14} /> From {analyticsData.validOrdersCount} active orders (${Number(analyticsData.grossRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </span>
                </div>

                <div className="analytics-card">
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Paid Checkout Settlement Rate
                  </span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#0f172a', margin: '8px 0' }}>
                    {analyticsData.checkoutConversionRate}%
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> {analyticsData.paidOrdersCount} of {analyticsData.totalOrdersCount} orders settled &amp; paid (${Number(analyticsData.paidRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                  </span>
                </div>

                <div className="analytics-card">
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Inventory Health Index
                  </span>
                  <strong style={{ display: 'block', fontSize: '1.8rem', fontFamily: 'var(--font-display)', color: '#0f172a', margin: '8px 0' }}>
                    {analyticsData.inventoryHealth}%
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: analyticsData.lowStockCount > 0 ? '#d97706' : '#64748b' }}>
                    {analyticsData.lowStockCount > 0
                      ? `${analyticsData.lowStockCount} silhouettes low in stock`
                      : `${analyticsData.inStockCount} of ${analyticsData.totalProductsCount} silhouettes in stock (>5 units)`}
                  </span>
                </div>
              </div>

              {/* Real Category Revenue Share from Actual MongoDB Order Line Items */}
              <div className="admin-content-card" style={{ padding: '28px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 4px 0' }}>
                      Category Revenue Share
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                      Revenue distribution aggregated from actual non-cancelled order line items.
                    </p>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#4338ca', background: '#e0e7ff', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600 }}>
                    Live MongoDB Orders
                  </span>
                </div>

                {analyticsData.categoryRevenueShare.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: '20px 0' }}>
                    No settled order items recorded yet to calculate category distribution.
                  </p>
                ) : (
                  analyticsData.categoryRevenueShare.map((catItem) => (
                    <div key={catItem.category} className="analytics-bar-row">
                      <span style={{ width: '130px', fontWeight: 600, color: '#334155' }}>
                        {catItem.category}
                      </span>
                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{ width: `${Math.max(catItem.percentage, 2)}%` }}
                        />
                      </div>
                      <strong style={{ width: '150px', textAlign: 'right', color: '#0f172a' }}>
                        {catItem.percentage}% (${Number(catItem.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </strong>
                    </div>
                  ))
                )}
              </div>

              {/* Live Payment Channels & Order Fulfillment Pipeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Payment Channels */}
                <div className="admin-content-card" style={{ padding: '24px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} color="#4f46e5" />
                    <span>Settled Payment Channels</span>
                  </h4>
                  {analyticsData.paymentMethodStats.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No payment records available.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analyticsData.paymentMethodStats.map((pay) => (
                        <div
                          key={pay._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <div>
                            <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{pay._id}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                              {pay.count} order{pay.count > 1 ? 's' : ''}
                            </span>
                          </div>
                          <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.95rem' }}>
                            ${Number(pay.volume).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order Pipeline */}
                <div className="admin-content-card" style={{ padding: '24px' }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={18} color="#7c3aed" />
                    <span>Order Fulfillment Pipeline</span>
                  </h4>
                  {analyticsData.orderStatusStats.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No orders in pipeline.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analyticsData.orderStatusStats.map((stat) => (
                        <div
                          key={stat._id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <span className={`status-pill status-${stat._id.toLowerCase()}`}>
                            {stat._id}
                          </span>
                          <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>
                            {stat.count} order{stat.count > 1 ? 's' : ''}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 10: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="admin-content-card">
              <form onSubmit={handleSaveSettings} className="settings-form-layout">
                <div>
                  <div className="form-group">
                    <label>Store Brand Name</label>
                    <input
                      type="text"
                      value={storeSettings?.storeName || 'NOVARA Haute Couture'}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, storeName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Concierge Email</label>
                    <input
                      type="email"
                      value={storeSettings?.contactEmail || 'concierge@novara.luxury'}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, contactEmail: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency Display</label>
                    <input
                      type="text"
                      value={storeSettings?.currencySymbol || '$'}
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, currencySymbol: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="form-group">
                    <label>Complimentary Courier Threshold ($)</label>
                    <input
                      type="number"
                      value={storeSettings?.freeShippingThreshold || 150}
                      onChange={(e) =>
                        setStoreSettings({
                          ...storeSettings,
                          freeShippingThreshold: Number(e.target.value)
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Top Announcement Banner Text</label>
                    <textarea
                      rows={3}
                      value={
                        storeSettings?.announcementText ||
                        'COMPLIMENTARY WORLDWIDE COURIER DELIVERY ON ORDERS ABOVE $150 • CODE: WELCOME10'
                      }
                      onChange={(e) =>
                        setStoreSettings({ ...storeSettings, announcementText: e.target.value })
                      }
                    />
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                      Save Atelier Configurations
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="admin-modal-root">
          <div className="admin-modal-backdrop" onClick={() => setIsProductModalOpen(false)} />
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Edit Silhouette' : 'Add New Luxury Silhouette'}</h3>
              <button className="modal-close" onClick={() => setIsProductModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Sovereign Cashmere Coat"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. NOV-OUT-001"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    required
                  >
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Outerwear">Outerwear</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Bags">Bags</option>
                    <option value="Watches">Watches</option>
                  </select>
                </div>

                <div className="form-group">
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
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Original Price ($)</label>
                  <input
                    type="number"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stock *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL *</label>
                <input
                  type="url"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
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
                  {editingProduct ? 'Save Changes' : 'Create Silhouette'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isCategoryModalOpen && (
        <div className="admin-modal-root">
          <div className="admin-modal-backdrop" onClick={() => setIsCategoryModalOpen(false)} />
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h3>Create Atelier Category</h3>
              <button className="modal-close" onClick={() => setIsCategoryModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="admin-modal-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fine Silk Scarves"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Artisan collection description..."
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, description: e.target.value })
                  }
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COUPON */}
      {isCouponModalOpen && (
        <div className="admin-modal-root">
          <div className="admin-modal-backdrop" onClick={() => setIsCouponModalOpen(false)} />
          <div className="admin-modal-dialog">
            <div className="admin-modal-header">
              <h3>Create Privilege Coupon</h3>
              <button className="modal-close" onClick={() => setIsCouponModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="admin-modal-form">
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LUXE25"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Minimum Order Amount ($)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Cap ($)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCouponModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
