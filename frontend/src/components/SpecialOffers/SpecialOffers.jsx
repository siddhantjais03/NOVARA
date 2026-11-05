import React, { useState, useEffect } from 'react';
import { Tag, Timer, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './SpecialOffers.css';

export const SpecialOffers = () => {
  const { showToast } = useStore();
  const [copied, setCopied] = useState(false);

  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 42,
    seconds: 18
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const promoCode = 'NOVARA45';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    showToast(`Promo code "${promoCode}" applied! Enjoy up to 45% off.`);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShopSale = () => {
    const el = document.querySelector('#trending');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="special-offers-section" id="offers">
      <div className="container">
        <div className="offer-banner-card">
          {/* Ambient Lighting Accents */}
          <div className="offer-glow-1" />
          <div className="offer-glow-2" />

          <div className="offer-content">
            <div className="offer-badge-pill">
              <Sparkles size={14} />
              <span>Limited Mid-Season Event</span>
            </div>

            <h2 className="offer-headline">
              Private Archive Sale <br />
              <span className="offer-headline-gradient">Up To 45% Off</span>
            </h2>

            <p className="offer-subtext">
              Unlock exclusive access to iconic archival silhouettes, hand-tailored
              overcoats, and runway leather accessories before the window closes.
            </p>

            {/* Live Countdown Timer */}
            <div className="countdown-container">
              <div className="countdown-header">
                <Timer size={16} />
                <span>Offer Expires In</span>
              </div>

              <div className="countdown-blocks">
                <div className="time-block">
                  <span className="time-number">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="time-label">Days</span>
                </div>
                <span className="time-separator">:</span>
                <div className="time-block">
                  <span className="time-number">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="time-label">Hours</span>
                </div>
                <span className="time-separator">:</span>
                <div className="time-block">
                  <span className="time-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="time-label">Mins</span>
                </div>
                <span className="time-separator">:</span>
                <div className="time-block">
                  <span className="time-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="time-label">Secs</span>
                </div>
              </div>
            </div>

            {/* Promo Code & Action Group */}
            <div className="offer-actions-group">
              <div className="code-box">
                <div className="code-info">
                  <span className="code-small-label">Use Code At Checkout</span>
                  <strong className="code-value">{promoCode}</strong>
                </div>
                <button
                  className="code-copy-btn"
                  onClick={handleCopyCode}
                  aria-label="Copy promotion code"
                  title="Click to copy promo code"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <button className="btn-primary offer-cta-btn" onClick={handleShopSale}>
                <span>Claim Offer</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Banner Editorial Visual */}
          <div className="offer-visual-frame">
            <div className="offer-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80"
                alt="NOVARA Special Offer Collection"
                className="offer-image"
              />
              <div className="offer-image-gradient" />
            </div>

            {/* Floating Offer Pill */}
            <div className="offer-floating-tag">
              <Tag size={16} color="#7c3aed" />
              <div>
                <strong>Complimentary Duties</strong>
                <span>Included on all international orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

