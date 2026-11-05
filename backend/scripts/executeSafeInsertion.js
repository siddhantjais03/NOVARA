import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { CATALOGUE_80 } from '../data/catalogue80.js';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

function normalizeStorefront(p) {
  const cat = (p.category || '').toLowerCase().trim();
  const name = (p.name || '').toLowerCase().trim();
  const isLegacyBag = cat === 'accessories' && (name.includes('shoulder bag') || name.includes('crossbody') || name.includes('duffle'));
  const isLegacyWatch = cat === 'jewelry' && name.includes('watch');

  if (cat === 'bags' || isLegacyBag) return 'Bags';
  if (cat === 'watches' || isLegacyWatch) return 'Watches';
  if (cat === 'outerwear') return 'Outerwear';
  if (cat === 'footwear') return 'Footwear';
  if (cat === 'womenswear' || cat === 'menswear' || cat === 'clothing') return 'Clothing';
  if (cat === 'accessories' || cat === 'jewelry') return 'Accessories';
  return p.category;
}

async function runSafeInsertion() {
  console.log('================================================================');
  console.log(' NOVARA LIVE MONGODB ATLAS SAFE CATALOGUE INSERTION');
  console.log('================================================================');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Target Cluster:', uri.substring(0, 35) + '...');

  let conn;
  try {
    conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
  } catch (err) {
    console.error('❌ FATAL: Could not connect to MongoDB Atlas directly:', err.message);
    process.exit(1);
  }

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ FATAL: Mongoose readyState is not 1 (connected). Aborting.');
    process.exit(1);
  }

  const db = mongoose.connection.db;
  const dbName = db.databaseName;
  console.log(`✅ Connected to live database: "${dbName}" at host: ${conn.connection.host}\n`);

  if (dbName !== 'test') {
    console.warn(`⚠️ Warning: Expected database name "test", got "${dbName}". Proceeding with caution.`);
  }

  // Step 1: Pre-insertion snapshot
  const initialCounts = {
    products: await db.collection('products').countDocuments(),
    coupons: await db.collection('coupons').countDocuments(),
    users: await db.collection('users').countDocuments(),
    orders: await db.collection('orders').countDocuments(),
    reviews: await db.collection('reviews').countDocuments()
  };

  console.log('PRE-INSERTION LIVE DATABASE SNAPSHOT:');
  console.log(`  • Products: ${initialCounts.products}`);
  console.log(`  • Coupons:  ${initialCounts.coupons}`);
  console.log(`  • Users:    ${initialCounts.users}`);
  console.log(`  • Orders:   ${initialCounts.orders}`);
  console.log(`  • Reviews:  ${initialCounts.reviews}\n`);

  if (initialCounts.products !== 21) {
    console.error(`❌ FATAL: Expected exactly 21 products in live Atlas before insertion, found ${initialCounts.products}. Aborting for safety.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Fetch the 21 existing products
  const existingProducts = await db.collection('products').find({}).toArray();
  const existingNames = new Set(existingProducts.map(p => p.name));
  const existingIds = new Set(existingProducts.map(p => String(p._id)));
  const existingSkus = new Set(existingProducts.filter(p => p.sku).map(p => p.sku));

  console.log(`Existing products loaded: ${existingProducts.length} (Ids: ${existingIds.size}, Names: ${existingNames.size})`);

  // Step 2: Identify strictly the 59 new products from CATALOGUE_80
  const new59ToInsert = CATALOGUE_80.filter(p => !existingNames.has(p.name));

  console.log(`New products to insert from CATALOGUE_80: ${new59ToInsert.length}`);
  if (new59ToInsert.length !== 59) {
    console.error(`❌ FATAL: Expected exactly 59 new products to insert, but found ${new59ToInsert.length}. Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Pre-validate all 59 new products for unique SKUs and no conflict with existing
  const newSkus = new59ToInsert.map(p => p.sku);
  const uniqueSkus = new Set(newSkus);
  if (uniqueSkus.size !== 59) {
    console.error(`❌ FATAL: Duplicate SKU found within the 59 new products. Unique count: ${uniqueSkus.size}. Aborting.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  for (const item of new59ToInsert) {
    if (existingSkus.has(item.sku)) {
      console.error(`❌ FATAL: SKU conflict with existing product: ${item.sku}. Aborting.`);
      await mongoose.disconnect();
      process.exit(1);
    }
    if (existingIds.has(item._id)) {
      console.error(`❌ FATAL: ID conflict with existing product: ${item._id}. Aborting.`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log('✅ Pre-validation passed: all 59 new products have unique SKUs and zero ID/name conflicts.\n');

  // Step 3: Insert products one by one with strict verification
  console.log('--- EXECUTING PRODUCT INSERTIONS ---');
  let insertedCount = 0;
  const insertionLogs = [];

  for (let i = 0; i < new59ToInsert.length; i++) {
    const item = new59ToInsert[i];

    // Double-check DB before every single insert
    const duplicateSku = await Product.findOne({ sku: item.sku });
    if (duplicateSku) {
      console.error(`❌ FATAL: Pre-insert check detected existing SKU ${item.sku}. Halting immediately.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const duplicateName = await Product.findOne({ name: item.name });
    if (duplicateName) {
      console.error(`❌ FATAL: Pre-insert check detected existing Name "${item.name}". Halting immediately.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const duplicateId = await Product.findById(item._id).catch(() => null);
    if (duplicateId) {
      console.error(`❌ FATAL: Pre-insert check detected existing ID ${item._id}. Halting immediately.`);
      await mongoose.disconnect();
      process.exit(1);
    }

    // Insert
    try {
      const created = await Product.create(item);
      insertedCount++;
      const logLine = `[${String(insertedCount).padStart(2, '0')}/59] INSERTED: ${item.sku} | ${item.category.padEnd(12)} | $${String(item.price).padEnd(4)} | "${item.name}" (ID: ${created._id})`;
      console.log(logLine);
      insertionLogs.push({
        num: insertedCount,
        sku: item.sku,
        category: item.category,
        price: item.price,
        name: item.name,
        id: String(created._id)
      });
    } catch (insertErr) {
      console.error(`❌ FATAL: Insertion failed on item ${item.sku} ("${item.name}"):`, insertErr.message);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  console.log(`\n✅ Successfully inserted all ${insertedCount} new products into MongoDB Atlas.\n`);

  // Step 4: Post-insertion direct Atlas verification
  console.log('================================================================');
  console.log(' POST-INSERTION LIVE DATABASE VERIFICATION');
  console.log('================================================================');

  const finalCounts = {
    products: await db.collection('products').countDocuments(),
    coupons: await db.collection('coupons').countDocuments(),
    users: await db.collection('users').countDocuments(),
    orders: await db.collection('orders').countDocuments(),
    reviews: await db.collection('reviews').countDocuments()
  };

  console.log('LIVE DOCUMENT COUNTS:');
  console.log(`  • Products: ${finalCounts.products} (Target: 80) -> ${finalCounts.products === 80 ? '✅ EXACT MATCH' : '❌ MISMATCH'}`);
  console.log(`  • Coupons:  ${finalCounts.coupons} (Target: 5, unchanged) -> ${finalCounts.coupons === 5 ? '✅ UNCHANGED' : '❌ CHANGED'}`);
  console.log(`  • Users:    ${finalCounts.users} (Target: 5, unchanged) -> ${finalCounts.users === 5 ? '✅ UNCHANGED' : '❌ CHANGED'}`);
  console.log(`  • Orders:   ${finalCounts.orders} (Target: 9, unchanged) -> ${finalCounts.orders === 9 ? '✅ UNCHANGED' : '❌ CHANGED'}`);
  console.log(`  • Reviews:  ${finalCounts.reviews} (Target: 4, unchanged) -> ${finalCounts.reviews === 4 ? '✅ UNCHANGED' : '❌ CHANGED'}\n`);

  // Verify all original 21 products exist and are unchanged
  const allFinalProducts = await db.collection('products').find({}).toArray();
  let originalPreservedCount = 0;
  for (const orig of existingProducts) {
    const found = allFinalProducts.find(p => String(p._id) === String(orig._id));
    if (found && found.name === orig.name && found.category === orig.category && found.price === orig.price) {
      originalPreservedCount++;
    } else {
      console.error(`❌ MISMATCH in original product: ${orig.name} (ID: ${orig._id})`);
    }
  }
  console.log(`Original 21 Products Preservation Check: ${originalPreservedCount} / 21 intact and unchanged.\n`);

  // Verify storefront category counts
  const storefrontCounts = {
    Accessories: 0,
    Footwear: 0,
    Outerwear: 0,
    Clothing: 0,
    Bags: 0,
    Watches: 0
  };

  for (const p of allFinalProducts) {
    const norm = normalizeStorefront(p);
    if (storefrontCounts[norm] !== undefined) {
      storefrontCounts[norm]++;
    } else {
      console.warn(`⚠️ Unexpected category for product ${p.name}: ${p.category} -> ${norm}`);
    }
  }

  console.log('STOREFRONT CATEGORY COUNTS:');
  const targetCategoryCounts = {
    Accessories: 15,
    Footwear: 15,
    Outerwear: 15,
    Clothing: 15,
    Bags: 10,
    Watches: 10
  };

  let allCategoriesMatch = true;
  for (const [cat, target] of Object.entries(targetCategoryCounts)) {
    const actual = storefrontCounts[cat];
    const match = actual === target;
    if (!match) allCategoriesMatch = false;
    console.log(`  • ${cat.padEnd(14)}: ${actual} / ${target} (Target) -> ${match ? '✅ MATCH' : '❌ MISMATCH'}`);
  }

  console.log(`\nOverall Storefront Category Verification: ${allCategoriesMatch ? '✅ ALL 6 CATEGORIES MATCH EXACTLY' : '❌ MISMATCH DETECTED'}`);

  await mongoose.disconnect();
  console.log('\nDisconnected safely from MongoDB Atlas.');
  console.log('================================================================');

  return {
    insertedCount,
    finalCounts,
    originalPreservedCount,
    storefrontCounts,
    allCategoriesMatch
  };
}

runSafeInsertion().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});

