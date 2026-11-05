import React from 'react';
import { Sparkles, Compass, Shield, Feather, Award, HeartHandshake } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import '../Content/ContentPages.css';

export const AboutPage = () => {
  return (
    <div className="content-page-root">
      <AnnouncementBar />
      <Navbar />

      <header className="content-page-hero">
        <div className="content-hero-pill">
          <Sparkles size={14} />
          <span>Haute Couture Heritage</span>
        </div>
        <h1 className="content-hero-title">Discover NOVARA Atelier</h1>
        <p className="content-hero-sub">
          Where pure architectural form meets the world's rarest fibers. Crafted for connoisseurs of timeless elegance.
        </p>
      </header>

      <main className="content-main-container">
        {/* Brand Story */}
        <section className="about-grid-story">
          <div className="about-story-text">
            <h2>The Art of Intentional Luxury</h2>
            <p>
              Founded with the resolute belief that true luxury is neither hurried nor disposable, NOVARA represents the pinnacle of modern architectural tailoring. Every silhouette is conceived as a work of wearable art, marrying fluid drapery with exacting precision.
            </p>
            <p>
              We bypass ephemeral seasonal trends in pursuit of permanent beauty. From grade-A Mongolian cashmere harvested under ethical stewardship to mulberry silks spun in heritage Italian mills, each material is selected for its sensory resonance and enduring grace.
            </p>
          </div>
          <div className="about-story-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
              alt="NOVARA Atelier Craftsmanship"
              className="about-story-image"
            />
          </div>
        </section>

        {/* 3 Pillars */}
        <section className="about-pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Feather size={26} />
            </div>
            <h3>Master Craftsmanship</h3>
            <p>
              Hand-finished by third-generation artisans in master ateliers across Northern Italy and Jaipur.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Compass size={26} />
            </div>
            <h3>Traceable Provenance</h3>
            <p>
              Every fiber is 100% sustainably sourced with direct transparent supply chains from herder to silhouette.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Award size={26} />
            </div>
            <h3>Heirloom Longevity</h3>
            <p>
              Engineered with internal canvas structures and reinforced French seams built to be treasured across generations.
            </p>
          </div>
        </section>

        {/* Numbers Section */}
        <section style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display, serif)', fontSize: '2rem', marginBottom: '32px' }}>
            Atelier By The Numbers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px'
          }}>
            <div>
              <strong style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: '#c7d2fe', display: 'block' }}>
                100%
              </strong>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Certified Traceable Fibers</span>
            </div>
            <div>
              <strong style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: '#c7d2fe', display: 'block' }}>
                18+
              </strong>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Global Boutique Destinations</span>
            </div>
            <div>
              <strong style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: '#c7d2fe', display: 'block' }}>
                24/7
              </strong>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Dedicated Patron Concierge</span>
            </div>
            <div>
              <strong style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: '#c7d2fe', display: 'block' }}>
                Zero
              </strong>
              <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Unsold Stock Incineration</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

