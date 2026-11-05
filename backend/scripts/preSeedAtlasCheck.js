import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { CATALOGUE_80 } from '../data/catalogue80.js';
import { ORIGINAL_21_IDS } from '../seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const uri = process.env.MONGODB_URI;

async function checkAtlasDirectly() {
  console.log('====================================================');
  console.log(' MONGODB ATLAS LIVE CONNECTION & PRE-SEED CHECK');
  console.log('====================================================');
  console.log('Target Cluster:', uri.substring(0, 35) + '...');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });

    console.log('\n[Check 1] DIRECT ATLAS CONNECTION:');
    console.log('  Status: SUCCESSFUL');
    console.log('  Host:', conn.connection.host);
    console.log('  Port:', conn.connection.port);
    console.log('  ReadyState:', conn.connection.readyState, '(1 = connected)');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('\n[Check 2] CONNECTED DATABASE NAME:');
    console.log('  Database:', dbName);

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('  Collections found:', collections.map(c => c.name).join(', '));

    console.log('\n[Check 3] ACTUAL LIVE DOCUMENT COUNTS IN MONGODB ATLAS:');

    const productCount = collections.some(c => c.name === 'products') ? await db.collection('products').countDocuments() : 0;
    const couponCount = collections.some(c => c.name === 'coupons') ? await db.collection('coupons').countDocuments() : 0;
    const userCount = collections.some(c => c.name === 'users') ? await db.collection('users').countDocuments() : 0;
    const orderCount = collections.some(c => c.name === 'orders') ? await db.collection('orders').countDocuments() : 0;
    const reviewCount = collections.some(c => c.name === 'reviews') ? await db.collection('reviews').countDocuments() : 0;

    console.log(`  - Products: ${productCount}`);
    console.log(`  - Coupons:  ${couponCount}`);
    console.log(`  - Users:    ${userCount}`);
    console.log(`  - Orders:   ${orderCount}`);
    console.log(`  - Reviews:  ${reviewCount}`);

    console.log('\n[Check 4] ORIGINAL 21 PRODUCT RECORDS INTEGRITY CHECK:');

    const productsInAtlas = await db.collection('products').find({}).toArray();
    console.log(`  Total products currently in Atlas: ${productsInAtlas.length}`);

    // Category breakdown of existing products
    const existingCatMap = {};
    for (const p of productsInAtlas) {
      existingCatMap[p.category] = (existingCatMap[p.category] || 0) + 1;
    }
    console.log('  Current Atlas Categories Breakdown:', existingCatMap);

    // Check each of the original 21
    const originalFound = [];
    const missingOriginal = [];
    for (const item of CATALOGUE_80) {
      if (ORIGINAL_21_IDS.has(item._id)) {
        const found = productsInAtlas.find(p => String(p._id) === item._id || p.name === item.name);
        if (found) {
          originalFound.push({
            id: String(found._id),
            name: found.name,
            category: found.category,
            sku: found.sku || null,
            price: found.price
          });
        } else {
          missingOriginal.push(item);
        }
      }
    }

    console.log(`  Original 21 Products Found in Atlas: ${originalFound.length} / 21`);
    if (missingOriginal.length > 0) {
      console.log(`  Missing Original: ${missingOriginal.map(m => m.name).join(', ')}`);
    } else {
      console.log('  All 21 original products exist and are intact.');
    }

    console.log('\n[Check 5] MISSING PRODUCTS CHECK:');

    const new59Items = CATALOGUE_80.filter(p => !ORIGINAL_21_IDS.has(p._id));
    const missingNew = [];
    const alreadyPresentNew = [];

    for (const newItem of new59Items) {
      const match = productsInAtlas.find(p => (p.sku && p.sku === newItem.sku) || String(p._id) === newItem._id);
      if (match) {
        alreadyPresentNew.push(newItem);
      } else {
        missingNew.push(newItem);
      }
    }

    console.log(`  Target New Products: ${new59Items.length}`);
    console.log(`  Already Present New Products: ${alreadyPresentNew.length}`);
    console.log(`  Missing New Products to Insert: ${missingNew.length}`);

    console.log('\n[Check 6] SKU CONFLICT & UNIQUENESS CHECK:');

    const newSkus = new59Items.map(p => p.sku);
    const uniqueNewSkus = new Set(newSkus);
    console.log(`  Total New SKUs: ${newSkus.length}, Unique: ${uniqueNewSkus.size}`);

    const existingAtlasSkus = productsInAtlas.filter(p => p.sku).map(p => p.sku);
    const conflicts = newSkus.filter(s => existingAtlasSkus.includes(s));
    console.log(`  Conflicts with existing Atlas SKUs: ${conflicts.length === 0 ? 'None (0 conflicts)' : conflicts.join(', ')}`);

    console.log('\n[Check 7] DEMO SEEDING CONDITIONS CHECK:');
    console.log(`  Orders Collection populated? ${orderCount > 0} (${orderCount} orders present -> demo orders will NOT be inserted)`);
    console.log(`  Reviews Collection populated? ${reviewCount > 0} (${reviewCount} reviews present -> demo reviews will NOT be inserted)`);

    console.log('\n[Check 8] NO MEMORY FALLBACK ACTIVE:');
    console.log('  Mongoose connection state:', mongoose.connection.readyState === 1 ? 'Direct Live MongoDB Atlas (State: 1)' : 'Offline/Fallback');

    await mongoose.disconnect();
    console.log('\n====================================================');
    console.log(' PRE-SEED ATLAS VERIFICATION COMPLETED SAFELY');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ ATLAS CONNECTION FAILED:');
    console.error('  Reason:', err.message);
    console.log('\n====================================================');
    console.log(' PRE-SEED ATLAS CHECK ABORTED');
    console.log('====================================================');
    process.exit(1);
  }
}

checkAtlasDirectly();
