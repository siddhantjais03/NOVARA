import React from 'react';
import { ArrowRight, Compass, Sparkles, Star, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './HeroSection.css';

export const HeroSection = () => {
  const { addToCart, allProducts } = useStore();
  const featuredHeroProduct = allProducts[0]; // Cashmere Overcoat

  const handleScrollTo = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section" id="home">
      {/* Ambient Gradient Glows */}
      <div className="hero-glow-purple" />
      <div className="hero-glow-blue" />

      <div className="container hero-container">
        {/* Left Column: Typography & CTAs */}
        <div className="hero-content">
          <div className="hero-badge-wrap">
            <span className="badge-pill badge-pill-gradient">
              <Sparkles size={13} className="hero-sparkle" />
              Spring / Summer 2026 Collection
            </span>
          </div>

          <h1 className="hero-title">
            Discover Your Style. <br />
            <span className="gradient-text">Define Your World.</span>
          </h1>

          <p className="hero-subtitle">
            Immerse yourself in understated modern luxury. Uncompromising Italian
            craftsmanship, architectural tailoring, and timeless silhouettes engineered
            for the discerning individual.
          </p>

          <div className="hero-cta-group">
            <button
              className="btn-primary hero-btn"
              onClick={() => handleScrollTo('#trending')}
            >
              <span>Shop Now</span>
              <ArrowRight size={18} className="btn-arrow" />
            </button>

            <button
              className="btn-secondary hero-btn"
              onClick={() => handleScrollTo('#categories')}
            >
              <Compass size={18} />
              <span>Explore Collection</span>
            </button>
          </div>

          {/* Social Proof & Metrics */}
          <div className="hero-metrics">
            <div className="metric-avatars">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                alt="Client 1"
                className="metric-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                alt="Client 2"
                className="metric-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                alt="Client 3"
                className="metric-avatar"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
                alt="Client 4"
                className="metric-avatar"
              />
            </div>
            <div className="metric-text-wrap">
              <div className="metric-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
                <span className="metric-score">4.9 / 5.0</span>
              </div>
              <p className="metric-desc">Adored by 24,000+ patrons worldwide</p>
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Visual Composition */}
        <div className="hero-visual-col">
          <div className="hero-image-frame">
            {/* Main Editorial Image */}
            <div className="image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
                alt="NOVARA Spring Summer Editorial"
                className="hero-main-img"
              />
              <div className="image-overlay-gradient" />
            </div>

            {/* Floating Glassmorphism Card 1: Top Floating Pill */}
            <div className="floating-card floating-top">
              <div className="floating-icon-wrap">
                <Zap size={16} />
              </div>
              <div>
                <span className="floating-label">Runway Spotlight</span>
                <p className="floating-title">Atelier Edition 04</p>
              </div>
            </div>

            {/* Floating Glassmorphism Card 2: Interactive Product Spotlight */}
            <div className="floating-card floating-bottom">
              <img
                src={featuredHeroProduct.image}
                alt={featuredHeroProduct.name}
                className="product-mini-thumb"
              />
              <div className="product-mini-info">
                <div className="mini-badge-row">
                  <span className="mini-tag">Signature Trench</span>
                  <span className="mini-rating">★ 4.9</span>
                </div>
                <h4 className="mini-title">{featuredHeroProduct.name}</h4>
                <div className="mini-price-row">
                  <span className="mini-price">${featuredHeroProduct.price}</span>
                  <span className="mini-old-price">${featuredHeroProduct.originalPrice}</span>
                </div>
              </div>
              <button
                className="mini-add-btn"
                onClick={() => addToCart(featuredHeroProduct)}
                title="Add to bag"
                aria-label="Add featured coat to bag"
              >
                +
              </button>
            </div>

            {/* Floating Quality Badge */}
            <div className="floating-pill floating-corner">
              <ShieldCheck size={14} color="#10b981" />
              <span>Certified 100% Italian Wool</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

