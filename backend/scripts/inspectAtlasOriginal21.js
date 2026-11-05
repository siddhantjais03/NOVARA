import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { CATALOGUE_80 } from '../data/catalogue80.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

function mapCustomerFacingCategory(storedCategory, name) {
  const nameLower = (name || '').toLowerCase();
  const prodCat = (storedCategory || '').toLowerCase();
  const isLegacyBag = prodCat === 'accessories' && (nameLower.includes('shoulder bag') || nameLower.includes('crossbody') || nameLower.includes('duffle'));
  const isLegacyWatch = prodCat === 'jewelry' && nameLower.includes('watch');

  if (prodCat === 'bags' || isLegacyBag) return 'Bags';
  if (prodCat === 'watches' || isLegacyWatch) return 'Watches';
  if (prodCat === 'outerwear') return 'Outerwear';
  if (prodCat === 'footwear') return 'Footwear';
  if (prodCat === 'womenswear' || prodCat === 'menswear' || prodCat === 'clothing') return 'Clothing';
  if (prodCat === 'accessories' || prodCat === 'jewelry') return 'Accessories';
  return storedCategory;
}

async function inspectOriginal21() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.db;
    const products = await db.collection('products').find({}).toArray();

    console.log(`Total live products found in Atlas: ${products.length}`);
    
    // Sort products by _id for deterministic display
    products.sort((a, b) => String(a._id).localeCompare(String(b._id)));

    const report = products.map((p, index) => {
      const customerCategory = mapCustomerFacingCategory(p.category, p.name);
      return {
        index: index + 1,
        id: String(p._id),
        name: p.name,
        storedCategory: p.category,
        customerCategory: customerCategory,
        price: p.price,
        sku: p.sku || 'N/A'
      };
    });

    console.log('\n--- 21 ORIGINAL PRODUCTS IN ATLAS ---');
    console.table(report);

    // Stored category counts
    const storedCounts = {};
    for (const p of products) {
      storedCounts[p.category] = (storedCounts[p.category] || 0) + 1;
    }
    console.log('\n--- STORED CATEGORIES IN ATLAS ---');
    console.log(storedCounts);

    // Customer-facing category counts for original 21
    const customerOriginalCounts = {
      Accessories: 0,
      Footwear: 0,
      Outerwear: 0,
      Clothing: 0,
      Bags: 0,
      Watches: 0
    };
    for (const r of report) {
      customerOriginalCounts[r.customerCategory] = (customerOriginalCounts[r.customerCategory] || 0) + 1;
    }
    console.log('\n--- CUSTOMER-FACING ORIGINAL 21 BREAKDOWN ---');
    console.log(customerOriginalCounts);

    // Now calculate 59 new products from CATALOGUE_80
    // Identifying 59 new products: those whose name is not among the 21 original products
    const originalNames = new Set(products.map(p => p.name));
    const new59 = CATALOGUE_80.filter(p => !originalNames.has(p.name));

    console.log(`\nNew products identified in CATALOGUE_80: ${new59.length}`);

    const newCounts = {
      Accessories: 0,
      Footwear: 0,
      Outerwear: 0,
      Clothing: 0,
      Bags: 0,
      Watches: 0
    };
    for (const p of new59) {
      const cat = mapCustomerFacingCategory(p.category, p.name);
      newCounts[cat] = (newCounts[cat] || 0) + 1;
    }
    console.log('\n--- 59 NEW PRODUCTS BREAKDOWN ---');
    console.log(newCounts);

    // Combined totals
    const finalTotals = {};
    for (const cat of ['Accessories', 'Footwear', 'Outerwear', 'Clothing', 'Bags', 'Watches']) {
      finalTotals[cat] = {
        original: customerOriginalCounts[cat] || 0,
        new: newCounts[cat] || 0,
        total: (customerOriginalCounts[cat] || 0) + (newCounts[cat] || 0)
      };
    }
    console.log('\n--- STOREFRONT RECONCILIATION SUMMARY ---');
    console.table(finalTotals);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

inspectOriginal21();

