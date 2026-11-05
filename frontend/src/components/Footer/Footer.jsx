import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowUp } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-root">
      {/* Top Banner / Brand Commitment */}
      <div className="footer-top-strip">
        <div className="container footer-strip-inner">
          <div className="strip-item">
            <span className="strip-title">Milan • Paris • New York • Tokyo • London</span>
          </div>
          <button className="back-to-top-btn" onClick={scrollToTop} aria-label="Scroll back to top">
            <span>Back To Top</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>

      {/* Main Multi-Column Content */}
      <div className="container footer-main">
        <div className="footer-grid">
          {/* Column 1: Brand & Bio */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-brand-logo" onClick={scrollToTop}>
              <div className="footer-symbol">
                <Sparkles size={16} />
              </div>
              <span className="footer-brand-name">NOVARA</span>
            </Link>

            <p className="footer-brand-desc">
              NOVARA embodies the pinnacle of contemporary luxury. Redefining modern
              silhouettes through master Italian tailoring, sustainable materials,
              and an unwavering devotion to aesthetic perfection.
            </p>

            <div className="footer-social-links">
              {/* Instagram */}
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* X / Twitter */}
              <a href="https://x.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="X (Twitter)">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                  <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="footer-col">
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Spring / Summer 2026</Link></li>
              <li><Link to="/shop?category=Outerwear">Tailored Outerwear</Link></li>
              <li><Link to="/shop?category=Womenswear">Contemporary Womenswear</Link></li>
              <li><Link to="/shop?category=Menswear">Modern Menswear</Link></li>
              <li><Link to="/shop?category=Accessories">Artisanal Leather Bags</Link></li>
              <li><Link to="/shop?category=Footwear">Designer Footwear</Link></li>
              <li><Link to="/shop">Private Archive Sale</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Concierge */}
          <div className="footer-col">
            <h4 className="footer-heading">Client Concierge</h4>
            <ul className="footer-links">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/faq">Complimentary Shipping &amp; Duties</Link></li>
              <li><Link to="/faq">30-Day Returns &amp; Exchanges</Link></li>
              <li><Link to="/contact">Bespoke Size &amp; Fit Guide</Link></li>
              <li><Link to="/contact">Book Private Appointment</Link></li>
              <li><Link to="/faq">Garment Care &amp; Longevity</Link></li>
              <li><Link to="/contact">Client Service: 24/7 Support</Link></li>
            </ul>
          </div>

          {/* Column 4: The House */}
          <div className="footer-col">
            <h4 className="footer-heading">The House of Novara</h4>
            <ul className="footer-links">
              <li><Link to="/about">Our Atelier Heritage</Link></li>
              <li><Link to="/about">Sustainable Craft Pledge</Link></li>
              <li><Link to="/contact">Global Boutiques &amp; Showrooms</Link></li>
              <li><Link to="/contact">Press &amp; Editorial Inquiries</Link></li>
              <li><Link to="/faq">Frequently Asked Questions</Link></li>
              <li><Link to="/about">Corporate Responsibility</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Payment Strip */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <div className="footer-copyright">
            <p>© 2026 NOVARA Luxury Fashion Group. All rights reserved.</p>
          </div>

          {/* Payment Badges */}
          <div className="payment-badges-row">
            <span className="pay-chip">VISA</span>
            <span className="pay-chip">MASTERCARD</span>
            <span className="pay-chip">AMEX</span>
            <span className="pay-chip">UPI</span>
            <span className="pay-chip">COD</span>
          </div>

          {/* Legal Links */}
          <div className="footer-legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms">Terms of Service</Link>
            <span>•</span>
            <Link to="/faq">Client FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
