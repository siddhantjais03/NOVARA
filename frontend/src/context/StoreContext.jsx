import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { PRODUCTS_DATA } from '../data/products';
import { authAPI, productsAPI, cartAPI, wishlistAPI, settingsAPI } from '../services/api';

const StoreContext = createContext();

let toastCounter = 0;

export const StoreProvider = ({ children }) => {
  // All Catalog Products
  const [allProducts, setAllProducts] = useState(PRODUCTS_DATA);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Store Settings (from MongoDB)
  const [storeSettings, setStoreSettings] = useState(null);

  // Authenticated Patron State (Customer Session)
  const [user, setUser] = useState(() => {
    try {
      const token =
        localStorage.getItem('novara_customer_token') ||
        localStorage.getItem('novara_token');
      const savedUser =
        localStorage.getItem('novara_customer_user') ||
        localStorage.getItem('novara_user');
      if (token && savedUser) {
        const parsed = JSON.parse(savedUser);
        // Customer session must strictly belong to a customer patron, never an administrator
        if (parsed?.role === 'admin') {
          return null;
        }
        return parsed;
      }
    } catch { }
    return null;
  });

  // Authenticated Administrator State (Independent Admin Session)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const adminToken = localStorage.getItem('novara_admin_token');
      const savedAdmin = localStorage.getItem('novara_admin_user');
      if (adminToken && savedAdmin) {
        return JSON.parse(savedAdmin);
      }
    } catch { }
    return null;
  });

  // Cart State (loaded from localStorage if present, else empty/default)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_cart');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [
      {
        product: PRODUCTS_DATA[0],
        quantity: 1,
        selectedColor: PRODUCTS_DATA[0].colors?.[0] || { name: 'Camel', hex: '#c19a6b' },
        selectedSize: 'M'
      }
    ];
  });

  // Wishlist State (loaded from localStorage if present, else default)
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_wishlist');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [PRODUCTS_DATA[1], PRODUCTS_DATA[2]];
  });

  // Recently Viewed Products
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('novara_recently_viewed');
      if (saved) return JSON.parse(saved);
    } catch { }
    return [PRODUCTS_DATA[0], PRODUCTS_DATA[3], PRODUCTS_DATA[4]];
  });

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Latest Placed Order for Confirmation
  const [latestOrder, setLatestOrder] = useState(null);

  // Toast System
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    toastCounter += 1;
    const id = toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Cart to localStorage for guests / offline caching
  useEffect(() => {
    try {
      localStorage.setItem('novara_cart', JSON.stringify(cartItems));
    } catch { }
  }, [cartItems]);

  // Sync Wishlist to localStorage for guests / offline caching
  useEffect(() => {
    try {
      localStorage.setItem('novara_wishlist', JSON.stringify(wishlistItems));
    } catch { }
  }, [wishlistItems]);

  // Sync Recently Viewed to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('novara_recently_viewed', JSON.stringify(recentlyViewed));
    } catch { }
  }, [recentlyViewed]);

  // Add to Recently Viewed (memoized to prevent unnecessary re-render chains)
  const addRecentlyViewed = React.useCallback((product) => {
    if (!product) return;
    const prodId = product._id || product.id;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => (p._id || p.id) !== prodId);
      return [product, ...filtered].slice(0, 8);
    });
  }, []);

  // 1. Fetch live products from backend on mount
  const refreshProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await productsAPI.getProducts({ limit: 200 });
      if (res.success && res.products && res.products.length > 0) {
        setAllProducts(res.products);
      }
    } catch {
      // Retain initial products if backend is loading
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // 2. Fetch live store settings from MongoDB
  const refreshSettings = async () => {
    try {
      const res = await settingsAPI.getSettings();
      if (res.success && res.settings) {
        setStoreSettings(res.settings);
      }
    } catch (err) {
      console.warn('[Settings Load Error]', err);
    }
  };

  useEffect(() => {
    refreshProducts();
    refreshSettings();
  }, []);

  // 3a. Restore customer session, cart and wishlist from MongoDB
  useEffect(() => {
    const customerToken =
      localStorage.getItem('novara_customer_token') ||
      localStorage.getItem('novara_token');

    if (customerToken) {
      authAPI
        .getProfile()
        .then(async (res) => {
          if (res.success && res.user) {
            // Customer session must strictly belong to a customer patron, never an administrator
            if (res.user.role === 'admin') {
              setUser(null);
              return;
            }
            setUser(res.user);
            try {
              localStorage.setItem('novara_customer_user', JSON.stringify(res.user));
              localStorage.setItem('novara_user', JSON.stringify(res.user));
            } catch { }

            try {
              const [cartRes, wishRes] = await Promise.all([
                cartAPI.getCart().catch(() => null),
                wishlistAPI.getWishlist().catch(() => null)
              ]);
              if (cartRes?.success && cartRes.cart?.items) {
                setCartItems(cartRes.cart.items);
              }
              if (wishRes?.success && wishRes.wishlist?.products) {
                setWishlistItems(wishRes.wishlist.products);
              }
            } catch (err) {
              console.warn('[Cart/Wishlist Restore Notice]', err);
            }
          } else {
            localStorage.removeItem('novara_customer_token');
            localStorage.removeItem('novara_token');
            localStorage.removeItem('novara_customer_user');
            localStorage.removeItem('novara_user');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('novara_customer_token');
          localStorage.removeItem('novara_token');
          localStorage.removeItem('novara_customer_user');
          localStorage.removeItem('novara_user');
          setUser(null);
        });
    } else {
      localStorage.removeItem('novara_customer_user');
      localStorage.removeItem('novara_user');
      setUser(null);
    }
  }, []);

  // 3b. Restore administrator session from MongoDB (independent from customer session)
  useEffect(() => {
    const adminToken = localStorage.getItem('novara_admin_token');
    if (adminToken) {
      authAPI
        .getAdminProfile()
        .then((res) => {
          if (res.success && res.admin) {
            setAdminUser(res.admin);
            try {
              localStorage.setItem('novara_admin_user', JSON.stringify(res.admin));
            } catch { }
          } else {
            localStorage.removeItem('novara_admin_token');
            localStorage.removeItem('novara_admin_user');
            setAdminUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('novara_admin_token');
          localStorage.removeItem('novara_admin_user');
          setAdminUser(null);
        });
    } else {
      localStorage.removeItem('novara_admin_user');
      setAdminUser(null);
    }
  }, []);

  // Multi-tab storage sync to eliminate conflicting sessions
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Sync Customer session across tabs
      if (
        e.key === 'novara_customer_token' ||
        e.key === 'novara_token' ||
        e.key === 'novara_customer_user' ||
        e.key === 'novara_user'
      ) {
        const token =
          localStorage.getItem('novara_customer_token') ||
          localStorage.getItem('novara_token');
        const savedUser =
          localStorage.getItem('novara_customer_user') ||
          localStorage.getItem('novara_user');
        if (!token) {
          setUser(null);
        } else if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch { }
        }
      }

      // Sync Admin session across tabs
      if (e.key === 'novara_admin_token' || e.key === 'novara_admin_user') {
        const adminToken = localStorage.getItem('novara_admin_token');
        const savedAdmin = localStorage.getItem('novara_admin_user');
        if (!adminToken) {
          setAdminUser(null);
        } else if (savedAdmin) {
          try {
            setAdminUser(JSON.parse(savedAdmin));
          } catch { }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Synchronize guest cart and wishlist to MongoDB upon login or registration
  const syncGuestDataToDB = async (guestCart, guestWishlist) => {
    try {
      const [cartSyncRes, wishSyncRes] = await Promise.all([
        guestCart && guestCart.length > 0
          ? cartAPI.syncCart(guestCart).catch(() => null)
          : cartAPI.getCart().catch(() => null),
        guestWishlist && guestWishlist.length > 0
          ? wishlistAPI.syncWishlist(guestWishlist).catch(() => null)
          : wishlistAPI.getWishlist().catch(() => null)
      ]);

      if (cartSyncRes?.success && cartSyncRes.cart?.items) {
        setCartItems(cartSyncRes.cart.items);
      }
      if (wishSyncRes?.success && wishSyncRes.wishlist?.products) {
        setWishlistItems(wishSyncRes.wishlist.products);
      }
    } catch (err) {
      console.warn('[Cart/Wishlist Sync Notice]', err);
    }
  };

  // Customer Login handler (Strictly Customer Session - preserves Admin session)
  const login = async (email, password) => {
    const guestCartSnapshot = [...cartItems];
    const guestWishlistSnapshot = [...wishlistItems];

    const res = await authAPI.login({ email, password });
    if (res.success && res.token && res.user) {
      localStorage.setItem('novara_customer_token', res.token);
      localStorage.setItem('novara_token', res.token);
      localStorage.setItem('novara_customer_user', JSON.stringify(res.user));
      localStorage.setItem('novara_user', JSON.stringify(res.user));
      setUser(res.user);
      await syncGuestDataToDB(guestCartSnapshot, guestWishlistSnapshot);
      return res;
    }
    throw new Error(res.message || 'Login failed.');
  };

  // Administrator Login handler (Strictly Admin Session - preserves Customer session)
  const adminLogin = async (email, password) => {
    const res = await authAPI.adminLogin({ email, password });
    if (res.success && res.token && res.user) {
      if (res.user.role !== 'admin') {
        throw new Error('Access Denied: Account does not possess administrator privileges.');
      }
      localStorage.setItem('novara_admin_token', res.token);
      localStorage.setItem('novara_admin_user', JSON.stringify(res.user));
      setAdminUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Administrator authentication failed.');
  };

  // Customer Register handler
  const register = async (userData) => {
    const guestCartSnapshot = [...cartItems];
    const guestWishlistSnapshot = [...wishlistItems];

    const res = await authAPI.register(userData);
    if (res.success && res.token && res.user) {
      localStorage.setItem('novara_customer_token', res.token);
      localStorage.setItem('novara_token', res.token);
      localStorage.setItem('novara_customer_user', JSON.stringify(res.user));
      localStorage.setItem('novara_user', JSON.stringify(res.user));
      setUser(res.user);
      await syncGuestDataToDB(guestCartSnapshot, guestWishlistSnapshot);
      return res;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  // Customer Logout handler (Does NOT affect active Administrator session)
  const logout = () => {
    localStorage.removeItem('novara_customer_token');
    localStorage.removeItem('novara_token');
    localStorage.removeItem('novara_customer_user');
    localStorage.removeItem('novara_user');
    sessionStorage.removeItem('novara_customer_token');
    sessionStorage.removeItem('novara_token');
    sessionStorage.removeItem('novara_user');
    localStorage.removeItem('novara_cart');
    localStorage.removeItem('novara_wishlist');
    setUser(null);
    setCartItems([]);
    setWishlistItems([]);
    authAPI.logout().catch(() => {});
    showToast('Signed out of customer account.', 'info');
  };

  // Administrator Logout handler (Does NOT affect active Customer session)
  const adminLogout = () => {
    localStorage.removeItem('novara_admin_token');
    localStorage.removeItem('novara_admin_user');
    sessionStorage.removeItem('novara_admin_token');
    sessionStorage.removeItem('novara_admin_user');
    setAdminUser(null);
    showToast('Administrator session signed out.', 'info');
  };

  // In-flight tracking to prevent duplicate concurrent network requests on rapid clicks
  const inFlightWishlistRef = useRef(new Set());
  const cartDebounceTimersRef = useRef({});

  // Set-based lookup for O(1) instant checking
  const wishlistIdSet = useMemo(() => {
    const set = new Set();
    for (const item of wishlistItems) {
      if (item._id) set.add(String(item._id));
      if (item.id) set.add(String(item.id));
    }
    return set;
  }, [wishlistItems]);

  const isInWishlist = useCallback((productId) => {
    if (!productId) return false;
    return wishlistIdSet.has(String(productId));
  }, [wishlistIdSet]);

  const wishlistCount = wishlistItems.length;

  // Optimistic Wishlist toggle with non-blocking MongoDB background synchronization
  const toggleWishlist = useCallback((product) => {
    if (!product) return;
    const prodId = String(product._id || product.id);

    // Prevent duplicate concurrent requests on repeated clicks
    if (inFlightWishlistRef.current.has(prodId)) {
      return;
    }

    const isCurrentlyLiked = wishlistIdSet.has(prodId);
    const previousWishlist = [...wishlistItems];

    // 1. OPTIMISTIC INSTANT UPDATE (0ms UI latency)
    if (isCurrentlyLiked) {
      setWishlistItems((prev) =>
        prev.filter((item) => String(item._id || item.id) !== prodId)
      );
      showToast(`Removed "${product.name}" from your wishlist.`, 'info');
    } else {
      setWishlistItems((prev) => {
        // Enforce uniqueness to prevent duplicate entries
        if (prev.some((item) => String(item._id || item.id) === prodId)) {
          return prev;
        }
        return [...prev, product];
      });
      showToast(`Saved "${product.name}" to your wishlist!`);
      addRecentlyViewed(product);
    }

    // 2. BACKGROUND MONGODB SYNCHRONIZATION (Non-blocking)
    if (user) {
      inFlightWishlistRef.current.add(prodId);
      const apiCall = isCurrentlyLiked
        ? wishlistAPI.removeFromWishlist(prodId)
        : wishlistAPI.addToWishlist(prodId);

      apiCall
        .then((res) => {
          if (res?.success && Array.isArray(res.wishlist?.products)) {
            // Reconcile with authoritative database list
            setWishlistItems(res.wishlist.products);
          }
        })
        .catch((err) => {
          console.warn('[Wishlist sync error — rolling back optimistic state]', err);
          // ROLLBACK on network or server failure
          setWishlistItems(previousWishlist);
          showToast(err.message || 'Could not update wishlist on server. Changes reverted.', 'error');
        })
        .finally(() => {
          inFlightWishlistRef.current.delete(prodId);
        });
    }
  }, [user, wishlistIdSet, wishlistItems, showToast, addRecentlyViewed]);

  // Optimistic Add to Cart with non-blocking MongoDB background synchronization
  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    if (!product) return false;
    const prodId = String(product._id || product.id);
    const availableStock = product.stock !== undefined ? product.stock : 10;

    if (availableStock <= 0) {
      showToast(`"${product.name}" is currently out of stock.`, 'info');
      return false;
    }

    const selectedSize = options.selectedSize || product.sizes?.[0] || 'M';
    const selectedColor = options.selectedColor || product.colors?.[0] || { name: 'Default', hex: '#000000' };

    // Stock check against current cart quantity
    const existingIndex = cartItems.findIndex(
      (item) =>
        String(item.product?._id || item.product?.id || item.product) === prodId &&
        item.selectedSize === selectedSize
    );
    const currentQty = existingIndex > -1 ? cartItems[existingIndex].quantity : 0;
    const newTotalQty = currentQty + quantity;

    if (newTotalQty > availableStock) {
      showToast(`Cannot add more. Available stock limit of ${availableStock} reached.`, 'info');
      return false;
    }

    const previousCart = [...cartItems];

    // 1. OPTIMISTIC INSTANT UPDATE (0ms UI latency)
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (item) =>
          String(item.product?._id || item.product?.id || item.product) === prodId &&
          item.selectedSize === selectedSize
      );

      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(availableStock, updated[idx].quantity + quantity)
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(quantity, availableStock),
            selectedColor,
            selectedSize
          }
        ];
      }
    });

    showToast(`Added "${product.name}" to your shopping bag.`);
    addRecentlyViewed(product);

    // 2. BACKGROUND MONGODB SYNCHRONIZATION (Non-blocking)
    if (user) {
      cartAPI.addToCart({
        productId: prodId,
        quantity,
        selectedSize,
        selectedColor
      })
        .then((res) => {
          if (res?.success && Array.isArray(res.cart?.items)) {
            setCartItems(res.cart.items);
          }
        })
        .catch((err) => {
          console.warn('[Cart add sync error — rolling back optimistic state]', err);
          // ROLLBACK on network/server error
          setCartItems(previousCart);
          showToast(err.message || `Could not add "${product.name}" to cart on server`, 'error');
        });
    }

    return true;
  }, [user, cartItems, showToast, addRecentlyViewed]);

  // Optimistic Remove from Cart with non-blocking MongoDB background synchronization
  const removeFromCart = useCallback((productId, selectedSize) => {
    if (!productId) return;
    const prodId = String(productId);
    const previousCart = [...cartItems];

    // 1. OPTIMISTIC INSTANT UPDATE (0ms UI latency)
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            String(item.product?._id || item.product?.id || item.product) === prodId &&
            (!selectedSize || item.selectedSize === selectedSize)
          )
      )
    );
    showToast('Item removed from shopping bag.', 'info');

    // 2. BACKGROUND MONGODB SYNCHRONIZATION (Non-blocking)
    if (user) {
      cartAPI.removeItem({ productId: prodId, selectedSize })
        .then((res) => {
          if (res?.success && Array.isArray(res.cart?.items)) {
            setCartItems(res.cart.items);
          }
        })
        .catch((err) => {
          console.warn('[Cart remove sync error — rolling back optimistic state]', err);
          // ROLLBACK
          setCartItems(previousCart);
          showToast(err.message || 'Could not remove item from server cart', 'error');
        });
    }
  }, [user, cartItems, showToast]);

  // Optimistic Update Quantity with debounce and non-blocking MongoDB background synchronization
  const updateQuantity = useCallback((productId, selectedSize, quantity) => {
    if (!productId) return;
    const prodId = String(productId);

    if (quantity <= 0) {
      removeFromCart(prodId, selectedSize);
      return;
    }

    const previousCart = [...cartItems];

    // Find product stock limit
    const target = cartItems.find(
      (item) =>
        String(item.product?._id || item.product?.id || item.product) === prodId &&
        (!selectedSize || item.selectedSize === selectedSize)
    );

    const availableStock = target?.product?.stock !== undefined ? target.product.stock : 10;
    let finalQty = quantity;
    if (finalQty > availableStock) {
      showToast(`Stock limit reached. Only ${availableStock} pieces available.`, 'info');
      finalQty = availableStock;
    }

    // 1. OPTIMISTIC INSTANT UPDATE (0ms UI latency)
    setCartItems((prev) =>
      prev.map((item) =>
        String(item.product?._id || item.product?.id || item.product) === prodId &&
        (!selectedSize || item.selectedSize === selectedSize)
          ? { ...item, quantity: finalQty }
          : item
      )
    );

    // 2. DEBOUNCED BACKGROUND MONGODB SYNCHRONIZATION
    if (user) {
      const timerKey = `${prodId}_${selectedSize || 'default'}`;
      if (cartDebounceTimersRef.current[timerKey]) {
        clearTimeout(cartDebounceTimersRef.current[timerKey]);
      }

      cartDebounceTimersRef.current[timerKey] = setTimeout(() => {
        delete cartDebounceTimersRef.current[timerKey];
        cartAPI.updateItem({ productId: prodId, selectedSize, quantity: finalQty })
          .then((res) => {
            if (res?.success && Array.isArray(res.cart?.items)) {
              setCartItems(res.cart.items);
            }
          })
          .catch((err) => {
            console.warn('[Cart update quantity sync error — rolling back]', err);
            // ROLLBACK
            setCartItems(previousCart);
            showToast(err.message || 'Could not update quantity on server', 'error');
          });
      }, 350);
    }
  }, [user, cartItems, removeFromCart, showToast]);

  // Optimistic Clear Cart
  const clearCart = useCallback(() => {
    const previousCart = [...cartItems];
    setCartItems([]);

    if (user) {
      cartAPI.clearCart()
        .catch((err) => {
          console.warn('[Cart clear sync error — rolling back]', err);
          setCartItems(previousCart);
          showToast('Could not clear cart on server', 'error');
        });
    }
  }, [user, cartItems, showToast]);

  // Instant Memoized Cart Metrics
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || item.price || 0;
      return acc + price * (item.quantity || 1);
    }, 0);
  }, [cartItems]);

  // Dynamic Free shipping threshold from MongoDB settings (default: $150)
  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 150;
  const shippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  // Quick View
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    addRecentlyViewed(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  // Keyboard shortcut listener (Cmd/Ctrl + K, Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCartOpen(false);
        setIsWishlistOpen(false);
        setIsSearchOpen(false);
        setIsAuthOpen(false);
        setIsCheckoutOpen(false);
        setIsOrderSuccessOpen(false);
        setIsOrderHistoryOpen(false);
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    const isAnyModalOpen =
      isCartOpen ||
      isWishlistOpen ||
      isSearchOpen ||
      isAuthOpen ||
      isCheckoutOpen ||
      isOrderSuccessOpen ||
      isOrderHistoryOpen ||
      quickViewProduct !== null;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [
    isCartOpen,
    isWishlistOpen,
    isSearchOpen,
    isAuthOpen,
    isCheckoutOpen,
    isOrderSuccessOpen,
    isOrderHistoryOpen,
    quickViewProduct
  ]);

  return (
    <StoreContext.Provider
      value={{
        // Products Catalog
        allProducts,
        isLoadingProducts,
        refreshProducts,

        // Store Settings
        storeSettings,
        refreshSettings,

        // Cart
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        freeShippingThreshold,
        shippingProgress,
        isCartOpen,
        setIsCartOpen,

        // Wishlist
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isWishlistOpen,
        setIsWishlistOpen,

        // Recently Viewed
        recentlyViewed,
        addRecentlyViewed,

        // Quick View
        quickViewProduct,
        openQuickView,
        closeQuickView,

        // Search
        isSearchOpen,
        setIsSearchOpen,

        // Checkout & Orders
        isCheckoutOpen,
        setIsCheckoutOpen,
        isOrderSuccessOpen,
        setIsOrderSuccessOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        latestOrder,
        setLatestOrder,

        // Customer Auth
        isAuthOpen,
        setIsAuthOpen,
        user,
        setUser,
        login,
        register,
        logout,

        // Administrator Auth (Independent Session)
        adminUser,
        setAdminUser,
        adminLogin,
        adminLogout,

        // Toasts
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
