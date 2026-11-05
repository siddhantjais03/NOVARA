import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import './AuthPages.css';

export const LoginPage = () => {
  const { login, showToast } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide email and password.', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      showToast(`Welcome back, ${res.user.name}!`);
      navigate('/shop');
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (demoEmail, demoPass, role) => {
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      showToast(`Signed in as ${role === 'admin' ? 'Administrator' : 'Patron'}!`);
      navigate('/shop');
    } catch (err) {
      showToast(err.message, 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="auth-page-container">
        <div className="auth-page-card">
          <div className="auth-page-header">
            <div className="auth-page-icon">
              <Sparkles size={24} />
            </div>
            <h1 className="auth-page-title">Patron Sign In</h1>
            <p className="auth-page-subtitle">
              Access your personal NOVARA wardrobe, private archive, and bespoke benefits.
            </p>
          </div>

          <form className="auth-page-form" onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label>Email Address</label>
              <div className="auth-input-box">
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label>Password</label>
              <div className="auth-input-box">
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn-full" disabled={loading}>
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to NOVARA</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="auth-page-divider">
            <span>Instant Demo Credentials</span>
          </div>

          <div className="auth-demo-grid">
            <button
              type="button"
              className="auth-demo-btn"
              onClick={() => handleDemoSignIn('elena@novara.luxury', 'Password123!', 'user')}
              disabled={loading}
            >
              Demo Patron
            </button>
            <button
              type="button"
              className="auth-demo-btn admin"
              onClick={() => handleDemoSignIn('admin@novara.luxury', 'Admin@Novara2026!', 'admin')}
              disabled={loading}
            >
              Demo Admin
            </button>
          </div>

          <p className="auth-switch-prompt">
            New to NOVARA?
            <Link to="/register">Create an account</Link>
          </p>

          <div className="auth-security-badge">
            <ShieldCheck size={14} />
            <span>256-Bit SSL Encrypted Luxury Security</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

