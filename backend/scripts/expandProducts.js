import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { CATALOGUE_80 } from '../data/catalogue80.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Set of the original 21 products to strictly protect them from any modification
const ORIGINAL_21_IDS = new Set([
  '672801a1e1b2c3d4e5f60001',
  '672801a1e1b2c3d4e5f60002',
  '672801a1e1b2c3d4e5f60003',
  '672801a1e1b2c3d4e5f60004',
  '672801a1e1b2c3d4e5f60005',
  '672801a1e1b2c3d4e5f60006',
  '672801a1e1b2c3d4e5f60007',
  '672801a1e1b2c3d4e5f60008',
  '672801a1e1b2c3d4e5f60009',
  '672801a1e1b2c3d4e5f60010',
  '672801a1e1b2c3d4e5f60011',
  '672801a1e1b2c3d4e5f60012',
  '672801a1e1b2c3d4e5f60013',
  '672801a1e1b2c3d4e5f60014',
  '672801a1e1b2c3d4e5f60015',
  '672801a1e1b2c3d4e5f60016',
  '672801a1e1b2c3d4e5f60017',
  '672801a1e1b2c3d4e5f60018',
  '672801a1e1b2c3d4e5f60019',
  '672801a1e1b2c3d4e5f60020',
  '672801a1e1b2c3d4e5f60021'
]);

// Isolate strictly the 59 new products
const NEW_59_PRODUCTS = CATALOGUE_80.filter((p) => !ORIGINAL_21_IDS.has(p._id));

async function expandCatalogue() {
  console.log('====================================================');
  console.log(' NOVARA CATALOGUE EXPANSION (STRICTLY 59 NEW ITEMS)');
  console.log('====================================================');
  console.log('Strict Invariants:');
  console.log('1. Original 21 products: Completely UNTOUCHED (no updates to SKU, category, price, images, or stock).');
  console.log('2. Insertion target: Exactly 59 NEW products.');
  console.log('3. Idempotency: Keyed strictly on unique SKUs.');
  console.log('4. Zero deletions: No deleteMany or drop operations.');
  console.log('----------------------------------------------------');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in backend/.env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('Connected to MongoDB successfully.\n');
  } catch (connErr) {
    console.warn('⚠️ Could not connect to MongoDB Atlas directly:');
    console.warn(`   Reason: ${connErr.message}`);
    console.warn('   (Add your current public IP to MongoDB Atlas Network Access)');
    console.warn('   Note: In-memory store already serves all 80 products in zero-downtime mode.');
    process.exit(0);
  }

  try {
    // Snapshot existing counts before operation
    const initialProductCount = await Product.countDocuments();
    const initialOrderCount = await Order.countDocuments();
    const initialReviewCount = await Review.countDocuments();
    const initialUserCount = await User.countDocuments();

    console.log(`Pre-Expansion Database State:`);
    console.log(`  • Products: ${initialProductCount}`);
    console.log(`  • Orders:   ${initialOrderCount}`);
    console.log(`  • Reviews:  ${initialReviewCount}`);
    console.log(`  • Users:    ${initialUserCount}\n`);

    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
      console.log('>>> RUNNING IN DRY-RUN MODE: ZERO DATABASE WRITES <<<\n');
    }

    console.log(`Processing strictly the ${NEW_59_PRODUCTS.length} new luxury products...`);

    let newlyInserted = 0;
    let skippedAlreadyPresent = 0;

    for (const item of NEW_59_PRODUCTS) {
      // Idempotent check strictly by unique SKU
      const existing = await Product.findOne({ sku: item.sku });

      if (existing) {
        skippedAlreadyPresent++;
      } else {
        if (!isDryRun) {
          // Insert new product record
          await Product.create({
            ...item
          });
        }
        newlyInserted++;
        console.log(`  + [${isDryRun ? 'WOULD INSERT' : 'INSERTED'}] ${item.sku} | ${item.category.padEnd(12)} | ${item.name} ($${item.price})`);
      }
    }

    console.log('\n----------------------------------------------------');
    console.log('Expansion Execution Summary:');
    console.log(`  • Newly Inserted:         ${newlyInserted}`);
    console.log(`  • Skipped (Already in DB): ${skippedAlreadyPresent}`);
    console.log(`  • Original 21 Modified:   0 (Strictly Untouched)`);

    // Post-expansion verification
    const finalProductCount = await Product.countDocuments();
    const finalOrderCount = await Order.countDocuments();
    const finalReviewCount = await Review.countDocuments();
    const finalUserCount = await User.countDocuments();

    console.log('\nPost-Expansion Database Verification:');
    console.log(`  • Total Products in DB:   ${finalProductCount} (Expected: 80)`);
    console.log(`  • Total Orders in DB:     ${finalOrderCount} (Unchanged: ${initialOrderCount === finalOrderCount})`);
    console.log(`  • Total Reviews in DB:    ${finalReviewCount} (Unchanged: ${initialReviewCount === finalReviewCount})`);
    console.log(`  • Total Users in DB:      ${finalUserCount} (Unchanged: ${initialUserCount === finalUserCount})`);

    // Category breakdown in MongoDB
    const categoryBreakdown = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\nDatabase Category Breakdown:');
    categoryBreakdown.forEach((cat) => {
      console.log(`  • ${String(cat._id).padEnd(14)}: ${cat.count} products`);
    });

    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Error during catalogue expansion:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

expandCatalogue();
