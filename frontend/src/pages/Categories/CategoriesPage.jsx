import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, SlidersHorizontal, Search } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { CATEGORIES_DATA } from '../../data/categories';
import { useStore } from '../../context/StoreContext';
import './CategoriesPage.css';

export const CategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allProducts = [], isLoadingProducts } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('category') || 'All';
  });

  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat) {
      setSelectedCategory(paramCat);
    }
  }, [searchParams]);

  const normalizeCategory = (cat) => {
    if (!cat || cat === 'All') return 'All';
    const c = cat.toLowerCase().trim();
    if (c.includes('outerwear')) return 'Outerwear';
    if (c.includes('cloth') || c.includes('women') || c.includes('men') || c.includes('apparel')) return 'Clothing';
    if (c.includes('bag') || c.includes('tote') || c.includes('duffle') || c.includes('backpack')) return 'Bags';
    if (c.includes('watch') || c.includes('timepiece') || c.includes('horlogerie')) return 'Watches';
    if (c.includes('footwear') || c.includes('shoe') || c.includes('boot') || c.includes('sneaker') || c.includes('sandal') || c.includes('loafer')) return 'Footwear';
    if (c.includes('accessor') || c.includes('jewel') || c.includes('accent')) return 'Accessories';
    return cat;
  };

  const handleCategorySelect = (category) => {
    const key = typeof category === 'string' ? category : category.categoryKey || category.name;
    const normalized = normalizeCategory(key);
    setSelectedCategory(normalized);
    setSearchParams(normalized === 'All' ? {} : { category: normalized });

    const previewSection = document.getElementById('category-products-preview');
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products for the selected category preview
  const filteredProducts = (allProducts || []).filter((p) => {
    if (selectedCategory === 'All') return true;
    const target = normalizeCategory(selectedCategory).toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const prodCat = (p.category || '').toLowerCase();
    const isLegacyBag = prodCat === 'accessories' && (nameLower.includes('shoulder bag') || nameLower.includes('crossbody') || nameLower.includes('duffle'));
    const isLegacyWatch = prodCat === 'jewelry' && nameLower.includes('watch');

    if (target === 'bags') {
      return prodCat === 'bags' || isLegacyBag;
    }
    if (target === 'watches') {
      return prodCat === 'watches' || isLegacyWatch;
    }
    if (target === 'accessories') {
      if (isLegacyBag) return false;
      return prodCat === 'accessories' || (prodCat === 'jewelry' && !isLegacyWatch);
    }

    const normProdCat = normalizeCategory(p.category || '').toLowerCase();
    return normProdCat === target;
  });

  return (
    <div className="categories-page-root">
      <AnnouncementBar />
      <Navbar />

      {/* Hero Header */}
      <section className="categories-hero-banner">
        <div className="container">
          <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Curated Categories</span>
          </nav>

          <div className="categories-header-content">
            <span className="badge-pill badge-pill-gradient">
              <Sparkles size={12} /> Seasonal Universes &amp; Wardrobe Pillars
            </span>
            <h1 className="categories-main-title">Curated Architectural Universes</h1>
            <p className="categories-main-subtitle">
              Explore our distinctive collections — from Italian virgin wool outerwear to
              architectural full-grain calfskin essentials crafted for a lifetime.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Cards Grid */}
      <section className="categories-grid-section">
        <div className="container">
          <div className="categories-cards-grid">
            {CATEGORIES_DATA.map((cat, idx) => {
              const isSelected =
                selectedCategory.toLowerCase() === (cat.categoryKey || '').toLowerCase() ||
                selectedCategory.toLowerCase() === cat.name.toLowerCase();

              return (
                <div
                  key={cat.id || idx}
                  className={`category-interactive-card card-variant-${idx % 3} ${
                    isSelected ? 'active-universe-card' : ''
                  }`}
                  onClick={() => handleCategorySelect(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCategorySelect(cat);
                  }}
                >
                  <div className="category-card-media-wrapper">
                    <img src={cat.image} alt={cat.name} className="cat-card-img" loading="lazy" />
                    <div className="cat-card-overlay-gradient" />
                  </div>

                  <div className="cat-card-badge-row">
                    <span className="cat-card-badge">{cat.tag}</span>
                    <span className="cat-card-count">{cat.itemCount} Silhouettes</span>
                  </div>

                  <div className="cat-card-body">
                    <h3 className="cat-card-title">{cat.name}</h3>
                    <p className="cat-card-desc">{cat.subtitle}</p>

                    <div className="cat-card-action">
                      <span className="action-label">
                        {isSelected ? 'Currently Viewing' : 'Explore Universe'}
                      </span>
                      <div className="action-arrow">
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Products Live Preview Stage */}
      <section className="category-preview-section" id="category-products-preview">
        <div className="container">
          <div className="preview-header-bar">
            <div>
              <span className="section-tag">
                <Layers size={13} /> Live Collection Preview
              </span>
              <h2 className="preview-heading">
                {selectedCategory === 'All'
                  ? 'All Luxury Silhouettes'
                  : `Curated ${selectedCategory} Silhouettes`}
              </h2>
              <p className="preview-sub">
                Showing {filteredProducts.length} masterfully finished pieces in this universe.
              </p>
            </div>

            <div className="preview-actions">
              <button
                className={`category-reset-btn ${selectedCategory === 'All' ? 'disabled' : ''}`}
                onClick={() => handleCategorySelect('All')}
                disabled={selectedCategory === 'All'}
              >
                Show All Categories
              </button>
              <Link
                to={
                  selectedCategory === 'All'
                    ? '/shop'
                    : `/shop?category=${encodeURIComponent(selectedCategory)}`
                }
                className="btn-primary browse-catalog-link"
              >
                <SlidersHorizontal size={15} />
                <span>Open Full Shop Filters</span>
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          {isLoadingProducts ? (
            <div className="products-grid categories-preview-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-skeleton-card">
                  <div className="skeleton-media shimmer" />
                  <div className="skeleton-text-block">
                    <div className="skeleton-line shimmer short" />
                    <div className="skeleton-line shimmer medium" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="categories-empty-notice">
              <div className="empty-halo">
                <Search size={32} />
              </div>
              <h3>No Silhouettes Currently In This Category</h3>
              <p>Check back for incoming drops or explore our entire runway collection.</p>
              <button className="btn-primary" onClick={() => handleCategorySelect('All')}>
                View All Silhouettes
              </button>
            </div>
          ) : (
            <div className="products-grid categories-preview-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

