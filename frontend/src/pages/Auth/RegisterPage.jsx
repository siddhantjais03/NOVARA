import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import './AuthPages.css';

export const RegisterPage = () => {
  const { register, showToast } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please provide your name, email, and password.', 'info');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'info');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      showToast('Welcome to the NOVARA Collective!');
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
            <h1 className="auth-page-title">Join the Collective</h1>
            <p className="auth-page-subtitle">
              Register for complimentary global express delivery, bespoke allocations, and early access.
            </p>
          </div>

          <form className="auth-page-form" onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label>Full Name</label>
              <div className="auth-input-box">
                <User size={18} />
                <input
                  type="text"
                  placeholder="e.g. Julian Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-btn-full" disabled={loading}>
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create NOVARA Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="auth-switch-prompt">
            Already a patron?
            <Link to="/login">Sign in here</Link>
          </p>

          <div className="auth-security-badge">
            <ShieldCheck size={14} />
            <span>Encrypted luxury security credentials</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

