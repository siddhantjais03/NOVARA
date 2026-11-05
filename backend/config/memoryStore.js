import bcrypt from 'bcryptjs';
import { CATALOGUE_80 } from '../data/catalogue80.js';

// Initial in-memory dataset to ensure the backend functions out-of-the-box
// whenever MongoDB service is offline or in transition.
export const memoryData = {
  products: CATALOGUE_80.map((p) => ({
    ...p,
    createdAt: p.createdAt || '2026-01-15T08:00:00.000Z'
  })),

  coupons: [
    {
      _id: 'c-001',
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      description: '10% Welcome Discount for New Patrons',
      isActive: true
    },
    {
      _id: 'c-002',
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 150,
      description: '20% Off Orders over $150',
      isActive: true
    },
    {
      _id: 'c-003',
      code: 'NOVARA50',
      discountType: 'fixed',
      discountValue: 50,
      minOrderAmount: 200,
      description: 'Flat ₹50 / $50 Off Your Order',
      isActive: true
    },
    {
      _id: 'c-004',
      code: 'NOVARA45',
      discountType: 'percentage',
      discountValue: 45,
      minOrderAmount: 250,
      description: '45% Mid-Season Private Archive Event',
      isActive: true
    }
  ],

  users: [
    {
      _id: 'u-admin-01',
      name: 'Novara Atelier Director',
      email: 'admin@novara.luxury',
      passwordHash: bcrypt.hashSync('Admin@Novara2026!', 10),
      role: 'admin',
      phone: '+91 98765 43210',
      membershipTier: 'House Administrator',
      address: { street: '1 Via Montenapoleone', city: 'Milan', state: 'Lombardy', postalCode: '20121', country: 'Italy' },
      createdAt: new Date().toISOString()
    },
    {
      _id: 'u-patron-01',
      name: 'Elena Rostova',
      email: 'elena@novara.luxury',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'user',
      phone: '+91 91234 56789',
      membershipTier: 'VIP Atelier Tier',
      address: { street: '12 Alipore Avenue', city: 'Kolkata', state: 'West Bengal', postalCode: '700027', country: 'India' },
      createdAt: new Date().toISOString()
    }
  ],

  orders: [
    {
      _id: 'ord-001-sample',
      customerInfo: { name: 'Elena Rostova', email: 'elena@novara.luxury', phone: '+91 91234 56789' },
      orderItems: [
        {
          product: '672801a1e1b2c3d4e5f60001',
          name: 'Sovereign Cashmere Double-Breasted Overcoat',
          image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80',
          price: 495,
          quantity: 1,
          selectedSize: 'M',
          selectedColor: { name: 'Camel', hex: '#c19a6b' }
        }
      ],
      shippingAddress: { street: '12 Alipore Avenue', city: 'Kolkata', state: 'West Bengal', postalCode: '700027', country: 'India' },
      paymentMethod: 'UPI',
      paymentResult: { id: 'DEMO-UPI-9921', status: 'COMPLETED', paymentDetail: 'elena@okhdfcbank' },
      itemsPrice: 495,
      shippingPrice: 0,
      discountPrice: 49.5,
      appliedCoupon: 'WELCOME10',
      totalPrice: 445.5,
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: 'Confirmed',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'ord-002-sample',
      customerInfo: { name: 'Vikramaditya Singhania', email: 'vikram@singhania.co', phone: '+91 98111 22334' },
      orderItems: [
        {
          product: '672801a1e1b2c3d4e5f60003',
          name: 'Lumina Sculpted Calfskin Shoulder Bag',
          image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
          price: 380,
          quantity: 1,
          selectedSize: 'One Size',
          selectedColor: { name: 'Deep Noir', hex: '#0a0a0a' }
        }
      ],
      shippingAddress: { street: '45 Marine Drive', city: 'Mumbai', state: 'Maharashtra', postalCode: '400020', country: 'India' },
      paymentMethod: 'CARD',
      paymentResult: { id: 'DEMO-CARD-8812', status: 'COMPLETED', paymentDetail: 'Visa Ending in 4242' },
      itemsPrice: 380,
      shippingPrice: 0,
      discountPrice: 76,
      appliedCoupon: 'SAVE20',
      totalPrice: 304,
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderStatus: 'Delivered',
      createdAt: new Date().toISOString()
    }
  ],

  reviews: [
    {
      _id: 'rev-001',
      productId: '672801a1e1b2c3d4e5f60001',
      productName: 'Sovereign Cashmere Double-Breasted Overcoat',
      userName: 'Elena Rostova',
      userEmail: 'elena@novara.luxury',
      rating: 5,
      comment: 'The drape and hand-feel of this Mongolian cashmere is transcendent. Truly heirloom craftsmanship.',
      status: 'Approved',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'rev-002',
      productId: '672801a1e1b2c3d4e5f60002',
      productName: 'Aura Silk Satin Bias-Cut Slip Gown',
      userName: 'Aria Montgomery',
      userEmail: 'aria@montgomery.fr',
      rating: 5,
      comment: 'Fits like liquid light. Stunning champagne tone under evening luminescence.',
      status: 'Approved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'rev-003',
      productId: '672801a1e1b2c3d4e5f60003',
      productName: 'Lumina Sculpted Calfskin Shoulder Bag',
      userName: 'Vikramaditya Singhania',
      userEmail: 'vikram@singhania.co',
      rating: 4,
      comment: 'Incredible leather aroma and pristine brass hardware. An instant staple in my collection.',
      status: 'Approved',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  categories: [
    { name: 'Accessories', slug: 'accessories', description: 'Fine jewelry, cashmere scarves, sunglasses and leather belts.', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80' },
    { name: 'Footwear', slug: 'footwear', description: 'Artisan Chelsea boots, Italian leather loafers and evening heels.', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80' },
    { name: 'Outerwear', slug: 'outerwear', description: 'Architectural coats, cashmere overcoats and tailored jackets.', image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Clothing', slug: 'clothing', description: 'Haute silk gowns, bespoke Italian tailoring and modern wardrobing.', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80' },
    { name: 'Bags', slug: 'bags', description: 'Architectural full-grain calfskin totes, shoulder bags and evening clutches.', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Watches', slug: 'watches', description: 'Haute Horlogerie, sapphire chronographs and Swiss automatic calibers.', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80' }
  ],

  settings: {
    storeName: 'NOVARA Haute Couture & Luxury Goods',
    tagline: 'Discover Your Style. Define Your World.',
    contactEmail: 'concierge@novara.luxury',
    supportPhone: '+91 (0) 11 4982 7000',
    currency: 'USD',
    currencySymbol: '$',
    freeShippingThreshold: 150,
    standardShippingFee: 25,
    taxPercentage: 0,
    announcementText: 'COMPLIMENTARY WORLDWIDE COURIER DELIVERY ON ORDERS ABOVE $150 • CODE: WELCOME10 FOR 10% PRIVILEGE',
    enableReviews: true,
    maintenanceMode: false
  },

  carts: {},
  wishlists: {}
};

