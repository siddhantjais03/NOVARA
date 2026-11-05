import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Star, Quote, Sparkles, ChevronDown, Search } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';
import './BestSellersPage.css';

export const BestSellersPage = () => {
  const { allProducts = [], isLoadingProducts } = useStore();
  const [activeTab, setActiveTab] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const tabs = ['All', 'Outerwear', 'Womenswear', 'Menswear', 'Accessories', 'Footwear', 'Jewelry'];

  const filteredBestSellers = useMemo(() => {
    const pool = Array.isArray(allProducts) ? [...allProducts] : [];
    
    // Explicit best sellers or top-reviewed/highest-rated items
    let list = pool.filter((p) => p.isBestSeller);
    if (list.length < 4) {
      list = pool.slice().sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    // Category tab filter
    if (activeTab !== 'All') {
      const tabLower = activeTab.toLowerCase();
      list = list.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        return cat.includes(tabLower) || tabLower.includes(cat);
      });
    }

    // Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else {
      // popular
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return list;
  }, [allProducts, activeTab, sortBy]);

  return (
    <div className="bestsellers-page-root">
      <AnnouncementBar />
      <Navbar />

      {/* Hero Banner */}
      <section className="bestsellers-hero-banner">
        <div className="container">
          <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Best Sellers</span>
          </nav>

          <div className="bestsellers-header-content">
            <span className="badge-pill badge-pill-gradient">
              <Award size={13} /> Proven Icons &amp; Patron Favorites
            </span>
            <h1 className="bestsellers-main-title">Our Most Coveted Silhouettes</h1>
            <p className="bestsellers-main-subtitle">
              Meticulously crafted pieces with an enduring following across Milan, Paris, and Tokyo.
              Each silhouette embodies architectural luxury and timeless material integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Stage */}
      <section className="bestsellers-stage-section">
        <div className="container">
          {/* Controls Bar: Category Tabs + Sort */}
          <div className="bestsellers-controls-bar">
            <div className="bestsellers-tabs-row" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`bestseller-page-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={activeTab === tab}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bestsellers-sort-wrap">
              <label>Sort By:</label>
              <div className="select-wrapper">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="popular">Most In-Demand</option>
                  <option value="rating">Highest Patron Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bestsellers-results-badge">
            <span>
              Presenting <strong>{filteredBestSellers.length}</strong> signature icons{' '}
              {activeTab !== 'All' && `in ${activeTab}`}
            </span>
          </div>

          {/* Product Grid */}
          {isLoadingProducts ? (
            <div className="products-grid bestsellers-page-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton-card">
                  <div className="skeleton-media shimmer" />
                  <div className="skeleton-text-block">
                    <div className="skeleton-line shimmer short" />
                    <div className="skeleton-line shimmer medium" />
                    <div className="skeleton-line shimmer full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredBestSellers.length === 0 ? (
            <div className="bestsellers-empty-notice">
              <div className="empty-halo">
                <Search size={32} />
              </div>
              <h3>No Best Sellers in {activeTab}</h3>
              <p>Explore all categories to see our complete range of patron favorites.</p>
              <button className="btn-primary" onClick={() => setActiveTab('All')}>
                View All Best Sellers
              </button>
            </div>
          ) : (
            <div className="products-grid bestsellers-page-grid">
              {filteredBestSellers.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}

          {/* Editorial Press Quote */}
          <div className="bestsellers-editorial-quote-card">
            <div className="editorial-quote-halo">
              <Quote size={28} className="quote-icon" />
            </div>
            <p className="editorial-quote-text">
              "NOVARA has effortlessly redefined the intersection of architectural minimalism
              and modern luxury. Their pieces possess a transcendent longevity that outlives trends."
            </p>
            <div className="editorial-author-meta">
              <span className="editorial-author-title">— VOGUE EDITORIAL ARCHIVE</span>
              <div className="editorial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

