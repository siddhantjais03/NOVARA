import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CATEGORIES_DATA } from '../../data/categories';
import './Categories.css';

export const Categories = ({ onSelectCategory, activeCategory }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    const targetKey = category.categoryKey || category.name;
    if (onSelectCategory) {
      onSelectCategory(targetKey);
      const trendingSection = document.querySelector('#trending');
      if (trendingSection) {
        trendingSection.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(`/shop?category=${encodeURIComponent(targetKey)}`);
  };

  return (
    <section className="categories-section" id="categories">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">
            <Sparkles size={14} /> Curated Collections
          </span>
          <h2>Shop By Category</h2>
          <p>
            Explore our meticulously crafted universes — from sculptural outerwear
            to architectural leather goods designed to elevate your everyday ritual.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {CATEGORIES_DATA.map((category, index) => {
            const isSelected =
              activeCategory &&
              (activeCategory.toLowerCase() === category.name.toLowerCase() ||
                activeCategory.toLowerCase() === (category.categoryKey || '').toLowerCase());

            return (
              <div
                key={category.id}
                className={`category-card ${category.featured ? 'featured' : ''} card-${index} ${
                  isSelected ? 'active-category-card' : ''
                }`}
                onClick={() => handleCategoryClick(category)}
                role="button"
                tabIndex={0}
                aria-label={`Explore ${category.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleCategoryClick(category);
                  }
                }}
              >
                <div className="category-image-wrap">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                    loading="lazy"
                  />
                  <div className="category-overlay" />
                </div>

                {/* Tag / Badge */}
                <div className="category-top-tag">
                  <span className="cat-badge">{category.tag}</span>
                </div>

                {/* Bottom Content */}
                <div className="category-info">
                  <span className="category-count">{category.itemCount} Curated Pieces</span>
                  <h3 className="category-title">{category.name}</h3>
                  <p className="category-subtitle">{category.subtitle}</p>

                  <div className="category-cta-row">
                    <span className="category-cta-text">Discover Collection</span>
                    <div className="category-cta-icon">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
