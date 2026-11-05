import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- CUSTOMER API CLIENT (Storefront & Patron Operations) ---
export const customerApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor: attach Customer JWT token
customerApi.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('novara_customer_token') ||
      localStorage.getItem('novara_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: purge customer session if 401 on protected customer route
customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/register')
    ) {
      try {
        localStorage.removeItem('novara_customer_token');
        localStorage.removeItem('novara_token');
        localStorage.removeItem('novara_customer_user');
        localStorage.removeItem('novara_user');
      } catch { }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// --- ADMINISTRATOR API CLIENT (Director Portal & Atelier Control) ---
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor: attach dedicated Administrator JWT token
adminApi.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('novara_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: purge administrator session if 401 on admin routes
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/admin-login')
    ) {
      try {
        localStorage.removeItem('novara_admin_token');
        localStorage.removeItem('novara_admin_user');
      } catch { }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// Default export uses customer client for backward compatibility
export const api = customerApi;

// --- Auth Endpoints ---
export const authAPI = {
  register: (data) => customerApi.post('/auth/register', data).then((res) => res.data),
  login: (data) => customerApi.post('/auth/login', data).then((res) => res.data),
  adminLogin: (data) => adminApi.post('/auth/admin-login', data).then((res) => res.data),
  getProfile: () => customerApi.get('/auth/profile').then((res) => res.data),
  getAdminProfile: () => adminApi.get('/auth/admin-profile').then((res) => res.data),
  updateProfile: (data) => customerApi.put('/auth/profile', data).then((res) => res.data),
  logout: () => customerApi.post('/auth/logout').then((res) => res.data)
};

// --- Products Endpoints ---
export const productsAPI = {
  getProducts: (params = {}) => customerApi.get('/products', { params }).then((res) => res.data),
  getProductById: (id) => customerApi.get(`/products/${id}`).then((res) => res.data),
  createProduct: (data) => adminApi.post('/products', data).then((res) => res.data),
  updateProduct: (id, data) => adminApi.put(`/products/${id}`, data).then((res) => res.data),
  deleteProduct: (id) => adminApi.delete(`/products/${id}`).then((res) => res.data),
  updateStock: (id, stock) => adminApi.patch(`/products/${id}/stock`, { stock }).then((res) => res.data)
};

// --- Coupons Endpoints ---
export const couponsAPI = {
  validateCoupon: (code, subtotal) =>
    customerApi.post('/coupons/validate', { code, subtotal }).then((res) => res.data),
  getCoupons: () => adminApi.get('/coupons').then((res) => res.data),
  createCoupon: (data) => adminApi.post('/coupons', data).then((res) => res.data),
  deleteCoupon: (id) => adminApi.delete(`/coupons/${id}`).then((res) => res.data),
  toggleCoupon: (id) => adminApi.patch(`/coupons/${id}/toggle`).then((res) => res.data)
};

// --- Reviews Endpoints ---
export const reviewsAPI = {
  getReviews: (params = {}) => {
    const adminToken = localStorage.getItem('novara_admin_token');
    const client = adminToken ? adminApi : customerApi;
    return client.get('/reviews', { params }).then((res) => res.data);
  },
  createReview: (data) => customerApi.post('/reviews', data).then((res) => res.data),
  updateStatus: (id, status) => adminApi.patch(`/reviews/${id}/status`, { status }).then((res) => res.data),
  deleteReview: (id) => adminApi.delete(`/reviews/${id}`).then((res) => res.data)
};

// --- Categories Endpoints ---
export const categoriesAPI = {
  getCategories: () => customerApi.get('/categories').then((res) => res.data),
  createCategory: (data) => adminApi.post('/categories', data).then((res) => res.data),
  deleteCategory: (name) => adminApi.delete(`/categories/${name}`).then((res) => res.data)
};

// --- Settings Endpoints ---
export const settingsAPI = {
  getSettings: () => customerApi.get('/settings').then((res) => res.data),
  updateSettings: (data) => adminApi.put('/settings', data).then((res) => res.data)
};

// --- Cart Endpoints (Strictly Customer Session) ---
export const cartAPI = {
  getCart: () => customerApi.get('/cart').then((res) => res.data),
  addToCart: (data) => customerApi.post('/cart/add', data).then((res) => res.data),
  updateItem: (data) => customerApi.put('/cart/item', data).then((res) => res.data),
  removeItem: (data) => customerApi.delete('/cart/item', { data }).then((res) => res.data),
  clearCart: () => customerApi.delete('/cart/clear').then((res) => res.data),
  syncCart: (guestItems) => customerApi.post('/cart/sync', { guestItems }).then((res) => res.data)
};

// --- Wishlist Endpoints (Strictly Customer Session) ---
export const wishlistAPI = {
  getWishlist: () => customerApi.get('/wishlist').then((res) => res.data),
  addToWishlist: (productId) => customerApi.post('/wishlist/add', { productId }).then((res) => res.data),
  removeFromWishlist: (productId) => customerApi.delete(`/wishlist/${productId}`).then((res) => res.data),
  syncWishlist: (guestProducts) => customerApi.post('/wishlist/sync', { guestProducts }).then((res) => res.data)
};

// --- Orders Endpoints ---
export const ordersAPI = {
  createOrder: (orderData) => customerApi.post('/orders', orderData).then((res) => res.data),
  getOrderById: (id) => {
    const client =
      localStorage.getItem('novara_admin_token') && !localStorage.getItem('novara_customer_token')
        ? adminApi
        : customerApi;
    return client.get(`/orders/${id}`).then((res) => res.data);
  },
  getMyOrders: () => customerApi.get('/orders/myorders').then((res) => res.data),
  getAllOrders: () => adminApi.get('/orders').then((res) => res.data),
  updateOrderStatus: (id, status) => adminApi.patch(`/orders/${id}/status`, { status }).then((res) => res.data)
};

// --- Admin Endpoints (Strictly Admin Session) ---
export const adminAPI = {
  getStats: () => adminApi.get('/admin/stats').then((res) => res.data),
  getCustomers: () => adminApi.get('/admin/users').then((res) => res.data)
};

export default customerApi;
