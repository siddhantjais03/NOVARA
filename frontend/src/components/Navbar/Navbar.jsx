import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Sparkles,
  SlidersHorizontal,
  Package
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import './Navbar.css';

export const Navbar = ({ onOpenAdminDashboard }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('home');

  const navigate = useNavigate();
  const location = useLocation();

  const {
    cartCount,
    wishlistCount,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsAuthOpen,
    setIsOrderHistoryOpen,
    user,
    adminUser
  } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home', href: '#home', route: '/' },
    { id: 'shop', label: 'Shop', href: '#trending', route: '/shop' },
    { id: 'categories', label: 'Categories', href: '#categories', route: '/categories' },
    { id: 'bestsellers', label: 'Best Sellers', href: '#bestsellers', route: '/bestsellers' },
    { id: 'about', label: 'About', href: '#about', route: '/about' }
  ];

  const handleNavClick = (id, href, route) => {
    setActiveLink(id);
    setMobileMenuOpen(false);

    if (route) {
      navigate(route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (location.pathname === '/') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/' + href);
    }
  };

  const handleAdminClick = () => {
    if (onOpenAdminDashboard) {
      onOpenAdminDashboard();
    } else {
      navigate('/admin');
    }
  };

  return (
    <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Brand Logo */}
        <Link
          to="/"
          className="brand-logo"
          onClick={() => {
            setActiveLink('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="logo-symbol">
            <Sparkles size={16} className="logo-sparkle" />
          </div>
          <span className="logo-text">NOVARA</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <ul className="nav-menu">
            {navLinks.map((link) => (
              <li key={link.id} className="nav-item">
                <a
                  href={link.href}
                  className={`nav-link ${
                    (location.pathname === '/' && activeLink === link.id) ||
                    (location.pathname === '/shop' && link.id === 'shop')
                      ? 'active'
                      : ''
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id, link.href, link.route);
                  }}
                >
                  {link.label}
                  {((location.pathname === '/' && activeLink === link.id) ||
                    (location.pathname === '/shop' && link.id === 'shop')) && (
                    <span className="nav-indicator" />
                  )}
                </a>
              </li>
            ))}

            {/* Quick Admin Navigation pill for Admins */}
            {(adminUser?.role === 'admin' || user?.role === 'admin') && (
              <li className="nav-item">
                <button
                  className="nav-link admin-pill-link"
                  onClick={handleAdminClick}
                >
                  <SlidersHorizontal size={14} />
                  <span>Admin Hub</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Utility / Icon Actions */}
        <div className="navbar-actions">
          {/* Search Trigger */}
          <button
            className="action-btn search-trigger"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search products"
            title="Search products (Ctrl+K)"
          >
            <Search size={20} />
            <span className="search-pill-label">Search</span>
            <kbd className="search-shortcut">⌘K</kbd>
          </button>

          {/* Orders History Quick Button */}
          <button
            className="action-btn icon-only order-history-btn"
            onClick={() => setIsOrderHistoryOpen(true)}
            aria-label="Order Tracking & History"
            title="Order Archive & Tracking"
          >
            <Package size={20} />
          </button>

          {/* Wishlist Button */}
          <button
            className="action-btn icon-only wishlist-btn"
            onClick={() => setIsWishlistOpen(true)}
            aria-label="Open wishlist"
            title="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="badge-counter badge-wishlist">{wishlistCount}</span>
            )}
          </button>

          {/* Cart Button */}
          <button
            className="action-btn cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open shopping bag"
            title="Shopping Bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="badge-counter badge-cart">{cartCount}</span>
            )}
          </button>

          {/* User Account / Login Button */}
          <button
            className="action-btn login-btn"
            onClick={() => {
              if (user) {
                navigate('/profile');
              } else {
                setIsAuthOpen(true);
              }
            }}
            aria-label="User Account"
            title={user ? user.name : 'Sign in to NOVARA'}
          >
            <User size={19} />
            <span className="login-label">
              {user ? user.name.split(' ')[0] : 'Login'}
            </span>
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-inner">
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button
              className="mobile-close-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <ul className="mobile-nav-links">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className={`mobile-nav-item ${activeLink === link.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.id, link.href, link.route);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}

            <li>
              <button
                className="mobile-nav-item"
                style={{ width: '100%', textAlign: 'left', background: 'none' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/wishlist');
                }}
              >
                Wishlist ({wishlistCount})
              </button>
            </li>

            <li>
              <button
                className="mobile-nav-item"
                style={{ width: '100%', textAlign: 'left', background: 'none' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/cart');
                }}
              >
                Shopping Bag ({cartCount})
              </button>
            </li>

            <li>
              <button
                className="mobile-nav-item"
                style={{ width: '100%', textAlign: 'left', background: 'none' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/orders');
                }}
              >
                Track Orders &amp; Archive
              </button>
            </li>

            {(adminUser?.role === 'admin' || user?.role === 'admin') && (
              <li>
                <button
                  className="mobile-nav-item"
                  style={{ width: '100%', textAlign: 'left', color: 'var(--color-primary)' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAdminClick();
                  }}
                >
                  Admin Management Hub
                </button>
              </li>
            )}
          </ul>

          <div className="mobile-nav-footer">
            <ThemeToggle showLabel={true} className="mobile-theme-toggle" />
            <button
              className="mobile-account-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                if (user) {
                  navigate('/profile');
                } else {
                  setIsAuthOpen(true);
                }
              }}
            >
              <User size={18} />
              <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
            </button>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};
