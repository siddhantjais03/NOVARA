import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Sparkles, Shield } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './Newsletter.css';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'info');
      return;
    }

    setIsSubmitted(true);
    showToast('Welcome to The Novara Circle! Your 15% voucher has been dispatched.');
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-card">
          {/* Subtle gradient light blur rings */}
          <div className="newsletter-glow" />

          <div className="newsletter-inner">
            <span className="newsletter-tag">
              <Sparkles size={13} /> The Novara Collective
            </span>

            <h2 className="newsletter-title">
              Join The Circle. <br />
              <span className="gradient-text">Unlock 15% Off Your First Order.</span>
            </h2>

            <p className="newsletter-subtitle">
              Subscribe to receive private showroom invitations, limited edition drops,
              and curated editorial edits delivered discreetly to your inbox.
            </p>

            {isSubmitted ? (
              <div className="newsletter-success-box">
                <div className="success-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div className="success-details">
                  <h4>You are officially on the guestlist.</h4>
                  <p>
                    Check <strong>{email}</strong> for your 15% welcome code: <code>NOVARA-VIP15</code>
                  </p>
                </div>
              </div>
            ) : (
              <form className="newsletter-form" onSubmit={handleSubmit}>
                <div className="input-field-wrap">
                  <Mail size={18} className="input-mail-icon" />
                  <input
                    type="email"
                    placeholder="Enter your personal email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary newsletter-btn">
                  <span>Subscribe</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            <div className="newsletter-trust-row">
              <div className="trust-item">
                <Shield size={14} />
                <span>Zero spam. Unsubscribe anytime with 1-click.</span>
              </div>
              <div className="trust-item">
                <span>• Privacy guaranteed</span>
              </div>
              <div className="trust-item">
                <span>• Exclusive member perks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

