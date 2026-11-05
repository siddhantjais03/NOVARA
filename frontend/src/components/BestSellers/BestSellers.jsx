import React, { useState } from 'react';
import { Award, Star, Quote } from 'lucide-react';
import { ProductCard } from '../ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';
import './BestSellers.css';

export const BestSellers = () => {
  const { allProducts = [], isLoadingProducts } = useStore();
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Outerwear', 'Womenswear', 'Menswear', 'Accessories', 'Footwear', 'Jewelry'];

  // Filter best sellers (or top-rated items if best seller flag is sparse)
  const candidatePool = Array.isArray(allProducts) ? allProducts : [];
  const explicitBestSellers = candidatePool.filter((p) => p.isBestSeller);
  const bestSellerCandidates =
    explicitBestSellers.length >= 4
      ? explicitBestSellers
      : candidatePool.slice().sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));

  const filteredBestSellers = bestSellerCandidates.filter((p) => {
    if (activeTab === 'All') return true;
    const cat = (p.category || '').toLowerCase();
    const tab = activeTab.toLowerCase();
    return cat.includes(tab) || tab.includes(cat);
  });

  const displayList = filteredBestSellers.length >= 4 ? filteredBestSellers : bestSellerCandidates.slice(0, 8);

  return (
    <section className="bestsellers-section" id="bestsellers">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Award size={14} /> Proven Icons
          </span>
          <h2>Our Best Sellers</h2>
          <p>
            The pieces our patrons return to time and again. Unmatched silhouettes,
            flawless longevity, and meticulous finishing.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="bestsellers-filter-bar">
          <div className="bestsellers-tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`bestseller-tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Best Sellers Grid */}
        {isLoadingProducts ? (
          <div className="products-grid bestsellers-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="product-skeleton-card">
                <div className="skeleton-media shimmer" />
                <div className="skeleton-text-block">
                  <div className="skeleton-line shimmer short" />
                  <div className="skeleton-line shimmer medium" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-grid bestsellers-grid">
            {displayList.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}

        {/* Editorial Press Praise Banner */}
        <div className="press-quote-box">
          <div className="quote-icon-wrap">
            <Quote size={28} className="quote-icon" />
          </div>
          <p className="quote-text">
            "NOVARA has effortlessly redefined the intersection of architectural minimalism
            and modern luxury. Their pieces possess a transcendent longevity that outlives trends."
          </p>
          <div className="quote-author-row">
            <span className="author-name">— VOGUE EDITORIAL ARCHIVE</span>
            <div className="author-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
