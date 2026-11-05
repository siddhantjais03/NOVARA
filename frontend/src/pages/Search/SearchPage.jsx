import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { productsAPI } from '../../services/api';
import { useStore } from '../../context/StoreContext';
import './SearchPage.css';

const POPULAR_SEARCHES = ['Cashmere', 'Silk', 'Bag', 'Coat', 'Gold', 'Loafers', 'Diamond'];
const CATEGORIES = ['All', 'Outerwear', 'Womenswear', 'Menswear', 'Accessories', 'Footwear', 'Jewelry'];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { allProducts } = useStore();

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== query) {
      setQuery(qParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = {};
        if (query.trim()) params.search = query.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;

        const data = await productsAPI.getProducts(params);
        if (isMounted) {
          setResults(data.products || []);
        }
      } catch (err) {
        // Fallback to local store products
        if (isMounted && allProducts) {
          const filtered = allProducts.filter((p) => {
            const matchesQuery = !query.trim() ||
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.description?.toLowerCase().includes(query.toLowerCase()) ||
              p.category?.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesQuery && matchesCategory;
          });
          setResults(filtered);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, selectedCategory, allProducts]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val.trim() ? { q: val } : {});
  };

  const handleClear = () => {
    setQuery('');
    setSearchParams({});
  };

  const handlePopularClick = (term) => {
    setQuery(term);
    setSearchParams({ q: term });
  };

  return (
    <div className="search-page-root">
      <AnnouncementBar />
      <Navbar />

      <header className="search-page-hero">
        <div className="search-hero-content">
          <div className="search-hero-pill">
            <Sparkles size={14} />
            <span>Curated Haute Catalog</span>
          </div>
          <h1 className="search-hero-title">Search NOVARA Atelier</h1>
          <p className="search-hero-subtitle">
            Explore handcrafted silhouettes, Italian leather goods, and fine jewelry.
          </p>

          <div className="search-input-box-wrapper">
            <Search className="search-input-icon" size={22} />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search by silhouette, material (cashmere, silk), or category..."
              value={query}
              onChange={handleQueryChange}
              autoFocus
            />
            {query && (
              <button className="search-clear-btn" onClick={handleClear} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="popular-searches">
            <span className="popular-label">Trending Searches:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                className="search-tag-chip"
                onClick={() => handlePopularClick(term)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="search-results-section">
        <div className="search-controls-bar">
          <h2 className="results-count-title">
            {query.trim() ? (
              <>
                Results for "<span>{query}</span>" ({results.length})
              </>
            ) : (
              <>All Creations ({results.length})</>
            )}
          </h2>

          <div className="category-filter-chips">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`cat-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <p>Scanning atelier catalog...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="search-products-grid">
            {results.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="empty-search-icon">
              <ShoppingBag size={32} />
            </div>
            <h3>No Silhouettes Found</h3>
            <p>
              We couldn't find any creations matching "{query}". Try checking your spelling or explore our full collection.
            </p>
            <Link to="/shop" className="empty-browse-btn">
              <span>Browse Full Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

