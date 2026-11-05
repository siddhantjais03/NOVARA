import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import './WishlistPage.css';

export const WishlistPage = () => {
  const { wishlistItems, toggleWishlist, addToCart, showToast } = useStore();

  const handleMoveToCart = (product) => {
    const ok = addToCart(product, 1);
    if (ok !== false) {
      toggleWishlist(product);
      showToast(`Moved "${product.name}" to shopping bag!`);
    }
  };

  return (
    <div className="wishlist-page-root">
      <AnnouncementBar />
      <Navbar />

      <main className="container wishlist-page-container">
        {/* Breadcrumb */}
        <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Wishlist</span>
        </nav>

        <div className="wishlist-page-header">
          <div>
            <h1 className="wishlist-page-title">Curated Archival Wishlist</h1>
            <p className="wishlist-page-sub">
              Your privately curated selection of NOVARA silhouettes awaiting atelier reservation.
            </p>
          </div>
          <span className="wishlist-count-badge">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'Silhouette' : 'Silhouettes'}
          </span>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty-state">
            <div className="empty-illustration-wrap">
              <Heart size={38} />
            </div>
            <h3>Your Wishlist is Empty</h3>
            <p>
              Explore our current seasonal lookbook and tap the heart icon on any piece to save it to
              your private wardrobe archive.
            </p>
            <Link to="/shop" className="btn-primary">
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((product) => {
              const id = product._id || product.id;
              return (
                <div key={id} className="wishlist-card">
                  <div className="wishlist-media">
                    <img src={product.image} alt={product.name} className="wishlist-img" />
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => toggleWishlist(product)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="wishlist-card-body">
                    <span className="wishlist-category">{product.category}</span>
                    <Link to={`/product/${id}`} className="wishlist-name">
                      {product.name}
                    </Link>

                    <div className="wishlist-price-row">
                      <span className="wishlist-current-price">${product.price}.00</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="wishlist-old-price">${product.originalPrice}.00</span>
                      )}
                    </div>

                    <div className="wishlist-actions-row">
                      <button
                        className="wishlist-move-btn"
                        onClick={() => handleMoveToCart(product)}
                      >
                        <ShoppingBag size={16} />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

