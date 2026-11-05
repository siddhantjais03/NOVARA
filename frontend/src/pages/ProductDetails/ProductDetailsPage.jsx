import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  Sparkles,
  ZoomIn,
  AlertCircle,
  MessageSquarePlus,
  Send,
  X,
  UserCheck,
  Award
} from 'lucide-react';
import { Navbar } from '../../components/Navbar/Navbar';
import { AnnouncementBar } from '../../components/AnnouncementBar/AnnouncementBar';
import { Footer } from '../../components/Footer/Footer';
import { ProductCard } from '../../components/ProductCard/ProductCard';
import { useStore } from '../../context/StoreContext';
import { productsAPI, reviewsAPI } from '../../services/api';
import './ProductDetailsPage.css';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const {
    allProducts = [],
    addToCart,
    toggleWishlist,
    isInWishlist,
    addRecentlyViewed,
    showToast,
    user,
    setIsAuthOpen
  } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('craftsmanship');
  const [isZoomed, setIsZoomed] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // High-performance DOM ref for zoom tracking (prevents React re-renders on mousemove)
  const zoomImgRef = useRef(null);

  // Fallback verified testimonials if this item has no custom DB reviews yet
  const fallbackTestimonials = useMemo(
    () => [
      {
        _id: 'seed-rev-1',
        userName: 'Julian V., Geneva',
        rating: 5,
        comment:
          'The weight and drape of this piece is exceptional. You can immediately feel the density of the weave and the precision of the cut. Worth every dollar.',
        status: 'Approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
      },
      {
        _id: 'seed-rev-2',
        userName: 'Claire D., Paris',
        rating: 5,
        comment:
          'Fits impeccably true to size. Arrived in a gorgeous branded garment box with concierge delivery. Truly high luxury.',
        status: 'Approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
      },
      {
        _id: 'seed-rev-3',
        userName: 'Marcus K., Tokyo',
        rating: 4,
        comment:
          'Sculptural minimalism at its finest. The silhouette commands attention while remaining understated.',
        status: 'Approved',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
      }
    ],
    []
  );

  // 1. Fetch product by ID (strictly isolated to ID changes to guarantee smooth scrolling)
  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Immediate cache check
      const local = allProducts.find((p) => (p._id || p.id) === id);
      if (local && isMounted) {
        setProduct(local);
        addRecentlyViewed(local);
        setSelectedSize(local.sizes?.[0] || 'M');
      }

      try {
        const res = await productsAPI.getProductById(id);
        if (res.success && res.product && isMounted) {
          setProduct(res.product);
          addRecentlyViewed(res.product);
          setSelectedSize(res.product.sizes?.[0] || 'M');
        }
      } catch {
        // Retain local if API call fails
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Fetch approved patron reviews for this product from MongoDB
  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      if (!id) return;
      setIsLoadingReviews(true);
      try {
        const res = await reviewsAPI.getReviews({ productId: id, status: 'Approved' });
        if (res.success && Array.isArray(res.reviews) && isMounted) {
          setReviews(res.reviews);
        }
      } catch (err) {
        console.warn('[Reviews fetch notice]', err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Sync reviewer name with logged-in user
  useEffect(() => {
    if (user && user.name) {
      setNewReviewerName(user.name);
    }
  }, [user]);

  // Check if current logged-in user has already submitted a review
  const hasUserReviewed = useMemo(() => {
    if (!user) return false;
    const authorEmail = user.email?.toLowerCase();
    const authorId = String(user._id);

    return reviews.some(
      (r) =>
        (r.user && String(r.user) === authorId) ||
        (r.userEmail && r.userEmail.toLowerCase() === authorEmail)
    );
  }, [user, reviews]);

  // Review statistics calculation
  const reviewStats = useMemo(() => {
    const activeList = reviews.length > 0 ? reviews : fallbackTestimonials;
    const total = activeList.length;
    const avg =
      total > 0
        ? Math.round((activeList.reduce((acc, r) => acc + (r.rating || 5), 0) / total) * 10) / 10
        : product?.rating || 5.0;

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    activeList.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });

    const percentages = {
      5: total > 0 ? Math.round((counts[5] / total) * 100) : 0,
      4: total > 0 ? Math.round((counts[4] / total) * 100) : 0,
      3: total > 0 ? Math.round((counts[3] / total) * 100) : 0,
      2: total > 0 ? Math.round((counts[2] / total) * 100) : 0,
      1: total > 0 ? Math.round((counts[1] / total) * 100) : 0
    };

    return { total, avg, counts, percentages, list: activeList };
  }, [reviews, fallbackTestimonials, product]);

  // Handle direct GPU-accelerated zoom without component re-renders
  const handleMouseMove = (e) => {
    if (!isZoomed || !zoomImgRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    zoomImgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const scrollToReviews = () => {
    const target = document.getElementById('customer-reviews-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit a customer review to MongoDB
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please sign in to your patron account to submit a review.', 'info');
      setIsAuthOpen(true);
      return;
    }

    if (hasUserReviewed) {
      showToast('You have already submitted a review for this silhouette.', 'info');
      return;
    }

    if (!newReviewComment.trim()) {
      showToast('Please provide your review comments.', 'info');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await reviewsAPI.createReview({
        productId: product?._id || product?.id || id,
        productName: product?.name || 'Luxury Silhouette',
        userName: (newReviewerName || user.name || 'Patron').trim(),
        userEmail: user.email || '',
        rating: Number(newRating),
        comment: newReviewComment.trim()
      });

      if (res.success && res.review) {
        showToast(
          res.message || 'Thank you! Your review has been submitted for moderation.',
          'success'
        );
        if (res.review.status === 'Approved') {
          setReviews((prev) => [res.review, ...prev]);
        }
        setNewReviewComment('');
        setShowReviewForm(false);
      }
    } catch (err) {
      showToast(err.message || 'Could not post review.', 'info');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Memoize related products to avoid recalculating on each render
  const relatedProducts = useMemo(() => {
    if (!product || !Array.isArray(allProducts)) return [];
    return allProducts
      .filter((p) => p.category === product.category && (p._id || p.id) !== (product._id || product.id))
      .slice(0, 4);
  }, [allProducts, product]);

  if (loading && !product) {
    return (
      <div className="product-details-root">
        <AnnouncementBar />
        <Navbar />
        <div className="container product-details-skeleton">
          <div className="skeleton-detail-media shimmer" />
          <div className="skeleton-detail-info">
            <div className="skeleton-line shimmer short" />
            <div className="skeleton-line shimmer full" />
            <div className="skeleton-line shimmer medium" />
            <div className="skeleton-line shimmer full" style={{ height: '80px' }} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-root">
        <AnnouncementBar />
        <Navbar />
        <div className="container product-not-found">
          <h2>Product Not Found</h2>
          <p>The luxury silhouette you are searching for is no longer in the active catalog.</p>
          <Link to="/shop" className="btn-primary">
            Return to Shop
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = [product.image, product.hoverImage || product.image];
  const isLiked = isInWishlist(product._id || product.id);
  const stockCount = product.stock !== undefined ? product.stock : 10;
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast(`"${product.name}" is out of stock.`, 'info');
      return;
    }

    const ok = addToCart(product, quantity, {
      selectedSize,
      selectedColor: product.colors?.[selectedColorIdx]
    });

    if (ok !== false) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2200);
    }
  };

  return (
    <div className="product-details-root">
      <AnnouncementBar />
      <Navbar />

      <div className="container product-details-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumbs-nav" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/shop">Shop</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>
            {product.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* 2-Column Product Configurator */}
        <div className="product-details-grid">
          {/* LEFT: GALLERY & ZOOM STAGE */}
          <div className="product-gallery-col">
            <div
              className={`product-zoom-stage ${isZoomed ? 'zoomed' : ''}`}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => {
                setIsZoomed(false);
                if (zoomImgRef.current) zoomImgRef.current.style.transformOrigin = '50% 50%';
              }}
              onMouseMove={handleMouseMove}
            >
              <img
                ref={zoomImgRef}
                src={gallery[activeImgIndex]}
                alt={product.name}
                className="product-zoom-img"
                loading="eager"
                decoding="async"
                style={isZoomed ? { transform: 'scale(1.8)' } : undefined}
              />

              <div className="zoom-hint-pill">
                <ZoomIn size={14} />
                <span>Hover to Zoom</span>
              </div>

              {product.discount > 0 && (
                <span className="badge-pill badge-pill-sale detail-sale-badge">
                  Save {product.discount}%
                </span>
              )}

              {isOutOfStock && (
                <div className="out-of-stock-overlay">
                  <span>Sold Out</span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="gallery-thumbs-strip">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  className={`gallery-thumb-btn ${activeImgIndex === idx ? 'active' : ''}`}
                  onClick={() => setActiveImgIndex(idx)}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} preview ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT SPECIFICATIONS & ACTIONS */}
          <div className="product-info-col">
            <div className="product-category-row">
              <span className="detail-category">{product.category}</span>
              {product.badge && <span className="detail-badge">{product.badge}</span>}
            </div>

            <h1 className="detail-title">{product.name}</h1>

            {/* Rating Stars (Clickable Jump to Customer Reviews Section) */}
            <div
              className="detail-rating-row clickable-rating-jump"
              onClick={scrollToReviews}
              role="button"
              tabIndex={0}
              title="Click to view all patron reviews"
              onKeyDown={(e) => {
                if (e.key === 'Enter') scrollToReviews();
              }}
            >
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < Math.floor(reviewStats.avg) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span className="detail-rating-val">{reviewStats.avg.toFixed(1)}</span>
              <span className="detail-review-count">
                ({reviewStats.total} patron reviews) • <span className="jump-link">Jump to Reviews ↓</span>
              </span>
            </div>

            {/* Pricing */}
            <div className="detail-price-row">
              <span className="detail-current-price">${product.price}.00</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="detail-old-price">${product.originalPrice}.00</span>
              )}
              {product.discount > 0 && (
                <span className="discount-tag">-{product.discount}% Discount</span>
              )}
            </div>

            {/* Stock Availability Pill */}
            <div className="stock-status-row">
              {isOutOfStock ? (
                <div className="stock-pill out">
                  <AlertCircle size={14} />
                  <span>Currently Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="stock-pill low">
                  <AlertCircle size={14} />
                  <span>Limited Availability: Only {stockCount} pieces remaining</span>
                </div>
              ) : (
                <div className="stock-pill in">
                  <Check size={14} />
                  <span>In Stock • Ready for Atelier Dispatch ({stockCount} units)</span>
                </div>
              )}
            </div>

            <p className="detail-description">{product.description}</p>

            {/* Color Swatch Picker */}
            {product.colors && product.colors.length > 0 && (
              <div className="detail-option-group">
                <label className="detail-option-label">
                  Selected Shade: <strong>{product.colors[selectedColorIdx]?.name}</strong>
                </label>
                <div className="color-swatches-strip">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      className={`color-choice-dot ${selectedColorIdx === idx ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColorIdx(idx)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="detail-option-group">
                <div className="detail-size-header">
                  <label className="detail-option-label">
                    Select Size: <strong>{selectedSize}</strong>
                  </label>
                  <span className="size-guide-modal-link">Bespoke Fit Guide</span>
                </div>
                <div className="size-choices-row">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-choice-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="detail-actions-stage">
              <div className="detail-qty-stepper">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  -
                </button>
                <span className="detail-qty-num">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stockCount, q + 1))}
                  disabled={quantity >= stockCount || isOutOfStock}
                >
                  +
                </button>
              </div>

              <button
                className={`btn-primary detail-add-btn ${addedSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  <span>Sold Out</span>
                ) : addedSuccess ? (
                  <>
                    <Check size={18} />
                    <span>Added to Shopping Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Bag • ${(product.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                className={`detail-wishlist-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Toggle wishlist"
                title={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart
                  size={22}
                  fill={isLiked ? '#ef4444' : 'none'}
                  color={isLiked ? '#ef4444' : 'currentColor'}
                />
              </button>
            </div>

            {/* Reassurance Badges */}
            <div className="detail-perks-box">
              <div className="perk-row">
                <Truck size={16} color="#818cf8" />
                <span>Complimentary Express Global Delivery on orders over $150</span>
              </div>
              <div className="perk-row">
                <RotateCcw size={16} color="#818cf8" />
                <span>30-Day Flawless Returns &amp; Concierge Exchanges</span>
              </div>
              <div className="perk-row">
                <ShieldCheck size={16} color="#34d399" />
                <span>Certified 100% Authentic Italian Atelier Craft</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: Product Specifications & Care Tabs */}
        <div className="product-tabs-section">
          <div className="tabs-nav-bar">
            <button
              className={`tab-btn ${activeTab === 'craftsmanship' ? 'active' : ''}`}
              onClick={() => setActiveTab('craftsmanship')}
            >
              Atelier Craftsmanship
            </button>
            <button
              className={`tab-btn ${activeTab === 'fabric' ? 'active' : ''}`}
              onClick={() => setActiveTab('fabric')}
            >
              Fabric &amp; Care
            </button>
            <button
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Complimentary Delivery &amp; Returns
            </button>
          </div>

          <div className="tab-content-panel">
            {activeTab === 'craftsmanship' && (
              <div className="tab-pane-content">
                <h3>Architectural Precision &amp; Timeless Drape</h3>
                <p>
                  Each {product.name} is constructed in our partner atelier in Biella and
                  Tuscany. Combining heritage sartorial hand-stitching with modern laser-cut
                  precision, this silhouette offers supreme comfort and sculptural poise that
                  transcends seasonal ephemera.
                </p>
                <ul>
                  <li>Meticulous hand-finished inner seams with pure silk binding</li>
                  <li>Sustainably harvested certified natural horn buttons</li>
                  <li>Ergonomically contoured shoulder and sleeve pitch for effortless movement</li>
                </ul>
              </div>
            )}

            {activeTab === 'fabric' && (
              <div className="tab-pane-content">
                <h3>Material Composition &amp; Longevity Protocol</h3>
                <p>
                  Crafted exclusively from ethically sourced natural raw fibers with zero toxic
                  synthetic finishes.
                </p>
                <ul>
                  <li>Dry clean only with eco-friendly hydrocarbon solvent</li>
                  <li>Store on structured cedar hangers away from direct sunlight</li>
                  <li>Steam gently with low heat to refresh natural wool or silk fibers</li>
                </ul>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="tab-pane-content">
                <h3>Global Courier Dispatch &amp; Concierge Exchange</h3>
                <p>
                  Orders over $150 receive complimentary worldwide express shipping with signature
                  courier delivery.
                </p>
                <ul>
                  <li>Estimated delivery: 2–4 business days across Europe, North America &amp; Asia</li>
                  <li>Includes bespoke luxury NOVARA gift presentation box and hanger</li>
                  <li>Full 30-day returns with complimentary pickup from your residence</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: COMPLETE DEDICATED CUSTOMER REVIEWS SECTION */}
        <section className="customer-reviews-section" id="customer-reviews-section">
          <div className="reviews-section-header">
            <span className="section-tag">
              <Sparkles size={13} /> Verified Patron Experiences
            </span>
            <h2 className="reviews-main-heading">Customer Reviews &amp; Testimonials</h2>
            <p className="reviews-sub-heading">
              Authentic reflections from verified owners of the {product.name} across the globe.
            </p>
          </div>

          {/* Rating Summary Scorecard Grid */}
          <div className="reviews-scorecard-grid">
            {/* Average Rating Card */}
            <div className="scorecard-main-col">
              <div className="big-rating-number">{reviewStats.avg.toFixed(1)}</div>
              <div className="scorecard-stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={22}
                    fill={i < Math.floor(reviewStats.avg) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <span className="scorecard-total-reviews">
                Based on <strong>{reviewStats.total}</strong> verified patron reviews
              </span>
              <div className="scorecard-guarantee">
                <Award size={14} color="#818cf8" />
                <span>100% Authentic Patron Feedback</span>
              </div>
            </div>

            {/* Rating Breakdown Percentage Bars */}
            <div className="scorecard-bars-col">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="rating-progress-row">
                  <span className="bar-star-label">
                    {stars} <Star size={12} fill="#f59e0b" color="#f59e0b" />
                  </span>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${reviewStats.percentages[stars]}%` }}
                    />
                  </div>
                  <span className="bar-count-label">
                    {reviewStats.percentages[stars]}% ({reviewStats.counts[stars]})
                  </span>
                </div>
              ))}
            </div>

            {/* Write a Review Action Card */}
            <div className="scorecard-action-col">
              <h4>Have You Worn This Piece?</h4>
              <p>Share your perspective on the textile feel, tailoring, and fit with fellow patrons.</p>

              {user ? (
                hasUserReviewed ? (
                  <div className="already-reviewed-badge">
                    <UserCheck size={18} color="#34d399" />
                    <span>You have submitted a review for this silhouette.</span>
                  </div>
                ) : (
                  <button
                    className="btn-primary write-review-trigger-btn"
                    onClick={() => setShowReviewForm((prev) => !prev)}
                  >
                    <MessageSquarePlus size={16} />
                    <span>{showReviewForm ? 'Close Form' : 'Write a Patron Review'}</span>
                  </button>
                )
              ) : (
                <div className="guest-review-prompt">
                  <button
                    className="btn-primary signin-to-review-btn"
                    onClick={() => setIsAuthOpen(true)}
                  >
                    <span>Sign In to Review</span>
                  </button>
                  <span className="guest-note">Only authenticated patrons can post reviews.</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Review Submission Composer */}
          {showReviewForm && (
            <form className="interactive-review-composer" onSubmit={handleSubmitReview}>
              <div className="composer-header">
                <div>
                  <h3>Submit Your Patron Review</h3>
                  <p>Your honest review helps connoisseurs define their style.</p>
                </div>
                <button
                  type="button"
                  className="composer-close-btn"
                  onClick={() => setShowReviewForm(false)}
                  aria-label="Close review form"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1-5 Interactive Star Selector */}
              <div className="composer-rating-field">
                <label className="composer-label">Overall Rating (Select 1 to 5 Stars):</label>
                <div className="star-picker-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-choice-btn ${star <= (hoverStar || newRating) ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => setNewRating(star)}
                      aria-label={`${star} Stars`}
                    >
                      <Star
                        size={28}
                        fill={star <= (hoverStar || newRating) ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                      />
                    </button>
                  ))}
                  <span className="rating-desc-badge">
                    {newRating === 5
                      ? 'Exceptional (5/5)'
                      : newRating === 4
                      ? 'Very Good (4/5)'
                      : newRating === 3
                      ? 'Average (3/5)'
                      : newRating === 2
                      ? 'Below Expectation (2/5)'
                      : 'Unsatisfactory (1/5)'}
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div className="composer-input-row">
                <div className="composer-field">
                  <label className="composer-label">Patron Name / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Julian V., Geneva"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Comments Textarea */}
              <div className="composer-field">
                <label className="composer-label">Your Review &amp; Fit Remarks</label>
                <textarea
                  rows={4}
                  placeholder="Describe the architectural drape, textile comfort, sizing accuracy, and atelier craftsmanship..."
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="composer-footer">
                <button
                  type="submit"
                  className="btn-primary composer-submit-btn"
                  disabled={isSubmittingReview}
                >
                  <Send size={16} />
                  <span>{isSubmittingReview ? 'Publishing to Atelier...' : 'Submit Patron Review'}</span>
                </button>
                <span className="review-policy-note">
                  Submitted reviews are verified and synchronized across the House of Novara.
                </span>
              </div>
            </form>
          )}

          {/* Customer Reviews List */}
          <div className="reviews-cards-list">
            {isLoadingReviews ? (
              <div className="reviews-loading-state">
                <div className="skeleton-line shimmer short" />
                <div className="skeleton-line shimmer full" />
              </div>
            ) : reviewStats.list.length === 0 ? (
              <div className="reviews-empty-box">
                <Star size={36} color="#818cf8" />
                <h3>No Reviews Yet</h3>
                <p>Be the inaugural patron to share your experience with this silhouette.</p>
              </div>
            ) : (
              reviewStats.list.map((rev) => (
                <div key={rev._id || rev.id} className="patron-review-card">
                  <div className="review-card-header">
                    <div className="reviewer-meta">
                      <div className="reviewer-avatar">
                        {(rev.userName || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="reviewer-display-name">{rev.userName}</h4>
                        <div className="verified-patron-badge">
                          <Check size={12} />
                          <span>Verified Purchase</span>
                        </div>
                      </div>
                    </div>

                    <div className="review-meta-right">
                      <div className="review-card-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < (rev.rating || 5) ? '#f59e0b' : 'none'}
                            color="#f59e0b"
                          />
                        ))}
                      </div>
                      <span className="review-card-date">
                        {rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : 'Recent Patron'}
                      </span>
                    </div>
                  </div>

                  <p className="review-card-comment">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* SECTION 3: You May Also Admire (Related Products) */}
        {relatedProducts.length > 0 && (
          <section className="related-products-section">
            <div className="section-header text-left">
              <span className="section-tag">
                <Sparkles size={12} /> Complementary Pieces
              </span>
              <h2>You May Also Admire</h2>
            </div>
            <div className="related-products-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};
