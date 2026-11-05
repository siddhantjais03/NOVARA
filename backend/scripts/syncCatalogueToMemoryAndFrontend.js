import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATALOGUE_80 } from '../data/catalogue80.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Update backend/config/memoryStore.js
const memoryStorePath = path.join(__dirname, '..', 'config', 'memoryStore.js');
const memoryStoreContent = fs.readFileSync(memoryStorePath, 'utf8');

// Find where coupons start: '  coupons: ['
const couponsIndex = memoryStoreContent.indexOf('  coupons: [');
if (couponsIndex === -1) {
  console.error('Could not find coupons: [ in memoryStore.js');
  process.exit(1);
}

const remainder = memoryStoreContent.substring(couponsIndex);

const updatedMemoryStore = `import bcrypt from 'bcryptjs';
import { CATALOGUE_80 } from '../data/catalogue80.js';

// Initial in-memory dataset to ensure the backend functions out-of-the-box
// whenever MongoDB service is offline or in transition.
export const memoryData = {
  products: CATALOGUE_80.map((p) => ({
    ...p,
    createdAt: p.createdAt || '2026-01-15T08:00:00.000Z'
  })),

${remainder}`;

fs.writeFileSync(memoryStorePath, updatedMemoryStore, 'utf8');
console.log('✅ Updated backend/config/memoryStore.js with all 80 catalogue products.');

// 2. Update frontend/src/data/products.js
const frontendProductsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'data', 'products.js');

const frontendProducts = CATALOGUE_80.map((p) => ({
  id: p._id,
  _id: p._id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  gender: p.gender,
  price: p.price,
  originalPrice: p.originalPrice,
  discount: p.discount,
  rating: p.rating,
  reviewsCount: p.reviewsCount,
  badge: p.badge,
  image: p.image,
  hoverImage: p.hoverImage,
  colors: p.colors,
  sizes: p.sizes,
  stock: p.stock,
  description: p.description,
  isTrending: p.isTrending,
  isBestSeller: p.isBestSeller,
  featured: p.featured,
  inStock: p.stock > 0
}));

const frontendFileContent = `// Authoritative 80-Product Master Catalogue for NOVARA Storefront
export const PRODUCTS_DATA = ${JSON.stringify(frontendProducts, null, 2)};
`;

fs.writeFileSync(frontendProductsPath, frontendFileContent, 'utf8');
console.log('✅ Updated frontend/src/data/products.js with all 80 catalogue products.');

