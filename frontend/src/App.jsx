import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import { HomePage } from './pages/Home/HomePage';
import { ShopPage } from './pages/Shop/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetails/ProductDetailsPage';
import { SearchPage } from './pages/Search/SearchPage';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { WishlistPage } from './pages/Wishlist/WishlistPage';
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { PaymentPage } from './pages/Payment/PaymentPage';
import { OrderConfirmationPage } from './pages/OrderConfirmation/OrderConfirmationPage';
import { MyOrdersPage } from './pages/MyOrders/MyOrdersPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { AboutPage } from './pages/About/AboutPage';
import { ContactPage } from './pages/Contact/ContactPage';
import { FaqPage } from './pages/Faq/FaqPage';
import { PrivacyPolicyPage } from './pages/Legal/PrivacyPolicyPage';
import { TermsPage } from './pages/Legal/TermsPage';
import { AdminPage } from './pages/Admin/AdminPage';
import { AdminRoute } from './components/AdminRoute/AdminRoute';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { BestSellersPage } from './pages/BestSellers/BestSellersPage';

// Global Overlays & Modals
import { CartDrawer } from './components/Modals/CartDrawer';
import { WishlistDrawer } from './components/Modals/WishlistDrawer';
import { SearchModal } from './components/Modals/SearchModal';
import { QuickViewModal } from './components/Modals/QuickViewModal';
import { AuthModal } from './components/Modals/AuthModal';
import { CheckoutModal } from './components/Modals/CheckoutModal';
import { OrderSuccessModal } from './components/Modals/OrderSuccessModal';
import { OrderHistoryModal } from './components/Modals/OrderHistoryModal';
import { Toast } from './components/Toast/Toast';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <StoreProvider>
          <div className="novara-app-root">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/bestsellers" element={<BestSellersPage />} />
              <Route path="/best-sellers" element={<BestSellersPage />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/orders" element={<MyOrdersPage />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms-and-conditions" element={<TermsPage />} />
              <Route path="/admin" element={<AdminRoute />} />
              <Route path="/admin/*" element={<AdminRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Interactive Modals and Drawers accessible everywhere */}
            <CartDrawer />
            <WishlistDrawer />
            <SearchModal />
            <QuickViewModal />
            <AuthModal />
            <CheckoutModal />
            <OrderSuccessModal />
            <OrderHistoryModal />
            <Toast />
          </div>
        </StoreProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
