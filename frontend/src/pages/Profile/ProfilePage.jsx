import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, SlidersHorizontal, LogOut } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { authAPI } from '../../services/api';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, adminUser, setUser, logout, showToast } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India'
  });

  const [isSaving, setIsSaving] = useState(false);

  // Synchronize formData whenever the authenticated user updates
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        street: user.address?.street || '',
        city: user.address?.city || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || 'India'
      });
    }
  }, [user]);

  // Fetch verified profile directly from MongoDB on mount to prevent stale context
  useEffect(() => {
    const token = localStorage.getItem('novara_customer_token') || localStorage.getItem('novara_token');
    if (token) {
      authAPI
        .getProfile()
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user);
            try {
              localStorage.setItem('novara_customer_user', JSON.stringify(res.user));
              localStorage.setItem('novara_user', JSON.stringify(res.user));
            } catch { }
          }
        })
        .catch((err) => {
          console.warn('[Profile fetch notice]', err.message);
          if (
            err.message &&
            (err.message.toLowerCase().includes('token') ||
              err.message.toLowerCase().includes('log in') ||
              err.message.toLowerCase().includes('access denied'))
          ) {
            logout();
          }
        });
    }
  }, [setUser, logout]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        }
      });
      if (res.success && res.user) {
        setUser(res.user);
        try {
          localStorage.setItem('novara_customer_user', JSON.stringify(res.user));
          localStorage.setItem('novara_user', JSON.stringify(res.user));
          if (res.token) {
            localStorage.setItem('novara_customer_token', res.token);
            localStorage.setItem('novara_token', res.token);
          }
        } catch { }
        showToast('Patron profile details updated successfully!');
      }
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page-root">
        <AnnouncementBar />
        <Navbar />
        <main className="container profile-page-container">
          <div className="cart-empty-view">
            <div className="cart-empty-icon">
              <User size={40} />
            </div>
            <h3>Patron Sign In Required</h3>
            <p>Please authenticate with your private credentials to view your profile ledger.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
              <Link to="/register" className="btn-secondary">
                Register
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="container profile-page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Patron Profile</span>
        </nav>

        <div className="profile-page-header">
          <h1 className="profile-page-title">Patron Portfolio &amp; Concierge</h1>
          <p className="profile-page-sub">
            Manage your personal credentials, bespoke shipping addresses, and maison privileges.
          </p>
        </div>

        <div className="profile-grid">
          {/* Left card */}
          <div className="patron-identity-card">
            <div className="patron-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <h2 className="patron-name">{user.name}</h2>
            <p className="patron-email">{user.email}</p>

            <span className="patron-tier-badge">
              ★ {user.role === 'admin' ? 'House Administrator' : user.membershipTier || 'Patron Privilège'}
            </span>

            <div className="profile-actions-stack">
              <Link to="/orders" className="prof-btn">
                <Package size={16} />
                <span>Order History &amp; Tracking</span>
              </Link>

              {(user.role === 'admin' || adminUser?.role === 'admin') && (
                <Link to="/admin" className="prof-btn admin-cta">
                  <SlidersHorizontal size={16} />
                  <span>Admin Management Hub</span>
                </Link>
              )}

              <button
                className="prof-btn logout"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Right form */}
          <div className="profile-settings-card">
            <h3 className="settings-sec-title">Contact &amp; Shipping Preferences</h3>
            <p className="settings-sec-desc">
              Update your personal contact details and bespoke delivery address.
            </p>

            <form onSubmit={handleSaveProfile} className="profile-form-grid">
              <div className="input-block">
                <label>Full Legal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-block">
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="input-block">
                <label>Primary Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Apartment, suite, street address"
                />
              </div>

              <div className="form-grid-3">
                <div className="input-block">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                  />
                </div>
                <div className="input-block">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="400001"
                  />
                </div>
                <div className="input-block">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="India"
                  />
                </div>
              </div>

              <button type="submit" className="save-profile-btn" disabled={isSaving}>
                {isSaving ? 'Updating...' : 'Save Patron Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

