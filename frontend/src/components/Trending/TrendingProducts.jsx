import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard } from '../ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';
import './TrendingProducts.css';

export const TrendingProducts = ({ activeCategoryFilter, setActiveCategoryFilter }) => {
  const { allProducts } = useStore();
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Filter categories
  const filterTabs = ['All', 'Outerwear', 'Womenswear', 'Menswear', 'Accessories', 'Footwear'];

  // Sync external category filter if passed
  const currentTab = activeCategoryFilter || selectedFilter;

  // Filter trending products (must have at least 8 cards)
  const trendingList = allProducts.filter((product) => {
    if (currentTab === 'All') return true;
    return product.category.toLowerCase().includes(currentTab.toLowerCase());
  });

  // Ensure at least 8 products are rendered
  const displayProducts = trendingList.length >= 8 ? trendingList : allProducts.slice(0, 8);

  const handleTabClick = (tab) => {
    setSelectedFilter(tab);
    if (setActiveCategoryFilter) {
      setActiveCategoryFilter(tab === 'All' ? null : tab);
    }
  };

  return (
    <section className="trending-section" id="trending">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Sparkles size={14} /> The Runway Edit
          </span>
          <h2>Trending This Season</h2>
          <p>
            Impeccably tailored silhouettes, architectural leather accents, and
            contemporary staples celebrated by global connoisseurs.
          </p>
        </div>

        {/* Filter Tabs Bar */}
        <div className="trending-filter-bar">
          <div className="filter-tabs-list" role="tablist">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                className={`filter-tab-pill ${currentTab === tab ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
                role="tab"
                aria-selected={currentTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="filter-results-count">
            Showing <span>{displayProducts.length}</span> curated pieces
          </div>
        </div>

        {/* 8+ Product Cards Grid */}
        <div className="products-grid">
          {displayProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA / Lookbook link */}
        <div className="trending-bottom-cta">
          <button
            className="btn-secondary"
            onClick={() => {
              const el = document.querySelector('#bestsellers');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Explore Best Sellers</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

