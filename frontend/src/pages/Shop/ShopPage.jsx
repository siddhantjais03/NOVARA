import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  ChevronDown,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';
import './ShopPage.css';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { allProducts = [], recentlyViewed = [], openQuickView, isLoadingProducts } = useStore();
  const loading = isLoadingProducts;

  const categories = [
    'All',
    'Accessories',
    'Footwear',
    'Outerwear',
    'Clothing',
    'Bags',
    'Watches'
  ];

  const genders = ['All', 'Women', 'Men', 'Unisex'];
  const sizes = ['All', 'XS', 'S', 'M', 'L', 'XL'];
  const itemsPerPage = 8;

  // Category normalizer to map names like "Tailored Outerwear" or query params to catalog categories
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

  // State Declarations
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const paramCat = searchParams.get('category');
    return paramCat ? normalizeCategory(paramCat) : 'All';
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'featured');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (cat !== null) {
      setSelectedCategory(normalizeCategory(cat));
      setCurrentPage(1);
    }
    if (search !== null) {
      setSearchQuery(search);
      setCurrentPage(1);
    }
    if (sort !== null) {
      setSortBy(sort);
    }
  }, [searchParams]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = Array.isArray(allProducts) ? [...allProducts] : [];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory && selectedCategory !== 'All') {
      const targetCat = normalizeCategory(selectedCategory).toLowerCase();
      list = list.filter((p) => {
        const nameLower = (p.name || '').toLowerCase();
        const prodCat = (p.category || '').toLowerCase();
        const isLegacyBag = prodCat === 'accessories' && (nameLower.includes('shoulder bag') || nameLower.includes('crossbody') || nameLower.includes('duffle'));
        const isLegacyWatch = prodCat === 'jewelry' && nameLower.includes('watch');

        if (targetCat === 'bags') {
          return prodCat === 'bags' || isLegacyBag;
        }
        if (targetCat === 'watches') {
          return prodCat === 'watches' || isLegacyWatch;
        }
        if (targetCat === 'accessories') {
          if (isLegacyBag) return false;
          return prodCat === 'accessories' || (prodCat === 'jewelry' && !isLegacyWatch);
        }

        const normProdCat = normalizeCategory(p.category || '').toLowerCase();
        return normProdCat === targetCat;
      });
    }

    // Gender
    if (selectedGender !== 'All') {
      list = list.filter(
        (p) =>
          (p.gender || '').toLowerCase() === selectedGender.toLowerCase() ||
          p.gender === 'Unisex' ||
          !p.gender
      );
    }

    // Size
    if (selectedSize !== 'All') {
      list = list.filter((p) => p.sizes && Array.isArray(p.sizes) && p.sizes.includes(selectedSize));
    }

    // Max Price
    list = list.filter((p) => (p.price !== undefined ? p.price <= maxPrice : true));

    // Stock
    if (inStockOnly) {
      list = list.filter((p) => (p.stock || 0) > 0);
    }

    // Sort
    if (sortBy === 'price-asc') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price-desc') list.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'popular') {
      list.sort((a, b) => {
        if (a.isBestSeller && !b.isBestSeller) return -1;
        if (!a.isBestSeller && b.isBestSeller) return 1;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
    } else if (sortBy === 'discount') {
      list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    }

    return list;
  }, [allProducts, searchQuery, selectedCategory, selectedGender, selectedSize, maxPrice, inStockOnly, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedGender('All');
    setSelectedSize('All');
    setMaxPrice(1000);
    setInStockOnly(false);
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="shop-page-root">
      <AnnouncementBar />
      <Navbar />

      {/* Breadcrumb Header */}
      <section className="shop-hero-banner">
        <div className="container">
          <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Shop Catalog</span>
          </nav>

          <div className="shop-header-content">
            <span className="badge-pill badge-pill-gradient">
              <Sparkles size={12} /> Seasonal Runway &amp; Archival Releases
            </span>
            <h1 className="shop-main-title">Curated Luxury Silhouettes</h1>
            <p className="shop-main-subtitle">
              Discover meticulous Italian tailoring, architectural leather essentials, and
              uncompromising modern craftsmanship.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog Stage */}
      <div className="container shop-stage-container">
        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-bar">
          <button
            className="mobile-filter-toggle-btn"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          >
            <SlidersHorizontal size={16} />
            <span>Filter Catalog ({filteredProducts.length})</span>
          </button>
        </div>

        <div className="shop-layout-grid">
          {/* LEFT: FILTER SIDEBAR */}
          <aside className={`shop-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-sticky-box">
              <div className="sidebar-header">
                <h3>Filters &amp; Refine</h3>
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Search in Catalog */}
              <div className="sidebar-group">
                <label className="sidebar-label">Search Keyword</label>
                <div className="sidebar-search-wrap">
                  <Search size={16} className="sidebar-search-icon" />
                  <input
                    type="text"
                    placeholder="Search silk, coat, boots..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="sidebar-group">
                <label className="sidebar-label">Category</label>
                <div className="category-pills-list">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-filter-pill ${
                        selectedCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''
                      }`}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      <span>{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="sidebar-group">
                <label className="sidebar-label">Gender / Wardrobe</label>
                <div className="gender-tabs-row">
                  {genders.map((g) => (
                    <button
                      key={g}
                      className={`gender-tab-btn ${selectedGender === g ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedGender(g);
                        setCurrentPage(1);
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="sidebar-group">
                <label className="sidebar-label">Size</label>
                <div className="size-filter-chips">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      className={`size-filter-btn ${selectedSize === s ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedSize(s);
                        setCurrentPage(1);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="sidebar-group">
                <div className="price-label-row">
                  <label className="sidebar-label">Max Price</label>
                  <span className="price-tag-badge">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="price-slider-input"
                />
                <div className="price-min-max">
                  <span>$50</span>
                  <span>$1000+</span>
                </div>
              </div>

              {/* Stock Checkbox */}
              <div className="sidebar-group stock-group">
                <label className="stock-checkbox-label">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCurrentPage(1);
                    }}
                  />
                  <span>In-Stock Items Only</span>
                </label>
              </div>

              {mobileFilterOpen && (
                <button
                  className="btn-primary apply-mobile-filters"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Apply Filters ({filteredProducts.length} pieces)
                </button>
              )}
            </div>
          </aside>

          {/* RIGHT: PRODUCTS GRID */}
          <section className="shop-products-col">
            {/* Toolbar (Count + Sorting) */}
            <div className="shop-toolbar-row">
              <div className="shop-results-count">
                Showing <strong>{filteredProducts.length}</strong> luxury silhouettes
                {selectedCategory !== 'All' && <span> in <em>{selectedCategory}</em></span>}
              </div>

              <div className="shop-sorting-wrap">
                <label>Sort By:</label>
                <div className="select-wrapper">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('sort', e.target.value);
                      setSearchParams(newParams);
                    }}
                  >
                    <option value="featured">Featured Picks</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Patron Rating</option>
                    <option value="popular">Most Popular</option>
                    <option value="discount">Highest Savings</option>
                  </select>
                  <ChevronDown size={14} className="select-chevron" />
                </div>
              </div>
            </div>

            {/* Product Cards Grid or Skeleton Loader */}
            {loading ? (
              <div className="products-grid-shop">
                {[...Array(6)].map((_, i) => (
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
            ) : paginatedProducts.length === 0 ? (
              <div className="shop-empty-results">
                <div className="empty-icon-halo">
                  <Search size={36} />
                </div>
                <h3>No Silhouettes Match Your Criteria</h3>
                <p>
                  Try widening your price range, clearing selected filters, or searching for
                  general terms like "Cashmere" or "Silk".
                </p>
                <button className="btn-primary" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="products-grid-shop">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="shop-pagination-wrap">
                <button
                  className="page-nav-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        className={`page-number-btn ${safeCurrentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="page-nav-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Recently Viewed Products Section */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <section className="recently-viewed-shelf">
            <div className="section-header text-left">
              <span className="section-tag">
                <Sparkles size={12} /> Curated For You
              </span>
              <h2>Recently Admired Pieces</h2>
            </div>

            <div className="recently-viewed-grid">
              {recentlyViewed.slice(0, 4).map((p) => (
                <div
                  key={p._id || p.id}
                  className="recent-product-chip"
                  onClick={() => openQuickView && openQuickView(p)}
                >
                  <img src={p.image} alt={p.name} className="recent-thumb" />
                  <div className="recent-info">
                    <span className="recent-cat">{p.category}</span>
                    <h4 className="recent-title">{p.name}</h4>
                    <span className="recent-price">${p.price}.00</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};
