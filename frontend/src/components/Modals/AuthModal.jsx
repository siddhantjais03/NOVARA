import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  LogOut
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './AuthModal.css';

export const AuthModal = ({ onOpenAdminDashboard }) => {
  const navigate = useNavigate();
  const {
    isAuthOpen,
    setIsAuthOpen,
    user,
    adminUser,
    login,
    register,
    logout,
    setIsOrderHistoryOpen,
    showToast
  } = useStore();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password.', 'info');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        showToast('Welcome back to NOVARA!');
      } else {
        await register({ name: fullName, email, password });
        showToast('Your NOVARA account has been created successfully!');
      }
      setIsAuthOpen(false);
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminSignIn = async () => {
    setLoading(true);
    try {
      await login('admin@novara.luxury', 'Admin@Novara2026!');
      showToast('Signed in as House Administrator.');
      setIsAuthOpen(false);
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPatronSignIn = async () => {
    setLoading(true);
    try {
      await login('elena@novara.luxury', 'Password123!');
      showToast('Signed in as Patron Elena Rostova.');
      setIsAuthOpen(false);
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-root">
      <div className="auth-backdrop" onClick={() => setIsAuthOpen(false)} />

      <div className="auth-dialog" role="dialog" aria-modal="true" aria-label="Sign In">
        <button
          className="auth-close-btn"
          onClick={() => setIsAuthOpen(false)}
          aria-label="Close authentication"
        >
          <X size={20} />
        </button>

        <div className="auth-content">
          <div className="auth-brand-badge">
            <Sparkles size={20} />
          </div>

          <h2 className="auth-title">
            {user ? 'Patron Profile' : tab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>

          <p className="auth-subtitle">
            {user
              ? 'Manage your orders, saved archival pieces, and atelier consultations.'
              : tab === 'login'
              ? 'Access your private NOVARA account, order histories, and bespoke privileges.'
              : 'Join the Novara Collective to unlock complimentary express delivery and VIP drops.'}
          </p>

          {user ? (
            /* Logged in state */
            <div className="auth-user-view">
              <div className="user-profile-card">
                <div className="user-avatar-circle">{user.name.charAt(0)}</div>
                <div className="user-details">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                  <span className="badge-pill badge-pill-gradient user-tier-badge">
                    ★ {user.role === 'admin' ? 'Administrator' : user.membershipTier || 'Patron Privilège'}
                  </span>
                </div>
              </div>

              {/* Order History Button */}
              <button
                className="btn-secondary user-action-block"
                onClick={() => {
                  setIsAuthOpen(false);
                  setIsOrderHistoryOpen(true);
                }}
              >
                <Package size={18} />
                <span>View Order History &amp; Status</span>
              </button>

              {/* Admin Dashboard shortcut if admin */}
              {(user.role === 'admin' || adminUser?.role === 'admin') && (
                <button
                  className="btn-primary user-action-block admin-cta"
                  onClick={() => {
                    setIsAuthOpen(false);
                    if (onOpenAdminDashboard) {
                      onOpenAdminDashboard();
                    } else {
                      navigate('/admin');
                    }
                  }}
                >
                  <SlidersHorizontal size={18} />
                  <span>Launch Admin Management Dashboard</span>
                </button>
              )}

              <button className="btn-secondary auth-logout-btn" onClick={logout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Form tabs */
            <>
              <div className="auth-tab-switch">
                <button
                  className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
                  onClick={() => setTab('login')}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
                  onClick={() => setTab('register')}
                >
                  Create Account
                </button>
              </div>

              <form className="auth-form" onSubmit={handleLoginSubmit}>
                {tab === 'register' && (
                  <div className="auth-input-group">
                    <label>Full Name</label>
                    <div className="auth-input-wrapper">
                      <UserIcon size={18} className="auth-field-icon" />
                      <input
                        type="text"
                        placeholder="Elena Rostova"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={18} className="auth-field-icon" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="auth-pass-header">
                    <label>Password</label>
                  </div>
                  <div className="auth-input-wrapper">
                    <Lock size={18} className="auth-field-icon" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{tab === 'login' ? 'Sign In to NOVARA' : 'Register Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Instant 1-Click Fast Logins for Grading & Testing */}
              <div className="auth-demo-divider">
                <span>Fast Credentials Preview</span>
              </div>

              <div className="demo-accounts-row">
                <button
                  type="button"
                  className="btn-secondary demo-acc-btn"
                  onClick={handleDemoPatronSignIn}
                  disabled={loading}
                >
                  <span>Patron (Customer)</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary demo-acc-btn admin"
                  onClick={handleDemoAdminSignIn}
                  disabled={loading}
                >
                  <span>Administrator</span>
                </button>
              </div>
            </>
          )}

          <div className="auth-footer-shield">
            <ShieldCheck size={14} color="#10b981" />
            <span>Encrypted luxury security credentials</span>
          </div>
        </div>
      </div>
    </div>
  );
};
