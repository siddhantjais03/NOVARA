import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import './SearchModal.css';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, allProducts, openQuickView } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  const suggestedTags = [
    'Cashmere',
    'Trench',
    'Silk Gown',
    'Blazer',
    'Chelsea Boot',
    'Calfskin Bag',
    'Timepiece',
    'Merino Knit'
  ];

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const handleClose = () => {
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  const filteredProducts = allProducts.filter((product) => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="search-modal-root">
      <div className="search-backdrop" onClick={handleClose} />

      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search Collections">
        {/* Search Header Input */}
        <div className="search-input-bar">
          <Search size={22} className="search-bar-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by keyword, silhouette, fabric (e.g. Cashmere, Silk)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-main-input"
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear query"
            >
              <X size={16} />
            </button>
          )}
          <button
            className="search-exit-btn"
            onClick={handleClose}
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        {/* Suggested Tags */}
        <div className="search-suggestions-row">
          <span className="suggestions-label">Popular Inquiries:</span>
          <div className="suggestions-tags">
            {suggestedTags.map((tag) => (
              <button
                key={tag}
                className="suggestion-tag-pill"
                onClick={() => setSearchTerm(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="search-results-area">
          {searchTerm.trim() === '' ? (
            <div className="search-initial-state">
              <Sparkles size={24} className="search-sparkle-icon" />
              <p>Type to search across NOVARA's seasonal drops &amp; archival releases.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="search-empty-state">
              <h4>No matches found for "{searchTerm}"</h4>
              <p>Try searching for "Cashmere", "Trench", "Silk", or explore our best sellers.</p>
            </div>
          ) : (
            <div className="search-results-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="search-result-card"
                  onClick={() => {
                    setIsSearchOpen(false);
                    openQuickView(product);
                  }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="result-thumb"
                  />
                  <div className="result-info">
                    <span className="result-category">{product.category}</span>
                    <h4 className="result-title">{product.name}</h4>
                    <div className="result-price-row">
                      <span className="result-price">${product.price}.00</span>
                      {product.originalPrice && (
                        <span className="result-old-price">${product.originalPrice}.00</span>
                      )}
                    </div>
                  </div>
                  <div className="result-action">
                    <button
                      className="result-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsSearchOpen(false);
                        openQuickView(product);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

